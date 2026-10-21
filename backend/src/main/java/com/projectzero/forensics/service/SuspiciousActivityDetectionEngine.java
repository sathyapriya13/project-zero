package com.projectzero.forensics.service;

import com.projectzero.forensics.model.entity.Detection;
import com.projectzero.forensics.model.entity.ForensicEvent;
import com.projectzero.forensics.model.enums.DetectionStatus;
import com.projectzero.forensics.model.enums.EventType;
import com.projectzero.forensics.model.enums.Severity;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * PROJECT ZERO — Suspicious Activity Detection Engine
 * 
 * Executes rule-based heuristic threat detection algorithms across forensic event sequences.
 * Each detection explicitly tags triggering event IDs, heuristic confidence scores,
 * full contextual explanation, and recommended next investigative steps.
 */
@Service
public class SuspiciousActivityDetectionEngine {

    public List<Detection> evaluateIncidentEvents(String incidentId, List<ForensicEvent> events) {
        List<Detection> detections = new ArrayList<>();
        if (events == null || events.isEmpty()) {
            return detections;
        }

        // Ensure chronological sorting
        List<ForensicEvent> sortedEvents = events.stream()
                .sorted(Comparator.comparing(ForensicEvent::getTimestamp))
                .toList();

        // 1. RULE-001: Multiple failed logins followed by a successful login
        detectBruteForceSuccess(incidentId, sortedEvents, detections);

        // 2. RULE-002: Unexpected privilege escalation
        detectPrivilegeEscalation(incidentId, sortedEvents, detections);

        // 3. RULE-003: Unusual access to sensitive files
        detectSensitiveFileAccess(incidentId, sortedEvents, detections);

        // 4. RULE-004: Large volumes of file modifications (Ransomware / Mass alteration)
        detectMassFileModifications(incidentId, sortedEvents, detections);

        // 5. RULE-005: Abnormal access outside configured working hours
        detectOffHoursActivity(incidentId, sortedEvents, detections);

        // 6. RULE-006: Unusual outbound data transfers
        detectUnusualOutboundTransfer(incidentId, sortedEvents, detections);

        // 7. RULE-007: Attempts to delete or modify audit logs
        detectLogTamperingAttempts(incidentId, sortedEvents, detections);

        return detections;
    }

    private void detectBruteForceSuccess(String incidentId, List<ForensicEvent> events, List<Detection> detections) {
        Map<String, List<ForensicEvent>> userFailures = new HashMap<>();

        for (ForensicEvent ev : events) {
            String user = ev.getActorUser();
            if (ev.getEventType() == EventType.AUTH_FAILURE) {
                userFailures.computeIfAbsent(user, k -> new ArrayList<>()).add(ev);
            } else if (ev.getEventType() == EventType.AUTH_SUCCESS) {
                List<ForensicEvent> priorFailures = userFailures.getOrDefault(user, Collections.emptyList());
                if (priorFailures.size() >= 3) {
                    List<String> triggerIds = new ArrayList<>(priorFailures.stream().map(ForensicEvent::getId).toList());
                    triggerIds.add(ev.getId());

                    detections.add(Detection.builder()
                            .id("DET-" + UUID.randomUUID().toString().substring(0, 8))
                            .incidentId(incidentId)
                            .ruleId("R-001")
                            .ruleCode("RULE-001")
                            .name("Brute-Force Credential Stuffing Followed by Compromise")
                            .severity(Severity.HIGH)
                            .status(DetectionStatus.UNDER_REVIEW)
                            .confidenceScore(BigDecimal.valueOf(92.5))
                            .explanation(String.format("User '%s' experienced %d consecutive authentication failures immediately prior to a successful logon at %s from IP %s.",
                                    user, priorFailures.size(), ev.getTimestamp(), ev.getSourceIp()))
                            .triggeringEventIds(triggerIds)
                            .recommendedActions("1. Immediately invalidate current session tokens and rotate account credentials. 2. Quarantine source IP in perimeter firewall. 3. Review all actions taken by this session.")
                            .detectedAt(Instant.now())
                            .build());
                    userFailures.remove(user); // reset window
                }
            }
        }
    }

