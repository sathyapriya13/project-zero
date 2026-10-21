package com.projectzero.forensics.model.entity;

import com.projectzero.forensics.model.enums.DetectionStatus;
import com.projectzero.forensics.model.enums.Severity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "detections")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Detection {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "incident_id", nullable = false)
    private String incidentId;

    @Column(name = "rule_id", nullable = false)
    private String ruleId;

    @Column(name = "rule_code", nullable = false)
    private String ruleCode;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Severity severity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DetectionStatus status;

    @Column(name = "confidence_score", nullable = false)
    private BigDecimal confidenceScore; // heuristic value 0-100%

    @Column(columnDefinition = "TEXT", nullable = false)
    private String explanation;

    @ElementCollection
    @CollectionTable(name = "detection_event_ids", joinColumns = @JoinColumn(name = "detection_id"))
    @Column(name = "event_id")
    private List<String> triggeringEventIds;

    @Column(name = "recommended_actions", columnDefinition = "TEXT", nullable = false)
    private String recommendedActions;

    @Column(name = "reviewed_by")
    private String reviewedBy;

    @Column(name = "review_notes", columnDefinition = "TEXT")
    private String reviewNotes;

    @Column(name = "detected_at")
    private Instant detectedAt;

    @PrePersist
    protected void onCreate() {
        if (detectedAt == null) detectedAt = Instant.now();
        if (status == null) status = DetectionStatus.UNDER_REVIEW;
    }
}
