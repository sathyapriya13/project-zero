package com.projectzero.forensics;

import com.projectzero.forensics.model.entity.ForensicEvent;
import com.projectzero.forensics.model.entity.Incident;
import com.projectzero.forensics.model.enums.ScenarioType;
import com.projectzero.forensics.model.enums.Severity;
import com.projectzero.forensics.service.ForensicSimulationEngine;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ForensicSimulationEngineTest {

    private final ForensicSimulationEngine engine = new ForensicSimulationEngine();

    @Test
    @DisplayName("Should generate at least 100 realistic, interconnected events in chronological order")
    void testDemonstrationScenarioGeneratesOver100Events() {
        Incident incident = Incident.builder()
                .id("TEST-INC-01")
                .title("Insider Theft Test")
                .scenarioType(ScenarioType.INSIDER_DATA_THEFT)
                .severity(Severity.CRITICAL)
                .startTime(Instant.parse("2026-10-21T06:00:00Z"))
                .endTime(Instant.parse("2026-10-21T08:00:00Z"))
                .build();

        List<ForensicEvent> events = engine.generateSimulationEvents(incident);

        assertNotNull(events);
        assertTrue(events.size() >= 100, "Must generate at least 100 events for forensic depth; actual: " + events.size());

        // Verify strictly chronological sequence
        for (int i = 0; i < events.size() - 1; i++) {
            ForensicEvent current = events.get(i);
            ForensicEvent next = events.get(i + 1);
            assertFalse(current.getTimestamp().isAfter(next.getTimestamp()),
                    "Events must be chronologically ordered at sequence: " + current.getSequenceNumber());
            assertNotNull(current.getActorUser(), "Actor user cannot be null");
            assertNotNull(current.getSourceDevice(), "Source device cannot be null");
            assertNotNull(current.getEvidenceReference(), "Evidence reference must be present for forensic traceability");
        }
    }
}
