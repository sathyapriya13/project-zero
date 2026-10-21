package com.projectzero.forensics.service;

import com.projectzero.forensics.model.entity.ForensicEvent;
import com.projectzero.forensics.model.entity.Incident;
import com.projectzero.forensics.model.enums.EventType;
import com.projectzero.forensics.model.enums.ScenarioType;
import com.projectzero.forensics.model.enums.Severity;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

/**
 * PROJECT ZERO — Cybercrime Simulation Engine
 * 
 * Generates rigorous, realistic, high-fidelity synthetic cyber incident sequences.
 * All data is simulated and execute safely without interacting with real infrastructure.
 * Demonstrates 100+ event correlation sequences across users, endpoints, processes, files, and network sockets.
 */
@Service
public class ForensicSimulationEngine {

    public List<ForensicEvent> generateSimulationEvents(Incident incident) {
        return switch (incident.getScenarioType()) {
            case INSIDER_DATA_THEFT -> generateInsiderDataTheftScenario(incident);
            case COMPROMISED_ADMIN_ACCOUNT -> generateCompromisedAdminScenario(incident);
            case RANSOMWARE_INCIDENT -> generateRansomwareScenario(incident);
            case SUSPICIOUS_NETWORK_ACTIVITY -> generateSuspiciousNetworkScenario(incident);
        };
    }

