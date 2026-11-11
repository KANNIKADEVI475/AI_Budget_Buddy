import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Wallet, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Check, 
  Copy, 
  LogOut,
  RefreshCw,
  Clock,
  Table
} from 'lucide-react';

export default function ConnectedSuccessCard({
  connectionData,
  onDisconnect,
  onOpenTransactions,
  onSyncNow,
  isSyncing,
}) {
  const [copied, setCopied] = useState(false);

  const maskedClientId = connectionData.clientId 
    ? `${connectionData.clientId.substring(0, 8)}••••••••••••${connectionData.clientId.substring(connectionData.clientId.length - 6)}`
    : 'AZ••••••••••••94kX';

  const handleCopyId = () => {
    navigator.clipboard?.writeText?.(connectionData.clientId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-[480px] bg-white rounded-[18px] border border-[#DCE7F1] shadow-[0_12px_40px_rgba(0,48,138,0.07)] overflow-hidden transition-all duration-300 relative animate-fadeIn">
      {/* Top subtle blue accent bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#00308A] via-[#0079C1] to-[#009CDE]" />

      <div className="p-7 sm:p-9">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-3">
            <div className="w-14 h-14 rounded-full bg-[#009CDE]/10 border border-[#009CDE]/30 flex items-center justify-center text-[#0079C1] ring-8 ring-[#0079C1]/5">
              <CheckCircle2 className="w-7 h-7 text-[#0079C1]" strokeWidth={2.4} />
            </div>
            <div className="absolute inset-0 rounded-full bg-[#009CDE]/25 blur-md -z-10" />
          </div>

          <h2 className="text-xl font-bold text-[#00308A] tracking-tight">
            AI Budget Buddy
          </h2>

          <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold tracking-wider uppercase">
              SANDBOX CONNECTED
            </span>
          </div>
        </div>

        {/* Heading & Subtitle */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-[#00308A] tracking-tight">
            PayPal Account Connected
          </h1>
          <p className="mt-2 text-sm text-[#64748B] leading-relaxed">
            Your PayPal Sandbox application is securely authorized. Credentials are encrypted using AES-256-GCM.
          </p>
        </div>

        {/* State 3: Prominent Green Success Message */}
        <div className="mb-5 p-3.5 rounded-xl bg-emerald-50/90 border border-emerald-200/90 flex items-start gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-900 leading-snug">
            <span className="font-semibold block text-emerald-950 mb-0.5">Authentication Successful</span>
            {connectionData.message || 'PayPal Sandbox connected successfully.'}
          </div>
        </div>

        {/* Connected Account Metadata Card */}
        <div className="bg-[#F4F8FC] border border-[#DCE7F1] rounded-xl p-4 sm:p-5 mb-5 space-y-3">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-[#DCE7F1]">
            <span className="text-[#64748B] font-medium">Automatic Daily Sync</span>
            <span className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
              connectionData.autoSyncEnabled
                ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                : 'text-[#64748B] bg-white border border-[#DCE7F1]'
            }`}>
              {connectionData.autoSyncEnabled ? 'Enabled (2:00 AM IST)' : 'Disabled'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pb-2 border-b border-[#DCE7F1]">
            <span className="text-[#64748B] font-medium">Reporting Permission</span>
            <span className="font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[11px] flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-600" />
              <span>Transaction Search Verified</span>
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-[#64748B] font-medium">Sandbox Client ID</span>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[11px] text-[#00308A] bg-white px-2 py-0.5 rounded border border-[#DCE7F1] max-w-[160px] truncate">
                {maskedClientId}
              </span>
              <button
                onClick={handleCopyId}
                className="text-[#0079C1] hover:text-[#00308A] p-1 rounded focus:outline-none cursor-pointer"
                title="Copy Client ID"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={onOpenTransactions}
            className="w-full h-11 bg-[#0079C1] hover:bg-[#00308A] active:scale-[0.99] text-white font-semibold rounded-xl shadow-sm shadow-[#0079C1]/25 hover:shadow-[#00308A]/30 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            <Table className="w-4 h-4 text-white" />
            <span>View Transactions &amp; Categorize</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>

          <button
            type="button"
            onClick={onSyncNow}
            disabled={isSyncing}
            className="w-full h-10 bg-[#F4F8FC] hover:bg-[#DCE7F1]/60 border border-[#DCE7F1] text-[#00308A] font-semibold rounded-xl transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer text-xs disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#0079C1] ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing Transactions...' : 'Sync Transactions Now'}</span>
          </button>

          <button
            type="button"
            onClick={onDisconnect}
            className="w-full h-9 bg-transparent hover:bg-red-50 text-[#64748B] hover:text-red-700 font-medium rounded-xl transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer text-xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Disconnect &amp; Delete Stored Credentials</span>
          </button>
        </div>

        {/* Security badge at bottom */}
        <div className="mt-5 pt-4 border-t border-[#DCE7F1] flex items-center justify-center gap-2 text-[11px] text-[#64748B]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#0079C1]" />
          <span>Encrypted with AES-256-GCM in MongoDB</span>
        </div>
      </div>
    </div>
  );
}
