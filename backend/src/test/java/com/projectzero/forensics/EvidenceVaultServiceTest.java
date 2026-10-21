package com.projectzero.forensics;

import com.projectzero.forensics.model.entity.Evidence;
import com.projectzero.forensics.model.entity.EvidenceAuditLog;
import com.projectzero.forensics.service.EvidenceVaultService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class EvidenceVaultServiceTest {

    private final EvidenceVaultService vaultService = new EvidenceVaultService();

    @Test
    @DisplayName("Should compute correct SHA-256 digest and maintain immutable chain of custody")
    void testSha256AndChainOfCustody() {
        byte[] content = "FORENSIC_RAW_PACKET_BYTES_PROJECT_ZERO_2026".getBytes(StandardCharsets.UTF_8);

        Evidence evidence = vaultService.storeEvidence(
                "INC-TEST-001",
                "traffic.pcap",
                "PCAP",
                "WS-01",
                content,
                "Network capture test",
                "INV-101",
                "Investigator Smith",
                "127.0.0.1"
        );

        assertNotNull(evidence);
        assertNotNull(evidence.getSha256Hash());
        assertEquals(64, evidence.getSha256Hash().length(), "SHA-256 digest must be 64 hexadecimal characters");

        // Verify valid integrity check
        boolean isValid = vaultService.verifyIntegrity(evidence.getId(), content, "INV-101", "Investigator Smith", "127.0.0.1");
        assertTrue(isValid, "Integrity verification should pass for identical content");

        // Verify tampered byte detection
        byte[] tamperedContent = "FORENSIC_RAW_PACKET_BYTES_TAMPERED".getBytes(StandardCharsets.UTF_8);
        boolean isTamperedDetected = vaultService.verifyIntegrity(evidence.getId(), tamperedContent, "INV-101", "Investigator Smith", "127.0.0.1");
        assertFalse(isTamperedDetected, "Integrity verification must fail if bytes are altered");

        // Verify chain of custody audit log sequence
        List<EvidenceAuditLog> auditLogs = vaultService.getChainOfCustody(evidence.getId());
        assertEquals(3, auditLogs.size(), "Should record ingestion, verification, and tamper detection events");
        assertEquals("INGESTION_COLLECTED", auditLogs.get(0).getAction());
        assertEquals("INTEGRITY_VERIFIED", auditLogs.get(1).getAction());
        assertEquals("TAMPER_DETECTED", auditLogs.get(2).getAction());
    }
}
