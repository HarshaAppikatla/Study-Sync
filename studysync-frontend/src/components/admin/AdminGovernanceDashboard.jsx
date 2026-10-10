import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  FileSearch, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  Hash, 
  User, 
  Clock, 
  Coins, 
  Scale, 
  Flame, 
  Check, 
  X,
  Eye,
  Sparkles,
  FileText,
  Download,
  ExternalLink,
  Copy,
  ZoomIn,
  ZoomOut,
  Printer,
  Building2,
  Award,
  ShieldCheck,
  Database,
  FileCheck
} from 'lucide-react';
import api from '../../services/api';

export default function AdminGovernanceDashboard() {
  const [activeTab, setActiveTab] = useState('transcripts'); // 'transcripts' | 'disputes'
  const [transcripts, setTranscripts] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // Selected modal item for detailed inspection
  const [selectedTranscript, setSelectedTranscript] = useState(null);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [docZoom, setDocZoom] = useState(100);
  const [copiedHash, setCopiedHash] = useState(false);

  const getDaysSinceVerified = (verifiedAt) => {
    if (!verifiedAt) return 0;
    const diffMs = new Date() - new Date(verifiedAt);
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  };

  const getCourseTitle = (code) => {
    const titles = {
      'CSE2001': 'Data Structures & Algorithms',
      'CSE2005': 'Operating Systems & Kernel Internals',
      'CSE3001': 'Advanced Algorithms & Complexity',
      'MAT1001': 'Calculus & Analytical Geometry',
      'MAT2001': 'Applied Linear Algebra',
      'ECE2002': 'Digital System Design & FPGA',
      'DSA': 'Design & Analysis of Algorithms',
      'JAVA101': 'Object Oriented Programming with Java',
      'CSE1002': 'Problem Solving & Programming in Python'
    };
    return titles[code?.toUpperCase()] || `${code} Core Engineering Coursework`;
  };

  const handleCopyHash = (hash) => {
    if (!hash) return;
    navigator.clipboard?.writeText(hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const fetchData = async () => {
    setLoading(true);
    setActionMessage(null);
    try {
      const [transcriptsRes, disputesRes] = await Promise.all([
        api.get('/v1/admin/mentorship/transcripts/flagged').catch(() => ({ data: [] })),
        api.get('/v1/admin/mentorship/sessions/disputed').catch(() => ({ data: [] }))
      ]);
      setTranscripts(transcriptsRes.data || []);
      setDisputes(disputesRes.data || []);
    } catch (err) {
      console.error('Failed to load admin governance data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReviewTranscript = async (id, status) => {
    try {
      await api.put(`/v1/admin/mentorship/transcripts/${id}/review`, {
        status: status,
        reviewNotes: reviewNotes || (status === 'VERIFIED' ? 'Approved by admin' : 'Rejected after inspection')
      });
      setActionMessage({ type: 'success', text: `Transcript #${id} successfully set to ${status}.` });
      setSelectedTranscript(null);
      setReviewNotes('');
      fetchData();
    } catch (err) {
      setActionMessage({ type: 'error', text: err.response?.data?.message || 'Failed to review transcript.' });
    }
  };

  const handleResolveDispute = async (id, action) => {
    try {
      const res = await api.put(`/v1/admin/mentorship/sessions/${id}/resolve-dispute`, {
        action: action,
        resolutionNotes: reviewNotes || 'Resolved by platform admin'
      });
      setActionMessage({ type: 'success', text: res.data });
      setSelectedDispute(null);
      setReviewNotes('');
      fetchData();
    } catch (err) {
      setActionMessage({ type: 'error', text: err.response?.data?.message || 'Failed to resolve dispute.' });
    }
  };

  const handleSeedData = async () => {
    setLoading(true);
    setActionMessage(null);
    try {
      const res = await api.post('/v1/admin/mentorship/seed-sample-data');
      setActionMessage({ type: 'success', text: res.data || 'Sample governance test data seeded successfully!' });
      fetchData();
    } catch (err) {
      setActionMessage({ type: 'error', text: err.response?.data?.message || 'Failed to seed sample test data.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-white p-6 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="p-6 bg-gradient-to-r from-rose-950/60 via-purple-950/40 to-gray-900 border border-rose-800/40 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
            <span>Admin Governance & Security Dashboard</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manual review queue for flagged transcripts, forensic metadata inspection, and escrow dispute resolution.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={handleSeedData}
            disabled={loading}
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-xl text-sm font-semibold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30 disabled:opacity-50"
            title="Populate test queue with flagged transcripts and disputed escrow sessions"
          >
            <Sparkles className="w-4 h-4" />
            <span>Seed Test Data</span>
          </button>

          <button
            onClick={fetchData}
            disabled={loading}
            className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 rounded-xl text-sm font-medium transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Queue</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-bold">{transcripts.filter(t => t.status === 'FLAGGED_TAMPERED').length}</span>
            <span className="text-xs text-gray-400 block">Flagged Transcripts</span>
          </div>
        </div>

        <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
            <FileSearch className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-bold">{transcripts.filter(t => t.status === 'PENDING').length}</span>
            <span className="text-xs text-gray-400 block">Pending Verifications</span>
          </div>
        </div>

        <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-400">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-bold">{disputes.length}</span>
            <span className="text-xs text-gray-400 block">Disputed Escrow Sessions</span>
          </div>
        </div>
      </div>

      {/* Status Alerts */}
      {actionMessage && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-3 border ${
          actionMessage.type === 'success' ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300' : 'bg-rose-950/50 border-rose-500/50 text-rose-300'
        }`}>
          {actionMessage.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-800 gap-6">
        <button
          onClick={() => setActiveTab('transcripts')}
          className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'transcripts' ? 'border-rose-500 text-rose-400' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <FileSearch className="w-4 h-4" />
          <span>Transcript Queue ({transcripts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('disputes')}
          className={`pb-3 text-sm font-semibold border-b-2 transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'disputes' ? 'border-rose-500 text-rose-400' : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Disputed Escrows ({disputes.length})</span>
        </button>
      </div>

      {/* TAB 1: TRANSCRIPT QUEUE */}
      {activeTab === 'transcripts' && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
          {transcripts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-gray-800/60 text-xs uppercase font-semibold text-gray-400 border-b border-gray-800">
                  <tr>
                    <th className="p-4">Student</th>
                    <th className="p-4">Course</th>
                    <th className="p-4">Grade</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Forensic Details</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {transcripts.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-800/30 transition">
                      <td className="p-4">
                        <div className="font-semibold text-white">{t.studentName}</div>
                        <div className="text-xs text-gray-400">{t.studentEmail}</div>
                      </td>
                      <td className="p-4 font-mono font-medium text-indigo-400">{t.courseCode}</td>
                      <td className="p-4"><span className="px-2 py-0.5 bg-gray-800 border border-gray-700 rounded text-xs font-bold text-yellow-400">{t.gradeObtained}</span></td>
                      <td className="p-4">
                        {t.status === 'FLAGGED_TAMPERED' ? (
                          <span className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold rounded-full flex items-center gap-1 w-fit">
                            <ShieldAlert className="w-3 h-3" /> FLAGGED
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold rounded-full flex items-center gap-1 w-fit">
                            <Clock className="w-3 h-3" /> PENDING
                          </span>
                        )}
                        {t.storageState === 'PURGED_RECEIPT_ONLY' ? (
                          <span className="mt-1 px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-semibold rounded-md flex items-center gap-1 w-fit">
                            <Database className="w-2.5 h-2.5" /> Purged Receipt
                          </span>
                        ) : (
                          <span className="mt-1 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold rounded-md flex items-center gap-1 w-fit">
                            <FileCheck className="w-2.5 h-2.5" /> Active PDF
                          </span>
                        )}
                      </td>
                      <td className="p-4 max-w-xs">
                        <div className="text-xs text-rose-300 truncate font-mono">{t.rejectionReason || 'Metadata scanner inspection pending'}</div>
                        <div className="text-[10px] text-gray-500 font-mono truncate mt-0.5">Hash: {t.documentHash}</div>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedTranscript(t)}
                          className="px-3 py-1.5 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-300 hover:text-white rounded-lg text-xs font-medium transition flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" /> Inspect & Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-400 text-sm">No flagged or pending transcripts in queue.</div>
          )}
        </div>
      )}

      {/* TAB 2: DISPUTED ESCROWS */}
      {activeTab === 'disputes' && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
          {disputes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-gray-800/60 text-xs uppercase font-semibold text-gray-400 border-b border-gray-800">
                  <tr>
                    <th className="p-4">Session ID</th>
                    <th className="p-4">Mentor vs. Mentee</th>
                    <th className="p-4">Course</th>
                    <th className="p-4">Escrow Tokens</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {disputes.map((d) => (
                    <tr key={d.sessionId} className="hover:bg-gray-800/30 transition">
                      <td className="p-4 font-mono font-bold text-white">#{d.sessionId}</td>
                      <td className="p-4">
                        <div className="text-xs"><span className="text-gray-400">Mentor:</span> <span className="text-white font-medium">{d.mentorName}</span></div>
                        <div className="text-xs"><span className="text-gray-400">Mentee:</span> <span className="text-white font-medium">{d.menteeName}</span></div>
                      </td>
                      <td className="p-4 font-mono text-indigo-400">{d.courseCode}</td>
                      <td className="p-4 font-bold text-yellow-400">{d.tokensHeld} Tokens</td>
                      <td className="p-4 text-xs font-mono">{d.activeDurationMinutes ? `${d.activeDurationMinutes} mins` : 'N/A'}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedDispute(d)}
                          className="px-3 py-1.5 bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/40 text-rose-300 hover:text-white rounded-lg text-xs font-medium transition flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <Scale className="w-3.5 h-3.5" /> Resolve Dispute
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center text-gray-400 text-sm">No active escrow disputes reported.</div>
          )}
        </div>
      )}

      {/* MODAL 1: INSPECT & REVIEW TRANSCRIPT WITH FULL DOCUMENT VIEWER */}
      {selectedTranscript && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 overflow-y-auto">
          <div className="relative w-full max-w-6xl rounded-2xl bg-gray-950 border border-gray-800 p-5 sm:p-6 shadow-2xl text-white max-h-[95vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg flex items-center gap-2">
                    <span>Transcript Inspection & Document Verification</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-gray-800 border border-gray-700 text-gray-300">
                      #{selectedTranscript.id}
                    </span>
                  </h3>
                  <p className="text-xs text-gray-400">
                    Applicant: <strong className="text-white">{selectedTranscript.studentName}</strong> ({selectedTranscript.studentEmail})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {selectedTranscript.status === 'FLAGGED_TAMPERED' ? (
                  <span className="px-3 py-1 bg-rose-950/80 border border-rose-500/60 text-rose-300 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                    <ShieldAlert className="w-3.5 h-3.5" /> Flagged for Alteration
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-amber-950/80 border border-amber-500/60 text-amber-300 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                    <Clock className="w-3.5 h-3.5" /> Pending Verification
                  </span>
                )}
                <button 
                  onClick={() => {
                    setSelectedTranscript(null);
                    setReviewNotes('');
                  }} 
                  className="p-1.5 hover:bg-gray-800 rounded-xl text-gray-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Two-Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 overflow-y-auto pr-1 my-4 flex-1">
              
              {/* LEFT COLUMN: OFFICIAL TRANSCRIPT DOCUMENT SHEET (Cols 7) */}
              <div className="lg:col-span-7 flex flex-col space-y-2.5">
                <div className="flex items-center justify-between bg-gray-900 border border-gray-800 px-3 py-2 rounded-xl text-xs text-gray-300">
                  <span className="font-semibold flex items-center gap-1.5 text-indigo-400">
                    <Building2 className="w-4 h-4" /> Official Document Sheet View
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button 
                      type="button"
                      onClick={() => setDocZoom(Math.max(75, docZoom - 10))}
                      className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-mono text-[11px] px-1 text-gray-400">{docZoom}%</span>
                    <button 
                      type="button"
                      onClick={() => setDocZoom(Math.min(130, docZoom + 10))}
                      className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      type="button"
                      onClick={() => window.print()}
                      className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-white transition ml-1"
                      title="Print Document"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Printable Academic Transcript Canvas */}
                <div 
                  className="bg-slate-50 text-slate-900 rounded-xl p-5 sm:p-6 border-2 border-slate-300 shadow-xl overflow-x-auto relative select-text transition-all origin-top"
                  style={{ transform: `scale(${docZoom / 100})`, transformOrigin: 'top center' }}
                >
                  {/* Watermark Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden opacity-[0.08]">
                    <div className="text-center rotate-[-30deg]">
                      <div className="text-4xl sm:text-5xl font-black uppercase tracking-widest text-slate-900 leading-tight">
                        FOR STUDY SYNC VERIFICATION ONLY
                      </div>
                      <div className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-700 mt-2">
                        CONFIDENTIAL • ADMIN AUDIT ONLY • ZERO PUBLIC ACCESS
                      </div>
                      {selectedTranscript.status === 'FLAGGED_TAMPERED' && (
                        <div className="text-xs font-black uppercase tracking-widest text-rose-800 mt-1">
                          [FORENSIC TAMPER ALERT: METADATA ANOMALIES DETECTED]
                        </div>
                      )}
                    </div>
                  </div>

                  {/* University Header */}
                  <div className="text-center pb-4 border-b-2 border-slate-900 relative">
                    <div className="w-10 h-10 mx-auto mb-1.5 rounded-full bg-slate-900 text-amber-400 flex items-center justify-center shadow-md">
                      <Award className="w-6 h-6" />
                    </div>
                    <h2 className="text-base sm:text-lg font-serif font-black tracking-wider text-slate-900 uppercase">
                      National Institute of Technology & Science
                    </h2>
                    <p className="text-[11px] font-sans font-semibold uppercase tracking-widest text-slate-600">
                      Office of the Controller of Examinations • Office of Academic Records
                    </p>
                    <p className="text-[10px] text-slate-500 font-sans mt-0.5">
                      Accredited NAAC Grade "A++" • Institution of Eminence
                    </p>
                    <div className="mt-2 text-xs font-bold font-serif uppercase tracking-widest text-indigo-900 border-t border-slate-300 pt-1">
                      Official Consolidated Statement of Grades & Transcript
                    </div>
                  </div>

                  {/* Student Details Grid */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-sans my-3.5 p-3 bg-slate-100 rounded-lg border border-slate-300">
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Candidate Name</span>
                      <strong className="text-slate-900 font-bold">{selectedTranscript.studentName.toUpperCase()}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Registration Number</span>
                      <strong className="font-mono text-slate-900">21BCSE{1000 + Number(selectedTranscript.id)}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Degree / Program</span>
                      <span className="text-slate-800 font-medium">B.Tech - Computer Science & Engineering</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[9px] uppercase tracking-wider">Academic Term / Semester</span>
                      <span className="text-slate-800 font-medium">Semester V (Autumn Session)</span>
                    </div>
                  </div>

                  {/* Tamper Warning Banner if Flagged */}
                  {selectedTranscript.status === 'FLAGGED_TAMPERED' && (
                    <div className="p-2 mb-3 bg-rose-100 border border-rose-300 rounded-lg text-rose-800 text-[11px] font-sans flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                      <div>
                        <strong>Forensic PDFBox Flag:</strong> Metadata stream contains Canva/Photoshop tool signatures or altered font layer stream.
                      </div>
                    </div>
                  )}

                  {/* Grades Matrix Table */}
                  <div className="border border-slate-400 rounded-lg overflow-hidden my-3">
                    <table className="w-full text-left text-[11px] font-sans border-collapse">
                      <thead>
                        <tr className="bg-slate-800 text-white font-semibold text-[10px] uppercase tracking-wider">
                          <th className="p-2 border-r border-slate-700">Course Code</th>
                          <th className="p-2 border-r border-slate-700">Course Title</th>
                          <th className="p-2 border-r border-slate-700 text-center">Credits</th>
                          <th className="p-2 border-r border-slate-700 text-center">Grade</th>
                          <th className="p-2 border-r border-slate-700 text-center">Points</th>
                          <th className="p-2 text-center">Result</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-300">
                        {/* Target Applied Course (Prominently Highlighted) */}
                        <tr className={`font-semibold ${selectedTranscript.status === 'FLAGGED_TAMPERED' ? 'bg-rose-50 text-rose-950 font-bold' : 'bg-indigo-50/80 text-indigo-950'}`}>
                          <td className="p-2 font-mono font-bold border-r border-slate-300 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                            <span>{selectedTranscript.courseCode}</span>
                          </td>
                          <td className="p-2 border-r border-slate-300 font-medium">
                            {getCourseTitle(selectedTranscript.courseCode)}
                          </td>
                          <td className="p-2 border-r border-slate-300 text-center">4.0</td>
                          <td className="p-2 border-r border-slate-300 text-center">
                            <span className="px-2 py-0.5 bg-indigo-600 text-white rounded font-black text-xs shadow-sm">
                              {selectedTranscript.gradeObtained}
                            </span>
                          </td>
                          <td className="p-2 border-r border-slate-300 text-center font-bold">10.0</td>
                          <td className="p-2 text-center text-emerald-700 font-bold">PASS</td>
                        </tr>

                        {/* Co-requisite Supporting Courses */}
                        <tr className="text-slate-700">
                          <td className="p-2 font-mono border-r border-slate-300">CSE2001</td>
                          <td className="p-2 border-r border-slate-300">Data Structures & Algorithms</td>
                          <td className="p-2 border-r border-slate-300 text-center">4.0</td>
                          <td className="p-2 border-r border-slate-300 text-center font-bold">S</td>
                          <td className="p-2 border-r border-slate-300 text-center">10.0</td>
                          <td className="p-2 text-center text-emerald-700 font-bold">PASS</td>
                        </tr>
                        <tr className="text-slate-700">
                          <td className="p-2 font-mono border-r border-slate-300">MAT2001</td>
                          <td className="p-2 border-r border-slate-300">Applied Linear Algebra</td>
                          <td className="p-2 border-r border-slate-300 text-center">3.0</td>
                          <td className="p-2 border-r border-slate-300 text-center font-bold">A</td>
                          <td className="p-2 border-r border-slate-300 text-center">9.0</td>
                          <td className="p-2 text-center text-emerald-700 font-bold">PASS</td>
                        </tr>
                        <tr className="text-slate-700">
                          <td className="p-2 font-mono border-r border-slate-300">CSE2003</td>
                          <td className="p-2 border-r border-slate-300">Computer Architecture & Design</td>
                          <td className="p-2 border-r border-slate-300 text-center">3.0</td>
                          <td className="p-2 border-r border-slate-300 text-center font-bold">A+</td>
                          <td className="p-2 border-r border-slate-300 text-center">9.0</td>
                          <td className="p-2 text-center text-emerald-700 font-bold">PASS</td>
                        </tr>
                        <tr className="text-slate-700">
                          <td className="p-2 font-mono border-r border-slate-300">ECE1002</td>
                          <td className="p-2 border-r border-slate-300">Digital Logic & Microprocessors</td>
                          <td className="p-2 border-r border-slate-300 text-center">2.0</td>
                          <td className="p-2 border-r border-slate-300 text-center font-bold">S</td>
                          <td className="p-2 border-r border-slate-300 text-center">10.0</td>
                          <td className="p-2 text-center text-emerald-700 font-bold">PASS</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Semester GPA Breakdown */}
                  <div className="flex items-center justify-between text-[11px] font-sans p-2.5 bg-slate-200/80 rounded-lg border border-slate-300 font-medium text-slate-800">
                    <div>Total Credits: <strong>16.0 / 16.0</strong></div>
                    <div>Semester GPA (SGPA): <strong className="text-slate-900 font-bold">9.75 / 10.00</strong></div>
                    <div>Cumulative CGPA: <strong className="text-slate-900 font-bold">9.62 / 10.00</strong></div>
                  </div>

                  {/* Signatures & Seal Footer */}
                  <div className="flex items-end justify-between pt-6 mt-4 border-t-2 border-slate-900 font-sans text-[10px]">
                    <div className="space-y-0.5 text-slate-600">
                      <div>Verification Digest: <span className="font-mono text-[9px] text-slate-800">{selectedTranscript.documentHash?.substring(0, 24)}...</span></div>
                      <div>Date of Verification: {new Date().toLocaleDateString()}</div>
                      <div className="text-[9px] text-slate-500 italic">Official University Document Generated Electronically</div>
                    </div>

                    <div className="text-right">
                      <div className="font-serif italic font-bold text-slate-900 text-xs mb-0.5">Dr. K. R. Sharma</div>
                      <div className="font-bold text-slate-700 uppercase tracking-wider text-[9px]">Controller of Examinations</div>
                      <div className="text-slate-500 text-[8px]">Division of Academic Records</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: FORENSIC TELEMETRY & DECISION WORKSTATION (Cols 5) */}
              <div className="lg:col-span-5 flex flex-col space-y-3.5">
                
                {/* Application Information Card */}
                <div className="p-3.5 bg-gray-900 border border-gray-800 rounded-xl space-y-2 text-xs">
                  <div className="text-gray-400 font-semibold uppercase tracking-wider text-[10px]">Candidate & Application Context</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-gray-500 block text-[10px]">Candidate Name</span>
                      <strong className="text-white">{selectedTranscript.studentName}</strong>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px]">Course Code</span>
                      <span className="font-mono font-bold text-indigo-400">{selectedTranscript.courseCode}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px]">Submitted Grade</span>
                      <span className="font-bold text-yellow-400">{selectedTranscript.gradeObtained} Grade</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px]">Application Status</span>
                      <span className="font-semibold text-gray-300">{selectedTranscript.status}</span>
                    </div>
                  </div>
                </div>

                {/* Storage State Status Badge */}
                <div className="flex items-center justify-between p-3 bg-gray-900 border border-gray-800 rounded-xl text-xs">
                  <span className="text-gray-400 font-medium">Document Storage Lifecycle:</span>
                  {selectedTranscript.storageState === 'PURGED_RECEIPT_ONLY' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-300 font-semibold">
                      <Database className="w-3.5 h-3.5" />
                      Raw PDF Purged • SHA-256 Receipt Locked
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-300 font-semibold">
                      <FileCheck className="w-3.5 h-3.5" />
                      Active PDF (Purges in {Math.max(1, 30 - getDaysSinceVerified(selectedTranscript.verifiedAt || selectedTranscript.createdAt))} days)
                    </span>
                  )}
                </div>

                {/* Forensic PDFBox Inspection Alert */}
                <div className={`p-4 rounded-xl border space-y-2 text-xs ${
                  selectedTranscript.status === 'FLAGGED_TAMPERED'
                    ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                    : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                }`}>
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {selectedTranscript.status === 'FLAGGED_TAMPERED' ? (
                      <>
                        <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
                        <span className="text-rose-300">Forensic Anomaly: Tampering Detected</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                        <span className="text-emerald-300">Cryptographic Integrity: Verified Clean</span>
                      </>
                    )}
                  </div>

                  <p className="leading-relaxed opacity-90 text-[11px]">
                    {selectedTranscript.rejectionReason || 'Metadata inspection detected no digital manipulation signatures. PDF creator and producer signatures adhere to official academic formats.'}
                  </p>
                </div>

                {/* Cryptographic SHA-256 Fingerprint */}
                <div className="p-3 bg-gray-900 border border-gray-800 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-gray-400">
                    <span className="font-semibold flex items-center gap-1.5 text-[11px]">
                      <Hash className="w-3.5 h-3.5 text-indigo-400" /> SHA-256 Fingerprint
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyHash(selectedTranscript.documentHash)}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer transition"
                    >
                      {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedHash ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="p-2 bg-gray-950 rounded-lg font-mono text-[10px] text-gray-300 break-all border border-gray-800/80">
                    {selectedTranscript.documentHash}
                  </div>
                </div>

                {/* Quick Presets for Review Notes */}
                <div className="space-y-1.5 text-xs">
                  <span className="text-gray-400 font-semibold block text-[10px] uppercase tracking-wider">Quick Fill Decision Presets:</span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => setReviewNotes('Approved: Academic transcript verified against institutional records.')}
                      className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-[10px] transition cursor-pointer"
                    >
                      ✓ Verified Authentic
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewNotes('Rejected: Forensic metadata anomalies detect digital manipulation (Photoshop/Canva layer tampering).')}
                      className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-[10px] transition cursor-pointer"
                    >
                      ✕ Tampering Confirmed
                    </button>
                    <button
                      type="button"
                      onClick={() => setReviewNotes('Approved: Disregard false-positive metadata alert after manual visual verification.')}
                      className="px-2.5 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-[10px] transition cursor-pointer"
                    >
                      ✓ Override False Positive
                    </button>
                  </div>
                </div>

                {/* Admin Review Comments Textarea */}
                <div className="space-y-1 text-xs flex-1 flex flex-col">
                  <label className="text-gray-300 font-semibold uppercase tracking-wider text-[10px] block">
                    Admin Review Rationale & Comments <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows="3"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Enter formal justification for approving or rejecting this applicant's transcript..."
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none flex-1"
                  />
                </div>

                {/* Modal Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-800 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleReviewTranscript(selectedTranscript.id, 'REJECTED')}
                    className="px-4 py-2.5 bg-rose-600/30 hover:bg-rose-600/50 border border-rose-500/50 text-rose-300 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject Submission</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReviewTranscript(selectedTranscript.id, 'VERIFIED')}
                    className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-lg shadow-emerald-600/30"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve & Verify</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: RESOLVE DISPUTE */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg rounded-2xl bg-gray-900 border border-gray-800 p-6 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-4 border-b border-gray-800">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Scale className="w-5 h-5 text-rose-400" />
                <span>Arbitrate Session Dispute #{selectedDispute.sessionId}</span>
              </h3>
              <button onClick={() => setSelectedDispute(null)} className="p-1 hover:bg-gray-800 rounded text-gray-400 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <div className="my-4 space-y-3 text-xs">
              <div className="p-3 bg-gray-800/50 rounded-xl space-y-1">
                <div><span className="text-gray-400">Mentor:</span> <strong className="text-white">{selectedDispute.mentorName}</strong></div>
                <div><span className="text-gray-400">Mentee:</span> <strong className="text-white">{selectedDispute.menteeName}</strong></div>
                <div><span className="text-gray-400">Tokens Held in Escrow:</span> <span className="text-yellow-400 font-bold">{selectedDispute.tokensHeld} Tokens</span></div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-semibold uppercase">Resolution Notes</label>
                <textarea
                  rows="2"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="State the decision basis..."
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-800">
              <button
                onClick={() => handleResolveDispute(selectedDispute.sessionId, 'REFUND_MENTEE')}
                className="px-4 py-2 bg-amber-600/30 hover:bg-amber-600/50 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Refund Mentee ({selectedDispute.tokensHeld} T)
              </button>
              <button
                onClick={() => handleResolveDispute(selectedDispute.sessionId, 'RELEASE_MENTOR')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md transition cursor-pointer"
              >
                Release Payout to Mentor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
