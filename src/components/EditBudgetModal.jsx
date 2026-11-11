import React, { useState } from 'react';
import { Target, X, Check, Loader2, DollarSign, AlertCircle } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function EditBudgetModal({ isOpen, onClose, currentBudget, onBudgetUpdated, activeUserId }) {
  const [monthlyAmount, setMonthlyAmount] = useState(currentBudget?.monthlyBudget || 3000);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const val = parseFloat(monthlyAmount);
    if (isNaN(val) || val <= 0) {
      setError('Please enter a valid positive budget amount.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/budgets`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': activeUserId,
        },
        body: JSON.stringify({
          monthlyBudget: val,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update budget');
      }

      onBudgetUpdated(data.budget);
      onClose();
    } catch (err) {
      setError(err.message || 'Error updating budget');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#DCE7F1] overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#DCE7F1] flex items-center justify-between bg-gradient-to-r from-[#F4F8FC] to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0079C1]/10 text-[#0079C1] flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[#00308A] text-base">Edit Monthly Budget</h3>
              <p className="text-xs text-[#64748B]">Set your monthly spending target</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#00308A] hover:bg-[#F4F8FC] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-[#00308A] block mb-1.5">
              Total Monthly Budget ($ USD)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-[#64748B] font-bold text-sm">$</span>
              <input
                type="number"
                min="1"
                step="50"
                value={monthlyAmount}
                onChange={(e) => setMonthlyAmount(e.target.value)}
                placeholder="3000"
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-[#DCE7F1] text-sm font-semibold text-[#00308A] focus:outline-none focus:border-[#0079C1] focus:ring-2 focus:ring-[#009CDE]/15"
                required
              />
            </div>
            <p className="text-[11px] text-[#64748B] mt-1.5">
              This target is used to calculate budget usage percentage and remaining allowance.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#F4F8FC] border border-[#DCE7F1] text-xs text-[#00308A] space-y-1">
            <div className="font-semibold text-[#0079C1]">Budget Rule Guideline:</div>
            <p className="text-[11px] text-[#64748B] leading-relaxed">
              We recommend allocating no more than 50% for fixed needs (utilities, groceries) and 30% for discretionary lifestyle spending.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:bg-[#F4F8FC] border border-[#DCE7F1] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#0079C1] hover:bg-[#00308A] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Budget</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
