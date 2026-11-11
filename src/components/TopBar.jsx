import React from 'react';
import {
  Menu,
  Sparkles,
  RefreshCw,
  Users,
  ChevronDown,
  Calendar,
  Wallet,
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import NotificationsPopover from './NotificationsPopover';

export default function TopBar({
  activeTab,
  onOpenMobileNav,
  activeUserId,
  setActiveUserId,
  onSyncNow,
  isSyncing,
  syncStatus,
  stats,
  onOpenAIAssistant,
  currentMonth,
  onPrevMonth,
  onNextMonth,
}) {
  const pageTitles = {
    dashboard: 'Dashboard',
    transactions: 'Transactions',
    categories: 'Categories',
    analytics: 'Analytics',
    budgets: 'Budgets',
    'ai-insights': 'AI Insights',
    connection: 'PayPal Sandbox Connection',
  };

  return (
    <header className="w-full h-16 bg-white border-b border-[#DCE7F1] px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md bg-white/90">
      {/* Left: Mobile Menu Toggle & Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="lg:hidden p-2 rounded-xl text-[#64748B] hover:bg-[#F4F8FC] border border-[#DCE7F1] cursor-pointer"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-[#00308A] tracking-tight">
            {pageTitles[activeTab] || 'Dashboard'}
          </h1>
          <p className="hidden md:block text-[11px] text-[#64748B] -mt-0.5">
            AI-powered personal finance management
          </p>
        </div>
      </div>

      {/* Center: Month Selector */}
      <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#F4F8FC] border border-[#DCE7F1] text-xs font-semibold text-[#00308A]">
        <button
          onClick={onPrevMonth}
          className="p-1 hover:bg-white rounded-md text-[#64748B] hover:text-[#00308A] transition-colors cursor-pointer"
          title="Previous Month"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        <span className="flex items-center gap-1.5 px-1.5">
          <Calendar className="w-3.5 h-3.5 text-[#0079C1]" />
          <span>{currentMonth}</span>
        </span>
        <button
          onClick={onNextMonth}
          className="p-1 hover:bg-white rounded-md text-[#64748B] hover:text-[#00308A] transition-colors cursor-pointer"
          title="Next Month"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right Controls: AI Assistant, Sync, Notifications, User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Ask AI Buddy CTA */}
        <button
          type="button"
          onClick={onOpenAIAssistant}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#00308A] to-[#0079C1] hover:from-[#002266] hover:to-[#005f99] text-white shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#009CDE]" />
          <span className="hidden sm:inline">Ask AI Buddy</span>
        </button>

        {/* Sync Now button */}
        <button
          type="button"
          onClick={onSyncNow}
          disabled={isSyncing}
          className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-semibold bg-[#F4F8FC] hover:bg-[#DCE7F1]/60 text-[#00308A] border border-[#DCE7F1] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          title="Sync with PayPal Sandbox"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#0079C1] ${isSyncing ? 'animate-spin' : ''}`} />
          <span className="hidden md:inline">{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
        </button>

        {/* Notifications Popover */}
        <NotificationsPopover syncStatus={syncStatus} stats={stats} />

        {/* Active User Switcher (For Multi-User Isolation Testing) */}
        <div className="flex items-center gap-1.5 bg-[#F4F8FC] border border-[#DCE7F1] pl-2.5 pr-2 py-1 rounded-xl text-xs">
          <div className="w-6 h-6 rounded-full bg-[#0079C1] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
            {activeUserId === 'user_demo_1' ? 'AJ' : 'MS'}
          </div>

          <div className="hidden sm:block text-left">
            <select
              value={activeUserId}
              onChange={(e) => setActiveUserId(e.target.value)}
              className="bg-transparent font-semibold text-[#00308A] focus:outline-none cursor-pointer text-xs pr-1"
              title="Switch user to verify multi-user isolation"
            >
              <option value="user_demo_1">Alex (User 1)</option>
              <option value="user_demo_2">Morgan (User 2)</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
}