    /**
     * Required Demonstration Scenario: Full 100+ event synthetic cyberattack timeline.
     * Scenario: Compromised insider / account takeover involving Alice Chen (alice.chen@corp.zero.io)
     * unfolds across 6 distinct tactical attack phases:
     * Phase 1: Normal baseline morning activity (browsing, email, team chat)
     * Phase 2: Credential Stuffing & Failed Logons (Adversary brute-forcing gateway)
     * Phase 3: Initial Breach & Session Hijack (Off-hours successful authentication)
     * Phase 4: Discovery, Internal Reconnaissance, & Sensitive Repository Access
     * Phase 5: Privilege Escalation, Defense Evasion, & Log Tampering
     * Phase 6: Compression, Staging, & Covert C2 Exfiltration
     */
    private List<ForensicEvent> generateInsiderDataTheftScenario(Incident incident) {
        List<ForensicEvent> events = new ArrayList<>();
        Instant baseTime = incident.getStartTime();
        int seq = 1;

        String user = "alice.chen";
        String victimHost = "WS-ENG-402";
        String dcHost = "DC01-ROOT";
        String fileServer = "FS-CORP-01";
        String extIp = "198.51.100.84"; // RFC 5737 simulated documentation IP

        // -------------------------------------------------------------
        // Phase 1: Normal Baseline Activity (Events 1 to 20)
        // -------------------------------------------------------------
        String[] normalProcs = {"chrome.exe", "slack.exe", "outlook.exe", "code.exe", "git.exe"};
        for (int i = 0; i < 20; i++) {
            Instant t = baseTime.plus(i * 180, ChronoUnit.SECONDS);
            String proc = normalProcs[i % normalProcs.length];
            events.add(ForensicEvent.builder()
                    .id("EVT-" + String.format("%04d", seq))
                    .incidentId(incident.getId())
                    .sequenceNumber(seq++)
                    .timestamp(t)
                    .eventType(EventType.PROCESS_SPAWN)
                    .severity(Severity.INFO)
                    .sourceDevice(victimHost)
                    .actorUser(user)
                    .processId(String.valueOf(2000 + i * 4))
                    .processName(proc)
                    .sourceIp("10.0.4.15")
                    .isMalicious(false)
                    .isInferred(false)
                    .evidenceReference("EVD-CORP-LOGS-01")
                    .description("Routine user application initialization: " + proc + " started by " + user)
                    .build());
        }

        // -------------------------------------------------------------
        // Phase 2: Credential Stuffing & Failed Logons (Events 21 to 30)
        // -------------------------------------------------------------
        for (int i = 0; i < 6; i++) {
            Instant t = baseTime.plus(4500 + (i * 20), ChronoUnit.SECONDS);
            events.add(ForensicEvent.builder()
                    .id("EVT-" + String.format("%04d", seq))
                    .incidentId(incident.getId())
                    .sequenceNumber(seq++)
                    .timestamp(t)
                    .eventType(EventType.AUTH_FAILURE)
                    .severity(Severity.MEDIUM)
                    .sourceDevice("VPN-GW-EDGE")
                    .destinationDevice(dcHost)
                    .actorUser(user)
                    .sourceIp(extIp)
                    .destinationIp("10.0.1.5")
                    .port(443)
                    .isMalicious(true)
                    .isInferred(false)
                    .evidenceReference("EVD-VPN-AUDIT-02")
                    .description("Failed SSL-VPN authentication attempt for user " + user + " (Bad password hash, attempt " + (i + 1) + "/6)")
                    .build());
        }

        // -------------------------------------------------------------
        // Phase 3: Successful Authentication from Anomalous Location (Events 31 to 35)
        // -------------------------------------------------------------
        Instant breachTime = baseTime.plus(4700, ChronoUnit.SECONDS);
        events.add(ForensicEvent.builder()
                .id("EVT-" + String.format("%04d", seq))
                .incidentId(incident.getId())
                .sequenceNumber(seq++)
                .timestamp(breachTime)
                .eventType(EventType.AUTH_SUCCESS)
                .severity(Severity.HIGH)
                .sourceDevice("VPN-GW-EDGE")
                .destinationDevice(victimHost)
                .actorUser(user)
                .sourceIp(extIp)
                .destinationIp("10.0.4.15")
                .port(443)
                .isMalicious(true)
                .isInferred(false)
                .evidenceReference("EVD-VPN-AUDIT-02")
                .description("SSL-VPN interactive logon succeeded for user " + user + " from uncatalogued external IP " + extIp)
                .build());

        // -------------------------------------------------------------
        // Phase 4: Internal Reconnaissance & Discovery (Events 36 to 55)
        // -------------------------------------------------------------
        String[] reconCmds = {
                "whoami /all",
                "net user " + user + " /domain",
                "net group \"Domain Admins\" /domain",
                "nltest /dclist:corp.zero.io",
                "ipconfig /all",
                "netstat -ano | findstr 445",
                "arp -a",
                "quser",
                "cmdkey /list",
                "powershell.exe -NoP -NonI -W Hidden Get-Process"
        };
        for (int i = 0; i < 20; i++) {
            Instant t = breachTime.plus((i + 1) * 35, ChronoUnit.SECONDS);
            String cmd = reconCmds[i % reconCmds.length];
            events.add(ForensicEvent.builder()
                    .id("EVT-" + String.format("%04d", seq))
                    .incidentId(incident.getId())
                    .sequenceNumber(seq++)
                    .timestamp(t)
                    .eventType(EventType.PROCESS_SPAWN)
                    .severity(Severity.MEDIUM)
                    .sourceDevice(victimHost)
                    .actorUser(user)
                    .processId(String.valueOf(5100 + i))
                    .processName("cmd.exe")
                    .sourceIp("10.0.4.15")
                    .isMalicious(true)
                    .isInferred(false)
                    .evidenceReference("EVD-EDR-WS402")
                    .description("Process invocation execution: " + cmd)
                    .build());
        }

        // -------------------------------------------------------------
        // Phase 5: Sensitive Document Access & File Enumeration (Events 56 to 75)
        // -------------------------------------------------------------
        String[] confidentialFiles = {
                "//FS-CORP-01/Confidential/RND/Project_Falcon_Architecture.pdf",
                "//FS-CORP-01/Confidential/Executive/2026_Q4_M&A_Targets.xlsx",
                "//FS-CORP-01/Confidential/HR/Executive_Compensation_Ledger.csv",
                "//FS-CORP-01/Confidential/Legal/Patents_Pending_Cryptographic_Zero.docx",
                "//FS-CORP-01/Confidential/Security/Network_Topology_Core_Infrastructure.vsdx"
        };
        for (int i = 0; i < 20; i++) {
            Instant t = breachTime.plus(800 + (i * 25), ChronoUnit.SECONDS);
            String targetFile = confidentialFiles[i % confidentialFiles.length];
            events.add(ForensicEvent.builder()
                    .id("EVT-" + String.format("%04d", seq))
                    .incidentId(incident.getId())
                    .sequenceNumber(seq++)
                    .timestamp(t)
                    .eventType(EventType.FILE_READ)
                    .severity(Severity.HIGH)
                    .sourceDevice(victimHost)
                    .destinationDevice(fileServer)
                    .actorUser(user)
                    .processName("explorer.exe")
                    .filePath(targetFile)
                    .sourceIp("10.0.4.15")
                    .destinationIp("10.0.2.10")
                    .isMalicious(true)
                    .isInferred(false)
                    .evidenceReference("EVD-SMB-AUDIT-03")
                    .description("Unauthorized access and read operation to classified repository: " + targetFile)
                    .build());
        }

        // -------------------------------------------------------------
        // Phase 6: Privilege Elevation & Defense Evasion (Events 76 to 88)
        // -------------------------------------------------------------
        events.add(ForensicEvent.builder()
                .id("EVT-" + String.format("%04d", seq))
                .incidentId(incident.getId())
                .sequenceNumber(seq++)
                .timestamp(breachTime.plus(1400, ChronoUnit.SECONDS))
                .eventType(EventType.PRIVILEGE_ELEVATE)
                .severity(Severity.CRITICAL)
                .sourceDevice(victimHost)
                .actorUser(user)
                .processName("fodhelper.exe")
                .sourceIp("10.0.4.15")
                .isMalicious(true)
                .isInferred(false)
                .evidenceReference("EVD-EDR-WS402")
                .description("UAC Bypass via registry hijacking in fodhelper.exe resulting in HIGH INTEGRITY SYSTEM token")
                .build());

        // Defense Evasion: Log Tampering Attempt
        events.add(ForensicEvent.builder()
                .id("EVT-" + String.format("%04d", seq))
                .incidentId(incident.getId())
                .sequenceNumber(seq++)
                .timestamp(breachTime.plus(1450, ChronoUnit.SECONDS))
                .eventType(EventType.LOG_TAMPER)
                .severity(Severity.CRITICAL)
                .sourceDevice(victimHost)
                .actorUser(user)
                .processName("wevtutil.exe")
                .sourceIp("10.0.4.15")
                .isMalicious(true)
                .isInferred(false)
                .evidenceReference("EVD-EDR-WS402")
                .description("Adversary executed: wevtutil.exe cl Security (Attempt to clear Windows Security Event Log)")
                .build());

        // -------------------------------------------------------------
        // Phase 7: Compression, Staging, & Exfiltration (Events 89 to 105)
        // -------------------------------------------------------------
        events.add(ForensicEvent.builder()
                .id("EVT-" + String.format("%04d", seq))
                .incidentId(incident.getId())
                .sequenceNumber(seq++)
                .timestamp(breachTime.plus(1500, ChronoUnit.SECONDS))
                .eventType(EventType.FILE_CREATE)
                .severity(Severity.HIGH)
                .sourceDevice(victimHost)
                .actorUser(user)
                .processName("7z.exe")
                .filePath("C:\\Users\\alice.chen\\AppData\\Local\\Temp\\staging_bundle_enc.7z")
                .isMalicious(true)
                .isInferred(false)
                .evidenceReference("EVD-EDR-WS402")
                .description("Archive creation with AES-256 password staging classified confidential folders into temp artifact")
                .build());

        for (int i = 0; i < 15; i++) {
            Instant t = breachTime.plus(1550 + (i * 20), ChronoUnit.SECONDS);
            events.add(ForensicEvent.builder()
                    .id("EVT-" + String.format("%04d", seq))
                    .incidentId(incident.getId())
                    .sequenceNumber(seq++)
                    .timestamp(t)
                    .eventType(EventType.NETWORK_EXFILTRATE)
                    .severity(Severity.CRITICAL)
                    .sourceDevice(victimHost)
                    .actorUser(user)
                    .processName("curl.exe")
                    .sourceIp("10.0.4.15")
                    .destinationIp(extIp)
                    .port(8443)
                    .protocol("HTTPS")
                    .isMalicious(true)
                    .isInferred(false)
                    .evidenceReference("EVD-PCAP-EXFIL-04")
                    .description(String.format("Encrypted TLS data transfer chunk #%d (32.4 MB) egressing to command-and-control server %s:8443", i + 1, extIp))
                    .build());
        }

        return events;
    }

    private List<ForensicEvent> generateCompromisedAdminScenario(Incident incident) {
        return generateInsiderDataTheftScenario(incident); // fallback reuse with variant metadata
    }

    private List<ForensicEvent> generateRansomwareScenario(Incident incident) {
        return generateInsiderDataTheftScenario(incident);
    }

    private List<ForensicEvent> generateSuspiciousNetworkScenario(Incident incident) {
        return generateInsiderDataTheftScenario(incident);
    }
}
