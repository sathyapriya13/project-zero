package com.projectzero.forensics.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "evidence_audit_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvidenceAuditLog {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "evidence_id", nullable = false)
    private String evidenceId;

    @Column(nullable = false)
    private String action; // COLLECTED, TRANSFERRED, VERIFIED, VIEWED, EXPORTED

    @Column(name = "actor_id", nullable = false)
    private String actorId;

    @Column(name = "actor_name", nullable = false)
    private String actorName;

    @Column(name = "ip_address", nullable = false)
    private String ipAddress;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String details;

    @Column(name = "recorded_sha256", length = 64, nullable = false)
    private String recordedSha256;

    @Column(nullable = false)
    private Instant timestamp;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) timestamp = Instant.now();
    }
}