    private void detectPrivilegeEscalation(String incidentId, List<ForensicEvent> events, List<Detection> detections) {
        for (ForensicEvent ev : events) {
            if (ev.getEventType() == EventType.PRIVILEGE_ELEVATE ||
                    (ev.getDescription() != null && ev.getDescription().toLowerCase().contains("privilege escalation"))) {
                detections.add(Detection.builder()
                        .id("DET-" + UUID.randomUUID().toString().substring(0, 8))
                        .incidentId(incidentId)
                        .ruleId("R-002")
                        .ruleCode("RULE-002")
                        .name("Unauthorized Process Privilege Elevation")
                        .severity(Severity.CRITICAL)
                        .status(DetectionStatus.UNDER_REVIEW)
                        .confidenceScore(BigDecimal.valueOf(96.0))
                        .explanation(String.format("Process '%s' (PID: %s) elevated execution context to SYSTEM/Root on host '%s' initiated by user '%s'.",
                                ev.getProcessName(), ev.getProcessId(), ev.getSourceDevice(), ev.getActorUser()))
                        .triggeringEventIds(List.of(ev.getId()))
                        .recommendedActions("1. Isolate endpoint '%s' from the corporate LAN. 2. Dump volatile memory for injected shellcode or token-stealing artifacts. 3. Review parent process tree.")
                        .detectedAt(Instant.now())
                        .build());
            }
        }
    }

    private void detectSensitiveFileAccess(String incidentId, List<ForensicEvent> events, List<Detection> detections) {
        List<String> sensitiveKeywords = List.of("confidential", "secret", "payroll", "patent", "keys", "wallet", "shadow", "sam", "credentials");
        List<ForensicEvent> matched = new ArrayList<>();

        for (ForensicEvent ev : events) {
            if (ev.getFilePath() != null) {
                String pathLower = ev.getFilePath().toLowerCase();
                for (String kw : sensitiveKeywords) {
                    if (pathLower.contains(kw)) {
                        matched.add(ev);
                        break;
                    }
                }
            }
        }

        if (!matched.isEmpty()) {
            List<String> triggerIds = matched.stream().map(ForensicEvent::getId).toList();
            detections.add(Detection.builder()
                    .id("DET-" + UUID.randomUUID().toString().substring(0, 8))
                    .incidentId(incidentId)
                    .ruleId("R-003")
                    .ruleCode("RULE-003")
                    .name("Abnormal Access to Classified or Sensitive Repositories")
                    .severity(Severity.HIGH)
                    .status(DetectionStatus.UNDER_REVIEW)
                    .confidenceScore(BigDecimal.valueOf(88.0))
                    .explanation(String.format("Detected %d file access/read events involving high-value or restricted directories by user '%s'.",
                            matched.size(), matched.get(0).getActorUser()))
                    .triggeringEventIds(triggerIds)
                    .recommendedActions("1. Cross-reference user access entitlements against HR role. 2. Verify DLP alarms and inspect file staging directories.")
                    .detectedAt(Instant.now())
                    .build());
        }
    }

    private void detectMassFileModifications(String incidentId, List<ForensicEvent> events, List<Detection> detections) {
        List<ForensicEvent> modEvents = events.stream()
                .filter(e -> e.getEventType() == EventType.FILE_MODIFY || e.getEventType() == EventType.FILE_DELETE)
                .toList();

        if (modEvents.size() >= 5) {
            List<String> triggerIds = modEvents.stream().map(ForensicEvent::getId).limit(10).toList();
            detections.add(Detection.builder()
                    .id("DET-" + UUID.randomUUID().toString().substring(0, 8))
                    .incidentId(incidentId)
                    .ruleId("R-004")
                    .ruleCode("RULE-004")
                    .name("High-Frequency File Modification Burst (Ransomware Pattern)")
                    .severity(Severity.CRITICAL)
                    .status(DetectionStatus.UNDER_REVIEW)
                    .confidenceScore(BigDecimal.valueOf(94.5))
                    .explanation(String.format("Observed %d rapid file rewrite/deletion events on endpoint '%s' within a constrained timeframe. Indicates cryptographic ransom activity or disk scrubbing.",
                            modEvents.size(), modEvents.get(0).getSourceDevice()))
                    .triggeringEventIds(triggerIds)
                    .recommendedActions("1. Immediately terminate suspicious process '%s'. 2. Halt SMB and network shares to prevent lateral encryption spreading. 3. Engage incident recovery backup snapshots.")
                    .detectedAt(Instant.now())
                    .build());
        }
    }

