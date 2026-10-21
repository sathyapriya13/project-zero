export type Severity = 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type DetectionStatus = 'UNDER_REVIEW' | 'CONFIRMED' | 'DISMISSED';

export interface ForensicIncident {
  id: string;
  title: string;
  scenarioType: string;
  description: string;
  severity: Severity;
  status: 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
  leadInvestigatorId: string;
  startTime: string;
  endTime: string;
  totalEvents: number;
  compromisedEntitiesCount: number;
}

export interface ForensicEvent {
  id: string;
  incidentId: string;
  sequenceNumber: number;
  timestamp: string;
  eventType: string;
  severity: Severity;
  sourceDevice: string;
  destinationDevice?: string;
  actorUser: string;
  targetUser?: string;
  processId?: string;
  processName?: string;
  filePath?: string;
  sourceIp?: string;
  destinationIp?: string;
  port?: number;
  protocol?: string;
  isMalicious: boolean;
  isInferred: boolean;
  evidenceReference?: string;
  description: string;
}

export interface GraphNodeData {
  id: string;
  label: string;
  type: 'USER' | 'DEVICE' | 'PROCESS' | 'FILE' | 'IP_ADDRESS' | 'SECURITY_EVENT';
  severity: Severity;
  isCompromised: boolean;
  metadata?: Record<string, any>;
}

export interface GraphEdgeData {
  id: string;
  source: string;
  target: string;
  label: string;
  isMalicious: boolean;
  isInferred: boolean;
  supportingEventId?: string;
  timestampEpochMs?: number;
}

export interface InvestigationGraph {
  incidentId: string;
  nodes: GraphNodeData[];
  edges: GraphEdgeData[];
  criticalAttackPath: string[];
  connectedComponentsCount: number;
  observedRelationshipsCount: number;
  inferredRelationshipsCount: number;
}

export interface Detection {
  id: string;
  incidentId: string;
  ruleId: string;
  ruleCode: string;
  name: string;
  severity: Severity;
  status: DetectionStatus;
  confidenceScore: number;
  explanation: string;
  triggeringEventIds: string[];
  recommendedActions: string;
  reviewedBy?: string;
  reviewNotes?: string;
  detectedAt: string;
}

export interface EvidenceArtifact {
  id: string;
  incidentId: string;
  evidenceType: string;
  originalFilename: string;
  storedPath: string;
  fileSizeBytes: number;
  sha256Hash: string;
  sourceHost: string;
  collectedBy: string;
  verificationStatus: 'VERIFIED' | 'TAMPERED';
  notes: string;
  uploadedAt: string;
}

export interface EvidenceAuditLog {
  id: string;
  evidenceId: string;
  action: string;
  actorId: string;
  actorName: string;
  ipAddress: string;
  details: string;
  recordedSha256: string;
  timestamp: string;
}

export interface InvestigationNote {
  id: string;
  incidentId: string;
  authorName: string;
  title: string;
  content: string;
  taggedEventIds: string[];
  createdAt: string;
}

export interface ForensicReport {
  reportId: string;
  incident: ForensicIncident;
  generatedAt: string;
  executiveSummary: string;
  totalEvents: number;
  maliciousEventsCount: number;
  detections: Detection[];
  evidenceList: EvidenceArtifact[];
  limitationsDisclaimer: string;
  recommendations: string[];
}
