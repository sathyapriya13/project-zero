package com.projectzero.forensics.controller;

import com.projectzero.forensics.model.entity.Detection;
import com.projectzero.forensics.model.entity.ForensicEvent;
import com.projectzero.forensics.model.entity.Incident;
import com.projectzero.forensics.model.enums.DetectionStatus;
import com.projectzero.forensics.service.ForensicSimulationEngine;
import com.projectzero.forensics.service.SuspiciousActivityDetectionEngine;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/detections")
@Tag(name = "Threat Detection Center", description = "Endpoints for heuristic detections and analyst triage")
@CrossOrigin(origins = "*")
public class DetectionController {

    private final SuspiciousActivityDetectionEngine detectionEngine;
    private final ForensicSimulationEngine simulationEngine;
    private final IncidentController incidentController;
    private final Map<String, Detection> detectionStore = new HashMap<>();

    public DetectionController(SuspiciousActivityDetectionEngine detectionEngine, ForensicSimulationEngine simulationEngine, IncidentController incidentController) {
        this.detectionEngine = detectionEngine;
        this.simulationEngine = simulationEngine;
        this.incidentController = incidentController;
    }

    @GetMapping("/{incidentId}")
    @Operation(summary = "Run 7 heuristic detection rules against incident events")
    public ResponseEntity<List<Detection>> getDetectionsForIncident(@PathVariable String incidentId) {
        ResponseEntity<Incident> incRes = incidentController.getIncident(incidentId);
        if (incRes.getBody() == null) return ResponseEntity.notFound().build();

        List<ForensicEvent> events = simulationEngine.generateSimulationEvents(incRes.getBody());
        List<Detection> evaluated = detectionEngine.evaluateIncidentEvents(incidentId, events);

        for (Detection d : evaluated) {
            detectionStore.putIfAbsent(d.getId(), d);
        }

        return ResponseEntity.ok(evaluated);
    }

    @PatchMapping("/{detectionId}/status")
    @Operation(summary = "Update investigation review status: CONFIRMED, DISMISSED, or UNDER_REVIEW")
    public ResponseEntity<Detection> updateStatus(
            @PathVariable String detectionId,
            @RequestParam DetectionStatus status,
            @RequestParam(required = false) String notes) {

        Detection d = detectionStore.get(detectionId);
        if (d == null) return ResponseEntity.notFound().build();

        d.setStatus(status);
        if (notes != null) d.setReviewNotes(notes);
        return ResponseEntity.ok(d);
    }
}