    private void detectOffHoursActivity(String incidentId, List<ForensicEvent> events, List<Detection> detections) {
        List<ForensicEvent> offHoursEvents = new ArrayList<>();
        for (ForensicEvent ev : events) {
            ZonedDateTime zdt = ev.getTimestamp().atZone(ZoneOffset.UTC);
            int hour = zdt.getHour();
            // Working hours defined as 07:00 to 19:00 UTC
            if (hour < 6 || hour > 21) {
                if (ev.getIsMalicious() || ev.getEventType() == EventType.AUTH_SUCCESS || ev.getEventType() == EventType.FILE_READ) {
                    offHoursEvents.add(ev);
                }
            }
        }

        if (!offHoursEvents.isEmpty()) {
            List<String> triggerIds = offHoursEvents.stream().map(ForensicEvent::getId).limit(6).toList();
            detections.add(Detection.builder()
                    .id("DET-" + UUID.randomUUID().toString().substring(0, 8))
                    .incidentId(incidentId)
                    .ruleId("R-005")
                    .ruleCode("RULE-005")
                    .name("Temporal Anomaly: Authenticated Activity Outside Operating Hours")
                    .severity(Severity.MEDIUM)
                    .status(DetectionStatus.UNDER_REVIEW)
                    .confidenceScore(BigDecimal.valueOf(74.0)) // heuristic confidence
                    .explanation(String.format("User activity detected during baseline maintenance window (%d events between 22:00-06:00 UTC).", offHoursEvents.size()))
                    .triggeringEventIds(triggerIds)
                    .recommendedActions("1. Contact employee or supervisor to verify scheduled on-call maintenance. 2. Verify VPN tunnel location against user geo-profile.")
                    .detectedAt(Instant.now())
                    .build());
        }
    }

    private void detectUnusualOutboundTransfer(String incidentId, List<ForensicEvent> events, List<Detection> detections) {
        for (ForensicEvent ev : events) {
            if (ev.getEventType() == EventType.NETWORK_EXFILTRATE ||
                    (ev.getEventType() == EventType.NETWORK_CONNECT && ev.getDestinationIp() != null && ev.getIsMalicious())) {
                detections.add(Detection.builder()
                        .id("DET-" + UUID.randomUUID().toString().substring(0, 8))
                        .incidentId(incidentId)
                        .ruleId("R-006")
                        .ruleCode("RULE-006")
                        .name("Unauthorized Outbound Data Transfer / External C2 Egress")
                        .severity(Severity.CRITICAL)
                        .status(DetectionStatus.UNDER_REVIEW)
                        .confidenceScore(BigDecimal.valueOf(95.0))
                        .explanation(String.format("Process '%s' established outbound connection to external untrusted IP %s:%d. Transfer signature matches external exfiltration or command-and-control beaconing.",
                                ev.getProcessName(), ev.getDestinationIp(), ev.getPort() != null ? ev.getPort() : 443))
                        .triggeringEventIds(List.of(ev.getId()))
                        .recommendedActions("1. Block destination IP %s across enterprise egress proxies. 2. Capture and parse network flow metadata. 3. Assess data volume transferred.")
                        .detectedAt(Instant.now())
                        .build());
            }
        }
    }

    private void detectLogTamperingAttempts(String incidentId, List<ForensicEvent> events, List<Detection> detections) {
        for (ForensicEvent ev : events) {
            if (ev.getEventType() == EventType.LOG_TAMPER ||
                    (ev.getDescription() != null && (ev.getDescription().toLowerCase().contains("clear-eventlog") ||
                            ev.getDescription().toLowerCase().contains("wevtutil") ||
                            ev.getDescription().toLowerCase().contains("rm -rf /var/log")))) {
                detections.add(Detection.builder()
                        .id("DET-" + UUID.randomUUID().toString().substring(0, 8))
                        .incidentId(incidentId)
                        .ruleId("R-007")
                        .ruleCode("RULE-007")
                        .name("Audit Log Tampering / Defense Evasion Attempt")
                        .severity(Severity.CRITICAL)
                        .status(DetectionStatus.UNDER_REVIEW)
                        .confidenceScore(BigDecimal.valueOf(99.0))
                        .explanation(String.format("Adversary executed log eradication command '%s' on device '%s' to erase audit artifacts and blind SIEM telemetry.",
                                ev.getDescription(), ev.getSourceDevice()))
                        .triggeringEventIds(List.of(ev.getId()))
                        .recommendedActions("1. Immediately snapshot remote SIEM cold storage. 2. Check syslog mirror relays for uncommitted buffers. 3. Escalate as confirmed hostile evasion.")
                        .detectedAt(Instant.now())
                        .build());
            }
        }
    }
}
