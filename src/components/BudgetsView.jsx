import React, { useState } from 'react';
import {
  Target,
  Edit2,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  TrendingDown,
  DollarSign,
  Layers,
  Sparkles
} from 'lucide-react';
import { CATEGORY_COLORS } from './DashboardView';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function BudgetsView({
  budget,
  stats,
  onOpenEditBudget,
  onBudgetUpdated,
  activeUserId,
}) {
  const [editingCategory, setEditingCategory] = useState(null);
  const [tempLimit, setTempLimit] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const monthlyBudget = budget?.monthlyBudget || 3000;
  const totalExpenses = stats?.totalOutgoing || 0;
  const remainingBudget = Math.max(0, monthlyBudget - totalExpenses);
  const usagePercent = Math.min(100, Math.round((totalExpenses / monthlyBudget) * 100));

  // Category limits list
  const categoryBudgets = budget?.categoryBudgets || [
    { category: 'Food & Dining', limit: 600 },
    { category: 'Shopping', limit: 400 },
    { category: 'Bills & Utilities', limit: 500 },
    { category: 'Entertainment', limit: 300 },
    { category: 'Travel', limit: 350 },
    { category: 'Health', limit: 200 },
    { category: 'Education', limit: 250 },
  ];

  const categoryMap = stats?.categoryWise || {};

  const handleSaveCategoryLimit = async (catName) => {
    const val = parseFloat(tempLimit);
    if (isNaN(val) || val <= 0) return;

    setIsLoading(true);
    try {
      const updatedList = categoryBudgets.map((b) =>
        b.category === catName ? { ...b, limit: val } : b
      );

      const res = await fetch(`${BACKEND_URL}/api/budgets`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': activeUserId,
        },
        body: JSON.stringify({
          monthlyBudget,
          categoryBudgets: updatedList,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onBudgetUpdated(data.budget);
        setEditingCategory(null);
      }
    } catch (err) {
      console.error('Error updating category limit', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Top Header */}
      <div className="bg-white rounded-[18px] border border-[#DCE7F1] p-5 sm:p-6 shadow-[0_12px_40px_rgba(0,48,138,0.06)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-bold text-[#00308A] tracking-tight">
              Budget Management
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#009CDE]/10 text-[#0079C1] border border-[#009CDE]/20 uppercase">
              ACTIVE CYCLE
            </span>
          </div>
          <p className="text-xs text-[#64748B] mt-1">
            Track allowance thresholds and prevent accidental overspending
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenEditBudget}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#0079C1] text-white hover:bg-[#00308A] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Monthly Target</span>
          </button>
        </div>
      </div>

      {/* Main Budget Progress Overview */}
      <div className="bg-white rounded-[18px] border border-[#DCE7F1] p-6 shadow-[0_12px_40px_rgba(0,48,138,0.06)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Total Monthly Target
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-[#00308A] mt-0.5">
              ${monthlyBudget.toFixed(2)}
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div>
              <span className="text-xs text-[#64748B] block">Spent so far</span>
              <span className="text-lg font-bold text-[#00308A] font-mono">
                ${totalExpenses.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-xs text-[#64748B] block">Remaining</span>
              <span className={`text-lg font-bold font-mono ${totalExpenses > monthlyBudget ? 'text-red-600' : 'text-emerald-700'}`}>
                ${remainingBudget.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-xs text-[#64748B] block">Usage</span>
              <span className="text-lg font-bold text-[#0079C1] font-mono">
                {usagePercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Large Progress Bar */}
        <div className="w-full h-3.5 bg-[#F4F8FC] rounded-full overflow-hidden border border-[#DCE7F1] p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              totalExpenses > monthlyBudget
                ? 'bg-red-500'
                : usagePercent >= 80
                ? 'bg-amber-500'
                : 'bg-[#0079C1]'
            }`}
            style={{ width: `${Math.min(100, usagePercent)}%` }}
          />
        </div>

        {/* Status Callout */}
        {totalExpenses > monthlyBudget ? (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>You have exceeded your total monthly budget target by ${(totalExpenses - monthlyBudget).toFixed(2)}.</span>
          </div>
        ) : usagePercent >= 80 ? (
          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Caution: You have utilized {usagePercent}% of your monthly budget. Monitor remaining discretionary spending.</span>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Great job! You are well within your healthy monthly budget boundary.</span>
          </div>
        )}
      </div>

      {/* Category-Wise Budgets Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base text-[#00308A]">Category Budget Limits</h3>
          <span className="text-xs text-[#64748B]">{categoryBudgets.length} configured limits</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryBudgets.map((b) => {
            const spent = categoryMap[b.category]?.totalAmount || 0;
            const limit = b.limit || 500;
            const pct = Math.min(100, Math.round((spent / limit) * 100));
            const color = CATEGORY_COLORS[b.category] || '#0079C1';
            const isEditing = editingCategory === b.category;
            const isOver = spent > limit;

            return (
              <div
                key={b.category}
                className={`bg-white rounded-2xl p-5 border shadow-xs space-y-3 transition-all ${
                  isOver ? 'border-red-300 ring-1 ring-red-200' : 'border-[#DCE7F1]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <h4 className="font-bold text-sm text-[#00308A]">{b.category}</h4>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      isOver
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : pct >= 80
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {isOver ? 'Exceeded' : pct >= 80 ? 'Near Limit' : 'On Track'}
                  </span>
                </div>

                {/* Amount comparisons */}
                <div className="flex items-baseline justify-between text-xs">
                  <div>
                    <span className="text-[#64748B] block text-[11px]">Spent</span>
                    <span className="font-bold font-mono text-[#00308A] text-sm">
                      ${spent.toFixed(2)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[#64748B] block text-[11px]">Limit</span>
                    {isEditing ? (
                      <div className="flex items-center gap-1 mt-0.5">
                        <input
                          type="number"
                          value={tempLimit}
                          onChange={(e) => setTempLimit(e.target.value)}
                          placeholder={limit.toString()}
                          className="w-16 px-1.5 py-0.5 border border-[#0079C1] rounded text-xs font-mono font-bold"
                          autoFocus
                        />
                        <button
                          onClick={() => handleSaveCategoryLimit(b.category)}
                          disabled={isLoading}
                          className="text-[10px] bg-[#0079C1] text-white px-1.5 py-0.5 rounded cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="font-bold font-mono text-[#00308A] text-sm">
                          ${limit.toFixed(2)}
                        </span>
                        <button
                          onClick={() => {
                            setEditingCategory(b.category);
                            setTempLimit(limit.toString());
                          }}
                          className="text-[#64748B] hover:text-[#0079C1] p-0.5 cursor-pointer"
                          title="Edit category limit"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-[#F4F8FC] rounded-full overflow-hidden border border-[#DCE7F1]">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isOver ? 'bg-red-500' : pct >= 80 ? 'bg-amber-500' : 'bg-[#0079C1]'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-0.5">
                  <span>{pct}% utilized</span>
                  <span>{isOver ? `+$${(spent - limit).toFixed(2)} over` : `$${(limit - spent).toFixed(2)} left`}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
