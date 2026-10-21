package com.projectzero.forensics.controller;

import com.projectzero.forensics.model.entity.Evidence;
import com.projectzero.forensics.model.entity.EvidenceAuditLog;
import com.projectzero.forensics.service.EvidenceVaultService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

@RestController
@RequestMapping("/api/evidence")
@Tag(name = "Evidence Vault", description = "Endpoints for evidence ingestion, SHA-256 verification, and chain-of-custody tracking")
@CrossOrigin(origins = "*")
public class EvidenceController {

    private final EvidenceVaultService evidenceVaultService;

    public EvidenceController(EvidenceVaultService evidenceVaultService) {
        this.evidenceVaultService = evidenceVaultService;
        seedDefaultEvidence();
    }

    private void seedDefaultEvidence() {
        evidenceVaultService.storeEvidence(
                "INC-2026-0891",
                "auth_audit_2026-10-21.log",
                "LOG_FILE",
                "VPN-GW-EDGE",
                "2026-10-21T05:30:12Z [AUTH_FAIL] user: alice.chen ip: 198.51.100.84\n2026-10-21T05:31:40Z [AUTH_SUCCESS] user: alice.chen ip: 198.51.100.84".getBytes(StandardCharsets.UTF_8),
                "Edge SSL-VPN firewall authentication log demonstrating credential brute force and successful logon.",
                "INV-7702",
                "Investigator S. Vance",
                "10.0.1.50"
        );

        evidenceVaultService.storeEvidence(
                "INC-2026-0891",
                "edr_ws402_process_tree.json",
                "EDR_TELEMETRY",
                "WS-ENG-402",
                "{\"pid\": 5104, \"name\": \"fodhelper.exe\", \"integrity\": \"HIGH\", \"action\": \"UAC_BYPASS\"}".getBytes(StandardCharsets.UTF_8),
                "CrowdStrike/Sysmon event telemetry capturing execution of fodhelper UAC bypass and wevtutil clear.",
                "INV-7702",
                "Investigator S. Vance",
                "10.0.1.50"
        );

        evidenceVaultService.storeEvidence(
                "INC-2026-0891",
                "exfil_packet_capture_c2.pcap",
                "PCAP",
                "GW-CORE-01",
                "PCAP_BINARY_DUMP_STREAM_TCP_PORT_8443_TOTAL_PACKETS_41028_BYTES_48928172".getBytes(StandardCharsets.UTF_8),
                "Full network packet capture showing TLS stream to 198.51.100.84 on port 8443 carrying AES archive chunks.",
                "INV-7702",
                "Investigator S. Vance",
                "10.0.1.50"
        );
    }

    @GetMapping("/incident/{incidentId}")
    @Operation(summary = "List all stored forensic evidence for an incident")
    public ResponseEntity<List<Evidence>> getIncidentEvidence(@PathVariable String incidentId) {
        return ResponseEntity.ok(evidenceVaultService.getIncidentEvidence(incidentId));
    }

    @GetMapping("/{evidenceId}/chain-of-custody")
    @Operation(summary = "Retrieve append-only chain of custody audit log for evidence")
    public ResponseEntity<List<EvidenceAuditLog>> getChainOfCustody(@PathVariable String evidenceId) {
        return ResponseEntity.ok(evidenceVaultService.getChainOfCustody(evidenceId));
    }

    @PostMapping("/incident/{incidentId}/upload")
    @Operation(summary = "Upload raw digital evidence artifact and compute SHA-256 digest")
    public ResponseEntity<Evidence> uploadEvidence(
            @PathVariable String incidentId,
            @RequestParam("file") MultipartFile file,
            @RequestParam String evidenceType,
            @RequestParam String sourceHost,
            @RequestParam String notes) throws IOException {

        Evidence ev = evidenceVaultService.storeEvidence(
                incidentId,
                file.getOriginalFilename(),
                evidenceType,
                sourceHost,
                file.getBytes(),
                notes,
                "INV-7702",
                "Investigator S. Vance",
                "127.0.0.1"
        );
        return ResponseEntity.ok(ev);
    }
}
