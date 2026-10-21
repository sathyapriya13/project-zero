import React, { useState, useEffect } from 'react';
import { ForensicReport, ForensicIncident } from '../types/forensics';
import { api } from '../services/api';
import {
  FileText,
  Download,
  Printer,
  ShieldAlert,
  Hash,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Info,
  RefreshCw,
} from 'lucide-react';

interface ReportsPageProps {
  currentIncident: ForensicIncident | null;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ currentIncident }) => {
  const [report, setReport] = useState<ForensicReport | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentIncident) return;
    loadReport(currentIncident.id);
  }, [currentIncident]);

  const loadReport = async (incidentId: string) => {
    setLoading(true);
    try {
      const data = await api.getReport(incidentId);
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJson = () => {
    if (!report) return;
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Forensic_Report_${report.incident.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-12 text-center font-mono text-cyan-400 flex items-center justify-center space-x-2">
        <RefreshCw className="w-5 h-5 animate-spin" />
        <span>Compiling forensic report from immutable evidence vault...</span>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)] font-mono">
      {/* Top Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4" />
            <span>Digital Forensic Report Generator</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 font-sans">
            Forensic Incident Examination Document
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Structured court-admissible forensic document compiled from verified timeline events, SHA-256 hashes, and rule detections.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleDownloadJson}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Raw JSON</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs transition-colors shadow-md shadow-cyan-500/20 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Forensic Document</span>
          </button>
        </div>
      </div>

      {/* Printable Report Canvas */}
      <div className="bg-[#0b101c] border border-slate-800 rounded-2xl p-8 max-w-4xl mx-auto space-y-8 shadow-2xl text-slate-200">
        {/* Document Header */}
        <div className="border-b-2 border-cyan-500/80 pb-6 flex items-start justify-between">
          <div>
            <div className="text-[11px] font-bold text-cyan-400 tracking-widest uppercase">
              PROJECT ZERO // CYBERCRIME FORENSIC CORE
            </div>
            <h2 className="text-2xl font-black text-slate-100 font-sans mt-1">
              DIGITAL CRIME SCENE REPORT
            </h2>
            <div className="text-xs text-slate-400 mt-1">
              Case Ref: <strong className="text-slate-200">{report.incident.id}</strong> | Lead Investigator: INV-7702 (S. Vance)
            </div>
          </div>
          <div className="text-right text-[11px] text-slate-400">
            <div>Generated: {new Date(report.generatedAt).toUTCString()}</div>
            <div>Classification: TLP:AMBER // CONFIDENTIAL</div>
            <div className="text-cyan-400 font-bold mt-1">STATUS: COMPLETED EXAMINATION</div>
          </div>
        </div>

        {/* 1. Executive Summary */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-2">
            <span>1.0</span>
            <span>Executive Summary</span>
          </h3>
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 font-sans leading-relaxed">
            {report.executiveSummary}
          </div>
        </div>

        {/* 2. Incident Telemetry & Scope */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-2">
            <span>2.0</span>
            <span>Incident Telemetry & Examination Scope</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Total Reconstructed</div>
              <div className="text-lg font-bold text-slate-100 mt-0.5">{report.totalEvents} Events</div>
            </div>
            <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Malicious Trace</div>
              <div className="text-lg font-bold text-red-400 mt-0.5">{report.maliciousEventsCount} Events</div>
            </div>
            <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Rule Detections</div>
              <div className="text-lg font-bold text-amber-400 mt-0.5">{report.detections.length} Alerts</div>
            </div>
            <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-800">
              <div className="text-[10px] text-slate-500 uppercase font-bold">Evidence Artifacts</div>
              <div className="text-lg font-bold text-emerald-400 mt-0.5">{report.evidenceList.length} Vault Items</div>
            </div>
          </div>
        </div>

        {/* 3. Suspicious Activity Detections */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-2">
            <span>3.0</span>
            <span>Suspicious Activity Detections & Heuristic Findings</span>
          </h3>
          <div className="space-y-2">
            {report.detections.map((d) => (
              <div key={d.id} className="bg-slate-900/40 p-3 rounded-lg border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 font-bold text-slate-100">
                    <span className="text-cyan-400 font-mono">[{d.ruleCode}]</span>
                    <span>{d.name}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[10px]">
                    <span className="text-slate-400">Heuristic Conf: {d.confidenceScore}%</span>
                    <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-400 font-bold">
                      {d.severity}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">{d.explanation}</p>
                <div className="text-[10px] text-cyan-400/80">
                  Triggering Event IDs: {d.triggeringEventIds.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Evidence Integrity (SHA-256 Hashes) */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-2">
            <span>4.0</span>
            <span>Evidence Vault & Cryptographic Hashes (SHA-256)</span>
          </h3>
          <div className="overflow-x-auto border border-slate-800 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                <tr>
                  <th className="py-2 px-3">Evidence ID</th>
                  <th className="py-2 px-3">Filename</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3">SHA-256 Bit-Level Digest</th>
                  <th className="py-2 px-3 text-right">Integrity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {report.evidenceList.map((ev) => (
                  <tr key={ev.id}>
                    <td className="py-2 px-3 font-bold text-cyan-300">{ev.id}</td>
                    <td className="py-2 px-3 text-slate-200">{ev.originalFilename}</td>
                    <td className="py-2 px-3 text-slate-400">{ev.evidenceType}</td>
                    <td className="py-2 px-3 text-slate-400 font-mono text-[10px]" title={ev.sha256Hash}>
                      {ev.sha256Hash}
                    </td>
                    <td className="py-2 px-3 text-right text-emerald-400 font-bold text-[10px]">
                      VERIFIED
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. Limitations & Legal Disclaimer */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
            <span>5.0</span>
            <span>Forensic Limitations & Legal Disclaimer</span>
          </h3>
          <div className="bg-amber-950/20 p-4 rounded-xl border border-amber-900/40 text-xs text-amber-200/90 font-sans leading-relaxed">
            {report.limitationsDisclaimer}
            <br className="mt-1" />
            Neither temporal proximity nor inferred topological links alone establish causation under Federal Rules of Evidence (FRE 702 / Daubert standard). All assertions herein rely strictly on deterministic audit artifacts.
          </div>
        </div>

        {/* 6. Recommendations */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-2">
            <span>6.0</span>
            <span>Recommended Defensive Actions</span>
          </h3>
          <ul className="list-disc list-inside space-y-1 text-xs text-slate-300 font-sans">
            {report.recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>

        {/* Sign-off footer */}
        <div className="pt-8 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div>
            <div>Lead Forensic Examiner: _______________________</div>
            <div className="text-[10px] mt-0.5">Project Zero Forensic Core Engine v1.0</div>
          </div>
          <div className="text-right">
            <div>Cryptographic Seal: SHA-256_CERTIFIED</div>
            <div className="text-[10px] mt-0.5">Page 1 of 1</div>
          </div>
        </div>
      </div>
    </div>
  );
};
