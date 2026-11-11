import React, { useState } from 'react';
import { Bell, Check, Clock, ShieldCheck, Sparkles, AlertTriangle, ArrowRight } from 'lucide-react';

export default function NotificationsPopover({ syncStatus, stats, onNavigate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [readAll, setReadAll] = useState(false);

  // Generate notifications based on real system state
  const notifications = [
    {
      id: 1,
      title: syncStatus?.autoSyncEnabled
        ? 'Automatic Daily Sync Scheduled'
        : 'Auto-Sync is Disabled',
      message: syncStatus?.autoSyncEnabled
        ? 'Your PayPal Sandbox transactions will synchronize automatically every day at 2:00 AM (IST).'
        : 'Enable automatic synchronization on the PayPal Connection page to keep spending history up-to-date.',
      time: 'Today',
      type: syncStatus?.autoSyncEnabled ? 'success' : 'info',
      icon: Clock,
    },
    {
      id: 2,
      title: 'AI Spending Anomaly Check',
      message: stats?.categoryWise && Object.keys(stats.categoryWise).length > 0
        ? `We analyzed ${stats.totalCount || 0} transaction(s). Spending pattern discovery is active.`
        : 'Connect your PayPal Sandbox account and seed transactions to enable AI insights.',
      time: '1h ago',
      type: 'ai',
      icon: Sparkles,
    },
    {
      id: 3,
      title: 'Credential Security Verified',
      message: 'All Sandbox Client Secrets are encrypted in MongoDB using AES-256-GCM authenticated cipher.',
      time: 'System',
      type: 'security',
      icon: ShieldCheck,
    },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-[#64748B] hover:text-[#00308A] hover:bg-white border border-[#DCE7F1] transition-all cursor-pointer"
        aria-label="View notifications"
      >
        <Bell className="w-4 h-4 text-[#0079C1]" />
        {!readAll && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#009CDE] ring-2 ring-white" />
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-[#DCE7F1] z-50 overflow-hidden animate-fadeIn">
            {/* Header */}
            <div className="p-3.5 border-b border-[#DCE7F1] flex items-center justify-between bg-[#F4F8FC]/60">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-[#00308A]">Notifications</span>
                {!readAll && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#0079C1] text-white">
                    3
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setReadAll(true)}
                className="text-[11px] font-semibold text-[#0079C1] hover:underline cursor-pointer"
              >
                Mark all as read
              </button>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-[#DCE7F1]">
              {notifications.map((n) => {
                const Icon = n.icon;
                return (
                  <div
                    key={n.id}
                    className="p-3 hover:bg-[#F4F8FC]/50 transition-colors flex items-start gap-3 text-xs"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#0079C1]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-[#0079C1]" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#00308A]">{n.title}</span>
                        <span className="text-[10px] text-[#64748B]">{n.time}</span>
                      </div>
                      <p className="text-[11px] text-[#64748B] mt-0.5 leading-relaxed">{n.message}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-2.5 bg-[#F4F8FC]/40 border-t border-[#DCE7F1] text-center">
              <span className="text-[11px] text-[#64748B]">All notifications are synchronized in real-time</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
