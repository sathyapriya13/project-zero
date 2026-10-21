package com.projectzero.forensics.controller;

import com.projectzero.forensics.dto.InvestigationGraphDto;
import com.projectzero.forensics.model.entity.ForensicEvent;
import com.projectzero.forensics.model.entity.Incident;
import com.projectzero.forensics.service.AttackReconstructionEngine;
import com.projectzero.forensics.service.ForensicSimulationEngine;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/graph")
@Tag(name = "Attack Reconstruction Graph", description = "Endpoints for topological correlation, BFS/DFS traversal, and entity network")
@CrossOrigin(origins = "*")
public class GraphController {

    private final AttackReconstructionEngine graphEngine;
    private final ForensicSimulationEngine simulationEngine;
    private final IncidentController incidentController;

    public GraphController(AttackReconstructionEngine graphEngine, ForensicSimulationEngine simulationEngine, IncidentController incidentController) {
        this.graphEngine = graphEngine;
        this.simulationEngine = simulationEngine;
        this.incidentController = incidentController;
    }

    @GetMapping("/{incidentId}")
    @Operation(summary = "Reconstruct full entity graph with BFS attack path and connected components")
    public ResponseEntity<InvestigationGraphDto> getInvestigationGraph(
            @PathVariable String incidentId,
            @RequestParam(required = false) Long upToEpochMs) {

        ResponseEntity<Incident> incRes = incidentController.getIncident(incidentId);
        if (incRes.getBody() == null) return ResponseEntity.notFound().build();

        List<ForensicEvent> events = simulationEngine.generateSimulationEvents(incRes.getBody());
        if (upToEpochMs != null) {
            Instant cutoff = Instant.ofEpochMilli(upToEpochMs);
            events = events.stream().filter(e -> !e.getTimestamp().isAfter(cutoff)).toList();
        }

        InvestigationGraphDto graph = graphEngine.reconstructGraph(incidentId, events, Collections.emptyList());
        return ResponseEntity.ok(graph);
    }
}
