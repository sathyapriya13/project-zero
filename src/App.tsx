/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  ForensicIncident,
  ForensicEvent,
  InvestigationGraph,
  Detection,
  EvidenceArtifact,
} from './types/forensics';
import { api } from './services/api';
import { Navigation } from './components/Navigation';
import { Header } from './components/Header';
import { EventDetailModal } from './components/EventDetailModal';

// Pages
import { CommandCenterPage } from './pages/CommandCenterPage';
import { IncidentLibraryPage } from './pages/IncidentLibraryPage';
import { TimeMachinePage } from './pages/TimeMachinePage';
import { AttackGraphPage } from './pages/AttackGraphPage';
import { EvidenceVaultPage } from './pages/EvidenceVaultPage';
import { DetectionCenterPage } from './pages/DetectionCenterPage';
import { AiInvestigatorPage } from './pages/AiInvestigatorPage';
import { ReportsPage } from './pages/ReportsPage';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('command-center');
  const [incidents, setIncidents] = useState<ForensicIncident[]>([]);
  const [currentIncident, setCurrentIncident] = useState<ForensicIncident | null>(null);

  // Time Machine Core State
  const [events, setEvents] = useState<ForensicEvent[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Graph, Detections, & Evidence
  const [graphData, setGraphData] = useState<InvestigationGraph | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [evidenceList, setEvidenceList] = useState<EvidenceArtifact[]>([]);

  // Detailed Event Modal Inspector
  const [inspectedEvent, setInspectedEvent] = useState<ForensicEvent | null>(null);

  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initial Load of Incidents
  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    try {
      const incList = await api.getIncidents();
      setIncidents(incList);
      if (incList.length > 0) {
        setCurrentIncident(incList[0]);
      }
    } catch (err) {
      console.error('Failed to load incidents', err);
    }
  };

  // 2. Load Incident Data when Active Incident Changes
  useEffect(() => {
    if (!currentIncident) return;
    loadIncidentData(currentIncident.id);
  }, [currentIncident]);

  const loadIncidentData = async (incidentId: string) => {
    setIsPlaying(false);
    try {
      const [allEvents, detList, evList] = await Promise.all([
        api.getTimelineEvents(incidentId),
        api.getDetections(incidentId),
        api.getIncidentEvidence(incidentId),
      ]);

      setEvents(allEvents);
      setCurrentIndex(Math.min(25, allEvents.length - 1)); // start at early reconnaissance stage
      setDetections(detList);
      setEvidenceList(evList);

      // Fetch initial graph
      const graph = await api.getInvestigationGraph(incidentId);
      setGraphData(graph);
    } catch (err) {
      console.error('Failed to load incident data', err);
    }
  };

  // 3. Synchronize Graph when Replay Position Changes
  useEffect(() => {
    if (!currentIncident || events.length === 0) return;
    const currentEvent = events[currentIndex];
    if (!currentEvent) return;

    const epochMs = new Date(currentEvent.timestamp).getTime();
    api
      .getInvestigationGraph(currentIncident.id, epochMs)
      .then((g) => setGraphData(g))
      .catch((err) => console.error('Failed to sync graph', err));
  }, [currentIndex, currentIncident, events]);

  // 4. Time Machine Playback Engine Loop
  useEffect(() => {
    if (isPlaying) {
      const intervalMs = Math.max(1000 / playbackSpeed, 200);
      playbackTimerRef.current = setInterval(() => {
        setCurrentIndex((prev) => {
          if (prev >= events.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, intervalMs);
    } else {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
      }
    }

    return () => {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    };
  }, [isPlaying, playbackSpeed, events.length]);

  // Playback transport handlers
  const handlePlayPause = () => {
    if (currentIndex >= events.length - 1) {
      setCurrentIndex(0); // loop from beginning if at end
    }
    setIsPlaying(!isPlaying);
  };

  const handleRewindStart = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  const handleFastForwardEnd = () => {
    setIsPlaying(false);
    setCurrentIndex(events.length - 1);
  };

  const handleStepBackward = () => {
    setIsPlaying(false);
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleStepForward = () => {
    setIsPlaying(false);
    setCurrentIndex((prev) => Math.min(events.length - 1, prev + 1));
  };

  const handleScrubIndex = (index: number) => {
    setCurrentIndex(index);
  };

  const handleChangeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
  };

  const handleSelectIncident = (inc: ForensicIncident) => {
    setCurrentIncident(inc);
  };

  const handleRefreshEvidence = () => {
    if (currentIncident) {
      api.getIncidentEvidence(currentIncident.id).then((evs) => setEvidenceList(evs));
    }
  };

  const handleRefreshDetections = () => {
    if (currentIncident) {
      api.getDetections(currentIncident.id).then((dets) => setDetections(dets));
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#090d16] text-slate-100 select-none">
      {/* Sidebar Navigation */}
      <Navigation
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        detectionCount={detections.length}
        evidenceCount={evidenceList.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <Header
          incidents={incidents}
          currentIncident={currentIncident}
          onSelectIncident={handleSelectIncident}
          onQuickRewind={handleRewindStart}
        />

        {/* Active Page View */}
        <main className="flex-1 overflow-hidden relative">
          {currentTab === 'command-center' && (
            <CommandCenterPage
              currentIncident={currentIncident}
              events={events}
              detections={detections}
              evidenceList={evidenceList}
              onNavigateTab={setCurrentTab}
              onSelectEvent={setInspectedEvent}
            />
          )}

          {currentTab === 'incidents' && (
            <IncidentLibraryPage
              incidents={incidents}
              currentIncident={currentIncident}
              onSelectIncident={handleSelectIncident}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'time-machine' && (
            <TimeMachinePage
              currentIncident={currentIncident}
              events={events}
              currentIndex={currentIndex}
              isPlaying={isPlaying}
              playbackSpeed={playbackSpeed}
              onPlayPause={handlePlayPause}
              onRewindStart={handleRewindStart}
              onFastForwardEnd={handleFastForwardEnd}
              onStepBackward={handleStepBackward}
              onStepForward={handleStepForward}
              onScrubIndex={handleScrubIndex}
              onChangeSpeed={handleChangeSpeed}
              onSelectEvent={setInspectedEvent}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'attack-graph' && (
            <AttackGraphPage
              graphData={graphData}
              currentIncident={currentIncident}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'evidence-vault' && (
            <EvidenceVaultPage
              evidenceList={evidenceList}
              currentIncident={currentIncident}
              onRefreshEvidence={handleRefreshEvidence}
            />
          )}

          {currentTab === 'detection-center' && (
            <DetectionCenterPage
              detections={detections}
              events={events}
              currentIncident={currentIncident}
              onSelectEvent={setInspectedEvent}
              onRefreshDetections={handleRefreshDetections}
            />
          )}

          {currentTab === 'ai-investigator' && (
            <AiInvestigatorPage
              currentIncident={currentIncident}
              events={events}
              currentIndex={currentIndex}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'reports' && (
            <ReportsPage currentIncident={currentIncident} />
          )}
        </main>
      </div>

      {/* Global Event Detail Inspector Modal */}
      <EventDetailModal
        event={inspectedEvent}
        onClose={() => setInspectedEvent(null)}
        onJumpToEvidence={(ref) => {
          setInspectedEvent(null);
          setCurrentTab('evidence-vault');
        }}
      />
    </div>
  );
}
