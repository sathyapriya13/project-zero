import React, { useState } from 'react';
import { ForensicIncident } from '../types/forensics';
import {
  FolderGit2,
  Play,
  ShieldAlert,
  Clock,
  Layers,
  Upload,
  Search,
  CheckCircle2,
  HardDrive,
  Users,
  ExternalLink,
} from 'lucide-react';

interface IncidentLibraryPageProps {
  incidents: ForensicIncident[];
  currentIncident: ForensicIncident | null;
  onSelectIncident: (inc: ForensicIncident) => void;
  onNavigateTab: (tab: string) => void;
}

export const IncidentLibraryPage: React.FC<IncidentLibraryPageProps> = ({
  incidents,
  currentIncident,
  onSelectIncident,
  onNavigateTab,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedScenarioFilter, setSelectedScenarioFilter] = useState('ALL');
  const [isSimulatingNew, setIsSimulatingNew] = useState(false);

  const scenarioMeta = {
    INSIDER_DATA_THEFT: {
      badge: 'Scenario A: Insider Threat',
      color: 'border-cyan-500/40 bg-cyan-950/20 text-cyan-300',
      tag: '105 Events // Multi-Stage Attack',
    },
    COMPROMISED_ADMIN_ACCOUNT: {
      badge: 'Scenario B: Privileged Takeover',
      color: 'border-amber-500/40 bg-amber-950/20 text-amber-300',
      tag: '84 Events // Kerberoasting',
    },
    RANSOMWARE_INCIDENT: {
      badge: 'Scenario C: Extortion Outbreak',
      color: 'border-red-500/40 bg-red-950/20 text-red-400',
      tag: '128 Events // Cryptographic Scrub',
    },
    SUSPICIOUS_NETWORK_ACTIVITY: {
      badge: 'Scenario D: Network Exfil',
      color: 'border-purple-500/40 bg-purple-950/20 text-purple-300',
      tag: '62 Events // DNS Beaconing',
    },
  };

  const filteredIncidents = incidents.filter((inc) => {
    const matchesSearch =
      inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesScenario =
      selectedScenarioFilter === 'ALL' || inc.scenarioType === selectedScenarioFilter;
    return matchesSearch && matchesScenario;
  });

  const handleLaunchIncident = (inc: ForensicIncident) => {
    onSelectIncident(inc);
    onNavigateTab('time-machine');
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)] font-mono">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <FolderGit2 className="w-4 h-4" />
            <span>Forensic Simulation Repository</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 font-sans">
            Incident Scenarios & Replay Archives
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Select an isolated cyberattack scenario to reconstruct chronologically, inspect entity topologies, and rewind digital evidence.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search case, host, user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-64"
            />
          </div>

          <select
            value={selectedScenarioFilter}
            onChange={(e) => setSelectedScenarioFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Scenarios</option>
            <option value="INSIDER_DATA_THEFT">Scenario A: Insider Threat</option>
            <option value="COMPROMISED_ADMIN_ACCOUNT">Scenario B: Compromised Admin</option>
            <option value="RANSOMWARE_INCIDENT">Scenario C: Ransomware</option>
            <option value="SUSPICIOUS_NETWORK_ACTIVITY">Scenario D: Suspicious Network</option>
          </select>
        </div>
      </div>

      {/* Incident Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredIncidents.map((inc) => {
          const isSelected = currentIncident?.id === inc.id;
          const meta = scenarioMeta[inc.scenarioType as keyof typeof scenarioMeta] || {
            badge: inc.scenarioType,
            color: 'border-slate-700 bg-slate-900 text-slate-300',
            tag: `${inc.totalEvents} Events`,
          };

          return (
            <div
              key={inc.id}
              className={`rounded-xl border p-5 flex flex-col justify-between transition-all relative overflow-hidden bg-[#0c1220] ${
                isSelected
                  ? 'border-cyan-500 shadow-xl shadow-cyan-950/40 ring-1 ring-cyan-500/50'
                  : 'border-slate-800 hover:border-slate-700 hover:bg-[#0e1526]'
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 right-0 bg-cyan-500 text-slate-950 px-3 py-0.5 text-[10px] font-bold rounded-bl-lg font-mono">
                  ACTIVE CASE
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded border font-semibold ${meta.color}`}>
                    {meta.badge}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{meta.tag}</span>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-400 text-xs font-bold">{inc.id}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        inc.severity === 'CRITICAL'
                          ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                          : inc.severity === 'HIGH'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {inc.severity}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-100 font-sans mt-1">
                    {inc.title}
                  </h3>
                </div>

                <p className="text-xs text-slate-400 font-sans leading-relaxed">
                  {inc.description}
                </p>

                <div className="pt-2 border-t border-slate-800/80 grid grid-cols-2 gap-2 text-[11px] text-slate-400 font-mono">
                  <div className="flex items-center space-x-1.5">
                    <Users className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Investigator: {inc.leadInvestigatorId}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Entities: {inc.compromisedEntitiesCount} Compromised</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                <div className="text-[10px] text-slate-500 font-mono">
                  Synthetic Sandbox Simulation
                </div>

                <button
                  onClick={() => handleLaunchIncident(inc)}
                  className={`flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'bg-slate-850 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 border border-slate-700'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isSelected ? 'Open Time Machine' : 'Load & Replay Scenario'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upload Custom Log Section */}
      <div className="rounded-xl border border-dashed border-slate-800 p-6 bg-slate-900/30 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-xs font-bold text-slate-200 font-sans flex items-center space-x-2">
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>Ingest Custom Raw Audit Log or PCAP Artifact</span>
          </h3>
          <p className="text-xs text-slate-400 font-sans">
            Upload custom Sysmon, EVTX, Apache access, or PCAP stream. The Java correlation engine will parse timestamps and compute SHA-256 evidence digests.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('evidence-vault')}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 rounded-lg text-xs font-semibold shrink-0 cursor-pointer"
        >
          Open Evidence Ingestion Vault
        </button>
      </div>
    </div>
  );
};
