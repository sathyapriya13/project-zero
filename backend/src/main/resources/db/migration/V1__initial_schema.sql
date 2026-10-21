-- =============================================================================
-- PROJECT ZERO — DATABASE SCHEMA (V1)
-- Enterprise Digital Forensics & Attack Timeline Reconstruction Engine
-- =============================================================================

-- 1. Users / Analysts
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'INVESTIGATOR',
    department VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Devices (Endpoints, Servers, Workstations)
CREATE TABLE IF NOT EXISTS devices (
    id VARCHAR(64) PRIMARY KEY,
    hostname VARCHAR(150) NOT NULL UNIQUE,
    ip_address VARCHAR(45) NOT NULL,
    mac_address VARCHAR(20),
    os VARCHAR(100),
    device_type VARCHAR(50) NOT NULL, -- WORKSTATION, SERVER, DC, GATEWAY
    is_compromised BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Incidents (Simulated & Ingested Investigations)
CREATE TABLE IF NOT EXISTS incidents (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    scenario_type VARCHAR(50) NOT NULL, -- INSIDER_THREAT, PRIVILEGE_ESCALATION, RANSOMWARE, NETWORK_EXFILTRATION
    description TEXT,
    severity VARCHAR(20) NOT NULL, -- LOW, MEDIUM, HIGH, CRITICAL
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, CLOSED, ARCHIVED
    lead_investigator_id VARCHAR(64) REFERENCES users(id),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    total_events INT DEFAULT 0,
    compromised_entities_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Processes
CREATE TABLE IF NOT EXISTS processes (
    id VARCHAR(64) PRIMARY KEY,
    pid INT NOT NULL,
    parent_pid INT,
    name VARCHAR(255) NOT NULL,
    executable_path TEXT NOT NULL,
    command_line TEXT,
    device_id VARCHAR(64) REFERENCES devices(id),
    username VARCHAR(100),
    sha256_hash VARCHAR(64),
    started_at TIMESTAMP WITH TIME ZONE,
    terminated_at TIMESTAMP WITH TIME ZONE
);

-- 5. Forensic Events (The immutable timeline backbone)
CREATE TABLE IF NOT EXISTS forensic_events (
    id VARCHAR(64) PRIMARY KEY,
    incident_id VARCHAR(64) NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    sequence_number INT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    event_type VARCHAR(60) NOT NULL, -- AUTH_SUCCESS, AUTH_FAILURE, PROCESS_SPAWN, FILE_ACCESS, FILE_MODIFY, FILE_DELETE, NETWORK_CONNECT, PRIVILEGE_ELEVATE, REGISTRY_WRITE
    severity VARCHAR(20) NOT NULL, -- INFO, LOW, MEDIUM, HIGH, CRITICAL
    source_device VARCHAR(150) NOT NULL,
    destination_device VARCHAR(150),
    actor_user VARCHAR(100) NOT NULL,
    target_user VARCHAR(100),
    process_id VARCHAR(64) REFERENCES processes(id),
    process_name VARCHAR(255),
    file_path TEXT,
    source_ip VARCHAR(45),
    destination_ip VARCHAR(45),
    port INT,
    protocol VARCHAR(20),
    is_malicious BOOLEAN DEFAULT FALSE,
    is_inferred BOOLEAN DEFAULT FALSE, -- Distinguishes observed from inferred relationships
    evidence_reference VARCHAR(64),
    description TEXT NOT NULL,
    raw_payload JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_forensic_events_incident ON forensic_events(incident_id);
CREATE INDEX idx_forensic_events_timestamp ON forensic_events(timestamp ASC);
CREATE INDEX idx_forensic_events_actor ON forensic_events(actor_user);
CREATE INDEX idx_forensic_events_device ON forensic_events(source_device);

-- 6. Evidence Vault
CREATE TABLE IF NOT EXISTS evidence (
    id VARCHAR(64) PRIMARY KEY,
    incident_id VARCHAR(64) NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    evidence_type VARCHAR(50) NOT NULL, -- LOG_FILE, MEMORY_DUMP, PCAP, DISK_IMAGE, VOLATILE_ARTIFACT
    original_filename VARCHAR(255) NOT NULL,
    stored_path TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    sha256_hash VARCHAR(64) NOT NULL,
    md5_hash VARCHAR(32),
    source_host VARCHAR(150),
    collected_by VARCHAR(64) REFERENCES users(id),
    verification_status VARCHAR(30) DEFAULT 'VERIFIED', -- VERIFIED, TAMPERED, UNVERIFIED
    notes TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Evidence Audit Logs (Append-Only Chain of Custody)
CREATE TABLE IF NOT EXISTS evidence_audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    evidence_id VARCHAR(64) NOT NULL REFERENCES evidence(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- COLLECTED, TRANSFERRED, VERIFIED, VIEWED, EXPORTED
    actor_id VARCHAR(64) NOT NULL REFERENCES users(id),
    actor_name VARCHAR(150) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    details TEXT NOT NULL,
    recorded_sha256 VARCHAR(64) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_evidence_audit_evidence ON evidence_audit_logs(evidence_id);

-- 8. Detection Rules
CREATE TABLE IF NOT EXISTS detection_rules (
    id VARCHAR(64) PRIMARY KEY,
    rule_code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    default_severity VARCHAR(20) NOT NULL,
    rule_logic TEXT NOT NULL,
    is_heuristic BOOLEAN DEFAULT TRUE,
    recommended_action TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Detections (Suspicious Activity Alerts Triggered)
CREATE TABLE IF NOT EXISTS detections (
    id VARCHAR(64) PRIMARY KEY,
    incident_id VARCHAR(64) NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    rule_id VARCHAR(64) NOT NULL REFERENCES detection_rules(id),
    rule_code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'UNDER_REVIEW', -- CONFIRMED, DISMISSED, UNDER_REVIEW
    confidence_score NUMERIC(5, 2) NOT NULL, -- Heuristic value 0.0 - 100.0
    explanation TEXT NOT NULL,
    triggering_event_ids TEXT[] NOT NULL, -- IDs of events that triggered the rule
    recommended_actions TEXT NOT NULL,
    reviewed_by VARCHAR(64) REFERENCES users(id),
    review_notes TEXT,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_detections_incident ON detections(incident_id);

-- 10. Entity Relationships (For Attack Reconstruction Graph BFS/DFS)
CREATE TABLE IF NOT EXISTS entity_relationships (
    id VARCHAR(64) PRIMARY KEY,
    incident_id VARCHAR(64) NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    source_entity_id VARCHAR(100) NOT NULL,
    source_entity_type VARCHAR(50) NOT NULL, -- USER, DEVICE, PROCESS, FILE, IP
    target_entity_id VARCHAR(100) NOT NULL,
    target_entity_type VARCHAR(50) NOT NULL,
    relationship_type VARCHAR(80) NOT NULL, -- SPAWNED, AUTHENTICATED_TO, MODIFIED, READ, TRANSMITTED_TO, ESCALATED_ON
    is_inferred BOOLEAN DEFAULT FALSE,
    is_malicious BOOLEAN DEFAULT FALSE,
    supporting_event_id VARCHAR(64) REFERENCES forensic_events(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_entity_rel_incident ON entity_relationships(incident_id);

-- 11. Investigation Notes
CREATE TABLE IF NOT EXISTS investigation_notes (
    id VARCHAR(64) PRIMARY KEY,
    incident_id VARCHAR(64) NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    author_id VARCHAR(64) NOT NULL REFERENCES users(id),
    author_name VARCHAR(150) NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    tagged_event_ids TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Generated Forensic Reports
CREATE TABLE IF NOT EXISTS generated_reports (
    id VARCHAR(64) PRIMARY KEY,
    incident_id VARCHAR(64) NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    report_title VARCHAR(255) NOT NULL,
    generated_by VARCHAR(64) NOT NULL REFERENCES users(id),
    sha256_checksum VARCHAR(64) NOT NULL,
    executive_summary TEXT NOT NULL,
    file_path TEXT,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
