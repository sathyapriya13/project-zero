package com.projectzero.forensics.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "evidence")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Evidence {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "incident_id", nullable = false)
    private String incidentId;

    @Column(name = "evidence_type", nullable = false)
    private String evidenceType;

    @Column(name = "original_filename", nullable = false)
    private String originalFilename;

    @Column(name = "stored_path", nullable = false)
    private String storedPath;

    @Column(name = "file_size_bytes", nullable = false)
    private Long fileSizeBytes;

    @Column(name = "sha256_hash", length = 64, nullable = false)
    private String sha256Hash;

    @Column(name = "md5_hash", length = 32)
    private String md5Hash;

    @Column(name = "source_host")
    private String sourceHost;

    @Column(name = "collected_by")
    private String collectedBy;

    @Column(name = "verification_status")
    private String verificationStatus;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "uploaded_at")
    private Instant uploadedAt;

    @PrePersist
    protected void onCreate() {
        if (uploadedAt == null) uploadedAt = Instant.now();
        if (verificationStatus == null) verificationStatus = "VERIFIED";
    }
}
