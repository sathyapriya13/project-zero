import React from 'react';
import { ForensicIncident, ForensicEvent, Detection, EvidenceArtifact } from '../types/forensics';
import {
  ShieldAlert,
  History,
  Network,
  Archive,
  Activity,
  Flame,
  Clock,
  ArrowRight,
  Database,
  Radio,
  FileCheck,
} from 'lucide-react';

interface CommandCenterPageProps {
  currentIncident: ForensicIncident | null;
  events: ForensicEvent[];
  detections: Detection[];
  evidenceList: EvidenceArtifact[];
  onNavigateTab: (tab: string) => void;
  onSelectEvent: (event: ForensicEvent) => void;
}

export const CommandCenterPage: React.FC<CommandCenterPageProps> = ({
  currentIncident,
  events,
  detections,
  evidenceList,
  onNavigateTab,
  onSelectEvent,
}) => {
  const maliciousEvents = events.filter((e) => e.isMalicious);
  const criticalDetections = detections.filter((d) => d.severity === 'CRITICAL');

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Hero Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-slate-900 via-[#0d1627] to-[#0a1120] border border-cyan-500/30 p-6 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono uppercase tracking-wider bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/40">
                Active Tactical Incident
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Case ID: {currentIncident?.id || 'INC-2026-0891'}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-100 tracking-tight">
              {currentIncident?.title || 'Project Falcon — Unauthorized Research Exfiltration'}
            </h1>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              {currentIncident?.description ||
                'Simulated multi-stage cyberattack timeline reconstruction. Digital evidence captured from edge SSL-VPN, endpoint EDR agents, and core packet capture gateways.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('time-machine')}
              className="flex items-center space-x-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-cyan-500/25 cursor-pointer"
            >
              <History className="w-4 h-4" />
              <span>Launch Time Machine Replay</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateTab('attack-graph')}
              className="flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold px-4 py-2.5 rounded-xl text-xs transition-all cursor-pointer"
            >
              <Network className="w-4 h-4 text-cyan-400" />
              <span>Inspect Attack Graph</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Events */}
        <div className="bg-[#0c1220] border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Reconstructed Events
            </div>
            <div className="text-2xl font-black text-slate-100 font-mono mt-1">
              {events.length}
            </div>
            <div className="text-[11px] text-cyan-400 font-mono mt-0.5">Chronologically Sequenced</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <History className="w-6 h-6" />
          </div>
        </div>

        {/* Malicious Detections */}
        <div className="bg-[#0c1220] border border-red-900/30 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-red-400 uppercase tracking-wider">
              Suspicious Detections
            </div>
            <div className="text-2xl font-black text-red-400 font-mono mt-1">
              {detections.length}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              {criticalDetections.length} Critical Severity
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
        </div>

        {/* Compromised Blast Radius */}
        <div className="bg-[#0c1220] border border-amber-900/30 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-amber-400 uppercase tracking-wider">
              Hostile Event Trace
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono mt-1">
              {maliciousEvents.length}
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
              {events.length > 0
                ? `${Math.round((maliciousEvents.length / events.length) * 100)}% of timeline`
                : '0%'}
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Flame className="w-6 h-6" />
          </div>
        </div>

        {/* Evidence Vault Artifacts */}
        <div className="bg-[#0c1220] border border-emerald-900/30 rounded-xl p-4 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">
              Evidence Vault
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
              {evidenceList.length}
            </div>
            <div className="text-[11px] text-emerald-400/80 font-mono mt-0.5">SHA-256 Bit-Verified</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <FileCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Middle Section: Live Radar & Threat Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar & SOC Threat Monitor */}
        <div className="bg-[#0c1220] border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                SOC Threat Vector Sweep
              </h2>
            </div>
            <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">
              ACTIVE SCAN
            </span>
          </div>

          <div className="relative w-48 h-48 mx-auto my-2 rounded-full border border-cyan-500/30 flex items-center justify-center overflow-hidden bg-slate-950/60 shadow-inner">
            {/* Concentric radar circles */}
            <div className="absolute inset-4 rounded-full border border-cyan-500/20"></div>
            <div className="absolute inset-10 rounded-full border border-cyan-500/20"></div>
            <div className="absolute inset-16 rounded-full border border-cyan-500/20"></div>
            {/* Crosshairs */}
            <div className="absolute inset-x-0 top-1/2 h-px bg-cyan-500/30"></div>
            <div className="absolute inset-y-0 left-1/2 w-px bg-cyan-500/30"></div>
            {/* Rotating radar sweep */}
            <div className="absolute inset-0 radar-sweep pointer-events-none"></div>

            {/* Pulsing Threat blips */}
            <div
              className="absolute top-10 left-14 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"
              title="Brute Force Edge VPN"
            ></div>
            <div
              className="absolute top-10 left-14 w-2 h-2 bg-red-400 rounded-full"
            ></div>
            <div
              className="absolute bottom-12 right-14 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"
              title="C2 Exfiltration TLS Socket"
            ></div>
            <div
              className="absolute bottom-12 right-14 w-2 h-2 bg-red-400 rounded-full"
            ></div>
          </div>

          <div className="text-[11px] font-mono text-center text-slate-400 pt-2 border-t border-slate-800/80">
            Detected <span className="text-red-400 font-bold">{maliciousEvents.length} malicious signals</span> across internal host and network egress vectors.
          </div>
        </div>

        {/* Tactical Attack Stages Progression */}
        <div className="lg:col-span-2 bg-[#0c1220] border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Attack Progression Chain (MITRE ATT&CK Aligned)
            </h2>
            <span className="text-[10px] font-mono text-slate-400">Deterministic Reconstruction</span>
          </div>

          <div className="space-y-3">
            {[
              {
                phase: 'Phase 1: Initial Reconnaissance & Brute-Force',
                events: 'EVT-0021 to EVT-0026',
                status: 'CONFIRMED',
                time: 'T+00:00 - T+01:15',
                desc: '6 authentication failures followed by SSL-VPN breach from external IP 198.51.100.84.',
                severity: 'HIGH',
              },
              {
                phase: 'Phase 2: Endpoint Access & Discovery',
                events: 'EVT-0036 to EVT-0055',
                status: 'CONFIRMED',
                time: 'T+01:18 - T+01:30',
                desc: 'Host discovery scripts executed (whoami, net group, nltest) from victim WS-ENG-402.',
                severity: 'MEDIUM',
              },
              {
                phase: 'Phase 3: Sensitive File Access & Harvesting',
                events: 'EVT-0056 to EVT-0075',
                status: 'CONFIRMED',
                time: 'T+01:31 - T+01:42',
                desc: 'Restricted Project Falcon aerospace and patent documents read from corporate file share.',
                severity: 'HIGH',
              },
              {
                phase: 'Phase 4: Privilege Escalation & Log Tampering',
                events: 'EVT-0076 & EVT-0077',
                status: 'CONFIRMED',
                time: 'T+01:43 - T+01:45',
                desc: 'Fodhelper UAC bypass to SYSTEM integrity, followed by wevtutil log clearing attempt.',
                severity: 'CRITICAL',
              },
              {
                phase: 'Phase 5: Compression & External TLS Exfiltration',
                events: 'EVT-0089 to EVT-0105',
                status: 'CONFIRMED',
                time: 'T+01:46 - T+02:00',
                desc: '15 sequential encrypted bursts (48.9 MB) egressing to 198.51.100.84 on port 8443.',
                severity: 'CRITICAL',
              },
            ].map((st, i) => (
              <div
                key={i}
                className="bg-slate-900/60 border border-slate-800 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-100">{st.phase}</span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                        st.severity === 'CRITICAL'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : st.severity === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {st.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans">{st.desc}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] font-mono text-cyan-300 font-semibold">{st.events}</div>
                  <div className="text-[10px] font-mono text-slate-500">{st.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Suspicious Activity Log Table */}
      <div className="bg-[#0c1220] border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
              Critical Forensic Event Sequence
            </h2>
            <p className="text-[11px] text-slate-400 font-mono">
              Click any event to open complete technical inspector
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('time-machine')}
            className="text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors flex items-center space-x-1"
          >
            <span>Open in Digital Time Machine</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 text-[10px] uppercase">
                <th className="py-2.5 px-3">Event ID</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Actor / Device</th>
                <th className="py-2.5 px-3">Target Details</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Evidence Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {maliciousEvents.slice(0, 8).map((ev) => (
                <tr
                  key={ev.id}
                  onClick={() => onSelectEvent(ev)}
                  className="hover:bg-slate-800/60 cursor-pointer transition-colors group"
                >
                  <td className="py-2.5 px-3 font-bold text-cyan-300 group-hover:underline">
                    {ev.id}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400">
                    {new Date(ev.timestamp).toISOString().substring(11, 19)} UTC
                  </td>
                  <td className="py-2.5 px-3 text-slate-200">{ev.eventType}</td>
                  <td className="py-2.5 px-3 text-slate-300">
                    <span className="text-cyan-400">{ev.actorUser}</span> @ {ev.sourceDevice}
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 max-w-xs truncate">
                    {ev.filePath || ev.destinationIp || ev.processName || ev.description}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                        ev.severity === 'CRITICAL'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}
                    >
                      {ev.severity}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-cyan-400/80">{ev.evidenceReference || '--'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
