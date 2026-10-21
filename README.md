# PROJECT ZERO — The Digital Crime Time Machine
> *"Every digital crime leaves a trace. Rewind the evidence."*

---

## 🛡️ Overview

**PROJECT ZERO** is an enterprise-grade digital cybersecurity forensics and attack reconstruction platform. Built with a **Java 21 / Spring Boot 3.x** core, an event-driven chronological replay engine, and an interactive **React + TypeScript + React Flow** investigation console, it allows incident responders, SOC analysts, and digital forensics specialists to travel backward and forward in time through digital crime scenes.

---

## 🏛️ Architecture & System Topology

```
+-----------------------------------------------------------------------------------+
|                        REACT TYPESCRIPT INVESTIGATION WORKSPACE                   |
|  [Command Center] [Incident Library] [Digital Time Machine] [Attack Graph (Flow)]  |
|  [Evidence Vault] [Detection Center] [AI Investigator (Gemini)] [Forensic Report] |
+------------------------------------------+----------------------------------------+
                                           | REST / SSE / WebSockets
                                           v
+-----------------------------------------------------------------------------------+
|                      JAVA 21 / SPRING BOOT 3 FORENSIC CORE                        |
|                                                                                   |
|  [Controllers]                                                                    |
|    IncidentController | TimelineController | GraphController                      |
|    DetectionController | EvidenceController | AssistantController | ReportCtrl    |
|                                                                                   |
|  [Forensic Service Engines]                                                       |
|    * ForensicSimulationEngine: Multi-phase synthetic scenario generator (100+ ev) |
|    * AttackReconstructionEngine: BFS shortest-path & DFS connected components     |
|    * SuspiciousActivityDetectionEngine: 7 deterministic & heuristic rules         |
|    * EvidenceVaultService: SHA-256 bit-level hashing & immutable audit trail      |
|    * ForensicReportService: Apache PDFBox court-admissible PDF generator          |
|    * AiInvestigatorService: Gemini 3.8 Flash grounded forensic analysis           |
|                                                                                   |
|  [Security & Storage]                                                             |
|    Spring Security RBAC | Flyway Migrations | PostgreSQL / H2 In-Memory           |
+-----------------------------------------------------------------------------------+
```

---

## 🧮 Graph Algorithms & Forensic Reconstruction

### 1. Chronological Event Sorting & State Reconstruction
Forensic events are sequenced by nanosecond timestamps $T_0, T_1, \dots, T_n$. Replay state at any timestamp $T_{scrub}$ projects only $E \subseteq \{e \mid \text{timestamp}(e) \le T_{scrub}\}$, dynamically revealing attacker lateral movement.

### 2. Breadth-First Search (BFS) Shortest Attack Path
Given a set of compromised seed identities $S$ (e.g. initial compromised account) and critical target assets $T$ (e.g. C2 exfiltration server, encrypted file shares):
- Constructs directed adjacency list $G = (V, E)$ where edges represent observed parent-child process invocations, authenticated remote sessions, or outbound sockets.
- Traverses the graph level-by-level via standard BFS queue to yield the minimum-hop execution chain that led to the compromise:
  $$\text{Path} = [v_0, v_1, \dots, v_k]$$
- Avoids temporal proximity false positives by requiring explicit parent-child PID, authentication token, or socket port causality.

### 3. Depth-First Search (DFS) Connected-Component Blast Radius
Identifies isolated entity clusters and blast radii:
- Transforms the entity graph into an undirected relationship projection.
- Runs recursive DFS to discover all disjoint components $\{C_1, C_2, \dots, C_m\}$, isolating unaffected workstations from compromised subnets.

---

## 🚨 Rule-Based Detection Engine (7 Forensic Rules)

| Rule ID | Rule Name | Severity | Detection Heuristic Logic |
|---|---|---|---|
| **RULE-001** | Brute-Force to Compromise | HIGH | $\ge 3$ consecutive `AUTH_FAILURE` events followed by `AUTH_SUCCESS` within a 15-minute sliding window. |
| **RULE-002** | Unauthorized Privilege Escalation | CRITICAL | High-integrity token creation via UAC bypass (`fodhelper.exe`, token manipulation). |
| **RULE-003** | Sensitive File Access | HIGH | Access to directories matching restricted regex patterns (`confidential`, `secret`, `patent`, `payroll`). |
| **RULE-004** | Mass File Modification Burst | CRITICAL | Rapid burst of $\ge 5$ file write/delete operations indicative of ransomware cryptographic wiping. |
| **RULE-005** | Off-Hours Temporal Anomaly | MEDIUM | User authenticated activity occurring between 22:00 and 06:00 UTC. |
| **RULE-006** | Unauthorized External C2 Egress | CRITICAL | Direct outbound TCP/TLS socket to uncatalogued public IP with high data volume payload. |
| **RULE-007** | Audit Log Tampering | CRITICAL | Invocation of log-clearing utilities (`wevtutil cl Security`, `rm -rf /var/log`). |

---

## 🔒 Forensic Limitations & Integrity Principles
- **Hash vs. Provenance**: Cryptographic hashes (SHA-256) verify bit-level file integrity; they do not independently establish physical chain of custody or legal admissibility without sworn procedural records.
- **Correlation vs. Causation**: Coinciding timestamps do not prove causation. PROJECT ZERO explicitly tags links as **Observed** (evidenced by process parentage or TCP state) versus **Inferred** (heuristic hypothesis).

---

## 🚀 Quickstart & Setup

### Option 1: Docker Compose (Full Stack)
```bash
# Clone and run PostgreSQL, Spring Boot 21 backend, and React frontend
docker-compose up --build
```
- Frontend UI: `http://localhost:3000`
- Backend API: `http://localhost:8080/api`
- Swagger UI: `http://localhost:8080/swagger-ui.html`

### Option 2: Local Development
**Backend:**
```bash
cd backend
mvn clean spring-boot:run
```
**Frontend:**
```bash
npm install
npm run dev
```

### Option 3: Automated Tests
```bash
cd backend
mvn test
```
All unit tests (`ForensicSimulationEngineTest`, `AttackReconstructionEngineTest`, `SuspiciousActivityDetectionEngineTest`, `EvidenceVaultServiceTest`) run with JUnit 5.
