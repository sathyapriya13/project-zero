package com.projectzero.forensics.model.entity;

import com.projectzero.forensics.model.enums.EventType;
import com.projectzero.forensics.model.enums.Severity;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "forensic_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ForensicEvent {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "incident_id", nullable = false)
    private String incidentId;

    @Column(name = "sequence_number", nullable = false)
    private Integer sequenceNumber;

    @Column(nullable = false)
    private Instant timestamp;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private EventType eventType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Severity severity;

    @Column(name = "source_device", nullable = false)
    private String sourceDevice;

    @Column(name = "destination_device")
    private String destinationDevice;

    @Column(name = "actor_user", nullable = false)
    private String actorUser;

    @Column(name = "target_user")
    private String targetUser;

    @Column(name = "process_id")
    private String processId;

    @Column(name = "process_name")
    private String processName;

    @Column(name = "file_path", columnDefinition = "TEXT")
    private String filePath;

    @Column(name = "source_ip")
    private String sourceIp;

    @Column(name = "destination_ip")
    private String destinationIp;

    private Integer port;

    private String protocol;

    @Column(name = "is_malicious")
    private Boolean isMalicious;

    @Column(name = "is_inferred")
    private Boolean isInferred;

    @Column(name = "evidence_reference")
    private String evidenceReference;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at")
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
        if (isMalicious == null) isMalicious = false;
        if (isInferred == null) isInferred = false;
    }
}
