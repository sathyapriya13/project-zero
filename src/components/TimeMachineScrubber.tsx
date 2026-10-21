import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  SkipBack,
  SkipForward,
  Clock,
  Gauge,
  Flame,
} from 'lucide-react';
import { ForensicEvent } from '../types/forensics';

interface TimeMachineScrubberProps {
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
}

export const TimeMachineScrubber: React.FC<TimeMachineScrubberProps> = ({
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
}) => {
  const currentEvent = events[currentIndex] || events[0];
  const speeds = [0.5, 1, 2, 5];

  const formatTimestamp = (iso?: string) => {
    if (!iso) return '--:--:--';
    const d = new Date(iso);
    return d.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
  };

  const getSeverityColor = (sev?: string) => {
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
    <div className="bg-[#0b101d] border border-cyan-500/30 rounded-xl p-4 shadow-xl shadow-cyan-950/30 relative overflow-hidden">
      {/* Decorative top glow border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-60"></div>

      {/* Top Meta Bar: Active Event Overview */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider font-mono text-cyan-400 font-semibold flex items-center space-x-1.5">
              <span>Time Machine Replay Position</span>
              {currentEvent?.isMalicious && (
                <span className="flex items-center space-x-1 text-red-400 font-mono text-[9px] px-1.5 py-0.2 bg-red-500/15 rounded border border-red-500/30">
                  <Flame className="w-2.5 h-2.5" />
                  <span>SUSPICIOUS ACTIVITY</span>
                </span>
              )}
            </div>
            <div className="text-base font-mono font-bold text-slate-100">
              {formatTimestamp(currentEvent?.timestamp)}
            </div>
          </div>
        </div>

        {/* Current State Info Chips */}
        {currentEvent && (
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className={`px-2.5 py-1 rounded-md border font-semibold ${getSeverityColor(currentEvent.severity)}`}>
              {currentEvent.severity}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
              User: <strong className="text-cyan-300">{currentEvent.actorUser}</strong>
            </span>
            <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
              Host: <strong className="text-slate-100">{currentEvent.sourceDevice}</strong>
            </span>
            {currentEvent.processName && (
              <span className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-cyan-400">
                Proc: <strong>{currentEvent.processName}</strong>
              </span>
            )}
            <span className="px-2.5 py-1 rounded-md bg-cyan-950/60 border border-cyan-700/50 text-cyan-300 font-bold">
              Event #{currentIndex + 1} of {events.length}
            </span>
          </div>
        )}
      </div>

      {/* Main Scrubber Slider */}
      <div className="mb-4 space-y-1.5">
        <div className="relative flex items-center">
          <input
            type="range"
            min={0}
            max={Math.max(events.length - 1, 0)}
            value={currentIndex}
            onChange={(e) => onScrubIndex(Number(e.target.value))}
            className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          />
        </div>

        {/* Progress & Markers */}
        <div className="flex justify-between items-center text-[11px] font-mono text-slate-400">
          <span>Inception: {events.length > 0 ? formatTimestamp(events[0]?.timestamp) : '--'}</span>
          <span className="text-cyan-400 font-semibold">
            {events.length > 0 ? `${Math.round(((currentIndex + 1) / events.length) * 100)}% Reconstructed` : '0%'}
          </span>
          <span>Latest: {events.length > 0 ? formatTimestamp(events[events.length - 1]?.timestamp) : '--'}</span>
        </div>
      </div>

      {/* Controls Bar: Playback Buttons & Speed Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        {/* Playback Transport Buttons */}
        <div className="flex items-center space-x-2">
          {/* Rewind to beginning */}
          <button
            onClick={onRewindStart}
            title="Rewind to Inception"
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-300 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Step Backward 1 Event */}
          <button
            onClick={onStepBackward}
            disabled={currentIndex === 0}
            title="Step Backward (Previous Event)"
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-700 text-slate-300 hover:text-cyan-300 transition-colors"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Play / Pause Toggle */}
          <button
            onClick={onPlayPause}
            className={`px-4 py-2 rounded-lg font-bold text-xs flex items-center space-x-2 transition-all shadow-md ${
              isPlaying
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/20'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>PAUSE REPLAY</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>PLAY REPLAY</span>
              </>
            )}
          </button>

          {/* Step Forward 1 Event */}
          <button
            onClick={onStepForward}
            disabled={currentIndex >= events.length - 1}
            title="Step Forward (Next Event)"
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-700 text-slate-300 hover:text-cyan-300 transition-colors"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Fast forward to end */}
          <button
            onClick={onFastForwardEnd}
            title="Fast Forward to Latest Event"
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-300 transition-colors"
          >
            <FastForward className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Selector (0.5x, 1x, 2x, 5x) */}
        <div className="flex items-center space-x-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-lg">
          <div className="flex items-center space-x-1 px-2 text-[11px] font-mono text-slate-400">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <span>Speed:</span>
          </div>
          {speeds.map((s) => (
            <button
              key={s}
              onClick={() => onChangeSpeed(s)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all ${
                playbackSpeed === s
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
