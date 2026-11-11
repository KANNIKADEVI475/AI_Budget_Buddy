import React, { useState } from 'react';
import {
  Layers,
  Tag,
  AlertCircle,
  CheckCircle2,
  Filter,
  DollarSign,
  ArrowRight,
  TrendingDown,
  Loader2,
  Receipt
} from 'lucide-react';
import { CATEGORY_COLORS } from './DashboardView';

const ALL_CATEGORIES = [
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

export default function CategoriesView({
  transactions,
  stats,
  onUpdateCategory,
  onNavigate,
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);

  const totalExpenses = stats?.totalOutgoing || 0;
  const categoryMap = stats?.categoryWise || {};

  // Find count of uncategorized transactions
  const uncategorizedCount = categoryMap['Uncategorized']?.count || 0;
  const uncategorizedAmount = categoryMap['Uncategorized']?.totalAmount || 0;

  // Filter transactions based on selection
  const filteredTransactions = transactions.filter((t) => {
    if (selectedCategory === 'All') return true;
    return (t.category || 'Uncategorized') === selectedCategory;
  });

  const handleCategoryChange = async (txId, newCategory) => {
    setUpdatingId(txId);
    await onUpdateCategory(txId, newCategory);
    setUpdatingId(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="bg-white rounded-[18px] border border-[#DCE7F1] p-5 sm:p-6 shadow-[0_12px_40px_rgba(0,48,138,0.06)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-[#00308A] tracking-tight">
              Category Management
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#009CDE]/10 text-[#0079C1] border border-[#009CDE]/20 uppercase">
              {ALL_CATEGORIES.length} Categories
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Organize, monitor, and reclassify your spending categories
          </p>
        </div>

        {/* Action / Helper */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('transactions')}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#0079C1] text-white hover:bg-[#00308A] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Full Transaction History</span>
          </button>
        </div>
      </div>

      {/* Uncategorized Warning Banner */}
      {uncategorizedCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold block">
                {uncategorizedCount} Uncategorized Transaction(s) Detected (${uncategorizedAmount.toFixed(2)})
              </span>
              <span className="text-[11px] text-amber-800">
                Categorizing your transactions improves AI Budget Buddy's pattern detection and budget recommendations.
              </span>
            </div>
          </div>

          <button
            onClick={() => setSelectedCategory('Uncategorized')}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl text-xs transition-colors shrink-0 cursor-pointer"
          >
            Review Uncategorized
          </button>
        </div>
      )}

      {/* Category Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {ALL_CATEGORIES.map((cat) => {
          const data = categoryMap[cat] || { count: 0, totalAmount: 0 };
          const color = CATEGORY_COLORS[cat] || '#0079C1';
          const isSelected = selectedCategory === cat;
          const pct = totalExpenses > 0 ? Math.round((data.totalAmount / totalExpenses) * 100) : 0;

          return (
            <div
              key={cat}
              onClick={() => setSelectedCategory(isSelected ? 'All' : cat)}
              className={`bg-white rounded-2xl p-4.5 border transition-all duration-150 cursor-pointer shadow-xs hover:shadow-md ${
                isSelected
                  ? 'border-[#0079C1] ring-2 ring-[#0079C1]/20 bg-[#F4F8FC]/50'
                  : 'border-[#DCE7F1] hover:border-[#009CDE]/50'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
                  style={{ backgroundColor: color }}
                >
                  <Tag className="w-4 h-4" />
                </div>
                <span className="text-xs font-mono font-bold text-[#00308A]">
                  ${data.totalAmount.toFixed(2)}
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-sm text-[#00308A]">{cat}</h4>
                <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                  <span>{data.count} transaction(s)</span>
                  <span>{cat !== 'Income' ? `${pct}% of spend` : 'Credit'}</span>
                </div>
              </div>

              {/* Progress bar */}
              {cat !== 'Income' && (
                <div className="mt-3 w-full h-1.5 bg-[#F4F8FC] rounded-full overflow-hidden border border-[#DCE7F1]">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Filtered Transactions List for Selected Category */}
      <div className="bg-white rounded-[18px] border border-[#DCE7F1] shadow-[0_12px_40px_rgba(0,48,138,0.06)] overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#DCE7F1] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#0079C1]" />
            <h3 className="font-bold text-sm text-[#00308A]">
              Transactions in: <span className="text-[#0079C1]">{selectedCategory}</span>
            </h3>
            <span className="text-xs text-[#64748B]">({filteredTransactions.length} items)</span>
          </div>

          {selectedCategory !== 'All' && (
            <button
              onClick={() => setSelectedCategory('All')}
              className="text-xs font-bold text-[#0079C1] hover:underline cursor-pointer"
            >
              Show All Categories
            </button>
          )}
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#64748B]">
            No transactions found in category "{selectedCategory}".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#F4F8FC]/60 border-b border-[#DCE7F1] text-[11px] font-bold text-[#00308A] uppercase">
                  <th className="py-3 px-4">Merchant</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-center">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE7F1]">
                {filteredTransactions.map((t) => {
                  const isIncome = (t.amount || 0) > 0;
                  const isUpdating = updatingId === t._id;

                  return (
                    <tr key={t._id} className="hover:bg-[#F4F8FC]/50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-[#00308A]">
                        {t.merchantName || 'PayPal Transaction'}
                      </td>
                      <td className="py-3 px-4 text-[#64748B]">
                        {t.transactionDate
                          ? new Date(t.transactionDate).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className={`py-3 px-4 font-mono font-bold ${isIncome ? 'text-emerald-700' : 'text-[#00308A]'}`}>
                        {isIncome ? `+$${t.amount.toFixed(2)}` : `-$${Math.abs(t.amount).toFixed(2)}`}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={t.category || 'Uncategorized'}
                          disabled={isUpdating}
                          onChange={(e) => handleCategoryChange(t._id, e.target.value)}
                          className="text-xs font-medium py-1 px-2.5 rounded-lg border border-[#DCE7F1] bg-white text-[#00308A] focus:outline-none focus:border-[#0079C1] cursor-pointer disabled:opacity-50"
                        >
                          {ALL_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                            t.categorySource === 'manual'
                              ? 'bg-[#009CDE]/10 text-[#0079C1] border border-[#009CDE]/20'
                              : 'bg-[#F4F8FC] text-[#64748B]'
                          }`}
                        >
                          {t.categorySource === 'manual' ? 'Manual' : 'Default'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
