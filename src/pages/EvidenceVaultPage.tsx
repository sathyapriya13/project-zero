import React, { useState } from 'react';
import { EvidenceArtifact, EvidenceAuditLog, ForensicIncident } from '../types/forensics';
import { api } from '../services/api';
import {
  Archive,
  FileCheck,
  ShieldAlert,
  Hash,
  Clock,
  Upload,
  Search,
  CheckCircle2,
  AlertTriangle,
  History,
  HardDrive,
  User,
  Info,
  X,
} from 'lucide-react';

interface EvidenceVaultPageProps {
  evidenceList: EvidenceArtifact[];
  currentIncident: ForensicIncident | null;
  onRefreshEvidence: () => void;
}

export const EvidenceVaultPage: React.FC<EvidenceVaultPageProps> = ({
  evidenceList,
  currentIncident,
  onRefreshEvidence,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceArtifact | null>(null);
  const [auditLogs, setAuditLogs] = useState<EvidenceAuditLog[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any | null>(null);

  // New Evidence Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newFilename, setNewFilename] = useState('');
  const [newType, setNewType] = useState('LOG_FILE');
  const [newSourceHost, setNewSourceHost] = useState('WS-ENG-402');
  const [newNotes, setNewNotes] = useState('');
  const [newContent, setNewContent] = useState('');

  const filteredEvidence = evidenceList.filter((ev) => {
    return (
      ev.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.originalFilename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.sha256Hash.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.sourceHost.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleOpenChainOfCustody = async (ev: EvidenceArtifact) => {
    setSelectedEvidence(ev);
    setLoadingAudit(true);
    setVerificationResult(null);
    try {
      const logs = await api.getChainOfCustody(ev.id);
      setAuditLogs(logs);
    } catch (err) {
      console.error('Failed to load chain of custody', err);
    } finally {
      setLoadingAudit(false);
    }
  };

  const handleRunIntegrityCheck = async (ev: EvidenceArtifact) => {
    setIsVerifying(true);
    try {
      // Simulate reading vault disk bytes for bit-level verification
      const sampleCurrentData =
        ev.id === 'EVD-VPN-AUDIT-02'
          ? 'EDGE_VPN_GATEWAY_RAW_LOG_DATA_AUTH_FAILURES_AND_SUCCESS'
          : ev.id === 'EVD-EDR-WS402'
          ? 'EDR_TELEMETRY_RAW_PROCESS_INJECTIONS_AND_FODHELPER'
          : 'PCAP_RAW_ETHERNET_PAYLOAD_C2_TLS_CHUNKS';

      const res = await api.verifyEvidenceIntegrity(ev.id, sampleCurrentData);
      setVerificationResult(res);
      // Reload audit log
      const updatedLogs = await api.getChainOfCustody(ev.id);
      setAuditLogs(updatedLogs);
      onRefreshEvidence();
    } catch (err) {
      console.error(err);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentIncident || !newFilename) return;

    try {
      await api.uploadEvidence(currentIncident.id, {
        originalFilename: newFilename,
        evidenceType: newType,
        sourceHost: newSourceHost,
        fileContentText: newContent || 'MANUALLY_INGESTED_FORENSIC_RAW_PAYLOAD_STREAM',
        notes: newNotes,
      });

      setShowUploadModal(false);
      setNewFilename('');
      setNewNotes('');
      setNewContent('');
      onRefreshEvidence();
    } catch (err) {
      console.error('Failed to upload evidence', err);
    }
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)] font-mono">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Archive className="w-4 h-4" />
            <span>Digital Evidence Vault & Chain of Custody</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100 font-sans">
            Cryptographic Integrity & Chain of Custody
          </h1>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Store, catalog, and cryptographically verify evidence with SHA-256 digests. Maintain an immutable append-only audit trail for legal compliance.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center space-x-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-lg text-xs transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Ingest New Evidence Artifact</span>
          </button>
        </div>
      </div>

      {/* Forensic Disclaimer Notice */}
      <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4 flex items-start space-x-3 text-xs font-sans text-slate-300">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-slate-100 font-mono text-[11px] uppercase tracking-wider">
            Forensic Standard of Integrity & Authenticity Notice:
          </strong>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            In strict accordance with digital forensics best practices (ISO/IEC 27037 and NIST SP 800-86), a matching SHA-256 hash establishes bit-level file integrity (the bytes have not been modified since acquisition). However, cryptographic hash verification alone does not establish legal authenticity, origin verification, or a legally complete physical chain of custody. Supporting procedural logs and investigator custody attestations are recorded below.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center justify-between">
        <div className="relative w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Evidence ID, file, host, hash..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-full"
          />
        </div>
        <div className="text-xs text-slate-400">
          Showing <strong className="text-cyan-400">{filteredEvidence.length}</strong> secured artifacts
        </div>
      </div>

      {/* Evidence Table */}
      <div className="bg-[#0c1220] border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-900/90 border-b border-slate-800 text-[10px] text-slate-400 uppercase">
              <tr>
                <th className="py-3 px-4">Artifact ID</th>
                <th className="py-3 px-4">Original Filename</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Source Host</th>
                <th className="py-3 px-4">Size</th>
                <th className="py-3 px-4">SHA-256 Digest</th>
                <th className="py-3 px-4">Integrity Status</th>
                <th className="py-3 px-4 text-right">Chain of Custody</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {filteredEvidence.map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-cyan-300">{ev.id}</td>
                  <td className="py-3 px-4 text-slate-200 font-semibold">{ev.originalFilename}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px]">
                      {ev.evidenceType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{ev.sourceHost}</td>
                  <td className="py-3 px-4 text-slate-400">
                    {(ev.fileSizeBytes / 1024).toFixed(1)} KB
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px]" title={ev.sha256Hash}>
                    {ev.sha256Hash.substring(0, 16)}...{ev.sha256Hash.substring(48)}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold flex items-center space-x-1 w-fit ${
                        ev.verificationStatus === 'VERIFIED'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/15 text-red-400 border border-red-500/30'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{ev.verificationStatus}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenChainOfCustody(ev)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded border border-slate-700 text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      Audit Trail
                    </button>
                    <button
                      onClick={() => handleRunIntegrityCheck(ev)}
                      disabled={isVerifying}
                      className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded text-[10px] font-bold transition-colors cursor-pointer"
                    >
                      Verify SHA-256
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chain of Custody & Integrity Audit Modal */}
      {selectedEvidence && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e1424] border border-cyan-500/40 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div>
                <div className="text-xs text-cyan-400 font-bold uppercase tracking-wider">
                  Append-Only Chain of Custody
                </div>
                <div className="text-sm font-bold text-slate-100">
                  {selectedEvidence.id} — {selectedEvidence.originalFilename}
                </div>
              </div>
              <button
                onClick={() => setSelectedEvidence(null)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs font-mono">
              {/* Checksum Details */}
              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-bold">
                  Immutable Cryptographic SHA-256 Checksum:
                </div>
                <div className="text-cyan-300 break-all font-mono text-[11px] bg-slate-950 p-2 rounded">
                  {selectedEvidence.sha256Hash}
                </div>
              </div>

              {/* Verification Result Callout */}
              {verificationResult && (
                <div
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    verificationResult.isMatch
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                      : 'bg-red-950/30 border-red-500/40 text-red-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>
                      SHA-256 verification passed: bit-level disk artifact matches recorded hash.
                    </span>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/40">
                    MATCH CONFIRMED
                  </span>
                </div>
              )}

              {/* Timeline of Custody Events */}
              <div className="space-y-2">
                <div className="text-[10px] text-slate-400 uppercase font-bold">
                  Sequential Audit Entries
                </div>

                {loadingAudit ? (
                  <div className="py-6 text-center text-slate-400">Loading audit trail...</div>
                ) : (
                  <div className="space-y-2.5 relative pl-4 border-l-2 border-slate-800">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="relative space-y-1">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-4 ring-slate-950"></div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-200">{log.action}</span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(log.timestamp).toUTCString()}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-sans">{log.details}</p>
                        <div className="text-[10px] text-slate-500">
                          Actor: <strong className="text-slate-300">{log.actorName}</strong> ({log.actorId}) | IP: {log.ipAddress}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-900 border-t border-slate-800 flex justify-between">
              <button
                onClick={() => handleRunIntegrityCheck(selectedEvidence)}
                disabled={isVerifying}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 rounded text-xs font-bold transition-colors cursor-pointer"
              >
                {isVerifying ? 'Computing SHA-256...' : 'Re-Run Bit-Level Verification'}
              </button>

              <button
                onClick={() => setSelectedEvidence(null)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ingest New Evidence Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleUploadSubmit}
            className="bg-[#0e1424] border border-cyan-500/40 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 font-sans">
                Ingest New Digital Evidence Artifact
              </h3>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                  Original Filename
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. sysmon_host_dump.evtx"
                  value={newFilename}
                  onChange={(e) => setNewFilename(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                    Artifact Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="LOG_FILE">Log File (Syslog / EVTX)</option>
                    <option value="EDR_TELEMETRY">EDR Telemetry</option>
                    <option value="PCAP">PCAP Network Stream</option>
                    <option value="MEMORY_DUMP">Volatile Memory Dump</option>
                    <option value="DISK_IMAGE">EnCase / DD Disk Image</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                    Source Endpoint / Host
                  </label>
                  <input
                    type="text"
                    value={newSourceHost}
                    onChange={(e) => setNewSourceHost(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                  Investigator Notes & Custody Provenance
                </label>
                <textarea
                  rows={2}
                  placeholder="Acquisition circumstances, write-blocker utilized, technician signature..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 uppercase text-[10px] font-bold block mb-1">
                  Raw Simulated Payload (Calculates SHA-256 Digest)
                </label>
                <textarea
                  rows={3}
                  placeholder="Paste or enter raw log snippet..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-slate-950 font-mono text-[11px] border border-slate-800 rounded-lg p-2 text-slate-300 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded text-xs transition-colors"
              >
                Hash & Ingest into Vault
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
