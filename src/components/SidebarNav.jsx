import React from 'react';
import {
  LayoutDashboard,
  Receipt,
  Layers,
  BarChart3,
  Target,
  Sparkles,
  KeyRound,
  Wallet,
  ShieldCheck,
  X,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: Receipt },
  { id: 'categories', label: 'Categories', icon: Layers },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'budgets', label: 'Budgets', icon: Target },
  { id: 'ai-insights', label: 'AI Insights', icon: Sparkles, badge: 'AI' },
  { id: 'connection', label: 'PayPal Sandbox', icon: KeyRound },
];

export default function SidebarNav({
  activeTab,
  setActiveTab,
  isOpenMobile,
  setIsOpenMobile,
  isConnected,
  syncStatus,
}) {
  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    if (setIsOpenMobile) setIsOpenMobile(false);
  };

  const navContent = (
    <div className="h-full flex flex-col justify-between p-4 sm:p-5 select-none">
      {/* Brand & Logo */}
      <div>
        <div className="flex items-center justify-between pb-6 border-b border-[#DCE7F1]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00308A] to-[#0079C1] flex items-center justify-center shadow-md shadow-[#00308A]/15 ring-2 ring-[#009CDE]/20">
              <Wallet className="w-5 h-5 text-white" strokeWidth={2.2} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-[#00308A] text-base tracking-tight">AI Budget Buddy</span>
              </div>
              <p className="text-[11px] text-[#64748B] font-medium">Smart Finance Assistant</p>
            </div>
          </div>

          {/* Close button on mobile */}
          {setIsOpenMobile && (
            <button
              onClick={() => setIsOpenMobile(false)}
              className="lg:hidden p-1.5 rounded-lg text-[#64748B] hover:bg-[#F4F8FC] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="mt-6 space-y-1.5" aria-label="Main Navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-[#0079C1] text-white shadow-sm shadow-[#0079C1]/30 font-bold'
                    : 'text-[#64748B] hover:text-[#00308A] hover:bg-[#F4F8FC]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#0079C1]'}`}
                    strokeWidth={isActive ? 2.4 : 2}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-[#009CDE]/10 text-[#0079C1] border border-[#009CDE]/20'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Connection Quick Pill & Footer info */}
      <div className="pt-6 border-t border-[#DCE7F1] space-y-3">
        <div className="bg-[#F4F8FC] rounded-xl p-3 border border-[#DCE7F1] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
              }`}
            />
            <span className="font-semibold text-[#00308A] text-[11px]">
              {isConnected ? 'PayPal Connected' : 'Sandbox Ready'}
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold text-[#0079C1] bg-white px-1.5 py-0.5 rounded border border-[#DCE7F1]">
            SANDBOX
          </span>
        </div>

        <div className="flex items-center justify-between text-[11px] text-[#64748B] px-1">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-[#0079C1]" />
            256-bit Encrypted
          </span>
          <span className="text-[#DCE7F1]">•</span>
          <span>v1.2.0</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (1440px grid ready) */}
      <aside className="hidden lg:block w-64 h-screen sticky top-0 bg-white border-r border-[#DCE7F1] z-20 shrink-0">
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setIsOpenMobile(false)}
          />
          <div className="relative w-72 max-w-[80vw] h-full bg-white shadow-2xl z-10 animate-fadeIn">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
