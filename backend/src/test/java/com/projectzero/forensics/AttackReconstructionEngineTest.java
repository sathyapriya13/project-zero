package com.projectzero.forensics;

import com.projectzero.forensics.dto.InvestigationGraphDto;
import com.projectzero.forensics.model.entity.ForensicEvent;
import com.projectzero.forensics.model.entity.Incident;
import com.projectzero.forensics.model.enums.ScenarioType;
import com.projectzero.forensics.model.enums.Severity;
import com.projectzero.forensics.service.AttackReconstructionEngine;
import com.projectzero.forensics.service.ForensicSimulationEngine;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class AttackReconstructionEngineTest {

    private final AttackReconstructionEngine graphEngine = new AttackReconstructionEngine();
    private final ForensicSimulationEngine simEngine = new ForensicSimulationEngine();

    @Test
    @DisplayName("Should reconstruct entity graph and traverse shortest attack path using BFS")
    void testReconstructGraphAndBfsPath() {
        Incident incident = Incident.builder()
                .id("TEST-INC-GRAPH")
                .title("Graph Test Incident")
                .scenarioType(ScenarioType.INSIDER_DATA_THEFT)
                .severity(Severity.HIGH)
                .startTime(Instant.now().minusSeconds(3600))
                .endTime(Instant.now())
                .build();

        List<ForensicEvent> events = simEngine.generateSimulationEvents(incident);
        InvestigationGraphDto graph = graphEngine.reconstructGraph(incident.getId(), events, Collections.emptyList());

        assertNotNull(graph);
        assertFalse(graph.getNodes().isEmpty(), "Graph should contain extracted entity nodes");
        assertFalse(graph.getEdges().isEmpty(), "Graph should contain correlated relationships");
        assertTrue(graph.getObservedRelationshipsCount() > 0, "Must contain observed evidence relationships");
        assertNotNull(graph.getCriticalAttackPath(), "Attack path should be determined by BFS");
        assertTrue(graph.getConnectedComponentsCount() >= 1, "Must contain at least 1 connected component");
    }
}
