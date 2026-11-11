import React, { useState } from 'react';
import { 
  Wallet, 
  Key, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ExternalLink, 
  Loader2, 
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  Info
} from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function PayPalConnectionCard({
  clientId,
  setClientId,
  clientSecret,
  setClientSecret,
  simulateFailure,
  setSimulateFailure,
  onSuccessfulConnect,
  activeUserId,
}) {
  const [showSecret, setShowSecret] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ clientId: '', clientSecret: '' });
  const [submitError, setSubmitError] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  const [touched, setTouched] = useState({ clientId: false, clientSecret: false });
  const [copiedKey, setCopiedKey] = useState(false);

  // Validate fields locally before transmitting
  const validateField = (field, value) => {
    if (!value || value.trim() === '') {
      return field === 'clientId' 
        ? 'PayPal Client ID is required' 
        : 'PayPal Client Secret is required';
    }
    if (value.trim().length < 6) {
      return field === 'clientId'
        ? 'Client ID looks too short for a PayPal REST App'
        : 'Client Secret looks too short';
    }
    return '';
  };

  const handleClientIdChange = (e) => {
    const val = e.target.value;
    setClientId(val);
    if (touched.clientId) {
      setErrors((prev) => ({ ...prev, clientId: validateField('clientId', val) }));
    }
    if (submitError) setSubmitError('');
    if (warningMessage) setWarningMessage('');
  };

  const handleClientSecretChange = (e) => {
    const val = e.target.value;
    setClientSecret(val);
    if (touched.clientSecret) {
      setErrors((prev) => ({ ...prev, clientSecret: validateField('clientSecret', val) }));
    }
    if (submitError) setSubmitError('');
    if (warningMessage) setWarningMessage('');
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const val = field === 'clientId' ? clientId : clientSecret;
    setErrors((prev) => ({ ...prev, [field]: validateField(field, val) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({ clientId: true, clientSecret: true });

    const clientIdError = validateField('clientId', clientId);
    const clientSecretError = validateField('clientSecret', clientSecret);

    setErrors({
      clientId: clientIdError,
      clientSecret: clientSecretError,
    });

    if (clientIdError || clientSecretError) {
      return;
    }

    setSubmitError('');
    setWarningMessage('');
    setIsLoading(true);

    try {
      const payloadClientId = simulateFailure ? 'invalid_sandbox_client_id' : clientId.trim();
      const payloadSecret = simulateFailure ? 'invalid_sandbox_secret' : clientSecret.trim();

      const response = await fetch(`${BACKEND_URL}/api/paypal/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-user-id': activeUserId || 'user_demo_1',
        },
        body: JSON.stringify({
          clientId: payloadClientId,
          clientSecret: payloadSecret,
          autoSyncEnabled,
        }),
      });

      const data = await response.json().catch(() => ({}));

      // State 3: Success with Transaction Search available
      if (response.ok && data.success && data.authenticated && data.transactionSearchAvailable) {
        // Clear secret immediately from state for security
        setClientSecret('');
        
        onSuccessfulConnect({
          clientId: clientId.trim(),
          transactionSearchAvailable: true,
          autoSyncEnabled: data.autoSyncEnabled,
          lastSyncedAt: data.lastSyncedAt,
          nextSyncAt: data.nextSyncAt,
          message: data.message || 'PayPal Sandbox connected successfully.',
          connectedAt: new Date(),
        });
        return;
      }

      // State 4: Authenticated, but Transaction Search scope is missing
      if (response.ok && data.success && data.authenticated && !data.transactionSearchAvailable) {
        setClientSecret('');
        setWarningMessage(
          data.message || 
          'PayPal authenticated, but Transaction Search permission is unavailable. Please enable "Transaction Search" in your PayPal Developer Dashboard app settings.'
        );
        return;
      }

      // State 5: Invalid credentials or specific backend error
      if (response.status === 401 || !data.authenticated) {
        setSubmitError(data.message || 'Invalid PayPal Sandbox credentials.');
        return;
      }

      if (response.status === 429) {
        setSubmitError(data.message || 'Too many authentication attempts. Please try again after 15 minutes.');
        return;
      }

      setSubmitError(data.message || 'PayPal Sandbox authentication failed. Please try again.');
    } catch (networkErr) {
      setSubmitError(
        `Unable to reach backend at ${BACKEND_URL}. Ensure the Express server is running (cd backend && npm start).`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setClientId('AZDxjDScFpQtjWTi8fWbL5k7H9z1Y2P3m4N5v6X7A8b9C0d1E2F3G4H5J6K7L8M9N0');
    setClientSecret('EK_x9q01L_23W45E67R89T01Y23U45I67O89P01A23S45D67F89G01H23J45K67L89');
    setErrors({ clientId: '', clientSecret: '' });
    setSubmitError('');
    setWarningMessage('');
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="w-full max-w-[480px] bg-white rounded-[18px] border border-[#DCE7F1] shadow-[0_12px_40px_rgba(0,48,138,0.07)] overflow-hidden transition-all duration-300 relative">
      {/* Top subtle blue accent bar */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#00308A] via-[#0079C1] to-[#009CDE]" />

      <div className="p-7 sm:p-9">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-3">
            <div className="w-12 h-12 rounded-full bg-[#0079C1]/10 flex items-center justify-center text-[#0079C1] ring-8 ring-[#009CDE]/5 transition-transform hover:scale-105 duration-200">
              <Wallet className="w-6 h-6 text-[#0079C1]" strokeWidth={2.2} />
            </div>
            <div className="absolute inset-0 rounded-full bg-[#009CDE]/20 blur-md -z-10" />
          </div>

          <h2 className="text-xl font-bold text-[#00308A] tracking-tight">
            AI Budget Buddy
          </h2>

          <div className="mt-1.5 inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#009CDE]/10 text-[#0079C1] border border-[#009CDE]/25">
            <span className="w-1.5 h-1.5 rounded-full bg-[#009CDE] animate-pulse" />
            <span className="text-[11px] font-bold tracking-wider uppercase">
              SANDBOX MODE
            </span>
          </div>
        </div>

        {/* Main Heading & Subtitle */}
        <div className="text-center mb-7">
          <h1 className="text-2xl font-bold text-[#00308A] tracking-tight">
            Connect your PayPal account
          </h1>
          <p className="mt-2 text-sm text-[#64748B] leading-relaxed">
            Connect your PayPal Sandbox application to analyze your transaction history and discover your spending patterns.
          </p>
        </div>

        {/* State 5: Invalid Credentials / Connection Error Banner */}
        {submitError && (
          <div 
            className="mb-5 p-3.5 rounded-xl bg-[#F4F8FC] border border-[#DCE7F1] flex items-start gap-3 animate-fadeIn"
            role="alert"
          >
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs text-[#00308A] leading-snug">
              <span className="font-semibold block text-red-600 mb-0.5">Connection Error</span>
              {submitError}
            </div>
          </div>
        )}

        {/* State 4: Authenticated but Permission Unavailable Warning Banner */}
        {warningMessage && (
          <div 
            className="mb-5 p-3.5 rounded-xl bg-[#F4F8FC] border border-[#009CDE]/50 flex items-start gap-3 animate-fadeIn"
            role="alert"
          >
            <Info className="w-5 h-5 text-[#0079C1] shrink-0 mt-0.5" />
            <div className="text-xs text-[#00308A] leading-snug">
              <span className="font-semibold block text-[#0079C1] mb-0.5">Permission Notice</span>
              {warningMessage}
            </div>
          </div>
        )}

        {/* Credential Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Client ID Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label 
                htmlFor="paypal-client-id" 
                className="text-xs font-semibold text-[#00308A] tracking-wide"
              >
                PayPal Client ID
              </label>
              <span className="text-[11px] text-[#64748B]">Sandbox App ID</span>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#0079C1]">
                <Key className="w-4 h-4 text-[#0079C1]" />
              </div>
              <input
                id="paypal-client-id"
                name="clientId"
                type="text"
                autoComplete="off"
                spellCheck="false"
                value={clientId}
                onChange={handleClientIdChange}
                onBlur={() => handleBlur('clientId')}
                placeholder="Enter your Sandbox Client ID"
                disabled={isLoading}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border text-sm text-[#00308A] bg-white placeholder-[#64748B]/60 transition-all duration-150 focus:outline-none ${
                  errors.clientId 
                    ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                    : 'border-[#DCE7F1] hover:border-[#009CDE]/60 focus:border-[#0079C1] focus:ring-4 focus:ring-[#009CDE]/15'
                } disabled:bg-[#F4F8FC] disabled:text-[#64748B] disabled:cursor-not-allowed`}
              />
            </div>
            {errors.clientId && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1" role="alert">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.clientId}</span>
              </p>
            )}
          </div>

          {/* Client Secret Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label 
                htmlFor="paypal-client-secret" 
                className="text-xs font-semibold text-[#00308A] tracking-wide"
              >
                PayPal Client Secret
              </label>
              <span className="text-[11px] text-[#64748B]">REST Secret</span>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#0079C1]">
                <Lock className="w-4 h-4 text-[#0079C1]" />
              </div>
              <input
                id="paypal-client-secret"
                name="clientSecret"
                type={showSecret ? 'text' : 'password'}
                autoComplete="new-password"
                spellCheck="false"
                value={clientSecret}
                onChange={handleClientSecretChange}
                onBlur={() => handleBlur('clientSecret')}
                placeholder="Enter your Sandbox Client Secret"
                disabled={isLoading}
                className={`w-full pl-10 pr-11 py-3 rounded-xl border text-sm text-[#00308A] bg-white placeholder-[#64748B]/60 transition-all duration-150 focus:outline-none ${
                  errors.clientSecret 
                    ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100' 
                    : 'border-[#DCE7F1] hover:border-[#009CDE]/60 focus:border-[#0079C1] focus:ring-4 focus:ring-[#009CDE]/15'
                } disabled:bg-[#F4F8FC] disabled:text-[#64748B] disabled:cursor-not-allowed`}
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                disabled={isLoading}
                aria-label={showSecret ? 'Hide Client Secret' : 'Show Client Secret'}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#64748B] hover:text-[#00308A] focus:outline-none transition-colors cursor-pointer"
              >
                {showSecret ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.clientSecret && (
              <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1" role="alert">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.clientSecret}</span>
              </p>
            )}
          </div>

          {/* Section 9: Auto-Sync User Interface Option */}
          <div className="p-3.5 rounded-xl bg-[#F4F8FC] border border-[#DCE7F1] space-y-1.5">
            <label className="flex items-start gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoSyncEnabled}
                onChange={(e) => setAutoSyncEnabled(e.target.checked)}
                disabled={isLoading}
                className="mt-0.5 rounded border-[#DCE7F1] text-[#0079C1] focus:ring-[#009CDE]/30 w-4 h-4 cursor-pointer"
              />
              <div>
                <span className="text-xs font-semibold text-[#00308A] block">
                  Enable automatic daily synchronization
                </span>
                <p className="text-[11px] text-[#64748B] leading-relaxed mt-0.5">
                  When enabled, AI Budget Buddy securely stores your Sandbox application credentials in encrypted form to synchronize transactions daily.
                </p>
              </div>
            </label>
          </div>

          {/* Quick Demo Credentials Autofill Helper */}
          <div className="pt-1 flex items-center justify-between text-xs text-[#64748B]">
            <button
              type="button"
              onClick={handleFillDemo}
              disabled={isLoading}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-[#0079C1] hover:text-[#00308A] transition-colors focus:outline-none cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-[#009CDE]" />
              {copiedKey ? 'Credentials Applied!' : 'Use sample Sandbox format'}
            </button>

            {/* Simulated failure toggle for testing */}
            <label className="inline-flex items-center gap-1.5 cursor-pointer select-none text-[11px]">
              <input
                type="checkbox"
                checked={simulateFailure}
                onChange={(e) => setSimulateFailure(e.target.checked)}
                className="rounded border-[#DCE7F1] text-[#0079C1] focus:ring-[#009CDE]/30 w-3 h-3"
              />
              <span className={simulateFailure ? 'text-[#00308A] font-semibold' : 'text-[#64748B]'}>
                Test invalid credentials
              </span>
            </label>
          </div>

          {/* State 1 (Idle) & State 2 (Loading) Connect Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#0079C1] hover:bg-[#00308A] active:scale-[0.99] text-white font-semibold rounded-xl shadow-sm shadow-[#0079C1]/25 hover:shadow-[#00308A]/30 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-white" />
                  <span>Connecting to PayPal Sandbox...</span>
                </>
              ) : (
                <>
                  <span>Connect PayPal Sandbox</span>
                  <ArrowRight className="w-4 h-4 text-white/90 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Security Information */}
        <div className="mt-5 flex items-center justify-center gap-2 text-center text-xs text-[#64748B] bg-[#F4F8FC] py-2.5 px-3 rounded-lg border border-[#DCE7F1]/80">
          <ShieldCheck className="w-4 h-4 text-[#0079C1] shrink-0" />
          <p className="leading-snug">
            Your credentials are sent securely to the backend and are never shared with the AI model.
          </p>
        </div>

        {/* Subtle Divider */}
        <div className="my-6 border-t border-[#DCE7F1]" />

        {/* Help Section */}
        <div className="text-center">
          <p className="text-xs text-[#64748B] mb-1.5 font-medium">
            Don't have Sandbox credentials?
          </p>
          <a
            href="https://developer.paypal.com/dashboard/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0079C1] hover:text-[#00308A] hover:underline transition-colors focus:outline-none group"
          >
            <span>Get your credentials from PayPal Developer Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#009CDE] group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </div>
    </div>
  );
}
