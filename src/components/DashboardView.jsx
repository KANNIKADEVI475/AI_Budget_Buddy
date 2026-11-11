import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  Sparkles,
  ChevronRight,
  Calendar,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Target,
  Layers,
  ArrowRight,
  Receipt,
  Edit2,
  Database,
  RefreshCw,
  Plus,
  Tag,
  Loader2,
  Check
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

export const CATEGORY_COLORS = {
  'Food & Dining': '#0079C1',
  'Shopping': '#009CDE',
  'Bills & Utilities': '#00308A',
  'Entertainment': '#2563EB',
  'Travel': '#0284C7',
  'Education': '#0369A1',
  'Health': '#0D9488',
  'Income': '#059669',
  'Transfers': '#4F46E5',
  'Other': '#64748B',
  'Uncategorized': '#94A3B8',
};

const CATEGORIES_LIST = [
  'Uncategorized',
  'Food & Dining',
  'Shopping',
  'Travel',
  'Entertainment',
  'Bills & Utilities',
  'Education',
  'Health',
  'Income',
  'Transfers',
  'Other',
];

export default function DashboardView({
  transactions,
  stats,
  syncStatus,
  budget,
  onNavigate,
  onOpenEditBudget,
  onOpenAIAssistant,
  onUpdateCategory,
  onSeedData,
  isSeeding,
  onSyncNow,
  isSyncing,
  currentMonth,
  activeUserId,
}) {
  const [updatingId, setUpdatingId] = useState(null);

  const monthlyBudget = budget?.monthlyBudget || 3000;
  const totalIncome = stats?.totalIncoming || 0;
  const totalExpenses = stats?.totalOutgoing || 0;
  const netCashFlow = totalIncome - totalExpenses;
  const totalTransactionsCount = stats?.totalCount || transactions.length || 0;
  const remainingBudget = Math.max(0, monthlyBudget - totalExpenses);
  const budgetUsagePercent = Math.min(100, Math.round((totalExpenses / monthlyBudget) * 100));

  // Determine budget health color & text
  let budgetColor = 'bg-[#0079C1]';
  let budgetStatusText = 'On Track';
  if (totalExpenses > monthlyBudget) {
    budgetColor = 'bg-red-500';
    budgetStatusText = 'Over Budget';
  } else if (budgetUsagePercent >= 80) {
    budgetColor = 'bg-amber-500';
    budgetStatusText = 'Near Limit';
  }

  // Build data array for Donut Chart from actual MongoDB category breakdown
  const categoryData = Object.entries(stats?.categoryWise || {})
    .filter(([cat]) => cat !== 'Income') // Only expenses in expense breakdown
    .map(([name, data]) => ({
      name,
      value: parseFloat((data.totalAmount || 0).toFixed(2)),
      count: data.count || 0,
      color: CATEGORY_COLORS[name] || '#0079C1',
    }))
    .sort((a, b) => b.value - a.value);

  // Fallback data if no expenses exist yet
  const chartData = categoryData.length > 0 ? categoryData : [
    { name: 'No Expenses Yet', value: 1, color: '#DCE7F1' }
  ];

  // Dynamically calculate Largest Expense Category
  const largestExpense = categoryData.length > 0 ? categoryData[0] : null;
  const largestExpensePercent = (largestExpense && totalExpenses > 0)
    ? Math.round((largestExpense.value / totalExpenses) * 100)
    : 0;

  // Handle inline category change for recent transactions
  const handleCategoryChange = async (txId, newCategory) => {
    setUpdatingId(txId);
    await onUpdateCategory(txId, newCategory);
    setUpdatingId(null);
  };

  const userName = activeUserId === 'user_demo_1' ? 'Alex' : 'Morgan';

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* 1. Welcome Section */}
      <div className="bg-white rounded-[18px] border border-[#DCE7F1] p-5 sm:p-6 shadow-[0_12px_40px_rgba(0,48,138,0.06)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-[#00308A] tracking-tight">
              Welcome back, {userName}!
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#009CDE]/10 text-[#0079C1] border border-[#009CDE]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#009CDE] animate-pulse" />
              SANDBOX MODE
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Here is your financial overview for <strong className="text-[#00308A]">{currentMonth}</strong>.
          </p>
        </div>

        {/* Sync Info & Connection Status */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2 bg-[#F4F8FC] border border-[#DCE7F1] px-3 py-1.5 rounded-xl">
            <span
              className={`w-2 h-2 rounded-full ${
                syncStatus?.connectionStatus === 'connected' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
              }`}
            />
            <span className="font-semibold text-[#00308A]">
              {syncStatus?.connectionStatus === 'connected' ? 'PayPal Connected' : 'Not Connected'}
            </span>
            <span className="text-[#DCE7F1]">|</span>
            <span className="text-[#64748B] flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#0079C1]" />
              {syncStatus?.lastSyncedAt
                ? new Date(syncStatus.lastSyncedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })
                : 'Never synced'}
            </span>
          </div>

          <button
            onClick={() => onNavigate('connection')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-[#DCE7F1] hover:border-[#0079C1] text-[#0079C1] transition-all cursor-pointer flex items-center gap-1"
          >
            <span>Connection Settings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Monthly Financial Overview (6 Summary Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Income */}
        <div className="bg-white rounded-2xl border border-[#DCE7F1] p-4 shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1">
            <span>Total Income</span>
            <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ArrowDownLeft className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-700">
            ${totalIncome.toFixed(2)}
          </div>
          <p className="text-[10px] text-emerald-700 font-medium mt-1">Inflow this month</p>
        </div>

        {/* Total Expenses */}
        <div className="bg-white rounded-2xl border border-[#DCE7F1] p-4 shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1">
            <span>Total Expenses</span>
            <div className="w-6 h-6 rounded-md bg-[#0079C1]/10 text-[#0079C1] flex items-center justify-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#00308A]">
            ${totalExpenses.toFixed(2)}
          </div>
          <p className="text-[10px] text-[#64748B] font-medium mt-1">Outflow this month</p>
        </div>

        {/* Net Cash Flow */}
        <div className="bg-white rounded-2xl border border-[#DCE7F1] p-4 shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1">
            <span>Net Cash Flow</span>
            <div className={`w-6 h-6 rounded-md flex items-center justify-center ${netCashFlow >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className={`text-xl sm:text-2xl font-bold ${netCashFlow >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
            {netCashFlow >= 0 ? `+$${netCashFlow.toFixed(2)}` : `-$${Math.abs(netCashFlow).toFixed(2)}`}
          </div>
          <p className="text-[10px] text-[#64748B] font-medium mt-1">
            {netCashFlow >= 0 ? 'Surplus balance' : 'Deficit balance'}
          </p>
        </div>

        {/* Total Transactions */}
        <div className="bg-white rounded-2xl border border-[#DCE7F1] p-4 shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1">
            <span>Transactions</span>
            <div className="w-6 h-6 rounded-md bg-[#009CDE]/10 text-[#0079C1] flex items-center justify-center">
              <Receipt className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#00308A]">
            {totalTransactionsCount}
          </div>
          <p className="text-[10px] text-[#64748B] font-medium mt-1">Recorded in DB</p>
        </div>

        {/* Monthly Budget */}
        <div className="bg-white rounded-2xl border border-[#DCE7F1] p-4 shadow-xs relative group">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1">
            <span>Budget</span>
            <button
              onClick={onOpenEditBudget}
              className="text-[#0079C1] hover:text-[#00308A] p-0.5 cursor-pointer"
              title="Edit monthly budget"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-[#00308A]">
            ${monthlyBudget.toFixed(2)}
          </div>
          <p className="text-[10px] text-[#0079C1] font-medium mt-1 cursor-pointer hover:underline" onClick={onOpenEditBudget}>
            Set target limit
          </p>
        </div>

        {/* Remaining Budget */}
        <div className="bg-white rounded-2xl border border-[#DCE7F1] p-4 shadow-xs">
          <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#64748B] mb-1">
            <span>Remaining</span>
            <div className="w-6 h-6 rounded-md bg-[#0079C1]/10 text-[#0079C1] flex items-center justify-center">
              <Target className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className={`text-xl sm:text-2xl font-bold ${totalExpenses > monthlyBudget ? 'text-red-600' : 'text-[#00308A]'}`}>
            ${remainingBudget.toFixed(2)}
          </div>
          <p className="text-[10px] text-[#64748B] font-medium mt-1">
            {100 - budgetUsagePercent}% left
          </p>
        </div>
      </div>

      {/* 3. Main Dashboard Grid (2 Columns: Left 65%, Right 35%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Monthly Budget Card & Recent Transactions */}
        <div className="lg:col-span-7 space-y-6">
          {/* Monthly Budget Visualization Card */}
          <div className="bg-white rounded-[18px] border border-[#DCE7F1] p-5 sm:p-6 shadow-[0_12px_40px_rgba(0,48,138,0.06)]">
            <div className="flex items-center justify-between pb-4 border-b border-[#DCE7F1]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#0079C1]/10 text-[#0079C1] flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#00308A] text-base">Monthly Budget</h3>
                  <p className="text-xs text-[#64748B]">Spending pace for {currentMonth}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    totalExpenses > monthlyBudget
                      ? 'bg-red-50 text-red-600 border border-red-200'
                      : budgetUsagePercent >= 80
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {budgetStatusText}
                </span>
                <button
                  onClick={onOpenEditBudget}
                  className="p-1.5 rounded-lg border border-[#DCE7F1] hover:bg-[#F4F8FC] text-[#64748B] hover:text-[#00308A] cursor-pointer"
                  title="Adjust monthly budget"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Budget Progress Bar */}
            <div className="mt-5 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[#00308A]">
                <span>Spent: ${totalExpenses.toFixed(2)}</span>
                <span>Budget: ${monthlyBudget.toFixed(2)}</span>
              </div>

              <div className="w-full h-3.5 bg-[#F4F8FC] rounded-full overflow-hidden border border-[#DCE7F1] p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${budgetColor}`}
                  style={{ width: `${Math.min(100, budgetUsagePercent)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-0.5">
                <span>{budgetUsagePercent}% Used</span>
                <span>${remainingBudget.toFixed(2)} Remaining ({Math.max(0, 100 - budgetUsagePercent)}%)</span>
              </div>
            </div>

            {/* Warning Note if approaching or over */}
            {budgetUsagePercent >= 80 && (
              <div className="mt-4 p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900 flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  {totalExpenses > monthlyBudget
                    ? `Warning: You have exceeded your $${monthlyBudget} budget by $${(totalExpenses - monthlyBudget).toFixed(2)}.`
                    : `Caution: You have utilized ${budgetUsagePercent}% of your monthly allowance.`}
                </span>
              </div>
            )}
          </div>

          {/* Recent Transactions Card */}
          <div className="bg-white rounded-[18px] border border-[#DCE7F1] shadow-[0_12px_40px_rgba(0,48,138,0.06)] overflow-hidden">
            <div className="p-5 sm:p-6 pb-4 border-b border-[#DCE7F1] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[#00308A] text-base">Recent Transactions</h3>
                <p className="text-xs text-[#64748B]">Latest activity from PayPal Sandbox</p>
              </div>

              <button
                onClick={() => onNavigate('transactions')}
                className="text-xs font-bold text-[#0079C1] hover:text-[#00308A] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {transactions.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-[#0079C1]/10 text-[#0079C1] flex items-center justify-center mx-auto">
                  <Database className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-[#00308A]">No transactions in database yet</p>
                <div className="flex justify-center gap-2 pt-1">
                  <button
                    onClick={onSeedData}
                    disabled={isSeeding}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#0079C1] text-white hover:bg-[#00308A] cursor-pointer"
                  >
                    {isSeeding ? 'Seeding...' : 'Load Sample Data'}
                  </button>
                  <button
                    onClick={onSyncNow}
                    disabled={isSyncing}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#F4F8FC] border border-[#DCE7F1] text-[#00308A] cursor-pointer"
                  >
                    Sync PayPal
                  </button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-[#DCE7F1]">
                {transactions.slice(0, 5).map((t) => {
                  const isIncome = (t.amount || 0) > 0;
                  const isUpdating = updatingId === t._id;

                  return (
                    <div
                      key={t._id}
                      className="p-4 sm:px-6 flex items-center justify-between hover:bg-[#F4F8FC]/50 transition-colors gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isIncome
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-[#0079C1]/10 text-[#0079C1]'
                          }`}
                        >
                          {isIncome ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#00308A] truncate">{t.merchantName || 'PayPal Merchant'}</p>
                          <p className="text-[11px] text-[#64748B]">
                            {t.transactionDate
                              ? new Date(t.transactionDate).toLocaleDateString([], {
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : '—'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {/* Interactive Category Selector */}
                        <div className="relative hidden sm:block">
                          <select
                            value={t.category || 'Uncategorized'}
                            disabled={isUpdating}
                            onChange={(e) => handleCategoryChange(t._id, e.target.value)}
                            className="text-xs font-medium py-1 px-2.5 rounded-lg border border-[#DCE7F1] bg-white text-[#00308A] focus:outline-none focus:border-[#0079C1] cursor-pointer disabled:opacity-50"
                          >
                            {CATEGORIES_LIST.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Amount */}
                        <div className="text-right">
                          <span className={`font-mono font-bold text-sm ${isIncome ? 'text-emerald-700' : 'text-[#00308A]'}`}>
                            {isIncome ? `+$${t.amount.toFixed(2)}` : `-$${Math.abs(t.amount).toFixed(2)}`}
                          </span>
                          <span className="block text-[10px] text-[#64748B] uppercase">{t.currency || 'USD'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Expense Breakdown Donut Chart & Largest Expense */}
        <div className="lg:col-span-5 space-y-6">
          {/* Expense Breakdown Donut Chart */}
          <div className="bg-white rounded-[18px] border border-[#DCE7F1] p-5 sm:p-6 shadow-[0_12px_40px_rgba(0,48,138,0.06)]">
            <div className="flex items-center justify-between pb-4 border-b border-[#DCE7F1]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#009CDE]/10 text-[#0079C1] flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-[#00308A] text-base">Expense Breakdown</h3>
                  <p className="text-xs text-[#64748B]">Categorized distribution</p>
                </div>
              </div>

              <span className="text-xs font-semibold text-[#0079C1] bg-[#F4F8FC] px-2 py-0.5 rounded-md border border-[#DCE7F1]">
                {categoryData.length} Categories
              </span>
            </div>

            {/* Donut Chart Container */}
            <div className="h-56 relative mt-2 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    formatter={(val, name) => [`$${val.toFixed(2)}`, name]}
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #DCE7F1',
                      fontSize: '12px',
                      boxShadow: '0 8px 24px rgba(0,48,138,0.08)',
                    }}
                  />
                  <Pie
                    data={chartData}
                    innerRadius={65}
                    outerRadius={88}
                    paddingAngle={chartData.length > 1 ? 3 : 0}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Total Expenses in Center */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider">
                  Total Spent
                </span>
                <span className="text-xl font-bold text-[#00308A]">
                  ${totalExpenses.toFixed(2)}
                </span>
                <span className="text-[10px] text-[#0079C1] font-medium">{currentMonth}</span>
              </div>
            </div>

            {/* Category Legend */}
            <div className="mt-3 pt-3 border-t border-[#DCE7F1] space-y-2 max-h-40 overflow-y-auto no-scrollbar">
              {categoryData.slice(0, 5).map((cat) => {
                const pct = totalExpenses > 0 ? Math.round((cat.value / totalExpenses) * 100) : 0;
                return (
                  <div key={cat.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-medium text-[#00308A]">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#64748B] text-[11px] font-medium">{pct}%</span>
                      <span className="font-semibold text-[#00308A] font-mono">${cat.value.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Largest Expense Card */}
          <div className="bg-white rounded-[18px] border border-[#DCE7F1] p-5 sm:p-6 shadow-[0_12px_40px_rgba(0,48,138,0.06)]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                Highest Spending Category
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#0079C1]/10 text-[#0079C1]">
                TOP EXPENSE
              </span>
            </div>

            {largestExpense ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-sm"
                      style={{ backgroundColor: largestExpense.color }}
                    >
                      <Tag className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#00308A] text-base">{largestExpense.name}</h4>
                      <p className="text-xs text-[#64748B]">{largestExpense.count} transactions recorded</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xl font-bold text-[#00308A] font-mono">
                      ${largestExpense.value.toFixed(2)}
                    </div>
                    <span className="text-xs text-[#0079C1] font-semibold">{largestExpensePercent}% of total</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-[#F4F8FC] rounded-full overflow-hidden border border-[#DCE7F1]">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${largestExpensePercent}%`,
                      backgroundColor: largestExpense.color,
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-[#64748B]">
                No expenses registered yet. Seed or sync data to analyze spending.
              </div>
            )}
          </div>

          {/* AI Insights Teaser Card */}
          <div className="bg-gradient-to-br from-[#F4F8FC] to-white rounded-[18px] border border-[#009CDE]/30 p-5 shadow-[0_12px_40px_rgba(0,48,138,0.06)] relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE7F1]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#0079C1] text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <h4 className="font-bold text-[#00308A] text-sm">AI Financial Insights</h4>
              </div>

              <button
                onClick={onOpenAIAssistant}
                className="text-xs font-bold text-[#0079C1] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Ask Buddy</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="mt-3 space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-white border border-[#DCE7F1] text-[#00308A] leading-relaxed">
                {largestExpense ? (
                  <span>
                    💡 <strong>{largestExpense.name}</strong> accounts for {largestExpensePercent}% of your spending this cycle. Cutting back by 15% would save approx <strong>${(largestExpense.value * 0.15).toFixed(2)}</strong>.
                  </span>
                ) : (
                  <span>
                    💡 Connect your PayPal Sandbox account and seed transactions to receive algorithmic spending observations!
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={onOpenAIAssistant}
                className="w-full py-2 bg-[#0079C1] hover:bg-[#00308A] text-white font-semibold rounded-xl transition-colors text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#009CDE]" />
                <span>Chat with AI Budget Buddy</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
