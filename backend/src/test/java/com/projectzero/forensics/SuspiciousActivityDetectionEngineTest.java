package com.projectzero.forensics;

import com.projectzero.forensics.model.entity.Detection;
import com.projectzero.forensics.model.entity.ForensicEvent;
import com.projectzero.forensics.model.entity.Incident;
import com.projectzero.forensics.model.enums.ScenarioType;
import com.projectzero.forensics.model.enums.Severity;
import com.projectzero.forensics.service.ForensicSimulationEngine;
import com.projectzero.forensics.service.SuspiciousActivityDetectionEngine;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class SuspiciousActivityDetectionEngineTest {

    private final SuspiciousActivityDetectionEngine detectionEngine = new SuspiciousActivityDetectionEngine();
    private final ForensicSimulationEngine simEngine = new ForensicSimulationEngine();

    @Test
    @DisplayName("Should evaluate 7 rules and trigger high-confidence detections with explicit event IDs")
    void testHeuristicRulesFireAccurately() {
        Incident incident = Incident.builder()
                .id("TEST-INC-DET")
                .title("Detection Test")
                .scenarioType(ScenarioType.INSIDER_DATA_THEFT)
                .severity(Severity.CRITICAL)
                .startTime(Instant.now().minusSeconds(7200))
                .endTime(Instant.now())
                .build();

        List<ForensicEvent> events = simEngine.generateSimulationEvents(incident);
        List<Detection> detections = detectionEngine.evaluateIncidentEvents(incident.getId(), events);

        assertNotNull(detections);
        assertFalse(detections.isEmpty(), "Detections must be generated from malicious event pattern");

        boolean foundBruteForce = detections.stream().anyMatch(d -> d.getRuleCode().equals("RULE-001"));
        boolean foundPrivEsc = detections.stream().anyMatch(d -> d.getRuleCode().equals("RULE-002"));
        boolean foundLogTamper = detections.stream().anyMatch(d -> d.getRuleCode().equals("RULE-007"));

        assertTrue(foundBruteForce, "RULE-001 (Brute-Force) must trigger");
        assertTrue(foundPrivEsc, "RULE-002 (Privilege Escalation) must trigger");
        assertTrue(foundLogTamper, "RULE-007 (Log Tampering) must trigger");

        for (Detection d : detections) {
            assertNotNull(d.getTriggeringEventIds(), "Every detection must cite triggering event IDs");
            assertFalse(d.getTriggeringEventIds().isEmpty(), "Triggering event IDs cannot be empty");
            assertTrue(d.getConfidenceScore().doubleValue() > 0, "Confidence score must be positive");
            assertNotNull(d.getRecommendedActions(), "Recommended actions must be present");
        }
    }
}
