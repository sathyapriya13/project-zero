import React from 'react';
import {
  LayoutDashboard,
  FolderGit2,
  History,
  Network,
  ShieldAlert,
  Archive,
  Bot,
  FileText,
  Radio,
  Cpu,
} from 'lucide-react';

interface NavigationProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  detectionCount: number;
  evidenceCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onTabChange,
  detectionCount,
  evidenceCount,
}) => {
  const navItems = [
    { id: 'command-center', label: 'Command Center', icon: LayoutDashboard },
    { id: 'incidents', label: 'Incident Library', icon: FolderGit2 },
    { id: 'time-machine', label: 'Digital Time Machine', icon: History, highlight: true },
    { id: 'attack-graph', label: 'Attack Graph', icon: Network },
    { id: 'evidence-vault', label: 'Evidence Vault', icon: Archive, badge: evidenceCount },
    { id: 'detection-center', label: 'Detection Center', icon: ShieldAlert, badge: detectionCount, badgeAlert: true },
    { id: 'ai-investigator', label: 'AI Investigator', icon: Bot, isAi: true },
    { id: 'reports', label: 'Forensic Reports', icon: FileText },
  ];

  return (
    <aside className="w-64 bg-[#0d131f] border-r border-slate-800/80 flex flex-col h-screen select-none shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-slate-950 font-black text-xl tracking-tighter">
            PØ
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-slate-100 tracking-wider text-sm">PROJECT ZERO</span>
              <span className="text-[10px] bg-cyan-950 text-cyan-400 px-1.5 py-0.5 rounded font-mono font-semibold border border-cyan-800/50">
                v1.0
              </span>
            </div>
            <p className="text-[11px] text-cyan-400/80 font-mono italic">Rewind the evidence.</p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold tracking-wider text-slate-500 uppercase font-mono">
          Investigation Console
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              } ${item.highlight && !isActive ? 'hover:border-cyan-500/30 text-slate-300' : ''}`}
            >
              <div className="flex items-center space-x-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'
                  } ${item.highlight ? 'text-cyan-400' : ''}`}
                />
                <span className={item.highlight ? 'font-semibold' : ''}>{item.label}</span>
              </div>

              <div className="flex items-center space-x-1.5">
                {item.isAi && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                    GEMINI
                  </span>
                )}
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      item.badgeAlert
                        ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Engine Status Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 space-y-2 text-[11px] font-mono">
        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center space-x-1.5">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Forensic Engine:</span>
          </span>
          <span className="text-emerald-400 font-semibold">ONLINE</span>
        </div>
        <div className="flex items-center justify-between text-slate-400">
          <span className="flex items-center space-x-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Integrity:</span>
          </span>
          <span className="text-slate-300">SHA-256 Valid</span>
        </div>
      </div>
    </aside>
  );
};
