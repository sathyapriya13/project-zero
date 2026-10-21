import React, { useEffect, useState } from 'react';
import { ForensicIncident } from '../types/forensics';
import { AlertTriangle, Clock, RefreshCw, Shield, ChevronDown } from 'lucide-react';

interface HeaderProps {
  incidents: ForensicIncident[];
  currentIncident: ForensicIncident | null;
  onSelectIncident: (inc: ForensicIncident) => void;
  onQuickRewind: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  incidents,
  currentIncident,
  onSelectIncident,
  onQuickRewind,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toUTCString().replace('GMT', 'UTC'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getSeverityBadge = (severity?: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-500/15 text-red-400 border-red-500/40';
      case 'HIGH':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/40';
      case 'MEDIUM':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/40';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <header className="h-16 bg-[#0a0f1d]/90 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between z-20 shrink-0">
      {/* Active Incident Dropdown & Title */}
      <div className="flex items-center space-x-4">
        <div className="relative group">
          <button className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-850 px-3 py-1.5 rounded-lg border border-slate-700/80 text-xs font-mono font-medium text-slate-200 shadow-sm transition-colors">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>{currentIncident ? currentIncident.id : 'Select Incident'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          <div className="absolute left-0 mt-1 w-80 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl py-1.5 hidden group-hover:block z-50">
            <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800">
              Active Investigation Cases
            </div>
            {incidents.map((inc) => (
              <button
                key={inc.id}
                onClick={() => onSelectIncident(inc)}
                className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-800 transition-colors flex flex-col space-y-0.5 ${
                  currentIncident?.id === inc.id ? 'bg-cyan-950/40 border-l-2 border-cyan-400' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-semibold text-cyan-300">{inc.id}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded border font-mono ${getSeverityBadge(inc.severity)}`}>
                    {inc.severity}
                  </span>
                </div>
                <span className="text-slate-300 truncate text-[11px]">{inc.title}</span>
              </button>
            ))}
          </div>
        </div>

        {currentIncident && (
          <div className="hidden md:flex items-center space-x-2">
            <span className="text-slate-600">/</span>
            <span className="text-xs font-semibold text-slate-200 truncate max-w-md">
              {currentIncident.title}
            </span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700 font-mono">
              {currentIncident.scenarioType}
            </span>
          </div>
        )}
      </div>

      {/* Right Controls: UTC Clock & Fast Rewind */}
      <div className="flex items-center space-x-4">
        <div className="hidden lg:flex items-center space-x-2 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-400">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{currentTime || 'Synchronizing Clock...'}</span>
        </div>

        <button
          onClick={onQuickRewind}
          title="Rewind Timeline to Incident Inception"
          className="flex items-center space-x-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-slate-950 font-bold px-3 py-1.5 rounded-lg text-xs shadow-md shadow-cyan-500/20 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Rewind Attack</span>
        </button>
      </div>
    </header>
  );
};
