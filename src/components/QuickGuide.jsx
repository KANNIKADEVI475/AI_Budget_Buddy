import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, ExternalLink, ShieldCheck, KeyRound } from 'lucide-react';

export default function QuickGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full max-w-[480px] mt-6">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-white/80 hover:bg-white border border-[#DCE7F1] text-xs font-semibold text-[#00308A] transition-all duration-150 shadow-xs cursor-pointer group"
      >
        <span className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#0079C1] group-hover:text-[#00308A]" />
          <span>How to find your Sandbox API credentials</span>
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-[#64748B]" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[#64748B]" />
        )}
      </button>

      {isOpen && (
        <div className="mt-2 p-4 rounded-xl bg-white border border-[#DCE7F1] text-xs text-[#64748B] space-y-3 shadow-xs animate-fadeIn">
          <ol className="space-y-2.5 list-decimal list-inside text-xs leading-relaxed">
            <li className="text-[#00308A]">
              <span className="text-[#64748B]">Log in to the </span>
              <a
                href="https://developer.paypal.com/dashboard/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#0079C1] hover:underline inline-flex items-center gap-0.5"
              >
                PayPal Developer Dashboard <ExternalLink className="w-3 h-3 text-[#009CDE]" />
              </a>
            </li>
            <li className="text-[#00308A]">
              <span className="text-[#64748B]">
                Navigate to <strong>Apps &amp; Credentials</strong> in the left sidebar.
              </span>
            </li>
            <li className="text-[#00308A]">
              <span className="text-[#64748B]">
                Ensure the toggle is set to <strong className="text-[#0079C1]">Sandbox</strong> (not Live).
              </span>
            </li>
            <li className="text-[#00308A]">
              <span className="text-[#64748B]">
                Select your Default Application or click <strong>Create App</strong>.
              </span>
            </li>
            <li className="text-[#00308A]">
              <span className="text-[#64748B]">
                Copy your <strong>Client ID</strong> and reveal the <strong>Secret</strong> to paste here.
              </span>
            </li>
          </ol>

          <div className="pt-2 border-t border-[#DCE7F1] flex items-center gap-2 text-[11px] text-[#64748B]">
            <ShieldCheck className="w-4 h-4 text-[#0079C1] shrink-0" />
            <span>Never share Live credentials. Only Sandbox keys should be tested.</span>
          </div>
        </div>
      )}
    </div>
  );
}
