import React, { useState, useRef } from 'react';
import { 
  Upload, FileText, AlertTriangle, CheckCircle, X, ShieldAlert, 
  ShieldCheck, Loader2, Sparkles, FileCheck2, Info, Lock, EyeOff,
  Shield, Stamp, FileLock2, ChevronDown, ChevronUp, FileX
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

export default function TranscriptUploadModal({ 
  isOpen, 
  onClose, 
  userId, 
  onSuccess,
  onViewApplications 
}) {
  const [courseCode, setCourseCode] = useState('');
  const [gradeObtained, setGradeObtained] = useState('S');
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanStep, setScanStep] = useState('');
  const [status, setStatus] = useState(null); // { type: 'success' | 'error' | 'tampered', title: '', message: '' }
  const [showPrivacyDetails, setShowPrivacyDetails] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    if (selectedFile.type !== 'application/pdf' && !selectedFile.name.toLowerCase().endsWith('.pdf')) {
      setStatus({ 
        type: 'error', 
        title: 'Invalid File Format',
        message: 'Only official university transcript documents in PDF format (.pdf) are accepted.' 
      });
      return;
    }
    if (selectedFile.size > 15 * 1024 * 1024) {
      setStatus({ 
        type: 'error', 
        title: 'File Too Large',
        message: 'Transcript file size must not exceed 15MB.' 
      });
      return;
    }
    setFile(selectedFile);
    setStatus(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !courseCode.trim()) {
      setStatus({ 
        type: 'error', 
        title: 'Incomplete Submission',
        message: 'Please specify the course code and upload an official transcript PDF.' 
      });
      return;
    }

    setLoading(true);
    setStatus(null);
    setScanStep('Initiating Apache PDFBox forensic scanner...');

    const stepTimer1 = setTimeout(() => {
      setScanStep('Scanning document metadata & creator signatures (Canva/Photoshop filter)...');
    }, 700);

    const stepTimer2 = setTimeout(() => {
      setScanStep('Computing SHA-256 cryptographic document fingerprint...');
    }, 1400);

    const formData = new FormData();
    formData.append('userId', userId);
    formData.append('courseCode', courseCode.toUpperCase().trim());
    formData.append('gradeObtained', gradeObtained);
    formData.append('file', file);

    try {
      const response = await api.post('/v1/mentorship/verify', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      const message = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
      if (message.toLowerCase().includes('flagged') || message.toLowerCase().includes('anomalies') || message.toLowerCase().includes('tamper')) {
        setStatus({
          type: 'tampered',
          title: 'Metadata Security Alert: Forensic PDF Tampering Detected',
          message: 'Metadata inspection detected digital manipulation signatures (Canva/Photoshop/GIMP/Inkscape) or corrupted digital signatures. Your transcript has been flagged for administrative review.',
        });
        if (onSuccess) onSuccess();
      } else {
        setStatus({
          type: 'success',
          title: 'Verification Request In Queue',
          message: 'Transcript submitted successfully for verification! Cryptographic inspection passed. Your application has been submitted with status PENDING. You can track your verification approval progress under the "My Applications" tab.',
        });
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      const errMsg = err.response?.data?.message || err.response?.data || err.message || 'Failed to process transcript verification.';
      
      const isTampered = typeof errMsg === 'string' && (errMsg.includes('tamper') || errMsg.includes('already been uploaded') || errMsg.includes('duplicate'));
      
      setStatus({
        type: isTampered ? 'tampered' : 'error',
        title: isTampered ? 'Document Integrity Alert' : 'Verification Error',
        message: errMsg,
      });
    } finally {
      setLoading(false);
      setScanStep('');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-2xl bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 p-5 sm:p-6 shadow-2xl text-white my-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-800/80">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
                <FileCheck2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  Apply as Verified Mentor
                </h2>
                <p className="text-xs text-gray-400">Forensic transcript verification powered by Apache PDFBox</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-1.5 rounded-xl hover:bg-gray-800 text-gray-400 hover:text-white transition duration-150"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Layer 1: Psychological Safety & Explicit Security Badges */}
          <div className="mt-3.5 grid grid-cols-3 gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium justify-center shadow-sm">
              <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="truncate">256-Bit Encrypted</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 text-[11px] font-medium justify-center shadow-sm">
              <EyeOff className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">Never Publicly Shared</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-950/40 border border-purple-500/30 text-purple-300 text-[11px] font-medium justify-center shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="truncate">Admin-Only Access</span>
            </div>
          </div>

          {/* Clear Purpose Statement & Data Minimization Notice */}
          <div className="mt-3 p-3 bg-gray-900/90 border border-gray-800 rounded-xl space-y-2 text-xs">
            <div className="flex items-start gap-2.5 text-gray-300 leading-relaxed">
              <Shield className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white">Student Privacy Guarantee & Data Minimization:</strong> Only your grade in this specific course is verified. Your full transcript, CGPA, semester marks, and student ID will <span className="text-indigo-300 font-semibold">never appear on your public mentor profile</span>, mentee chats, or search results.
              </div>
            </div>

            {/* Automated Digital Watermarking Notice */}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-800/80 text-[11px] text-amber-300/90">
              <Stamp className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>
                <strong>Automated Watermarking:</strong> System automatically overlays <span className="font-mono bg-amber-950/60 px-1 py-0.5 rounded border border-amber-700/50 text-amber-200">"FOR STUDY SYNC VERIFICATION ONLY"</span> onto administrative inspection previews.
              </span>
            </div>
          </div>

          {/* Privacy & Auto-Purge Guarantee Box */}
          <div className="mt-2.5 p-3.5 bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold uppercase tracking-wider text-[11px]">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>30-Day Auto-Purge & Cryptographic Receipt Guarantee</span>
            </div>

            <p className="text-gray-300 leading-relaxed text-[11px]">
              To protect your academic privacy, StudySync <strong>automatically purges your raw PDF file</strong> from server storage 30 days after verification.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-300 pt-1 text-[11px]">
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>SHA-256 Receipt locked in DB</span>
              </div>
              <div className="flex items-center gap-2">
                <FileX className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>PDF binary deleted after 30d</span>
              </div>
            </div>
          </div>

          {/* Expandable 4-Layer Security Details Accordion */}
          <div className="mt-2.5 border border-gray-800/70 rounded-xl overflow-hidden bg-gray-900/40">
            <button
              type="button"
              onClick={() => setShowPrivacyDetails(!showPrivacyDetails)}
              className="w-full px-3.5 py-2 flex items-center justify-between text-xs font-medium text-gray-400 hover:text-gray-200 transition bg-gray-800/30 hover:bg-gray-800/60 cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <FileLock2 className="w-3.5 h-3.5 text-indigo-400" />
                <span>How StudySync protects your academic documents</span>
              </span>
              {showPrivacyDetails ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {showPrivacyDetails && (
              <div className="p-3.5 border-t border-gray-800/70 space-y-2 text-[11px] text-gray-300 bg-gray-950/70">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <p>
                    <strong className="text-white">Zero Public Visibility:</strong> Stored securely in isolated cloud storage with no public URL access. Other students and mentees cannot download or view your documents.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                  <p>
                    <strong className="text-white">Strict Role-Based Access (RBAC):</strong> Only authenticated platform administrators (<code className="text-indigo-300">ROLE_ADMIN</code>) with valid JWT signatures can access viewing links.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                  <p>
                    <strong className="text-white">SHA-256 Cryptographic Fingerprint:</strong> Hashed via one-way cryptographic algorithms to prevent duplicate transcript claims without unencrypted directory sharing.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <p>
                    <strong className="text-white">Automated 30-Day Retention Purge:</strong> Daily cron job purges physical PDF binary from server storage after 30 days while locking the immutable receipt in DB forever.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <p>
                    <strong className="text-white">Badge-Only Profile Display:</strong> Upon verification, your profile only gains a verified badge (e.g. <em>"Grade S Verified"</em>). Raw grade sheets are never accessible.
                  </p>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
            {/* Status Alert Banner */}
            {status && (
              <motion.div 
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl text-xs sm:text-sm flex items-start gap-3 border shadow-md ${
                  status.type === 'success'
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                    : status.type === 'tampered'
                    ? 'bg-rose-950/70 border-rose-500/60 text-rose-200'
                    : 'bg-amber-950/60 border-amber-500/50 text-amber-200'
                }`}
              >
                {status.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 shrink-0 text-emerald-400 mt-0.5" />
                ) : status.type === 'tampered' ? (
                  <ShieldAlert className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
                )}
                <div className="space-y-1.5 flex-1">
                  <p className="font-bold">{status.title}</p>
                  <p className="opacity-90 leading-relaxed">{status.message}</p>
                  {(status.type === 'success' || status.type === 'tampered') && onViewApplications && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onViewApplications();
                      }}
                      className="mt-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-md"
                    >
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>Track in My Applications</span>
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Inputs: Course Code & Grade */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                  Course Code <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. CSE2001 or DSA"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-2.5 bg-gray-800/80 border border-gray-700/80 rounded-xl text-white placeholder-gray-500 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                  Grade Obtained <span className="text-rose-400">*</span>
                </label>
                <select
                  value={gradeObtained}
                  onChange={(e) => setGradeObtained(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-800/80 border border-gray-700/80 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer transition"
                >
                  <option value="S">S Grade (Outstanding / Top 1%)</option>
                  <option value="A+">A+ Grade (Exceptional)</option>
                  <option value="A">A Grade (Excellent)</option>
                  <option value="B+">B+ Grade (Very Good)</option>
                </select>
              </div>
            </div>

            {/* Drag & Drop File Upload Box */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                Official Transcript (PDF) <span className="text-rose-400">*</span>
              </label>
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
                  isDragging 
                    ? 'border-indigo-400 bg-indigo-950/40 scale-[1.01]' 
                    : file 
                    ? 'border-emerald-500/50 bg-emerald-950/20' 
                    : 'border-gray-700 hover:border-indigo-500 bg-gray-800/30 hover:bg-gray-800/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  aria-label="Official Transcript (PDF)"
                  data-testid="file-input"
                />

                {file ? (
                  <div className="flex items-center justify-between gap-3 text-left p-2 bg-gray-900/80 rounded-lg border border-gray-700">
                    <div className="flex items-center gap-3 truncate">
                      <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-semibold text-white truncate">{file.name}</p>
                        <p className="text-xs text-gray-400">{formatFileSize(file.size)} • PDF Ready</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFile(null);
                      }}
                      className="p-1 rounded-md text-gray-400 hover:text-rose-400 hover:bg-gray-800 transition"
                      title="Remove file"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-9 h-9 text-indigo-400 mx-auto mb-2 opacity-80" />
                    <p className="text-sm font-medium text-gray-200">
                      Drag & drop your official university PDF transcript here
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      or click to browse your local device (Max 15MB)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Scanning Progress Feedback */}
            {loading && (
              <div className="p-3 bg-indigo-950/50 border border-indigo-500/40 rounded-xl flex items-center gap-3 text-xs text-indigo-200 animate-pulse">
                <Loader2 className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
                <span>{scanStep || 'Analyzing transcript with Apache PDFBox...'}</span>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-800">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !file || !courseCode.trim()}
                className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Document...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Submit Transcript</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
