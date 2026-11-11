import React, { useState, useEffect, useCallback } from 'react';
import SidebarNav from './components/SidebarNav';
import TopBar from './components/TopBar';
import DashboardView from './components/DashboardView';
import TransactionHistory from './components/TransactionHistory';
import CategoriesView from './components/CategoriesView';
import BudgetsView from './components/BudgetsView';
import AnalyticsView from './components/AnalyticsView';
import AIInsightsView from './components/AIInsightsView';
import PayPalConnectionCard from './components/PayPalConnectionCard';
import ConnectedSuccessCard from './components/ConnectedSuccessCard';
import QuickGuide from './components/QuickGuide';
import BackgroundDecorations from './components/BackgroundDecorations';
import AskAIBuddyModal from './components/AskAIBuddyModal';
import EditBudgetModal from './components/EditBudgetModal';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function App() {
  // Navigation & User State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeUserId, setActiveUserId] = useState('user_demo_1');
  const [isOpenMobileNav, setIsOpenMobileNav] = useState(false);

  // Month Selector State
  const [monthDate, setMonthDate] = useState(new Date(2026, 10, 1)); // Nov 2026

  // Financial Data State
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState(null);
  const [syncStatus, setSyncStatus] = useState(null);
  const [budget, setBudget] = useState(null);
  const [connectionData, setConnectionData] = useState(null);

  // Loading States
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Modals State
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isEditBudgetOpen, setIsEditBudgetOpen] = useState(false);

  // PayPal Form Inputs
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [simulateFailure, setSimulateFailure] = useState(false);

  // Month navigation handlers
  const handlePrevMonth = () => {
    setMonthDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const handleNextMonth = () => {
    setMonthDate((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const currentMonthLabel = `${MONTH_NAMES[monthDate.getMonth()]} ${monthDate.getFullYear()}`;

  // 1. Fetch Transactions, Stats, Budget, and Sync Status from Backend
  const refreshFinancialData = useCallback(async () => {
    try {
      const [txRes, statsRes, syncRes, budgetRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/transactions?limit=20`, {
          headers: { 'x-user-id': activeUserId },
        }),
        fetch(`${BACKEND_URL}/api/transactions/stats`, {
          headers: { 'x-user-id': activeUserId },
        }),
        fetch(`${BACKEND_URL}/api/transactions/sync-status`, {
          headers: { 'x-user-id': activeUserId },
        }),
        fetch(`${BACKEND_URL}/api/budgets`, {
          headers: { 'x-user-id': activeUserId },
        }),
      ]);

      if (txRes.ok) {
        const txData = await txRes.json();
        setTransactions(txData.transactions || []);
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats || null);
      }

      if (syncRes.ok) {
        const syncData = await syncRes.json();
        setSyncStatus(syncData);

        if (syncData.connectionStatus === 'connected') {
          setConnectionData((prev) => ({
            ...prev,
            clientId: prev?.clientId || 'Connected via MongoDB',
            autoSyncEnabled: syncData.autoSyncEnabled,
            lastSyncedAt: syncData.lastSyncedAt,
            nextSyncAt: syncData.nextSyncAt,
            message: 'PayPal Sandbox connection active.',
          }));
        } else {
          setConnectionData(null);
        }
      }

      if (budgetRes.ok) {
        const budgetData = await budgetRes.json();
        setBudget(budgetData.budget || null);
      }
    } catch (err) {
      console.warn('Could not refresh financial data from backend:', err);
    }
  }, [activeUserId]);

  useEffect(() => {
    refreshFinancialData();
  }, [refreshFinancialData]);

  // 2. Action: Manual Sync Trigger
  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/transactions/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': activeUserId,
        },
      });
      await res.json();
      await refreshFinancialData();
    } catch (err) {
      console.warn('Sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // 3. Action: Seed Sample Sandbox Data (Dev Helper)
  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      await fetch(`${BACKEND_URL}/api/transactions/seed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': activeUserId,
        },
      });
      await refreshFinancialData();
    } catch (err) {
      console.warn('Seed error:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  // 4. Action: Update Transaction Category
  const handleUpdateCategory = async (transactionId, newCategory) => {
    // Optimistic local update
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

      if (!res.ok) throw new Error('Update failed');
      await refreshFinancialData();
    } catch (err) {
      console.error('Error updating category:', err);
      refreshFinancialData();
    }
  };

  // 5. Action: Disconnect PayPal Account
  const handleDisconnect = async () => {
    try {
      await fetch(`${BACKEND_URL}/api/paypal/disconnect`, {
        method: 'DELETE',
        headers: { 'x-user-id': activeUserId },
      });
    } catch (err) {
      console.warn('Disconnect request error:', err);
    }
    setConnectionData(null);
    setSyncStatus((prev) => (prev ? { ...prev, connectionStatus: 'disconnected' } : null));
    refreshFinancialData();
  };

  // 6. Action: Successful PayPal Connect
  const handleSuccessfulConnect = (data) => {
    setConnectionData(data);
    setActiveTab('dashboard');
    refreshFinancialData();
  };

  return (
    <div className="min-h-screen bg-[#F4F8FC] text-[#00308A] flex flex-row antialiased relative selection:bg-[#009CDE]/20 selection:text-[#00308A]">
      {/* Background Decorative Ambient Shapes */}
      <BackgroundDecorations />

      {/* Persistent Desktop Sidebar & Mobile Drawer */}
      <SidebarNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpenMobile={isOpenMobileNav}
        setIsOpenMobile={setIsOpenMobileNav}
        isConnected={Boolean(connectionData)}
        syncStatus={syncStatus}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Navigation */}
        <TopBar
          activeTab={activeTab}
          onOpenMobileNav={() => setIsOpenMobileNav(true)}
          activeUserId={activeUserId}
          setActiveUserId={setActiveUserId}
          onSyncNow={handleSyncNow}
          isSyncing={isSyncing}
          syncStatus={syncStatus}
          stats={stats}
          onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
          currentMonth={currentMonthLabel}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />

        {/* View Switcher based on active tab */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              transactions={transactions}
              stats={stats}
              syncStatus={syncStatus}
              budget={budget}
              onNavigate={setActiveTab}
              onOpenEditBudget={() => setIsEditBudgetOpen(true)}
              onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
              onUpdateCategory={handleUpdateCategory}
              onSeedData={handleSeedData}
              isSeeding={isSeeding}
              onSyncNow={handleSyncNow}
              isSyncing={isSyncing}
              currentMonth={currentMonthLabel}
              activeUserId={activeUserId}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionHistory
              activeUserId={activeUserId}
              onDisconnect={handleDisconnect}
            />
          )}

          {activeTab === 'categories' && (
            <CategoriesView
              transactions={transactions}
              stats={stats}
              onUpdateCategory={handleUpdateCategory}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              transactions={transactions}
              stats={stats}
              currentMonth={currentMonthLabel}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'budgets' && (
            <BudgetsView
              budget={budget}
              stats={stats}
              onOpenEditBudget={() => setIsEditBudgetOpen(true)}
              onBudgetUpdated={(updated) => setBudget(updated)}
              activeUserId={activeUserId}
            />
          )}

          {activeTab === 'ai-insights' && (
            <AIInsightsView
              activeUserId={activeUserId}
              onOpenAIAssistant={() => setIsAIAssistantOpen(true)}
              onNavigate={setActiveTab}
              onSeedData={handleSeedData}
              isSeeding={isSeeding}
            />
          )}

          {activeTab === 'connection' && (
            <div className="w-full max-w-xl mx-auto flex flex-col items-center animate-fadeIn">
              {connectionData ? (
                <ConnectedSuccessCard
                  connectionData={connectionData}
                  onDisconnect={handleDisconnect}
                  onOpenTransactions={() => setActiveTab('transactions')}
                  onSyncNow={handleSyncNow}
                  isSyncing={isSyncing}
                />
              ) : (
                <PayPalConnectionCard
                  clientId={clientId}
                  setClientId={setClientId}
                  clientSecret={clientSecret}
                  setClientSecret={setClientSecret}
                  simulateFailure={simulateFailure}
                  setSimulateFailure={setSimulateFailure}
                  onSuccessfulConnect={handleSuccessfulConnect}
                  activeUserId={activeUserId}
                />
              )}

              {!connectionData && <QuickGuide />}
            </div>
          )}
        </main>
      </div>

      {/* Interactive Ask AI Buddy Assistant Modal */}
      <AskAIBuddyModal
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        activeUserId={activeUserId}
      />

      {/* Edit Budget Modal */}
      <EditBudgetModal
        isOpen={isEditBudgetOpen}
        onClose={() => setIsEditBudgetOpen(false)}
        currentBudget={budget}
        onBudgetUpdated={(updated) => setBudget(updated)}
        activeUserId={activeUserId}
      />
    </div>
  );
}
