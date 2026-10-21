package com.projectzero.forensics.controller;

import com.projectzero.forensics.dto.IncidentDto;
import com.projectzero.forensics.model.entity.Incident;
import com.projectzero.forensics.model.enums.ScenarioType;
import com.projectzero.forensics.model.enums.Severity;
import com.projectzero.forensics.service.ForensicSimulationEngine;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

@RestController
@RequestMapping("/api/incidents")
@Tag(name = "Incident Management", description = "Endpoints for creating, listing, and inspecting forensic incidents")
@CrossOrigin(origins = "*")
public class IncidentController {

    private final Map<String, Incident> incidentStore = new LinkedHashMap<>();

    public IncidentController() {
        // Seed default scenarios for instant review
        seedDefaultIncidents();
    }

    private void seedDefaultIncidents() {
        Incident incA = Incident.builder()
                .id("INC-2026-0891")
                .title("Project Falcon — Unauthorized Research Exfiltration & Insider Theft")
                .scenarioType(ScenarioType.INSIDER_DATA_THEFT)
                .description("Simulated investigation of compromised credentials, privilege escalation, and classified aerospace patent staging.")
                .severity(Severity.CRITICAL)
                .status("ACTIVE")
                .leadInvestigatorId("INV-7702")
                .startTime(Instant.now().minus(2, ChronoUnit.HOURS))
                .endTime(Instant.now())
                .totalEvents(105)
                .compromisedEntitiesCount(6)
                .build();
        incidentStore.put(incA.getId(), incA);

        Incident incB = Incident.builder()
                .id("INC-2026-0892")
                .title("Active Directory Domain Admin Impersonation & Kerberoast")
                .scenarioType(ScenarioType.COMPROMISED_ADMIN_ACCOUNT)
                .description("Privileged account hijack utilizing stolen silver tickets and automated GPO modification.")
                .severity(Severity.HIGH)
                .status("ACTIVE")
                .leadInvestigatorId("INV-7702")
                .startTime(Instant.now().minus(5, ChronoUnit.HOURS))
                .endTime(Instant.now().minus(1, ChronoUnit.HOURS))
                .totalEvents(84)
                .compromisedEntitiesCount(4)
                .build();
        incidentStore.put(incB.getId(), incB);

        Incident incC = Incident.builder()
                .id("INC-2026-0893")
                .title("LockBit 4.0 Canary Cryptographic Extortion Outbreak")
                .scenarioType(ScenarioType.RANSOMWARE_INCIDENT)
                .description("Rapid file system encryption burst following malicious macro execution and VSS shadow copy deletion.")
                .severity(Severity.CRITICAL)
                .status("ACTIVE")
                .leadInvestigatorId("INV-7702")
                .startTime(Instant.now().minus(1, ChronoUnit.DAYS))
                .endTime(Instant.now().minus(22, ChronoUnit.HOURS))
                .totalEvents(128)
                .compromisedEntitiesCount(9)
                .build();
        incidentStore.put(incC.getId(), incC);

        Incident incD = Incident.builder()
                .id("INC-2026-0894")
                .title("APT-41 Covert DNS Tunneling & Egress Beaconing")
                .scenarioType(ScenarioType.SUSPICIOUS_NETWORK_ACTIVITY)
                .description("High-entropy DNS query sequence and unauthorized long-duration socket to unclassified external IP.")
                .severity(Severity.MEDIUM)
                .status("ACTIVE")
                .leadInvestigatorId("INV-7702")
                .startTime(Instant.now().minus(12, ChronoUnit.HOURS))
                .endTime(Instant.now().minus(8, ChronoUnit.HOURS))
                .totalEvents(62)
                .compromisedEntitiesCount(3)
                .build();
        incidentStore.put(incD.getId(), incD);
    }

    @GetMapping
    @Operation(summary = "List all forensic incidents")
    public ResponseEntity<List<Incident>> listIncidents() {
        return ResponseEntity.ok(new ArrayList<>(incidentStore.values()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get forensic incident details by ID")
    public ResponseEntity<Incident> getIncident(@PathVariable String id) {
        Incident inc = incidentStore.get(id);
        if (inc == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(inc);
    }

    @PostMapping
    @Operation(summary = "Register or launch a new investigation scenario")
    public ResponseEntity<Incident> createIncident(@RequestBody IncidentDto dto) {
        String id = "INC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        Incident inc = Incident.builder()
                .id(id)
                .title(dto.getTitle())
                .scenarioType(dto.getScenarioType())
                .description(dto.getDescription())
                .severity(dto.getSeverity())
                .status("ACTIVE")
                .leadInvestigatorId(dto.getLeadInvestigatorId() != null ? dto.getLeadInvestigatorId() : "INV-7702")
                .startTime(Instant.now().minus(1, ChronoUnit.HOURS))
                .endTime(Instant.now())
                .totalEvents(105)
                .compromisedEntitiesCount(5)
                .build();
        incidentStore.put(id, inc);
        return ResponseEntity.ok(inc);
    }
}
