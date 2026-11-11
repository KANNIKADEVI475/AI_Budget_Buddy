import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  TrendingDown,
  ArrowRight,
  Database,
  RefreshCw,
  Layers,
  DollarSign
} from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function AIInsightsView({
  activeUserId,
  onOpenAIAssistant,
  onNavigate,
  onSeedData,
  isSeeding,
}) {
  const [insightsData, setInsightsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadInsights() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`${BACKEND_URL}/api/ai/insights`, {
          headers: { 'x-user-id': activeUserId },
        });
        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
        const data = await res.json();
        setInsightsData(data);
      } catch (err) {
        setError(err.message || 'Error generating AI insights');
      } finally {
        setIsLoading(false);
      }
    }

    loadInsights();
  }, [activeUserId]);

  const getInsightIcon = (type) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case 'savings':
      case 'positive':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'tip':
        return <Lightbulb className="w-5 h-5 text-[#009CDE]" />;
      default:
        return <TrendingUp className="w-5 h-5 text-[#0079C1]" />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#00308A] to-[#0079C1] rounded-[18px] p-6 text-white shadow-lg shadow-[#00308A]/15 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white uppercase tracking-wider">
              Algorithmic Intelligence
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">AI-Powered Financial Insights</h2>
          <p className="text-xs text-white/80 max-w-xl leading-relaxed">
            AI Budget Buddy continuously evaluates your synchronized PayPal Sandbox expenses against your monthly budget to highlight anomalies, patterns, and savings opportunities.
          </p>
        </div>

        <button
          onClick={onOpenAIAssistant}
          className="px-4 py-2.5 bg-white text-[#00308A] hover:bg-[#F4F8FC] font-semibold rounded-xl text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md shrink-0"
        >
          <Sparkles className="w-4 h-4 text-[#0079C1]" />
          <span>Ask AI Buddy</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Insights Content */}
      {isLoading ? (
        <div className="bg-white rounded-[18px] border border-[#DCE7F1] p-12 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#0079C1] animate-spin mx-auto" />
          <p className="text-xs text-[#64748B]">Synthesizing financial observations from MongoDB...</p>
        </div>
      ) : error ? (
        <div className="bg-white rounded-[18px] border border-red-200 p-8 text-center space-y-2 text-xs text-red-900">
          <AlertCircle className="w-6 h-6 text-red-600 mx-auto" />
          <p className="font-semibold">{error}</p>
        </div>
      ) : !insightsData?.hasData ? (
        <div className="bg-white rounded-[18px] border border-[#DCE7F1] p-12 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-[#0079C1]/10 text-[#0079C1] flex items-center justify-center mx-auto">
            <Database className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-[#00308A] text-base">Insufficient Transaction Data</h3>
          <p className="text-xs text-[#64748B] max-w-md mx-auto leading-relaxed">
            AI analysis requires synchronized transaction history to formulate mathematical spending observations and budget pacing advice.
          </p>
          <div className="flex justify-center gap-2 pt-2">
            <button
              onClick={onSeedData}
              disabled={isSeeding}
              className="px-4 py-2 bg-[#0079C1] hover:bg-[#00308A] text-white font-semibold rounded-xl text-xs transition-all cursor-pointer"
            >
              {isSeeding ? 'Seeding...' : 'Load Sample Sandbox Data'}
            </button>
            <button
              onClick={() => onNavigate('connection')}
              className="px-4 py-2 bg-[#F4F8FC] border border-[#DCE7F1] text-[#00308A] font-semibold rounded-xl text-xs hover:bg-[#DCE7F1]/50 cursor-pointer"
            >
              Sync Live Sandbox
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insightsData.insights.map((ins) => (
            <div
              key={ins.id}
              className="bg-white rounded-2xl border border-[#DCE7F1] p-5 shadow-xs hover:shadow-md transition-all space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-[#F4F8FC] border border-[#DCE7F1]">
                    {getInsightIcon(ins.type)}
                  </div>
                  <h4 className="font-bold text-sm text-[#00308A]">{ins.title}</h4>
                </div>

                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    ins.priority === 'high'
                      ? 'bg-red-50 text-red-600 border border-red-200'
                      : ins.priority === 'medium'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {ins.priority} Priority
                </span>
              </div>

              <p className="text-xs text-[#64748B] leading-relaxed pl-11">
                {ins.description}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Interactive Ask AI Buddy Card */}
      <div className="bg-white rounded-[18px] border border-[#DCE7F1] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="font-bold text-[#00308A] text-base">Have a question about your finances?</h4>
          <p className="text-xs text-[#64748B]">
            Ask questions like "Where did I spend the most?", "How much did I spend on food?", or "Give me 3 savings tips".
          </p>
        </div>

        <button
          onClick={onOpenAIAssistant}
          className="px-5 py-2.5 rounded-xl bg-[#0079C1] hover:bg-[#00308A] text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-xs"
        >
          <Sparkles className="w-4 h-4 text-[#009CDE]" />
          <span>Launch AI Assistant</span>
        </button>
      </div>
    </div>
  );
}
