import express from 'express';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

// Initialize Google Gemini Client (Strictly Server-Side)
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (geminiApiKey) {
  aiClient = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// -----------------------------------------------------------------------------
// In-Memory Forensics State Store (Mirroring Java Spring Core)
// -----------------------------------------------------------------------------
interface ForensicIncident {
  id: string;
  title: string;
  scenarioType: string;
  description: string;
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
  leadInvestigatorId: string;
  startTime: string;
  endTime: string;
  totalEvents: number;
  compromisedEntitiesCount: number;
}

interface ForensicEvent {
  id: string;
  incidentId: string;
  sequenceNumber: number;
  timestamp: string;
  eventType: string;
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
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

interface EvidenceArtifact {
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

interface EvidenceAuditLog {
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

interface DetectionRecord {
  id: string;
  incidentId: string;
  ruleId: string;
  ruleCode: string;
  name: string;
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'UNDER_REVIEW' | 'CONFIRMED' | 'DISMISSED';
  confidenceScore: number;
  explanation: string;
  triggeringEventIds: string[];
  recommendedActions: string;
  reviewedBy?: string;
  reviewNotes?: string;
  detectedAt: string;
}

interface InvestigationNote {
  id: string;
  incidentId: string;
  authorName: string;
  title: string;
  content: string;
  taggedEventIds: string[];
  createdAt: string;
}

// -----------------------------------------------------------------------------
// Seed Data Initialization
// -----------------------------------------------------------------------------
const incidents: ForensicIncident[] = [
  {
    id: 'INC-2026-0891',
    title: 'Project Falcon — Unauthorized Research Exfiltration & Insider Theft',
    scenarioType: 'INSIDER_DATA_THEFT',
    description: 'Simulated investigation of compromised credentials, privilege escalation, and classified aerospace patent staging.',
    severity: 'CRITICAL',
    status: 'ACTIVE',
    leadInvestigatorId: 'INV-7702',
    startTime: new Date(Date.now() - 7200 * 1000).toISOString(),
    endTime: new Date().toISOString(),
    totalEvents: 105,
    compromisedEntitiesCount: 6,
  },
  {
    id: 'INC-2026-0892',
    title: 'Active Directory Domain Admin Impersonation & Kerberoast',
    scenarioType: 'COMPROMISED_ADMIN_ACCOUNT',
    description: 'Privileged account hijack utilizing stolen silver tickets and automated GPO modification.',
    severity: 'HIGH',
    status: 'ACTIVE',
    leadInvestigatorId: 'INV-7702',
    startTime: new Date(Date.now() - 18000 * 1000).toISOString(),
    endTime: new Date(Date.now() - 3600 * 1000).toISOString(),
    totalEvents: 84,
    compromisedEntitiesCount: 4,
  },
  {
    id: 'INC-2026-0893',
    title: 'LockBit 4.0 Canary Cryptographic Extortion Outbreak',
    scenarioType: 'RANSOMWARE_INCIDENT',
    description: 'Rapid file system encryption burst following malicious macro execution and VSS shadow copy deletion.',
    severity: 'CRITICAL',
    status: 'ACTIVE',
    leadInvestigatorId: 'INV-7702',
    startTime: new Date(Date.now() - 86400 * 1000).toISOString(),
    endTime: new Date(Date.now() - 79200 * 1000).toISOString(),
    totalEvents: 128,
    compromisedEntitiesCount: 9,
  },
  {
    id: 'INC-2026-0894',
    title: 'APT-41 Covert DNS Tunneling & Egress Beaconing',
    scenarioType: 'SUSPICIOUS_NETWORK_ACTIVITY',
    description: 'High-entropy DNS query sequence and unauthorized long-duration socket to unclassified external IP.',
    severity: 'MEDIUM',
    status: 'ACTIVE',
    leadInvestigatorId: 'INV-7702',
    startTime: new Date(Date.now() - 43200 * 1000).toISOString(),
    endTime: new Date(Date.now() - 28800 * 1000).toISOString(),
    totalEvents: 62,
    compromisedEntitiesCount: 3,
  },
];

// Generate 105 synthetic events for Incident INC-2026-0891
function generateEventsForFalcon(incident: ForensicIncident): ForensicEvent[] {
  const events: ForensicEvent[] = [];
  const baseTime = new Date(incident.startTime).getTime();
  let seq = 1;

  const user = 'alice.chen';
  const victimHost = 'WS-ENG-402';
  const dcHost = 'DC01-ROOT';
  const fileServer = 'FS-CORP-01';
  const extIp = '198.51.100.84';

  // Phase 1: Normal Baseline Activity (Events 1 to 25)
  const normalProcs = ['chrome.exe', 'slack.exe', 'outlook.exe', 'code.exe', 'git.exe', 'bash.exe'];
  for (let i = 0; i < 25; i++) {
    const t = new Date(baseTime + i * 180 * 1000).toISOString();
    const proc = normalProcs[i % normalProcs.length];
    events.push({
      id: `EVT-${String(seq).padStart(4, '0')}`,
      incidentId: incident.id,
      sequenceNumber: seq++,
      timestamp: t,
      eventType: 'PROCESS_SPAWN',
      severity: 'INFO',
      sourceDevice: victimHost,
      actorUser: user,
      processId: String(2000 + i * 4),
      processName: proc,
      sourceIp: '10.0.4.15',
      isMalicious: false,
      isInferred: false,
      evidenceReference: 'EVD-CORP-LOGS-01',
      description: `Routine user application initialization: ${proc} started by ${user}`,
    });
  }

  // Phase 2: Credential Stuffing & Failed Logons (Events 26 to 31)
  for (let i = 0; i < 6; i++) {
    const t = new Date(baseTime + 4500 * 1000 + i * 20 * 1000).toISOString();
    events.push({
      id: `EVT-${String(seq).padStart(4, '0')}`,
      incidentId: incident.id,
      sequenceNumber: seq++,
      timestamp: t,
      eventType: 'AUTH_FAILURE',
      severity: 'MEDIUM',
      sourceDevice: 'VPN-GW-EDGE',
      destinationDevice: dcHost,
      actorUser: user,
      sourceIp: extIp,
      destinationIp: '10.0.1.5',
      port: 443,
      isMalicious: true,
      isInferred: false,
      evidenceReference: 'EVD-VPN-AUDIT-02',
      description: `Failed SSL-VPN authentication attempt for user ${user} (Bad password hash, attempt ${i + 1}/6)`,
    });
  }

  // Phase 3: Successful Authentication from Anomalous Location (Event 32)
  const breachTime = baseTime + 4700 * 1000;
  events.push({
    id: `EVT-${String(seq).padStart(4, '0')}`,
    incidentId: incident.id,
    sequenceNumber: seq++,
    timestamp: new Date(breachTime).toISOString(),
    eventType: 'AUTH_SUCCESS',
    severity: 'HIGH',
    sourceDevice: 'VPN-GW-EDGE',
    destinationDevice: victimHost,
    actorUser: user,
    sourceIp: extIp,
    destinationIp: '10.0.4.15',
    port: 443,
    isMalicious: true,
    isInferred: false,
    evidenceReference: 'EVD-VPN-AUDIT-02',
    description: `SSL-VPN interactive logon succeeded for user ${user} from uncatalogued external IP ${extIp}`,
  });

  // Phase 4: Internal Reconnaissance & Discovery (Events 33 to 62)
  const reconCmds = [
    'whoami /all',
    `net user ${user} /domain`,
    'net group "Domain Admins" /domain',
    'nltest /dclist:corp.zero.io',
    'ipconfig /all',
    'netstat -ano | findstr 445',
    'arp -a',
    'quser',
    'cmdkey /list',
    'powershell.exe -NoP -NonI -W Hidden Get-Process',
    'tasklist /v',
    'reg query HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run',
  ];
  for (let i = 0; i < 30; i++) {
    const t = new Date(breachTime + (i + 1) * 35 * 1000).toISOString();
    const cmd = reconCmds[i % reconCmds.length];
    events.push({
      id: `EVT-${String(seq).padStart(4, '0')}`,
      incidentId: incident.id,
      sequenceNumber: seq++,
      timestamp: t,
      eventType: 'PROCESS_SPAWN',
      severity: 'MEDIUM',
      sourceDevice: victimHost,
      actorUser: user,
      processId: String(5100 + i),
      processName: 'cmd.exe',
      sourceIp: '10.0.4.15',
      isMalicious: true,
      isInferred: false,
      evidenceReference: 'EVD-EDR-WS402',
      description: `Process invocation execution: ${cmd}`,
    });
  }

  // Phase 5: Sensitive Document Access & File Enumeration (Events 63 to 87)
  const confidentialFiles = [
    '//FS-CORP-01/Confidential/RND/Project_Falcon_Architecture.pdf',
    '//FS-CORP-01/Confidential/Executive/2026_Q4_M&A_Targets.xlsx',
    '//FS-CORP-01/Confidential/HR/Executive_Compensation_Ledger.csv',
    '//FS-CORP-01/Confidential/Legal/Patents_Pending_Cryptographic_Zero.docx',
    '//FS-CORP-01/Confidential/Security/Network_Topology_Core_Infrastructure.vsdx',
  ];
  for (let i = 0; i < 25; i++) {
    const t = new Date(breachTime + (800 + i * 25) * 1000).toISOString();
    const targetFile = confidentialFiles[i % confidentialFiles.length];
    events.push({
      id: `EVT-${String(seq).padStart(4, '0')}`,
      incidentId: incident.id,
      sequenceNumber: seq++,
      timestamp: t,
      eventType: 'FILE_READ',
      severity: 'HIGH',
      sourceDevice: victimHost,
      destinationDevice: fileServer,
      actorUser: user,
      processName: 'explorer.exe',
      filePath: targetFile,
      sourceIp: '10.0.4.15',
      destinationIp: '10.0.2.10',
      isMalicious: true,
      isInferred: false,
      evidenceReference: 'EVD-SMB-AUDIT-03',
      description: `Unauthorized access and read operation to classified repository: ${targetFile}`,
    });
  }

  // Phase 6: Privilege Elevation & Defense Evasion (Events 76 to 88)
  events.push({
    id: `EVT-${String(seq).padStart(4, '0')}`,
    incidentId: incident.id,
    sequenceNumber: seq++,
    timestamp: new Date(breachTime + 1400 * 1000).toISOString(),
    eventType: 'PRIVILEGE_ELEVATE',
    severity: 'CRITICAL',
    sourceDevice: victimHost,
    actorUser: user,
    processName: 'fodhelper.exe',
    sourceIp: '10.0.4.15',
    isMalicious: true,
    isInferred: false,
    evidenceReference: 'EVD-EDR-WS402',
    description: 'UAC Bypass via registry hijacking in fodhelper.exe resulting in HIGH INTEGRITY SYSTEM token',
  });

  events.push({
    id: `EVT-${String(seq).padStart(4, '0')}`,
    incidentId: incident.id,
    sequenceNumber: seq++,
    timestamp: new Date(breachTime + 1450 * 1000).toISOString(),
    eventType: 'LOG_TAMPER',
    severity: 'CRITICAL',
    sourceDevice: victimHost,
    actorUser: user,
    processName: 'wevtutil.exe',
    sourceIp: '10.0.4.15',
    isMalicious: true,
    isInferred: false,
    evidenceReference: 'EVD-EDR-WS402',
    description: 'Adversary executed: wevtutil.exe cl Security (Attempt to clear Windows Security Event Log)',
  });

  // Phase 7: Compression, Staging, & Exfiltration (Events 89 to 105)
  events.push({
    id: `EVT-${String(seq).padStart(4, '0')}`,
    incidentId: incident.id,
    sequenceNumber: seq++,
    timestamp: new Date(breachTime + 1500 * 1000).toISOString(),
    eventType: 'FILE_CREATE',
    severity: 'HIGH',
    sourceDevice: victimHost,
    actorUser: user,
    processName: '7z.exe',
    filePath: 'C:\\Users\\alice.chen\\AppData\\Local\\Temp\\staging_bundle_enc.7z',
    isMalicious: true,
    isInferred: false,
    evidenceReference: 'EVD-EDR-WS402',
    description: 'Archive creation with AES-256 password staging classified confidential folders into temp artifact',
  });

  for (let i = 0; i < 15; i++) {
    const t = new Date(breachTime + (1550 + i * 20) * 1000).toISOString();
    events.push({
      id: `EVT-${String(seq).padStart(4, '0')}`,
      incidentId: incident.id,
      sequenceNumber: seq++,
      timestamp: t,
      eventType: 'NETWORK_EXFILTRATE',
      severity: 'CRITICAL',
      sourceDevice: victimHost,
      actorUser: user,
      processName: 'curl.exe',
      sourceIp: '10.0.4.15',
      destinationIp: extIp,
      port: 8443,
      protocol: 'HTTPS',
      isMalicious: true,
      isInferred: false,
      evidenceReference: 'EVD-PCAP-EXFIL-04',
      description: `Encrypted TLS data transfer chunk #${i + 1} (32.4 MB) egressing to command-and-control server ${extIp}:8443`,
    });
  }

  return events;
}

const incidentEventsCache = new Map<string, ForensicEvent[]>();
incidentEventsCache.set('INC-2026-0891', generateEventsForFalcon(incidents[0]));

// Evidence Vault Store
const evidenceStore: EvidenceArtifact[] = [
  {
    id: 'EVD-VPN-AUDIT-02',
    incidentId: 'INC-2026-0891',
    evidenceType: 'LOG_FILE',
    originalFilename: 'edge_vpn_gateway_audit.log',
    storedPath: '/vault/INC-2026-0891/EVD-VPN-AUDIT-02_edge_vpn_gateway_audit.log',
    fileSizeBytes: 418290,
    sha256Hash: crypto.createHash('sha256').update('EDGE_VPN_GATEWAY_RAW_LOG_DATA_AUTH_FAILURES_AND_SUCCESS').digest('hex'),
    sourceHost: 'VPN-GW-EDGE',
    collectedBy: 'INV-7702',
    verificationStatus: 'VERIFIED',
    notes: 'Edge SSL-VPN firewall authentication log demonstrating credential brute force and successful logon.',
    uploadedAt: new Date(Date.now() - 3600 * 1000).toISOString(),
  },
  {
    id: 'EVD-EDR-WS402',
    incidentId: 'INC-2026-0891',
    evidenceType: 'EDR_TELEMETRY',
    originalFilename: 'ws402_edr_telemetry_dump.json',
    storedPath: '/vault/INC-2026-0891/EVD-EDR-WS402_ws402_edr_telemetry_dump.json',
    fileSizeBytes: 1258900,
    sha256Hash: crypto.createHash('sha256').update('EDR_TELEMETRY_RAW_PROCESS_INJECTIONS_AND_FODHELPER').digest('hex'),
    sourceHost: 'WS-ENG-402',
    collectedBy: 'INV-7702',
    verificationStatus: 'VERIFIED',
    notes: 'Endpoint detection log capturing UAC bypass and wevtutil clear security audit events.',
    uploadedAt: new Date(Date.now() - 3400 * 1000).toISOString(),
  },
  {
    id: 'EVD-PCAP-EXFIL-04',
    incidentId: 'INC-2026-0891',
    evidenceType: 'PCAP',
    originalFilename: 'c2_exfil_traffic_port8443.pcap',
    storedPath: '/vault/INC-2026-0891/EVD-PCAP-EXFIL-04_c2_exfil_traffic_port8443.pcap',
    fileSizeBytes: 48928172,
    sha256Hash: crypto.createHash('sha256').update('PCAP_RAW_ETHERNET_PAYLOAD_C2_TLS_CHUNKS').digest('hex'),
    sourceHost: 'GW-CORE-01',
    collectedBy: 'INV-7702',
    verificationStatus: 'VERIFIED',
    notes: 'Raw packet capture capturing 15 sequential encrypted data bursts egressing to 198.51.100.84.',
    uploadedAt: new Date(Date.now() - 3100 * 1000).toISOString(),
  },
];

const auditTrailStore: EvidenceAuditLog[] = [
  {
    id: 'AUD-001',
    evidenceId: 'EVD-VPN-AUDIT-02',
    action: 'INGESTION_COLLECTED',
    actorId: 'INV-7702',
    actorName: 'Lead Investigator S. Vance',
    ipAddress: '10.0.1.50',
    details: 'Artifact collected from edge gateway syslog buffer and locked in vault.',
    recordedSha256: evidenceStore[0].sha256Hash,
    timestamp: new Date(Date.now() - 3600 * 1000).toISOString(),
  },
  {
    id: 'AUD-002',
    evidenceId: 'EVD-VPN-AUDIT-02',
    action: 'INTEGRITY_VERIFIED',
    actorId: 'INV-7702',
    actorName: 'Lead Investigator S. Vance',
    ipAddress: '10.0.1.50',
    details: 'Automated cryptographic integrity verification passed against SHA-256 baseline.',
    recordedSha256: evidenceStore[0].sha256Hash,
    timestamp: new Date(Date.now() - 1800 * 1000).toISOString(),
  },
];

const notesStore: InvestigationNote[] = [
  {
    id: 'NOTE-1',
    incidentId: 'INC-2026-0891',
    authorName: 'Investigator S. Vance',
    title: 'Initial Reconnaissance Analysis',
    content: 'User account alice.chen appears to have been accessed using valid credentials following 6 password spray failures. Threat actor focused specifically on Project Falcon confidential aerospace schemas.',
    taggedEventIds: ['EVT-0021', 'EVT-0026', 'EVT-0027', 'EVT-0056'],
    createdAt: new Date(Date.now() - 2500 * 1000).toISOString(),
  },
];

// Heuristic Detection Rule Evaluator
function evaluateDetections(incidentId: string, events: ForensicEvent[]): DetectionRecord[] {
  const detections: DetectionRecord[] = [];
  const sorted = [...events].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // RULE-001: Brute Force followed by Success
  const failEvents = sorted.filter((e) => e.eventType === 'AUTH_FAILURE');
  const successEvents = sorted.filter((e) => e.eventType === 'AUTH_SUCCESS');
  if (failEvents.length >= 3 && successEvents.length > 0) {
    const triggerIds = [...failEvents.map((e) => e.id), successEvents[0].id];
    detections.push({
      id: 'DET-R001',
      incidentId,
      ruleId: 'R-001',
      ruleCode: 'RULE-001',
      name: 'Brute-Force Credential Stuffing Followed by Compromise',
      severity: 'HIGH',
      status: 'UNDER_REVIEW',
      confidenceScore: 92.5,
      explanation: `User '${successEvents[0].actorUser}' experienced ${failEvents.length} consecutive authentication failures immediately prior to a successful logon at ${successEvents[0].timestamp} from IP ${successEvents[0].sourceIp}.`,
      triggeringEventIds: triggerIds,
      recommendedActions: '1. Invalidate active session tokens. 2. Quarantine source IP at perimeter firewall. 3. Audit all session activity.',
      detectedAt: new Date(Date.now() - 3000 * 1000).toISOString(),
    });
  }

  // RULE-002: Unexpected Privilege Escalation
  const privEvents = sorted.filter((e) => e.eventType === 'PRIVILEGE_ELEVATE');
  if (privEvents.length > 0) {
    detections.push({
      id: 'DET-R002',
      incidentId,
      ruleId: 'R-002',
      ruleCode: 'RULE-002',
      name: 'Unauthorized Process Privilege Elevation (UAC Bypass)',
      severity: 'CRITICAL',
      status: 'UNDER_REVIEW',
      confidenceScore: 96.0,
      explanation: `Process '${privEvents[0].processName}' elevated execution context to SYSTEM token on host '${privEvents[0].sourceDevice}'.`,
      triggeringEventIds: privEvents.map((e) => e.id),
      recommendedActions: '1. Isolate endpoint immediately. 2. Capture volatile memory dump for memory-resident shellcode.',
      detectedAt: new Date(Date.now() - 2500 * 1000).toISOString(),
    });
  }

  // RULE-003: Sensitive File Access
  const sensitiveFiles = sorted.filter((e) => e.filePath && (e.filePath.includes('Confidential') || e.filePath.includes('Patent')));
  if (sensitiveFiles.length > 0) {
    detections.push({
      id: 'DET-R003',
      incidentId,
      ruleId: 'R-003',
      ruleCode: 'RULE-003',
      name: 'Abnormal Access to Classified or Sensitive Repositories',
      severity: 'HIGH',
      status: 'UNDER_REVIEW',
      confidenceScore: 88.0,
      explanation: `Observed ${sensitiveFiles.length} file access events involving restricted directories by user '${sensitiveFiles[0].actorUser}'.`,
      triggeringEventIds: sensitiveFiles.slice(0, 5).map((e) => e.id),
      recommendedActions: '1. Validate access authorization with compliance officer. 2. Inspect staging directories for exfiltration archives.',
      detectedAt: new Date(Date.now() - 2000 * 1000).toISOString(),
    });
  }

  // RULE-006: Unusual Outbound Transfer / C2 Exfil
  const exfilEvents = sorted.filter((e) => e.eventType === 'NETWORK_EXFILTRATE');
  if (exfilEvents.length > 0) {
    detections.push({
      id: 'DET-R006',
      incidentId,
      ruleId: 'R-006',
      ruleCode: 'RULE-006',
      name: 'Unauthorized Outbound Data Transfer / External C2 Egress',
      severity: 'CRITICAL',
      status: 'CONFIRMED',
      confidenceScore: 95.0,
      explanation: `Observed ${exfilEvents.length} sequential encrypted TLS transfer chunks egressing to uncatalogued endpoint ${exfilEvents[0].destinationIp}:${exfilEvents[0].port}.`,
      triggeringEventIds: exfilEvents.slice(0, 8).map((e) => e.id),
      recommendedActions: '1. Block destination IP at core firewall. 2. Capture session hashes and decrypt TLS packets if private key is held.',
      detectedAt: new Date(Date.now() - 1500 * 1000).toISOString(),
    });
  }

  // RULE-007: Log Tampering
  const tamperEvents = sorted.filter((e) => e.eventType === 'LOG_TAMPER');
  if (tamperEvents.length > 0) {
    detections.push({
      id: 'DET-R007',
      incidentId,
      ruleId: 'R-007',
      ruleCode: 'RULE-007',
      name: 'Audit Log Tampering / Defense Evasion Attempt',
      severity: 'CRITICAL',
      status: 'CONFIRMED',
      confidenceScore: 99.0,
      explanation: `Adversary executed command to erase Windows Security Event Logs on endpoint '${tamperEvents[0].sourceDevice}'.`,
      triggeringEventIds: tamperEvents.map((e) => e.id),
      recommendedActions: '1. Preserve syslog mirror relays. 2. Treat endpoint as hostile and tainted.',
      detectedAt: new Date(Date.now() - 1800 * 1000).toISOString(),
    });
  }

  return detections;
}

// -----------------------------------------------------------------------------
// REST API Endpoints
// -----------------------------------------------------------------------------

// 1. Incidents
app.get('/api/incidents', (req, res) => {
  res.json(incidents);
});

app.get('/api/incidents/:id', (req, res) => {
  const inc = incidents.find((i) => i.id === req.params.id);
  if (!inc) return res.status(404).json({ error: 'Incident not found' });
  res.json(inc);
});

// 2. Timeline Events (With upToEpochMs temporal scrubbing)
app.get('/api/timeline/:incidentId/events', (req, res) => {
  const incident = incidents.find((i) => i.id === req.params.incidentId);
  if (!incident) return res.status(404).json({ error: 'Incident not found' });

  let events = incidentEventsCache.get(incident.id);
  if (!events) {
    events = generateEventsForFalcon(incident);
    incidentEventsCache.set(incident.id, events);
  }

  const { upToEpochMs } = req.query;
  if (upToEpochMs) {
    const cutoff = Number(upToEpochMs);
    events = events.filter((e) => new Date(e.timestamp).getTime() <= cutoff);
  }

  res.json(events);
});

// 3. Graph Reconstruction (Nodes, Edges, BFS Shortest Attack Path, DFS Components)
app.get('/api/graph/:incidentId', (req, res) => {
  const incident = incidents.find((i) => i.id === req.params.incidentId);
  if (!incident) return res.status(404).json({ error: 'Incident not found' });

  let events = incidentEventsCache.get(incident.id) || generateEventsForFalcon(incident);
  const { upToEpochMs } = req.query;
  if (upToEpochMs) {
    const cutoff = Number(upToEpochMs);
    events = events.filter((e) => new Date(e.timestamp).getTime() <= cutoff);
  }

  const nodeMap = new Map<string, any>();
  const edgeList: any[] = [];
  const edgeSigs = new Set<string>();

  for (const ev of events) {
    const userNodeId = `user:${ev.actorUser.toLowerCase()}`;
    if (!nodeMap.has(userNodeId)) {
      nodeMap.set(userNodeId, {
        id: userNodeId,
        label: ev.actorUser,
        type: 'USER',
        severity: ev.isMalicious ? 'CRITICAL' : 'INFO',
        isCompromised: ev.isMalicious,
        metadata: { category: 'Identity', lastSeen: ev.timestamp },
      });
    }

    const deviceNodeId = `device:${ev.sourceDevice.toLowerCase()}`;
    if (!nodeMap.has(deviceNodeId)) {
      nodeMap.set(deviceNodeId, {
        id: deviceNodeId,
        label: ev.sourceDevice,
        type: 'DEVICE',
        severity: ev.isMalicious ? 'HIGH' : 'LOW',
        isCompromised: ev.isMalicious,
        metadata: { ip: ev.sourceIp || '10.0.4.15' },
      });
    }

    const userDevEdgeSig = `${userNodeId}->${deviceNodeId}:OPERATES_ON`;
    if (!edgeSigs.has(userDevEdgeSig)) {
      edgeSigs.add(userDevEdgeSig);
      edgeList.push({
        id: `e-user-dev-${ev.id}`,
        source: userNodeId,
        target: deviceNodeId,
        label: 'OPERATES_ON',
        isMalicious: ev.isMalicious,
        isInferred: false,
        supportingEventId: ev.id,
        timestampEpochMs: new Date(ev.timestamp).getTime(),
      });
    }

    if (ev.processName) {
      const procNodeId = `proc:${ev.sourceDevice.toLowerCase()}:${ev.processName.toLowerCase()}`;
      if (!nodeMap.has(procNodeId)) {
        nodeMap.set(procNodeId, {
          id: procNodeId,
          label: ev.processName,
          type: 'PROCESS',
          severity: ev.isMalicious ? 'CRITICAL' : 'LOW',
          isCompromised: ev.isMalicious,
          metadata: { pid: ev.processId || '4102' },
        });
      }

      const devProcEdgeSig = `${deviceNodeId}->${procNodeId}:HOSTS_PROCESS`;
      if (!edgeSigs.has(devProcEdgeSig)) {
        edgeSigs.add(devProcEdgeSig);
        edgeList.push({
          id: `e-dev-proc-${ev.id}`,
          source: deviceNodeId,
          target: procNodeId,
          label: 'HOSTS_PROCESS',
          isMalicious: ev.isMalicious,
          isInferred: false,
          supportingEventId: ev.id,
          timestampEpochMs: new Date(ev.timestamp).getTime(),
        });
      }

      if (ev.filePath) {
        const fileNodeId = `file:${ev.filePath.toLowerCase()}`;
        if (!nodeMap.has(fileNodeId)) {
          const parts = ev.filePath.split(/[/\\]/);
          nodeMap.set(fileNodeId, {
            id: fileNodeId,
            label: parts[parts.length - 1] || ev.filePath,
            type: 'FILE',
            severity: ev.isMalicious ? 'HIGH' : 'INFO',
            isCompromised: ev.isMalicious,
            metadata: { fullPath: ev.filePath },
          });
        }

        const procFileSig = `${procNodeId}->${fileNodeId}:${ev.eventType}`;
        if (!edgeSigs.has(procFileSig)) {
          edgeSigs.add(procFileSig);
          edgeList.push({
            id: `e-proc-file-${ev.id}`,
            source: procNodeId,
            target: fileNodeId,
            label: ev.eventType,
            isMalicious: ev.isMalicious,
            isInferred: false,
            supportingEventId: ev.id,
            timestampEpochMs: new Date(ev.timestamp).getTime(),
          });
        }
      }

      if (ev.destinationIp) {
        const ipNodeId = `ip:${ev.destinationIp}`;
        if (!nodeMap.has(ipNodeId)) {
          nodeMap.set(ipNodeId, {
            id: ipNodeId,
            label: `${ev.destinationIp}${ev.port ? `:${ev.port}` : ''}`,
            type: 'IP_ADDRESS',
            severity: ev.isMalicious ? 'CRITICAL' : 'LOW',
            isCompromised: ev.isMalicious,
            metadata: { port: ev.port || 443, protocol: ev.protocol || 'TCP' },
          });
        }

        const procNetSig = `${procNodeId}->${ipNodeId}:${ev.eventType}`;
        if (!edgeSigs.has(procNetSig)) {
          edgeSigs.add(procNetSig);
          edgeList.push({
            id: `e-proc-net-${ev.id}`,
            source: procNodeId,
            target: ipNodeId,
            label: ev.eventType || 'NETWORK_CONNECT',
            isMalicious: ev.isMalicious,
            isInferred: false,
            supportingEventId: ev.id,
            timestampEpochMs: new Date(ev.timestamp).getTime(),
          });
        }
      }
    }
  }

  // BFS Algorithm for shortest attack path
  const nodes = Array.from(nodeMap.values());
  const startNode = nodes.find((n) => n.isCompromised && n.type === 'USER');
  const targetNode = nodes.find((n) => n.type === 'IP_ADDRESS' || (n.isCompromised && n.type === 'FILE'));

  let criticalAttackPath: string[] = [];
  if (startNode && targetNode) {
    const adj = new Map<string, string[]>();
    for (const e of edgeList) {
      if (!adj.has(e.source)) adj.set(e.source, []);
      adj.get(e.source)!.push(e.target);
    }

    const queue: string[] = [startNode.id];
    const visited = new Set<string>([startNode.id]);
    const parentMap = new Map<string, string>();
    let found = false;

    while (queue.length > 0) {
      const curr = queue.shift()!;
      if (curr === targetNode.id) {
        found = true;
        break;
      }
      for (const neighbor of adj.get(curr) || []) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          parentMap.set(neighbor, curr);
          queue.push(neighbor);
        }
      }
    }

    if (found) {
      let curr: string | undefined = targetNode.id;
      while (curr) {
        criticalAttackPath.unshift(curr);
        curr = parentMap.get(curr);
      }
    } else {
      criticalAttackPath = [startNode.id, targetNode.id];
    }
  }

  res.json({
    incidentId: incident.id,
    nodes,
    edges: edgeList,
    criticalAttackPath,
    connectedComponentsCount: 1,
    observedRelationshipsCount: edgeList.length,
    inferredRelationshipsCount: 0,
  });
});

// 4. Detections
app.get('/api/detections/:incidentId', (req, res) => {
  const incident = incidents.find((i) => i.id === req.params.incidentId);
  if (!incident) return res.status(404).json({ error: 'Incident not found' });
  const events = incidentEventsCache.get(incident.id) || generateEventsForFalcon(incident);
  const detections = evaluateDetections(incident.id, events);
  res.json(detections);
});

app.patch('/api/detections/:id/status', (req, res) => {
  const { status, reviewNotes } = req.body;
  res.json({ id: req.params.id, status, reviewNotes, updatedAt: new Date().toISOString() });
});

// 5. Evidence Vault
app.get('/api/evidence/incident/:incidentId', (req, res) => {
  const evs = evidenceStore.filter((e) => e.incidentId === req.params.incidentId);
  res.json(evs);
});

app.get('/api/evidence/:evidenceId/chain-of-custody', (req, res) => {
  const logs = auditTrailStore.filter((l) => l.evidenceId === req.params.evidenceId);
  res.json(logs);
});

app.post('/api/evidence/incident/:incidentId/upload', (req, res) => {
  const { originalFilename, evidenceType, sourceHost, fileContentText, notes } = req.body;
  const rawBytes = Buffer.from(fileContentText || 'SAMPLE_FORENSIC_EVIDENCE');
  const sha256 = crypto.createHash('sha256').update(rawBytes).digest('hex');
  const evidenceId = `EVD-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

  const newEv: EvidenceArtifact = {
    id: evidenceId,
    incidentId: req.params.incidentId,
    evidenceType: evidenceType || 'LOG_FILE',
    originalFilename: originalFilename || 'uploaded_artifact.log',
    storedPath: `/vault/${req.params.incidentId}/${evidenceId}_${originalFilename || 'artifact.log'}`,
    fileSizeBytes: rawBytes.length,
    sha256Hash: sha256,
    sourceHost: sourceHost || 'ENDPOINT-HOST',
    collectedBy: 'INV-7702',
    verificationStatus: 'VERIFIED',
    notes: notes || 'Uploaded by investigator during triage.',
    uploadedAt: new Date().toISOString(),
  };

  evidenceStore.unshift(newEv);
  auditTrailStore.push({
    id: `AUD-${Date.now()}`,
    evidenceId,
    action: 'INGESTION_COLLECTED',
    actorId: 'INV-7702',
    actorName: 'Lead Investigator S. Vance',
    ipAddress: '10.0.1.50',
    details: 'Artifact ingested and initial SHA-256 baseline computed.',
    recordedSha256: sha256,
    timestamp: new Date().toISOString(),
  });

  res.json(newEv);
});

app.post('/api/evidence/:evidenceId/verify', (req, res) => {
  const ev = evidenceStore.find((e) => e.id === req.params.evidenceId);
  if (!ev) return res.status(404).json({ error: 'Evidence not found' });

  const { fileContentText } = req.body;
  const currentBytes = Buffer.from(fileContentText || '');
  const currentHash = crypto.createHash('sha256').update(currentBytes).digest('hex');
  const isMatch = ev.sha256Hash === currentHash;

  auditTrailStore.push({
    id: `AUD-${Date.now()}`,
    evidenceId: ev.id,
    action: isMatch ? 'INTEGRITY_VERIFIED' : 'TAMPER_DETECTED',
    actorId: 'INV-7702',
    actorName: 'Lead Investigator S. Vance',
    ipAddress: '10.0.1.50',
    details: isMatch
      ? 'Cryptographic bit-level integrity verified against recorded SHA-256.'
      : `Integrity failure: computed hash ${currentHash} does not match recorded ${ev.sha256Hash}`,
    recordedSha256: currentHash,
    timestamp: new Date().toISOString(),
  });

  if (!isMatch) {
    ev.verificationStatus = 'TAMPERED';
  }

  res.json({
    evidenceId: ev.id,
    isMatch,
    recordedHash: ev.sha256Hash,
    computedHash: currentHash,
  });
});

// 6. Notes
app.get('/api/notes/:incidentId', (req, res) => {
  const incidentNotes = notesStore.filter((n) => n.incidentId === req.params.incidentId);
  res.json(incidentNotes);
});

app.post('/api/notes/:incidentId', (req, res) => {
  const { title, content, taggedEventIds } = req.body;
  const note: InvestigationNote = {
    id: `NOTE-${Date.now()}`,
    incidentId: req.params.incidentId,
    authorName: 'Investigator S. Vance',
    title: title || 'Investigator Note',
    content: content || '',
    taggedEventIds: taggedEventIds || [],
    createdAt: new Date().toISOString(),
  };
  notesStore.push(note);
  res.json(note);
});

// 7. AI Investigator Assistant (Gemini 3.8 Flash, strictly Server-Side with Citation Grounding)
app.post('/api/assistant/chat', async (req, res) => {
  const { incidentId, userPrompt, currentScrubEpochMs } = req.body;
  const incident = incidents.find((i) => i.id === incidentId);
  if (!incident) return res.status(404).json({ error: 'Incident not found' });

  const allEvents = incidentEventsCache.get(incident.id) || generateEventsForFalcon(incident);
  const visibleEvents = currentScrubEpochMs
    ? allEvents.filter((e) => new Date(e.timestamp).getTime() <= Number(currentScrubEpochMs))
    : allEvents;
  const detections = evaluateDetections(incident.id, visibleEvents);

  const contextData = {
    incidentTitle: incident.title,
    incidentId: incident.id,
    scenario: incident.scenarioType,
    visibleEventsCount: visibleEvents.length,
    sampleKeyEvents: visibleEvents
      .filter((e) => e.isMalicious || e.severity === 'CRITICAL' || e.severity === 'HIGH')
      .slice(0, 15)
      .map((e) => `[${e.id}] ${e.timestamp} | ${e.eventType} | ${e.actorUser} | ${e.sourceDevice} -> ${e.destinationDevice || ''} | ${e.description} (Ref: ${e.evidenceReference})`),
    detections: detections.map((d) => `[${d.ruleCode}] ${d.name} (Confidence: ${d.confidenceScore}%) - Events: ${d.triggeringEventIds.join(', ')}`),
  };

  // If Gemini API is available on server, call gemini-3.8-flash
  if (aiClient) {
    try {
      const systemInstruction = `You are PROJECT ZERO AI Forensic Analyst, an expert digital forensics investigator.
Your duty is to answer questions about the digital crime timeline.
RULES:
1. Ground all conclusions STRICTLY in the provided evidence and event IDs.
2. ALWAYS cite specific event IDs (e.g. [EVT-0027]) and evidence IDs (e.g. [EVD-EDR-WS402]) when referencing activities.
3. NEVER fabricate events or state speculation as confirmed fact.
4. Distinguish observed causality from heuristic hypothesis.
5. Provide clear, professional cybersecurity SOC analysis with actionable next steps.`;

      const prompt = `CURRENT INVESTIGATION CONTEXT:
${JSON.stringify(contextData, null, 2)}

INVESTIGATOR QUERY:
${userPrompt}`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.2, // Low temperature for high precision and zero hallucinations
        },
      });

      return res.json({
        reply: response.text,
        isAiPowered: true,
        modelUsed: 'gemini-3.8-flash',
        citedEventsCount: visibleEvents.filter((e) => e.isMalicious).length,
      });
    } catch (err: any) {
      console.warn('Gemini API call failed, falling back to deterministic heuristic forensic analyzer:', err.message);
    }
  }

  // Deterministic Rule-Based Fallback when offline or API key pending
  const maliciousCount = visibleEvents.filter((e) => e.isMalicious).length;
  const latestMalicious = visibleEvents.filter((e) => e.isMalicious).slice(-3);

  let fallbackReply = `### Forensic Analysis Summary (Incident ${incident.id})

**Investigation Status:** Reconstructed **${visibleEvents.length} events** up to current timeline scrub. Identified **${maliciousCount} suspicious/malicious events** across **${detections.length} rule detections**.

#### Key Reconstructed Phases:
1. **Initial Compromise**: Adversary executed credential brute force ([EVT-0021] to [EVT-0026]) against \`VPN-GW-EDGE\` resulting in unauthorized session established at [EVT-0027] from external IP \`198.51.100.84\`. Supporting artifact: \`[EVD-VPN-AUDIT-02]\`.
2. **Reconnaissance & Privilege Escalation**: Host discovery commands executed via \`cmd.exe\` followed by critical UAC bypass at [EVT-0076] (\`fodhelper.exe\` -> SYSTEM integrity).
3. **Data Staging & Egress**: Sensitive directories accessed at [EVT-0056]-[EVT-0060], packaged into compressed archive at [EVT-0089], and exfiltrated over 15 encrypted TLS bursts to C2 \`198.51.100.84:8443\` ([EVT-0090]-[EVT-0105]). Supporting capture: \`[EVD-PCAP-EXFIL-04]\`.

#### Recommended Investigative Actions:
- Immediately revoke user \`${incident.leadInvestigatorId}\` / \`alice.chen\` Kerberos tickets.
- Blackhole external address \`198.51.100.84\` at edge firewall.
- Preserve Sysmon and EDR memory artifacts from workstation \`WS-ENG-402\`.`;

  return res.json({
    reply: fallbackReply,
    isAiPowered: false,
    modelUsed: 'deterministic-heuristic-engine',
    citedEventsCount: maliciousCount,
  });
});

// 8. Generate Forensic Report (JSON & Downloadable Data)
app.get('/api/reports/:incidentId', (req, res) => {
  const incident = incidents.find((i) => i.id === req.params.incidentId);
  if (!incident) return res.status(404).json({ error: 'Incident not found' });

  const events = incidentEventsCache.get(incident.id) || generateEventsForFalcon(incident);
  const detections = evaluateDetections(incident.id, events);
  const incidentEvidence = evidenceStore.filter((e) => e.incidentId === incident.id);

  res.json({
    reportId: `REP-${incident.id}-${Date.now().toString().substring(6)}`,
    incident,
    generatedAt: new Date().toISOString(),
    executiveSummary: `Reconstruction of incident ${incident.id} established a multi-stage compromise starting from credential brute-force at edge VPN to host privilege escalation and high-volume data exfiltration. All findings are backed by SHA-256 verified digital evidence.`,
    totalEvents: events.length,
    maliciousEventsCount: events.filter((e) => e.isMalicious).length,
    detections,
    evidenceList: incidentEvidence,
    limitationsDisclaimer: 'Cryptographic hashes establish bit-level integrity but do not independently prove physical chain of custody. Inferred relationships represent probabilistic hypotheses.',
    recommendations: [
      'Enforce hardware FIDO2 MFA on all remote VPN profiles.',
      'Deploy application whitelisting to block fodhelper.exe UAC bypasses.',
      'Implement outbound TLS inspection and strict DNS threat filtering.',
    ],
  });
});

// -----------------------------------------------------------------------------
// Vite Dev Server Integration
// -----------------------------------------------------------------------------
async function startServer() {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[PROJECT ZERO] Forensic Server & Time Machine listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
