package com.projectzero.forensics.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "entity_relationships")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EntityRelationship {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "incident_id", nullable = false)
    private String incidentId;

    @Column(name = "source_entity_id", nullable = false)
    private String sourceEntityId;

    @Column(name = "source_entity_type", nullable = false)
    private String sourceEntityType;

    @Column(name = "target_entity_id", nullable = false)
    private String targetEntityId;

    @Column(name = "target_entity_type", nullable = false)
    private String targetEntityType;

    @Column(name = "relationship_type", nullable = false)
    private String relationshipType;

    @Column(name = "is_inferred")
    private Boolean isInferred;

    @Column(name = "is_malicious")
    private Boolean isMalicious;

    @Column(name = "supporting_event_id")
    private String supportingEventId;

    @Column(name = "created_at")
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
        if (isInferred == null) isInferred = false;
        if (isMalicious == null) isMalicious = false;
    }
}
