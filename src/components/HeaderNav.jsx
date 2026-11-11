import React from 'react';
import { Wallet, ShieldCheck, UserCheck, Users, Table, KeyRound } from 'lucide-react';

export default function HeaderNav({
  isConnected,
  activeTab,
  setActiveTab,
  activeUserId,
  setActiveUserId,
}) {
  return (
    <header className="w-full border-b border-[#DCE7F1] bg-white/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00308A] to-[#0079C1] flex items-center justify-center shadow-sm shadow-[#00308A]/10">
            <Wallet className="w-5 h-5 text-white" strokeWidth={2.2} />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-[#00308A] text-lg tracking-tight">AI Budget Buddy</span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-[#F4F8FC] text-[#0079C1] border border-[#DCE7F1]">
                SANDBOX
              </span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center p-1 bg-[#F4F8FC] rounded-xl border border-[#DCE7F1] text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('connect')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'connect'
                ? 'bg-white text-[#00308A] shadow-xs'
                : 'text-[#64748B] hover:text-[#00308A]'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-[#0079C1]" />
            <span>Connection</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('transactions')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'transactions'
                ? 'bg-white text-[#00308A] shadow-xs'
                : 'text-[#64748B] hover:text-[#00308A]'
            }`}
          >
            <Table className="w-3.5 h-3.5 text-[#009CDE]" />
            <span>Transactions</span>
          </button>
        </div>

        {/* User Identity Switcher (For Multi-User Isolation Testing) */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#64748B] bg-white border border-[#DCE7F1] px-2.5 py-1 rounded-xl">
            <Users className="w-3.5 h-3.5 text-[#0079C1]" />
            <span className="text-[11px] font-medium text-[#64748B]">Active User:</span>
            <select
              value={activeUserId}
              onChange={(e) => setActiveUserId(e.target.value)}
              className="bg-transparent font-semibold text-[#00308A] focus:outline-none cursor-pointer text-xs"
              title="Switch user to test data isolation"
            >
              <option value="user_demo_1">Alex (User 1)</option>
              <option value="user_demo_2">Morgan (User 2)</option>
            </select>
          </div>

          <div className="hidden lg:flex items-center space-x-1 text-[11px] text-[#64748B] bg-white px-2 py-1 rounded-lg border border-[#DCE7F1]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0079C1]" />
            <span>AES-256-GCM</span>
          </div>
        </div>
      </div>
    </header>
  );
}
