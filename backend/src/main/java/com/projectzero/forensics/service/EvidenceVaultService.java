package com.projectzero.forensics.service;

import com.projectzero.forensics.model.entity.Evidence;
import com.projectzero.forensics.model.entity.EvidenceAuditLog;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.*;

/**
 * PROJECT ZERO — Evidence Vault Service
 * 
 * Manages forensic evidence ingestion, cryptographic integrity verification (SHA-256),
 * and append-only tamper-evident chain-of-custody tracking.
 * 
 * NOTE ON FORENSIC STANDARD: Cryptographic hashes establish digital bit-level integrity,
 * but do not independently establish legal chain of custody or physical provenance.
 */
@Service
public class EvidenceVaultService {

    private final Map<String, Evidence> evidenceStore = new HashMap<>();
    private final List<EvidenceAuditLog> auditTrail = new ArrayList<>();

    /**
     * Computes the SHA-256 hexadecimal digest of raw bytes in Java.
     */
    public String calculateSha256(byte[] data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(data);
            StringBuilder hexString = new StringBuilder();
            for (byte b : hashBytes) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 cryptographic provider unavailable", e);
        }
    }

    /**
     * Ingests a new forensic digital artifact into the secure vault with an immutable initial audit entry.
     */
    public Evidence storeEvidence(String incidentId, String filename, String evidenceType, String sourceHost, byte[] fileContent, String notes, String investigatorId, String investigatorName, String clientIp) {
        String sha256 = calculateSha256(fileContent);
        String evidenceId = "EVD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Evidence evidence = Evidence.builder()
                .id(evidenceId)
                .incidentId(incidentId)
                .originalFilename(filename)
                .evidenceType(evidenceType)
                .storedPath("/vault/" + incidentId + "/" + evidenceId + "_" + filename)
                .fileSizeBytes((long) fileContent.length)
                .sha256Hash(sha256)
                .sourceHost(sourceHost)
                .collectedBy(investigatorId)
                .verificationStatus("VERIFIED")
                .notes(notes)
                .uploadedAt(Instant.now())
                .build();

        evidenceStore.put(evidenceId, evidence);

        // Immutable Append-Only Chain of Custody Record
        recordAuditAction(evidenceId, "INGESTION_COLLECTED", investigatorId, investigatorName, clientIp,
                "Evidence artifact captured and ingested into vault. Baseline SHA-256 calculated.", sha256);

        return evidence;
    }

    /**
     * Verifies that the artifact content matches the original stored SHA-256 checksum.
     */
    public boolean verifyIntegrity(String evidenceId, byte[] currentBytes, String verifierId, String verifierName, String clientIp) {
        Evidence ev = evidenceStore.get(evidenceId);
        if (ev == null) return false;

        String currentSha = calculateSha256(currentBytes);
        boolean intact = ev.getSha256Hash().equalsIgnoreCase(currentSha);

        recordAuditAction(evidenceId, intact ? "INTEGRITY_VERIFIED" : "TAMPER_DETECTED", verifierId, verifierName, clientIp,
                intact ? "Bit-level integrity confirmed. Checksum matches recorded hash." : "CRITICAL ALERT: Current hash " + currentSha + " does NOT match recorded hash " + ev.getSha256Hash(),
                currentSha);

        if (!intact) {
            ev.setVerificationStatus("TAMPERED");
        }
        return intact;
    }

    public List<EvidenceAuditLog> getChainOfCustody(String evidenceId) {
        return auditTrail.stream()
                .filter(log -> log.getEvidenceId().equals(evidenceId))
                .sorted(Comparator.comparing(EvidenceAuditLog::getTimestamp))
                .toList();
    }

    public List<Evidence> getIncidentEvidence(String incidentId) {
        return evidenceStore.values().stream()
                .filter(e -> e.getIncidentId().equals(incidentId))
                .sorted(Comparator.comparing(Evidence::getUploadedAt).reversed())
                .toList();
    }

    private void recordAuditAction(String evidenceId, String action, String actorId, String actorName, String ip, String details, String sha256) {
        EvidenceAuditLog log = EvidenceAuditLog.builder()
                .id("AUDIT-" + UUID.randomUUID().toString().substring(0, 8))
                .evidenceId(evidenceId)
                .action(action)
                .actorId(actorId)
                .actorName(actorName)
                .ipAddress(ip)
                .details(details)
                .recordedSha256(sha256)
                .timestamp(Instant.now())
                .build();
        auditTrail.add(log);
    }
}
