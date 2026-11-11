import React from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart as PieIcon,
  Activity,
  Layers,
  ArrowRight,
  Database
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { CATEGORY_COLORS } from './DashboardView';

export default function AnalyticsView({
  transactions,
  stats,
  currentMonth,
  onNavigate,
}) {
  const totalIncome = stats?.totalIncoming || 0;
  const totalExpenses = stats?.totalOutgoing || 0;
  const netCashFlow = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((netCashFlow / totalIncome) * 100)) : 0;

  // 1. Income vs Expense Data
  const incomeVsExpenseData = [
    { name: 'Income', amount: totalIncome, fill: '#059669' },
    { name: 'Expenses', amount: totalExpenses, fill: '#0079C1' },
    { name: 'Net Savings', amount: Math.max(0, netCashFlow), fill: '#009CDE' },
  ];

  // 2. Category Distribution Data
  const categoryData = Object.entries(stats?.categoryWise || {})
    .filter(([cat]) => cat !== 'Income')
    .map(([name, data]) => ({
      name,
      value: parseFloat((data.totalAmount || 0).toFixed(2)),
      color: CATEGORY_COLORS[name] || '#0079C1',
    }))
    .sort((a, b) => b.value - a.value);

  // 3. Top Merchants Leaderboard
  const merchantMap = {};
  for (const t of transactions) {
    if ((t.amount || 0) < 0) {
      const m = t.merchantName || 'PayPal Merchant';
      merchantMap[m] = (merchantMap[m] || 0) + Math.abs(t.amount);
    }
  }
  const topMerchants = Object.entries(merchantMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="bg-white rounded-[18px] border border-[#DCE7F1] p-5 sm:p-6 shadow-[0_12px_40px_rgba(0,48,138,0.06)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-[#00308A] tracking-tight">
              Financial Analytics
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#009CDE]/10 text-[#0079C1] border border-[#009CDE]/20 uppercase">
              {currentMonth}
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Visual breakdown of cash flow ratios, category expenditure, and merchant patterns
          </p>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#DCE7F1] p-4.5 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
            Savings Rate
          </span>
          <div className="text-2xl font-bold text-[#00308A] mt-1">
            {savingsRate}%
          </div>
          <p className="text-[11px] text-[#0079C1] font-medium mt-0.5">
            {savingsRate >= 20 ? 'Target achieved (≥20%)' : 'Aim for 20% savings'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#DCE7F1] p-4.5 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
            Expense-to-Income Ratio
          </span>
          <div className="text-2xl font-bold text-[#00308A] mt-1">
            {totalIncome > 0 ? `${Math.round((totalExpenses / totalIncome) * 100)}%` : 'N/A'}
          </div>
          <p className="text-[11px] text-[#64748B] font-medium mt-0.5">
            {totalIncome > 0 && totalExpenses <= totalIncome ? 'Healthy living within means' : 'Monitor cash outflow'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#DCE7F1] p-4.5 shadow-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
            Avg Outflow per Expense
          </span>
          <div className="text-2xl font-bold text-[#00308A] mt-1">
            ${stats?.totalCount ? (totalExpenses / Math.max(1, stats.totalCount)).toFixed(2) : '0.00'}
          </div>
          <p className="text-[11px] text-[#64748B] font-medium mt-0.5">Across recorded transactions</p>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Chart (7 cols): Income vs Expense Comparison */}
        <div className="lg:col-span-7 bg-white rounded-[18px] border border-[#DCE7F1] p-5 sm:p-6 shadow-[0_12px_40px_rgba(0,48,138,0.06)]">
          <div className="flex items-center justify-between pb-4 border-b border-[#DCE7F1] mb-4">
            <div>
              <h3 className="font-bold text-base text-[#00308A]">Cash Flow Comparison</h3>
              <p className="text-xs text-[#64748B]">Income vs Expenses vs Net Savings</p>
            </div>
            <span className="text-xs font-semibold text-[#0079C1] bg-[#F4F8FC] px-2.5 py-0.5 rounded-md border border-[#DCE7F1]">
              Bar Metrics
            </span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incomeVsExpenseData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#DCE7F1" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 12, fill: '#64748B' }} />
                <Tooltip
                  formatter={(val) => [`$${val.toFixed(2)}`, 'Amount']}
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #DCE7F1',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart (5 cols): Category Distribution Donut */}
        <div className="lg:col-span-5 bg-white rounded-[18px] border border-[#DCE7F1] p-5 sm:p-6 shadow-[0_12px_40px_rgba(0,48,138,0.06)]">
          <div className="flex items-center justify-between pb-4 border-b border-[#DCE7F1] mb-4">
            <div>
              <h3 className="font-bold text-base text-[#00308A]">Expense Distribution</h3>
              <p className="text-xs text-[#64748B]">Relative weight by category</p>
            </div>
            <span className="text-xs font-semibold text-[#0079C1] bg-[#F4F8FC] px-2.5 py-0.5 rounded-md border border-[#DCE7F1]">
              Donut
            </span>
          </div>

          <div className="h-56 relative flex items-center justify-center">
            {categoryData.length === 0 ? (
              <div className="text-center text-xs text-[#64748B]">No expenses recorded yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    formatter={(val, name) => [`$${val.toFixed(2)}`, name]}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #DCE7F1',
                      fontSize: '12px',
                    }}
                  />
                  <Pie
                    data={categoryData}
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Top 3 categories summary */}
          <div className="mt-4 pt-3 border-t border-[#DCE7F1] space-y-1.5 text-xs">
            {categoryData.slice(0, 3).map((c) => (
              <div key={c.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="font-medium text-[#00308A]">{c.name}</span>
                </div>
                <span className="font-bold font-mono text-[#00308A]">${c.value.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Merchants Leaderboard */}
      <div className="bg-white rounded-[18px] border border-[#DCE7F1] p-5 sm:p-6 shadow-[0_12px_40px_rgba(0,48,138,0.06)]">
        <div className="flex items-center justify-between pb-4 border-b border-[#DCE7F1] mb-4">
          <div>
            <h3 className="font-bold text-base text-[#00308A]">Top Spending Merchants</h3>
            <p className="text-xs text-[#64748B]">Vendors receiving the largest cumulative payments</p>
          </div>
        </div>

        {topMerchants.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#64748B]">
            No merchant data available. Synchronize transactions to generate merchant intelligence.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {topMerchants.map(([merchant, amt], idx) => (
              <div key={merchant} className="bg-[#F4F8FC] border border-[#DCE7F1] rounded-xl p-3.5 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-[#0079C1]">
                  <span>#{idx + 1} Merchant</span>
                </div>
                <h4 className="font-bold text-xs text-[#00308A] truncate" title={merchant}>{merchant}</h4>
                <div className="text-base font-bold text-[#00308A] font-mono">${amt.toFixed(2)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
