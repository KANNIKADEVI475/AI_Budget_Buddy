import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw,
  Search,
  Filter,
  Calendar,
  Tag,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Layers,
  Database,
  Check,
  Loader2,
  ShieldCheck,
  TrendingDown,
  TrendingUp
} from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CATEGORIES = [
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

export default function TransactionHistory({ activeUserId, onDisconnect }) {
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [updateSuccessId, setUpdateSuccessId] = useState(null);
  const [error, setError] = useState(null);
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch transactions from backend
  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
      });
      if (search.trim()) params.append('search', search.trim());
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (selectedStatus !== 'All') params.append('status', selectedStatus);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await fetch(`${BACKEND_URL}/api/transactions?${params.toString()}`, {
        headers: {
          'x-user-id': activeUserId,
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to load transactions (Status ${res.status})`);
      }

      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalCount(data.pagination?.total || 0);
      }
    } catch (err) {
      setError(err.message || 'Error loading transactions');
    } finally {
      setIsLoading(false);
    }
  }, [activeUserId, page, search, selectedCategory, selectedStatus, startDate, endDate]);

  // Fetch aggregated stats and sync status
  const fetchStatsAndStatus = useCallback(async () => {
    try {
      const [statsRes, syncRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/transactions/stats`, {
          headers: { 'x-user-id': activeUserId },
        }),
        fetch(`${BACKEND_URL}/api/transactions/sync-status`, {
          headers: { 'x-user-id': activeUserId },
        }),
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }
      if (syncRes.ok) {
        const syncData = await syncRes.json();
        setSyncStatus(syncData);
      }
    } catch (err) {
      console.warn('Could not refresh stats or status', err);
    }
  }, [activeUserId]);

  useEffect(() => {
    fetchTransactions();
    fetchStatsAndStatus();
  }, [fetchTransactions, fetchStatsAndStatus]);

  // Manual Trigger: Sync with PayPal Sandbox API
  const handleSyncNow = async () => {
    setIsSyncing(true);
    setFeedbackMsg(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/transactions/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': activeUserId,
        },
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Synchronization failed');
      }

      setFeedbackMsg({
        type: 'success',
        text: `Sync complete! Fetched ${data.stats?.fetchedCount || 0} transaction(s). Inserted: ${data.stats?.insertedCount || 0}, Updated: ${data.stats?.updatedCount || 0}.`,
      });
      fetchTransactions();
      fetchStatsAndStatus();
    } catch (err) {
      setFeedbackMsg({
        type: 'error',
        text: err.message || 'Failed to sync with PayPal Sandbox.',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Development helper: Seed sample sandbox records
  const handleSeedData = async () => {
    setIsSeeding(true);
    setFeedbackMsg(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/transactions/seed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': activeUserId,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Seeding failed');

      setFeedbackMsg({
        type: 'success',
        text: `Seeded ${data.count || 5} sample Sandbox transactions into MongoDB for testing.`,
      });
      fetchTransactions();
      fetchStatsAndStatus();
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: err.message });
    } finally {
      setIsSeeding(false);
    }
  };

  // Manual Categorization: PATCH /api/transactions/:id/category
  const handleCategoryChange = async (transactionId, newCategory) => {
    setUpdatingId(transactionId);
    setFeedbackMsg(null);

    // Optimistic UI update
    setTransactions((prev) =>
      prev.map((t) =>
        t._id === transactionId
          ? { ...t, category: newCategory, categorySource: 'manual' }
          : t
      )
    );

    try {
      const res = await fetch(`${BACKEND_URL}/api/transactions/${transactionId}/category`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': activeUserId,
        },
        body: JSON.stringify({ category: newCategory }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update category');
      }

      setUpdateSuccessId(transactionId);
      setTimeout(() => setUpdateSuccessId(null), 2500);

      // Refresh statistics breakdown
      fetchStatsAndStatus();
    } catch (err) {
      setFeedbackMsg({
        type: 'error',
        text: `Category update error: ${err.message}`,
      });
      // Revert on failure
      fetchTransactions();
    } finally {
      setUpdatingId(null);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedStatus('All');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Top Banner: Status & Action Bar */}
      <div className="bg-white rounded-[18px] border border-[#DCE7F1] p-5 sm:p-6 shadow-[0_12px_40px_rgba(0,48,138,0.06)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-[#00308A] tracking-tight">
              Transaction History
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#009CDE]/10 text-[#0079C1] border border-[#009CDE]/20 uppercase">
              Sandbox Sync
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-1.5 text-xs text-[#64748B]">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#0079C1]" />
              Last Synced:{' '}
              <strong className="text-[#00308A] font-semibold">
                {syncStatus?.lastSyncedAt
                  ? new Date(syncStatus.lastSyncedAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Never'}
              </strong>
            </span>
            <span className="text-[#DCE7F1]">•</span>
            <span className="flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5 text-[#009CDE]" />
              Auto-Sync:{' '}
              <strong className={syncStatus?.autoSyncEnabled ? 'text-emerald-700 font-semibold' : 'text-[#64748B]'}>
                {syncStatus?.autoSyncEnabled ? 'Active (Daily 2:00 AM)' : 'Disabled'}
              </strong>
            </span>
          </div>
        </div>

        {/* Sync & Disconnect Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleSeedData}
            disabled={isSeeding || isSyncing}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#F4F8FC] hover:bg-[#DCE7F1]/60 text-[#00308A] border border-[#DCE7F1] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Load sample Sandbox records for testing"
          >
            {isSeeding ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0079C1]" /> : <Database className="w-3.5 h-3.5 text-[#0079C1]" />}
            <span>Seed Sample Data</span>
          </button>

          <button
            type="button"
            onClick={handleSyncNow}
            disabled={isSyncing}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#0079C1] hover:bg-[#00308A] active:scale-[0.99] text-white shadow-sm shadow-[#0079C1]/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-white ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>

          <button
            type="button"
            onClick={onDisconnect}
            className="p-2 rounded-xl text-xs font-medium text-[#64748B] hover:text-red-700 hover:bg-red-50 border border-[#DCE7F1] transition-all cursor-pointer"
            title="Disconnect PayPal Sandbox"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Global Feedback Banner */}
      {feedbackMsg && (
        <div
          className={`p-3.5 rounded-xl border flex items-start gap-3 animate-fadeIn text-xs leading-relaxed ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
          role="alert"
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          )}
          <span className="flex-1">{feedbackMsg.text}</span>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="font-bold text-xs opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Summary Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-[#DCE7F1] p-4.5 shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Total Transactions
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[#00308A]">
                {stats.totalCount || 0}
              </span>
              <span className="text-xs text-[#64748B] bg-[#F4F8FC] px-2 py-0.5 rounded-md border border-[#DCE7F1]">
                Indexed in DB
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#DCE7F1] p-4.5 shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Total Outflow (Expenses)
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[#00308A]">
                ${stats.totalOutgoing?.toFixed(2) || '0.00'}
              </span>
              <span className="text-xs text-red-600 flex items-center font-semibold">
                <TrendingDown className="w-3.5 h-3.5 mr-0.5" /> Outgoing
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#DCE7F1] p-4.5 shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Total Inflow (Income)
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[#00308A]">
                ${stats.totalIncoming?.toFixed(2) || '0.00'}
              </span>
              <span className="text-xs text-emerald-700 flex items-center font-semibold">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> Income
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#DCE7F1] p-4.5 shadow-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
              Categorized
            </span>
            <div className="mt-1 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[#0079C1]">
                {Object.keys(stats.categoryWise || {}).length} Categories
              </span>
              <span className="text-xs text-[#0079C1] flex items-center font-semibold">
                <Tag className="w-3.5 h-3.5 mr-0.5" /> Manual & Auto
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-[#DCE7F1] p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search merchant, description..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#DCE7F1] bg-white text-[#00308A] placeholder-[#64748B]/60 focus:outline-none focus:border-[#0079C1] focus:ring-2 focus:ring-[#009CDE]/15 transition-all"
            />
          </div>

          {/* Category Filter Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#DCE7F1] bg-white text-[#00308A] focus:outline-none focus:border-[#0079C1] cursor-pointer"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div className="relative">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#DCE7F1] bg-white text-[#00308A] focus:outline-none focus:border-[#0079C1] cursor-pointer"
              title="Start Date"
            />
          </div>

          {/* End Date */}
          <div className="relative">
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#DCE7F1] bg-white text-[#00308A] focus:outline-none focus:border-[#0079C1] cursor-pointer"
              title="End Date"
            />
          </div>
        </div>

        {/* Clear Filters helper */}
        {(search || selectedCategory !== 'All' || selectedStatus !== 'All' || startDate || endDate) && (
          <div className="flex items-center justify-end pt-1">
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs font-semibold text-[#0079C1] hover:text-[#00308A] transition-colors cursor-pointer"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Main Transactions Table Container */}
      <div className="bg-white rounded-[18px] border border-[#DCE7F1] shadow-[0_12px_40px_rgba(0,48,138,0.06)] overflow-hidden">
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#0079C1] animate-spin" />
            <span className="text-xs text-[#64748B]">Loading transactions from MongoDB...</span>
          </div>
        ) : error ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3 text-center px-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <p className="text-sm font-semibold text-[#00308A]">{error}</p>
            <button
              onClick={fetchTransactions}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0079C1] rounded-xl hover:bg-[#00308A] transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-[#0079C1]/10 flex items-center justify-center text-[#0079C1] mb-1">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#00308A]">No Transactions Stored in MongoDB</h3>
            <p className="text-xs text-[#64748B] max-w-md leading-relaxed">
              No transactions match your current filters. Synchronize with PayPal Sandbox or load sample test data to evaluate the categorization workflow.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSeedData}
                disabled={isSeeding}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#0079C1] hover:bg-[#00308A] rounded-xl transition-colors cursor-pointer"
              >
                {isSeeding ? 'Seeding...' : 'Load Sample Sandbox Data'}
              </button>
              <button
                onClick={handleSyncNow}
                disabled={isSyncing}
                className="px-4 py-2 text-xs font-semibold text-[#00308A] bg-[#F4F8FC] border border-[#DCE7F1] hover:bg-[#DCE7F1]/50 rounded-xl transition-colors cursor-pointer"
              >
                Sync with PayPal
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#DCE7F1] bg-[#F4F8FC]/60 text-[11px] font-bold text-[#00308A] uppercase tracking-wider">
                  <th className="py-3 px-4">Merchant / Description</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Currency</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 min-w-[180px]">Category</th>
                  <th className="py-3 px-4 text-center w-20">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DCE7F1] text-xs">
                {transactions.map((t) => {
                  const isUpdating = updatingId === t._id;
                  const isUpdated = updateSuccessId === t._id;
                  const isIncome = (t.amount || 0) > 0;

                  return (
                    <tr
                      key={t._id}
                      className="hover:bg-[#F4F8FC]/40 transition-colors group"
                    >
                      {/* Merchant / Description */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#00308A]">{t.merchantName || 'PayPal Merchant'}</div>
                        <div className="text-[11px] text-[#64748B] truncate max-w-xs" title={t.description}>
                          {t.description || t.paypalTransactionId}
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 font-mono font-semibold">
                        <span className={isIncome ? 'text-emerald-700' : 'text-[#00308A]'}>
                          {isIncome ? `+$${t.amount.toFixed(2)}` : `-$${Math.abs(t.amount).toFixed(2)}`}
                        </span>
                      </td>

                      {/* Currency */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F4F8FC] border border-[#DCE7F1] text-[#64748B]">
                          {t.currency || 'USD'}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-[#64748B]">
                        {t.transactionDate
                          ? new Date(t.transactionDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {t.status === 'S' ? 'Completed' : t.status || 'Success'}
                        </span>
                      </td>

                      {/* Category Dropdown */}
                      <td className="py-3.5 px-4">
                        <div className="relative">
                          <select
                            value={t.category || 'Uncategorized'}
                            disabled={isUpdating}
                            onChange={(e) => handleCategoryChange(t._id, e.target.value)}
                            className="w-full text-xs font-medium py-1.5 px-2.5 rounded-lg border border-[#DCE7F1] bg-white text-[#00308A] focus:outline-none focus:border-[#0079C1] focus:ring-2 focus:ring-[#009CDE]/15 cursor-pointer disabled:opacity-50"
                          >
                            {CATEGORIES.map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      {/* Action / Feedback Status */}
                      <td className="py-3.5 px-4 text-center">
                        {isUpdating ? (
                          <Loader2 className="w-4 h-4 animate-spin text-[#0079C1] mx-auto" />
                        ) : isUpdated ? (
                          <Check className="w-4 h-4 text-emerald-600 mx-auto animate-bounce" />
                        ) : (
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-md uppercase font-bold tracking-wider ${
                              t.categorySource === 'manual'
                                ? 'bg-[#009CDE]/10 text-[#0079C1] border border-[#009CDE]/20'
                                : 'bg-[#F4F8FC] text-[#64748B]'
                            }`}
                            title={t.categorySource === 'manual' ? 'Manually classified by user' : 'Default initial classification'}
                          >
                            {t.categorySource === 'manual' ? 'Manual' : 'Default'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {transactions.length > 0 && (
          <div className="p-4 border-t border-[#DCE7F1] bg-[#F4F8FC]/40 flex items-center justify-between text-xs text-[#64748B]">
            <div>
              Showing Page <strong className="text-[#00308A]">{page}</strong> of{' '}
              <strong className="text-[#00308A]">{totalPages}</strong> ({totalCount} total transactions)
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg border border-[#DCE7F1] bg-white text-[#00308A] font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F4F8FC] transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg border border-[#DCE7F1] bg-white text-[#00308A] font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#F4F8FC] transition-colors flex items-center gap-1 cursor-pointer"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
