import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Loader2,
  TrendingUp,
  Tag,
  DollarSign,
  Lightbulb,
  Check
} from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SUGGESTED_PROMPTS = [
  'Where did I spend the most this month?',
  'How much did I spend on food & dining?',
  'Am I currently on track with my monthly budget?',
  'Give me 3 smart tips to reduce spending',
];

export default function AskAIBuddyModal({ isOpen, onClose, activeUserId }) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I am your AI Budget Buddy. I have direct access to your synchronized PayPal Sandbox transactions. Ask me about your spending patterns, highest categories, or how to save more this month!",
      time: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (queryText) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage = {
      sender: 'user',
      text: textToSend.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch(`${BACKEND_URL}/api/ai/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': activeUserId,
        },
        body: JSON.stringify({ question: textToSend.trim() }),
      });

      const data = await res.json();
      const aiReply = {
        sender: 'ai',
        text: data.answer || "I've analyzed your spending records, but could not formulate a clear response. Try asking about your highest expenses or budget pacing!",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Unable to consult financial model: ${err.message}. Please verify the backend is active.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#DCE7F1] flex flex-col h-[600px] max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#DCE7F1] flex items-center justify-between bg-gradient-to-r from-[#F4F8FC] to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00308A] to-[#0079C1] flex items-center justify-center text-white shadow-sm shadow-[#00308A]/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[#00308A] text-base">Ask AI Buddy</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#009CDE]/10 text-[#0079C1] border border-[#009CDE]/20">
                  REAL-TIME INSIGHTS
                </span>
              </div>
              <p className="text-xs text-[#64748B]">Personalized insights based on your MongoDB transactions</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#00308A] hover:bg-[#F4F8FC] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((m, idx) => {
            const isAI = m.sender === 'ai';
            return (
              <div
                key={idx}
                className={`flex items-start gap-3 ${isAI ? '' : 'flex-row-reverse'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs shrink-0 ${
                    isAI
                      ? 'bg-[#0079C1]/10 text-[#0079C1] border border-[#009CDE]/20'
                      : 'bg-[#00308A] text-white'
                  }`}
                >
                  {isAI ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                    isAI
                      ? 'bg-[#F4F8FC] text-[#00308A] border border-[#DCE7F1] rounded-tl-sm'
                      : 'bg-[#0079C1] text-white rounded-tr-sm shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{m.text}</p>
                  <span
                    className={`block mt-1 text-[10px] ${
                      isAI ? 'text-[#64748B]' : 'text-white/70'
                    }`}
                  >
                    {m.time}
                  </span>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#0079C1]/10 text-[#0079C1] flex items-center justify-center text-xs shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[#F4F8FC] rounded-2xl rounded-tl-sm p-3.5 border border-[#DCE7F1] flex items-center gap-2 text-xs text-[#0079C1]">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>AI Buddy is analyzing your spending records...</span>
              </div>
            </div>
          )}
        </div>

        {/* Suggested Prompts Pills */}
        <div className="px-4 py-2 border-t border-[#DCE7F1] bg-[#F4F8FC]/50 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
          <span className="text-[11px] font-semibold text-[#64748B] shrink-0">Try:</span>
          {SUGGESTED_PROMPTS.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSend(p)}
              disabled={isLoading}
              className="px-2.5 py-1 rounded-lg bg-white border border-[#DCE7F1] hover:border-[#0079C1] text-[11px] text-[#00308A] font-medium shrink-0 transition-colors cursor-pointer disabled:opacity-50"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3.5 border-t border-[#DCE7F1] bg-white flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your budget, highest expenses, or tips..."
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-[#DCE7F1] focus:outline-none focus:border-[#0079C1] focus:ring-2 focus:ring-[#009CDE]/15 bg-white text-[#00308A]"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="h-10 px-4 bg-[#0079C1] hover:bg-[#00308A] disabled:opacity-50 text-white font-semibold rounded-xl transition-all duration-150 flex items-center gap-1.5 cursor-pointer text-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}
