import React from 'react';
import { ForensicEvent } from '../types/forensics';
import {
  X,
  Shield,
  Clock,
  Terminal,
  FileCode,
  Network,
  User,
  HardDrive,
  Hash,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface EventDetailModalProps {
  event: ForensicEvent | null;
  onClose: () => void;
  onJumpToEvidence?: (evidenceRef: string) => void;
}

export const EventDetailModal: React.FC<EventDetailModalProps> = ({
  event,
  onClose,
  onJumpToEvidence,
}) => {
  if (!event) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0e1424] border border-cyan-500/40 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl shadow-cyan-950/50 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs font-mono border ${
                event.isMalicious
                  ? 'bg-red-500/20 text-red-400 border-red-500/40'
                  : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
              }`}
            >
              {event.isMalicious ? 'MAL' : 'SYS'}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-sm font-bold text-cyan-300">{event.id}</span>
                <span className="text-slate-500 font-mono text-xs">#{event.sequenceNumber}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                    event.isMalicious
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {event.severity}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">{event.eventType}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs font-mono">
          {/* Timestamp & Causality Nature */}
          <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-slate-300">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Timestamp:</span>
              <strong className="text-slate-100">{new Date(event.timestamp).toUTCString()}</strong>
            </div>
            <div className="text-[11px]">
              {event.isInferred ? (
                <span className="text-amber-400 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/30">
                  Relationship: Heuristic Inferred
                </span>
              ) : (
                <span className="text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/30">
                  Relationship: Deterministic Observed
                </span>
              )}
            </div>
          </div>

          {/* Forensic Description */}
          <div>
            <label className="text-slate-400 uppercase tracking-wider text-[10px] font-bold block mb-1.5">
              Forensic Narrative & Context
            </label>
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-200 leading-relaxed font-sans text-xs">
              {event.description}
            </div>
          </div>

          {/* Grid of Entity Properties */}
          <div className="grid grid-cols-2 gap-3">
            {/* Actor User */}
            <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800/80">
              <div className="flex items-center space-x-2 text-slate-400 mb-1">
                <User className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[10px] uppercase font-bold">Actor User</span>
              </div>
              <div className="text-slate-100 font-semibold">{event.actorUser}</div>
            </div>

            {/* Source Device */}
            <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800/80">
              <div className="flex items-center space-x-2 text-slate-400 mb-1">
                <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[10px] uppercase font-bold">Source Endpoint</span>
              </div>
              <div className="text-slate-100 font-semibold">{event.sourceDevice}</div>
            </div>

            {/* Destination Device */}
            {event.destinationDevice && (
              <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800/80">
                <div className="flex items-center space-x-2 text-slate-400 mb-1">
                  <Network className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[10px] uppercase font-bold">Target Host</span>
                </div>
                <div className="text-slate-100 font-semibold">{event.destinationDevice}</div>
              </div>
            )}

            {/* Process Execution */}
            {event.processName && (
              <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800/80">
                <div className="flex items-center space-x-2 text-slate-400 mb-1">
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[10px] uppercase font-bold">Process & PID</span>
                </div>
                <div className="text-cyan-300 font-semibold">
                  {event.processName} {event.processId ? `(PID: ${event.processId})` : ''}
                </div>
              </div>
            )}

            {/* File Path */}
            {event.filePath && (
              <div className="col-span-2 bg-slate-900/40 p-3 rounded-lg border border-slate-800/80">
                <div className="flex items-center space-x-2 text-slate-400 mb-1">
                  <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[10px] uppercase font-bold">Target File Artifact</span>
                </div>
                <div className="text-slate-200 break-all font-mono text-[11px] bg-slate-950 p-2 rounded border border-slate-850">
                  {event.filePath}
                </div>
              </div>
            )}

            {/* Network Socket */}
            {(event.sourceIp || event.destinationIp) && (
              <div className="col-span-2 bg-slate-900/40 p-3 rounded-lg border border-slate-800/80">
                <div className="flex items-center space-x-2 text-slate-400 mb-1">
                  <Network className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-[10px] uppercase font-bold">Network Socket Flow</span>
                </div>
                <div className="text-slate-200 flex items-center space-x-2">
                  <span>{event.sourceIp || 'Internal'}</span>
                  <span className="text-slate-500">➔</span>
                  <span className="text-red-400 font-bold">{event.destinationIp || 'Egress'}</span>
                  {event.port && <span className="text-slate-400">:port {event.port}</span>}
                  {event.protocol && (
                    <span className="px-1.5 py-0.2 bg-slate-800 text-[10px] rounded text-slate-300">
                      {event.protocol}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Evidence Reference Link */}
          {event.evidenceReference && (
            <div className="p-3 bg-cyan-950/30 border border-cyan-800/40 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-300">
                <Hash className="w-4 h-4 text-cyan-400" />
                <span>Supporting Vault Artifact:</span>
                <strong className="text-cyan-300">{event.evidenceReference}</strong>
              </div>
              {onJumpToEvidence && (
                <button
                  onClick={() => onJumpToEvidence(event.evidenceReference!)}
                  className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded font-bold text-[10px] transition-colors"
                >
                  Inspect in Vault
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-900/60 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-mono transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
