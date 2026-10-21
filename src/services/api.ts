import {
  ForensicIncident,
  ForensicEvent,
  InvestigationGraph,
  Detection,
  EvidenceArtifact,
  EvidenceAuditLog,
  InvestigationNote,
  ForensicReport,
} from '../types/forensics';

export const api = {
  // Incidents
  async getIncidents(): Promise<ForensicIncident[]> {
    const res = await fetch('/api/incidents');
    if (!res.ok) throw new Error('Failed to fetch incidents');
    return res.json();
  },

  async getIncident(id: string): Promise<ForensicIncident> {
    const res = await fetch(`/api/incidents/${id}`);
    if (!res.ok) throw new Error('Failed to fetch incident');
    return res.json();
  },

  // Timeline & Events
  async getTimelineEvents(incidentId: string, upToEpochMs?: number): Promise<ForensicEvent[]> {
    const url = upToEpochMs
      ? `/api/timeline/${incidentId}/events?upToEpochMs=${upToEpochMs}`
      : `/api/timeline/${incidentId}/events`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch timeline events');
    return res.json();
  },

  // Investigation Graph
  async getInvestigationGraph(incidentId: string, upToEpochMs?: number): Promise<InvestigationGraph> {
    const url = upToEpochMs
      ? `/api/graph/${incidentId}?upToEpochMs=${upToEpochMs}`
      : `/api/graph/${incidentId}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch investigation graph');
    return res.json();
  },

  // Detections
  async getDetections(incidentId: string): Promise<Detection[]> {
    const res = await fetch(`/api/detections/${incidentId}`);
    if (!res.ok) throw new Error('Failed to fetch detections');
    return res.json();
  },

  async updateDetectionStatus(
    id: string,
    status: 'CONFIRMED' | 'DISMISSED' | 'UNDER_REVIEW',
    reviewNotes?: string
  ): Promise<any> {
    const res = await fetch(`/api/detections/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, reviewNotes }),
    });
    if (!res.ok) throw new Error('Failed to update detection status');
    return res.json();
  },

  // Evidence Vault
  async getIncidentEvidence(incidentId: string): Promise<EvidenceArtifact[]> {
    const res = await fetch(`/api/evidence/incident/${incidentId}`);
    if (!res.ok) throw new Error('Failed to fetch evidence');
    return res.json();
  },

  async getChainOfCustody(evidenceId: string): Promise<EvidenceAuditLog[]> {
    const res = await fetch(`/api/evidence/${evidenceId}/chain-of-custody`);
    if (!res.ok) throw new Error('Failed to fetch chain of custody');
    return res.json();
  },

  async uploadEvidence(
    incidentId: string,
    data: {
      originalFilename: string;
      evidenceType: string;
      sourceHost: string;
      fileContentText: string;
      notes: string;
    }
  ): Promise<EvidenceArtifact> {
    const res = await fetch(`/api/evidence/incident/${incidentId}/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to upload evidence');
    return res.json();
  },

  async verifyEvidenceIntegrity(evidenceId: string, fileContentText: string): Promise<any> {
    const res = await fetch(`/api/evidence/${evidenceId}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileContentText }),
    });
    if (!res.ok) throw new Error('Failed to verify evidence integrity');
    return res.json();
  },

  // Notes
  async getNotes(incidentId: string): Promise<InvestigationNote[]> {
    const res = await fetch(`/api/notes/${incidentId}`);
    if (!res.ok) throw new Error('Failed to fetch notes');
    return res.json();
  },

  async addNote(
    incidentId: string,
    note: { title: string; content: string; taggedEventIds: string[] }
  ): Promise<InvestigationNote> {
    const res = await fetch(`/api/notes/${incidentId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note),
    });
    if (!res.ok) throw new Error('Failed to add note');
    return res.json();
  },

  // AI Investigator Assistant
  async askAiAssistant(
    incidentId: string,
    userPrompt: string,
    currentScrubEpochMs?: number
  ): Promise<{ reply: string; isAiPowered: boolean; modelUsed: string; citedEventsCount: number }> {
    const res = await fetch('/api/assistant/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ incidentId, userPrompt, currentScrubEpochMs }),
    });
    if (!res.ok) throw new Error('Failed to query AI assistant');
    return res.json();
  },

  // Reports
  async getReport(incidentId: string): Promise<ForensicReport> {
    const res = await fetch(`/api/reports/${incidentId}`);
    if (!res.ok) throw new Error('Failed to generate report');
    return res.json();
  },
};
