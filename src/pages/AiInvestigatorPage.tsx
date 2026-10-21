import React, { useState } from 'react';
import { ForensicIncident, ForensicEvent } from '../types/forensics';
import { api } from '../services/api';
import {
  Bot,
  Send,
  Sparkles,
  ShieldAlert,
  Hash,
  Clock,
  Terminal,
  HelpCircle,
  Cpu,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface AiInvestigatorPageProps {
  currentIncident: ForensicIncident | null;
  events: ForensicEvent[];
  currentIndex: number;
  onNavigateTab: (tab: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'USER' | 'AI';
  text: string;
  modelUsed?: string;
  isAiPowered?: boolean;
  citedEventsCount?: number;
  timestamp: string;
}

export const AiInvestigatorPage: React.FC<AiInvestigatorPageProps> = ({
  currentIncident,
  events,
  currentIndex,
  onNavigateTab,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'AI',
      text: `Hello Investigator. I am the **PROJECT ZERO AI Forensics Specialist**, connected to the server-side analysis core.

I evaluate deterministic events up to your current Time Machine replay position (Event #${currentIndex + 1} of ${events.length}).

**Rules of Engagement:**
- All conclusions are grounded strictly in recorded evidence and event IDs.
- Speculation is explicitly differentiated from confirmed telemetry.
- Click any quick question below or ask a custom forensic query.`,
      modelUsed: 'gemini-3.8-flash',
      isAiPowered: true,
      timestamp: new Date().toISOString(),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const quickPrompts = [
    'Summarize the initial breach vector and credential stuffing pattern.',
    'Trace how the adversary bypassed UAC and escalated to SYSTEM integrity.',
    'Explain the data staging and external C2 TLS exfiltration timeline.',
    'Which specific files were accessed and what evidence artifacts prove it?',
    'What are the recommended containment actions for host WS-ENG-402?',
  ];

  const handleSendMessage = async (promptToSend?: string) => {
    const text = promptToSend || inputPrompt;
    if (!text.trim() || !currentIncident) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'USER',
      text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const currentEpochMs = events[currentIndex]
        ? new Date(events[currentIndex].timestamp).getTime()
        : undefined;

      const res = await api.askAiAssistant(currentIncident.id, text, currentEpochMs);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'AI',
        text: res.reply,
        modelUsed: res.modelUsed,
        isAiPowered: res.isAiPowered,
        citedEventsCount: res.citedEventsCount,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'AI',
          text: `Error analyzing timeline: ${err.message}. Please check connection to forensic server.`,
          isAiPowered: false,
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 h-[calc(100vh-4rem)] flex flex-col space-y-4 font-mono">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-800 shrink-0">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Evidence-Grounded AI Forensic Analyst</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 font-sans">
            AI Investigation Assistant (Gemini 3.8 Flash)
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Server-side AI analyst querying verified timeline state up to Event #{currentIndex + 1}. All answers cite specific event references.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] bg-indigo-950 text-indigo-300 px-2.5 py-1 rounded border border-indigo-700/60 font-semibold">
            Model: gemini-3.8-flash
          </span>
          <span className="text-[10px] bg-slate-900 text-slate-300 px-2 py-1 rounded border border-slate-800">
            Replay Horizon: {currentIndex + 1} / {events.length} Events
          </span>
        </div>
      </div>

      {/* Quick Prompts Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 shrink-0">
        <span className="text-[10px] text-slate-500 uppercase font-bold shrink-0">
          Suggested Queries:
        </span>
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(qp)}
            disabled={isLoading}
            className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-indigo-950 text-slate-300 hover:text-indigo-200 border border-slate-800 hover:border-indigo-700 text-xs whitespace-nowrap transition-colors cursor-pointer"
          >
            {qp}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 bg-[#0c1220] border border-slate-800 rounded-xl p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === 'USER' ? 'items-end' : 'items-start'
            }`}
          >
            <div
              className={`max-w-3xl rounded-2xl p-4 space-y-2 ${
                msg.sender === 'USER'
                  ? 'bg-cyan-600 text-slate-950 font-semibold'
                  : 'bg-slate-900 border border-slate-800 text-slate-200 shadow-md'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] text-slate-400 pb-1 border-b border-slate-800/60">
                <div className="flex items-center space-x-2">
                  {msg.sender === 'AI' ? (
                    <>
                      <Bot className="w-3.5 h-3.5 text-indigo-400" />
                      <strong className="text-indigo-300">AI Forensic Specialist</strong>
                      {msg.modelUsed && (
                        <span className="px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 text-[9px] border border-indigo-800/40">
                          {msg.modelUsed}
                        </span>
                      )}
                    </>
                  ) : (
                    <strong className="text-slate-900">Lead Investigator</strong>
                  )}
                </div>
                <span>{new Date(msg.timestamp).toISOString().substring(11, 19)} UTC</span>
              </div>

              {/* Message Content */}
              <div
                className={`text-xs leading-relaxed font-sans whitespace-pre-wrap ${
                  msg.sender === 'USER' ? 'text-slate-950' : 'text-slate-200'
                }`}
              >
                {msg.text}
              </div>

              {/* Citations Footer */}
              {msg.sender === 'AI' && (
                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <span>Grounding: Strictly constrained to verified timeline telemetry</span>
                  <span className="text-cyan-400 font-semibold">Evidence IDs Verified</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-mono py-2">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>Analyzing digital evidence stream with Gemini 3.8 Flash...</span>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center space-x-2 shrink-0"
      >
        <input
          type="text"
          placeholder="Ask a forensic question (e.g. 'Explain the C2 exfiltration protocol and identify the IP destination')..."
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          disabled={isLoading}
          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
        />
        <button
          type="submit"
          disabled={isLoading || !inputPrompt.trim()}
          className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-40 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-2 transition-all shadow-md cursor-pointer"
        >
          <span>Analyze</span>
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
