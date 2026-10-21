import React, { useState, useMemo } from 'react';
import { ForensicEvent, ForensicIncident } from '../types/forensics';
import { TimeMachineScrubber } from '../components/TimeMachineScrubber';
import {
  History,
  Filter,
  Search,
  Flame,
  Shield,
  FileCode,
  Terminal,
  Network,
  Eye,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface TimeMachinePageProps {
  currentIncident: ForensicIncident | null;
  events: ForensicEvent[];
  currentIndex: number;
  isPlaying: boolean;
  playbackSpeed: number;
  onPlayPause: () => void;
  onRewindStart: () => void;
  onFastForwardEnd: () => void;
  onStepBackward: () => void;
  onStepForward: () => void;
  onScrubIndex: (index: number) => void;
  onChangeSpeed: (speed: number) => void;
  onSelectEvent: (event: ForensicEvent) => void;
  onNavigateTab: (tab: string) => void;
}

export const TimeMachinePage: React.FC<TimeMachinePageProps> = ({
  currentIncident,
  events,
  currentIndex,
  isPlaying,
  playbackSpeed,
  onPlayPause,
  onRewindStart,
  onFastForwardEnd,
  onStepBackward,
  onStepForward,
  onScrubIndex,
  onChangeSpeed,
  onSelectEvent,
  onNavigateTab,
}) => {
  const [filterMaliciousOnly, setFilterMaliciousOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('ALL');

  const visibleEvents = useMemo(() => {
    return events.slice(0, currentIndex + 1);
  }, [events, currentIndex]);

  const filteredVisibleEvents = useMemo(() => {
    return visibleEvents.filter((ev) => {
      const matchMal = !filterMaliciousOnly || ev.isMalicious;
      const matchType = selectedEventType === 'ALL' || ev.eventType === selectedEventType;
      const matchSearch =
        searchTerm === '' ||
        ev.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ev.actorUser.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ev.processName && ev.processName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (ev.filePath && ev.filePath.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchMal && matchType && matchSearch;
    });
  }, [visibleEvents, filterMaliciousOnly, selectedEventType, searchTerm]);

  const currentScrubbedEvent = events[currentIndex];

  const eventTypes = useMemo(() => {
    const set = new Set(events.map((e) => e.eventType));
    return ['ALL', ...Array.from(set)];
  }, [events]);

  const getSeverityStyle = (sev?: string) => {
    switch (sev) {
      case 'CRITICAL':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'HIGH':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'MEDIUM':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      {/* Page Title & Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold font-mono uppercase tracking-wider mb-1">
            <History className="w-4 h-4" />
            <span>Digital Time Machine // Signature Replay Engine</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 font-sans">
            Chronological Cybercrime Reconstruction
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Rewind and replay the forensic timeline. As you scrub forward or backward, all entity relationships, process hierarchies, and detections update dynamically.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => onNavigateTab('attack-graph')}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono text-cyan-300 transition-colors cursor-pointer"
          >
            <span>View Graph Topology</span>
          </button>
          <button
            onClick={() => onNavigateTab('ai-investigator')}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-950 hover:bg-indigo-900 border border-indigo-700/60 rounded-lg text-xs font-mono text-indigo-300 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask AI Investigator</span>
          </button>
        </div>
      </div>

      {/* Signature Scrubber Component */}
      <TimeMachineScrubber
        events={events}
        currentIndex={currentIndex}
        isPlaying={isPlaying}
        playbackSpeed={playbackSpeed}
        onPlayPause={onPlayPause}
        onRewindStart={onRewindStart}
        onFastForwardEnd={onFastForwardEnd}
        onStepBackward={onStepBackward}
        onStepForward={onStepForward}
        onScrubIndex={onScrubIndex}
        onChangeSpeed={onChangeSpeed}
      />

      {/* Active Scrubbed Event Highlight Card */}
      {currentScrubbedEvent && (
        <div
          onClick={() => onSelectEvent(currentScrubbedEvent)}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            currentScrubbedEvent.isMalicious
              ? 'bg-red-950/20 border-red-500/50 hover:border-red-400 glow-red'
              : 'bg-slate-900/60 border-cyan-500/40 hover:border-cyan-400'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start space-x-3">
              <div
                className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                  currentScrubbedEvent.isMalicious
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-cyan-500/20 text-cyan-400'
                }`}
              >
                {currentScrubbedEvent.isMalicious ? (
                  <Flame className="w-5 h-5" />
                ) : (
                  <Shield className="w-5 h-5" />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-2 font-mono text-xs">
                  <span className="font-bold text-cyan-300">{currentScrubbedEvent.id}</span>
                  <span className="text-slate-500">#{currentScrubbedEvent.sequenceNumber}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${getSeverityStyle(currentScrubbedEvent.severity)}`}>
                    {currentScrubbedEvent.severity}
                  </span>
                  <span className="text-slate-400">
                    {new Date(currentScrubbedEvent.timestamp).toUTCString()}
                  </span>
                </div>

                <div className="text-sm font-semibold text-slate-100 font-sans">
                  {currentScrubbedEvent.description}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400 pt-1">
                  <span>User: <strong className="text-slate-200">{currentScrubbedEvent.actorUser}</strong></span>
                  <span>Host: <strong className="text-slate-200">{currentScrubbedEvent.sourceDevice}</strong></span>
                  {currentScrubbedEvent.processName && (
                    <span>Process: <strong className="text-cyan-400">{currentScrubbedEvent.processName}</strong></span>
                  )}
                  {currentScrubbedEvent.evidenceReference && (
                    <span className="text-cyan-400/80 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
                      Ref: {currentScrubbedEvent.evidenceReference}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono self-start md:self-center shrink-0">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>Full Details</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar for Reconstructed Feed */}
      <div className="bg-[#0c1220] border border-slate-800 rounded-xl p-4 space-y-3 font-mono">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-200 uppercase">
              Reconstructed Event Feed
            </span>
            <span className="text-[11px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800">
              Showing {filteredVisibleEvents.length} of {visibleEvents.length} Active Events
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Filter events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-900 border border-slate-750 rounded-lg pl-8 pr-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-44"
              />
            </div>

            {/* Event Type Filter */}
            <select
              value={selectedEventType}
              onChange={(e) => setSelectedEventType(e.target.value)}
              className="bg-slate-900 border border-slate-750 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {eventTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>

            {/* Malicious Only Toggle */}
            <button
              onClick={() => setFilterMaliciousOnly(!filterMaliciousOnly)}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer ${
                filterMaliciousOnly
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Suspicious Only</span>
            </button>
          </div>
        </div>

        {/* Scrollable Forensic Events Table */}
        <div className="overflow-x-auto max-h-96 overflow-y-auto border border-slate-850 rounded-lg">
          <table className="w-full text-left font-mono text-xs">
            <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 z-10 text-[10px] text-slate-400 uppercase">
              <tr>
                <th className="py-2 px-3">#</th>
                <th className="py-2 px-3">Event ID</th>
                <th className="py-2 px-3">Timestamp</th>
                <th className="py-2 px-3">Type</th>
                <th className="py-2 px-3">Actor / Host</th>
                <th className="py-2 px-3">Process / Target</th>
                <th className="py-2 px-3">Severity</th>
                <th className="py-2 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filteredVisibleEvents.map((ev, idx) => {
                const isCurrent = ev.id === currentScrubbedEvent?.id;
                return (
                  <tr
                    key={ev.id}
                    className={`hover:bg-slate-800/60 transition-colors ${
                      isCurrent
                        ? 'bg-cyan-950/40 border-l-4 border-cyan-400 font-bold'
                        : ev.isMalicious
                        ? 'bg-red-950/10'
                        : ''
                    }`}
                  >
                    <td className="py-2 px-3 text-slate-500">{ev.sequenceNumber}</td>
                    <td className="py-2 px-3 font-semibold text-cyan-300">{ev.id}</td>
                    <td className="py-2 px-3 text-slate-400 whitespace-nowrap">
                      {new Date(ev.timestamp).toISOString().substring(11, 19)} UTC
                    </td>
                    <td className="py-2 px-3">
                      <span className="text-slate-200">{ev.eventType}</span>
                    </td>
                    <td className="py-2 px-3 text-slate-300">
                      <span className="text-cyan-400">{ev.actorUser}</span>
                      <span className="text-slate-500"> @ </span>
                      <span>{ev.sourceDevice}</span>
                    </td>
                    <td className="py-2 px-3 max-w-xs truncate text-slate-400">
                      {ev.processName || ev.filePath || ev.destinationIp || ev.description}
                    </td>
                    <td className="py-2 px-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${getSeverityStyle(ev.severity)}`}>
                        {ev.severity}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => onScrubIndex(ev.sequenceNumber - 1)}
                        title="Jump Time Machine scrubber to this event"
                        className="text-[10px] text-cyan-400 hover:text-cyan-200 underline cursor-pointer"
                      >
                        Jump To
                      </button>
                      <button
                        onClick={() => onSelectEvent(ev)}
                        className="text-[10px] text-slate-400 hover:text-slate-200 underline cursor-pointer"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
