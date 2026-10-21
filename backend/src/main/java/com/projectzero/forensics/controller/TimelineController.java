package com.projectzero.forensics.controller;

import com.projectzero.forensics.model.entity.ForensicEvent;
import com.projectzero.forensics.model.entity.Incident;
import com.projectzero.forensics.service.ForensicSimulationEngine;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/timeline")
@Tag(name = "Digital Time Machine", description = "Endpoints for temporal replay, event scrubbing, and chronological event sequence fetching")
@CrossOrigin(origins = "*")
public class TimelineController {

    private final ForensicSimulationEngine simulationEngine;
    private final IncidentController incidentController;

    public TimelineController(ForensicSimulationEngine simulationEngine, IncidentController incidentController) {
        this.simulationEngine = simulationEngine;
        this.incidentController = incidentController;
    }

    @GetMapping("/{incidentId}/events")
    @Operation(summary = "Fetch full chronological forensic event sequence for replay")
    public ResponseEntity<List<ForensicEvent>> getIncidentEvents(
            @PathVariable String incidentId,
            @RequestParam(required = false) Long upToEpochMs) {

        ResponseEntity<Incident> incRes = incidentController.getIncident(incidentId);
        if (incRes.getBody() == null) {
            return ResponseEntity.notFound().build();
        }

        List<ForensicEvent> allEvents = simulationEngine.generateSimulationEvents(incRes.getBody());

        if (upToEpochMs != null) {
            Instant cutoff = Instant.ofEpochMilli(upToEpochMs);
            allEvents = allEvents.stream()
                    .filter(e -> !e.getTimestamp().isAfter(cutoff))
                    .toList();
        }

        return ResponseEntity.ok(allEvents);
    }
}
