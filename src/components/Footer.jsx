import React from 'react';
import { ShieldCheck, Lock, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full mt-auto py-8 text-center text-xs text-[#64748B]">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center space-y-3">
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-[#64748B]">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#0079C1]" />
            End-to-End Client Encryption
          </span>
          <span className="text-[#DCE7F1]">•</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0079C1]" />
            Zero AI Model Credential Leakage
          </span>
          <span className="text-[#DCE7F1]">•</span>
          <a
            href="https://developer.paypal.com/docs/api/overview/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#00308A] hover:underline flex items-center gap-1"
          >
            <span>PayPal REST Documentation</span>
            <ExternalLink className="w-3 h-3 text-[#009CDE]" />
          </a>
        </div>

        <p className="text-[11px] text-[#64748B]/80 max-w-lg leading-relaxed">
          AI Budget Buddy is an AI-powered financial management prototype. PayPal and the PayPal logo are trademarks of PayPal, Inc. This application operates within the PayPal Sandbox testing environment.
        </p>

        <p className="text-[11px] text-[#64748B]/60">
          © {new Date().getFullYear()} AI Budget Buddy • Built for modern personal finance
        </p>
      </div>
    </footer>
  );
}
