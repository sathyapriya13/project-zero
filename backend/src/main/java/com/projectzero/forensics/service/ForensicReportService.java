package com.projectzero.forensics.service;

import com.projectzero.forensics.dto.InvestigationGraphDto;
import com.projectzero.forensics.model.entity.Detection;
import com.projectzero.forensics.model.entity.Evidence;
import com.projectzero.forensics.model.entity.ForensicEvent;
import com.projectzero.forensics.model.entity.Incident;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.Instant;
import java.util.List;

/**
 * PROJECT ZERO — Forensic PDF Report Generator
 * 
 * Compiles a comprehensive, court-admissible or C-suite ready digital forensic report
 * using Apache PDFBox. Incorporates deterministic facts, heuristic detection findings,
 * chain-of-custody cryptographic hashes, and forensic limitation disclaimers.
 */
@Service
public class ForensicReportService {

    public byte[] generateForensicPdf(
            Incident incident,
            List<ForensicEvent> events,
            List<Detection> detections,
            List<Evidence> evidenceList,
            InvestigationGraphDto graphDto,
            String investigatorNotes) throws IOException {

        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage(PDRectangle.A4);
            document.addPage(page);

            try (PDPageContentStream cs = new PDPageContentStream(document, page)) {
                // Header Banner
                cs.beginText();
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 18);
                cs.newLineAtOffset(50, 780);
                cs.showText("PROJECT ZERO // FORENSIC INVESTIGATION REPORT");
                cs.endText();

                cs.beginText();
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 10);
                cs.newLineAtOffset(50, 765);
                cs.showText("Tagline: Every digital crime leaves a trace. Rewind the evidence.");
                cs.endText();

                // Horizontal Rule
                cs.setLineWidth(1.0f);
                cs.moveTo(50, 755);
                cs.lineTo(550, 755);
                cs.stroke();

                // Incident Metadata
                float y = 735;
                cs.beginText();
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 12);
                cs.newLineAtOffset(50, y);
                cs.showText("1. INCIDENT OVERVIEW");
                cs.endText();

                y -= 20;
                writeLine(cs, 50, y, "Incident ID: " + incident.getId() + " | Title: " + incident.getTitle());
                y -= 15;
                writeLine(cs, 50, y, "Scenario: " + incident.getScenarioType() + " | Severity: " + incident.getSeverity());
                y -= 15;
                writeLine(cs, 50, y, "Timeline Range: " + incident.getStartTime() + " to " + incident.getEndTime());
                y -= 15;
                writeLine(cs, 50, y, "Total Chronological Events: " + events.size() + " | Correlated Graph Nodes: " + graphDto.getNodes().size());

                // Executive Summary
                y -= 30;
                cs.beginText();
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 12);
                cs.newLineAtOffset(50, y);
                cs.showText("2. EXECUTIVE SUMMARY & ATTACK PATH");
                cs.endText();

                y -= 20;
                writeLine(cs, 50, y, "Analysis reconstructed a multi-phase cyber incident culminating in unauthorized file staging");
                y -= 15;
                writeLine(cs, 50, y, "and external TLS data egress. Shortest attack path spans: " + String.join(" -> ", graphDto.getCriticalAttackPath()));

                // Suspicious Activity Detections
                y -= 30;
                cs.beginText();
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 12);
                cs.newLineAtOffset(50, y);
                cs.showText("3. HEURISTIC THREAT DETECTIONS (" + detections.size() + " Alerts)");
                cs.endText();

                for (Detection d : detections.stream().limit(4).toList()) {
                    y -= 18;
                    writeLine(cs, 50, y, String.format("[%s] %s (Conf: %.1f%%) - Events: %s",
                            d.getRuleCode(), d.getName(), d.getConfidenceScore().doubleValue(), String.join(", ", d.getTriggeringEventIds())));
                }

                // Evidence Vault & Hashes
                y -= 30;
                cs.beginText();
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 12);
                cs.newLineAtOffset(50, y);
                cs.showText("4. EVIDENCE VAULT & INTEGRITY CHECKS (SHA-256)");
                cs.endText();

                for (Evidence ev : evidenceList.stream().limit(3).toList()) {
                    y -= 18;
                    writeLine(cs, 50, y, ev.getId() + " | " + ev.getOriginalFilename() + " | SHA-256: " + ev.getSha256Hash().substring(0, 32) + "...");
                }

                // Limitations Disclaimer
                y -= 35;
                cs.beginText();
                cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD), 10);
                cs.newLineAtOffset(50, y);
                cs.showText("5. FORENSIC LIMITATIONS & LEGAL DISCLAIMER");
                cs.endText();

                y -= 15;
                writeLine(cs, 50, y, "Temporal proximity does not guarantee causality. Inferred relationships represent hypothesis.");
                y -= 15;
                writeLine(cs, 50, y, "Cryptographic hashes demonstrate file-level integrity but do not independently establish legal chain of custody.");

                // Footer
                y -= 30;
                writeLine(cs, 50, y, "Generated by PROJECT ZERO Forensic Core on " + Instant.now() + " | Analyst Signature: ___________________");
            }

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            document.save(baos);
            return baos.toByteArray();
        }
    }

    private void writeLine(PDPageContentStream cs, float x, float y, String text) throws IOException {
        cs.beginText();
        cs.setFont(new PDType1Font(Standard14Fonts.FontName.HELVETICA), 9);
        cs.newLineAtOffset(x, y);
        cs.showText(text);
        cs.endText();
    }
}
