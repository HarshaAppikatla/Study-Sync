import React, { useState } from 'react';
import { 
  Search, Filter, Sparkles, Shield, ShieldCheck, Flame, Lock, 
  Coins, BookOpen, Clock, Calendar, CheckCircle2, UserCheck, 
  HelpCircle, AlertCircle, ArrowUpDown, FileCheck2, FileText,
  ShieldAlert, XCircle, AlertTriangle, ExternalLink, RefreshCw, Check, Radio
} from 'lucide-react';
import { motion } from 'framer-motion';
import MentorCard from './MentorCard';
import { reviewVerification } from '../../services/api';

export default function MentorDiscovery({ 
  mentors = [], 
  sessions = [],
  verifications = [],
  activeTab: controlledTab,
  onTabChange,
  onSelectMentor, 
  onOpenVerificationModal,
  onOpenCompletionModal,
  onOpenStudyRoom,
  onRefreshVerifications,
  onRefreshMentors
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [minRating, setMinRating] = useState('0');
  const [selectedCourseTag, setSelectedCourseTag] = useState('ALL');
  const [sortBy, setSortBy] = useState('rating');
  const [internalTab, setInternalTab] = useState('mentors');
  const [reviewLoadingId, setReviewLoadingId] = useState(null);

  const activeTab = controlledTab !== undefined ? controlledTab : internalTab;
  const setActiveTab = (tab) => {
    if (onTabChange) onTabChange(tab);
    setInternalTab(tab);
  };

  const pendingCount = verifications.filter(v => v.status === 'PENDING').length;
  const verifiedCount = verifications.filter(v => v.status === 'VERIFIED').length;
  const flaggedCount = verifications.filter(v => v.status === 'FLAGGED_TAMPERED').length;

  const handleSimulateReview = async (verificationId, status, reason = null) => {
    setReviewLoadingId(verificationId);
    try {
      await reviewVerification(verificationId, status, reason);
      if (onRefreshVerifications) await onRefreshVerifications();
      if (onRefreshMentors) await onRefreshMentors();
    } catch (e) {
      console.error('Error simulating verification review', e);
    } finally {
      setReviewLoadingId(null);
    }
  };

  // Extract unique course codes for quick filter tags
  const courseTags = ['ALL', ...new Set(mentors.map(m => m.courseCode).filter(Boolean))];

  const filteredMentors = mentors
    .filter((m) => {
      const name = `${m.firstName || ''} ${m.lastName || ''}`.toLowerCase();
      const course = (m.courseCode || '').toLowerCase();
      const dept = (m.department || '').toLowerCase();
      const term = searchTerm.toLowerCase().trim();

      const matchesSearch = !term || name.includes(term) || course.includes(term) || dept.includes(term);
      const matchesRating = parseFloat(m.rating || 0) >= parseFloat(minRating);
      const matchesCourseTag = selectedCourseTag === 'ALL' || (m.courseCode && m.courseCode.toUpperCase() === selectedCourseTag);

      return matchesSearch && matchesRating && matchesCourseTag;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'price-low') return (a.hourlyRate || 30) - (b.hourlyRate || 30);
      if (sortBy === 'price-high') return (b.hourlyRate || 30) - (a.hourlyRate || 30);
      return (a.firstName || '').localeCompare(b.firstName || '');
    });

  return (
    <div className="space-y-6">
      {/* Hero Header Banner */}
      <div className="relative overflow-hidden p-6 sm:p-8 bg-gradient-to-r from-indigo-950/80 via-purple-950/60 to-gray-900 border border-indigo-800/40 rounded-3xl shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-3">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Anti-Collusion Verified Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>Peer Mentorship & Study Escrow</span>
              <Sparkles className="w-6 h-6 text-indigo-400 animate-pulse" />
            </h1>
            <p className="text-sm text-gray-300 mt-2 leading-relaxed">
              Book verified 1-on-1 study sessions with seniors proven by forensic transcript inspection. Tokens are locked in Escrow with 15% platform burn and Pairwise Decay to prevent review collusion.
            </p>

            {/* Quick Micro-Stats */}
            <div className="flex flex-wrap items-center gap-4 mt-4 pt-3 border-t border-indigo-900/40 text-xs text-gray-400">
              <span className="flex items-center gap-1.5 text-indigo-300">
                <Lock className="w-3.5 h-3.5 text-indigo-400" /> Token Escrow Protected
              </span>
              <span className="flex items-center gap-1.5 text-rose-300">
                <Flame className="w-3.5 h-3.5 text-rose-400" /> 15% Platform Token Burn
              </span>
              <span className="flex items-center gap-1.5 text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> PDFBox Forensic Auditing
              </span>
            </div>

            {/* User Application Status Quick Bar */}
            {verifications.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-3 pt-2 text-xs">
                <span className="text-gray-400 font-medium">Your Application Tracker:</span>
                {verifiedCount > 0 && (
                  <button
                    onClick={() => setActiveTab('applications')}
                    className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{verifiedCount} Verified Mentor Profile{verifiedCount > 1 ? 's' : ''}</span>
                  </button>
                )}
                {pendingCount > 0 && (
                  <button
                    onClick={() => setActiveTab('applications')}
                    className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{pendingCount} Application Pending Review</span>
                  </button>
                )}
                {flaggedCount > 0 && (
                  <button
                    onClick={() => setActiveTab('applications')}
                    className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    <span>{flaggedCount} Integrity Flagged</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2">
            <button
              onClick={onOpenVerificationModal}
              className="px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>Apply as Verified Mentor</span>
            </button>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>256-Bit Encrypted • Admin-Only Review</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hub Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-800 pb-2 text-sm overflow-x-auto">
        <button
          onClick={() => setActiveTab('mentors')}
          className={`px-4 py-2 font-bold rounded-xl transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'mentors'
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-sm'
              : 'text-gray-400 hover:text-white hover:bg-gray-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Verified Mentors ({filteredMentors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sessions')}
          className={`px-4 py-2 font-bold rounded-xl transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'sessions'
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-sm'
              : 'text-gray-400 hover:text-white hover:bg-gray-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>My Sessions ({sessions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('applications')}
          className={`px-4 py-2 font-bold rounded-xl transition flex items-center gap-2 cursor-pointer relative ${
            activeTab === 'applications'
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-sm'
              : 'text-gray-400 hover:text-white hover:bg-gray-900'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>My Applications ({verifications.length})</span>
          {pendingCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('anti-collusion')}
          className={`px-4 py-2 font-bold rounded-xl transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'anti-collusion'
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-sm'
              : 'text-gray-400 hover:text-white hover:bg-gray-900'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Anti-Collusion Protocol</span>
        </button>
      </div>

      {/* TAB 1: VERIFIED MENTORS */}
      {activeTab === 'mentors' && (
        <div className="space-y-5">
          {/* Filter Controls Row */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            {/* Search Input */}
            <div className="relative sm:col-span-6">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search mentor by name, course code (e.g. CSE2001), or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            {/* Rating Filter */}
            <div className="sm:col-span-3 flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl px-3 py-2">
              <Filter className="w-4 h-4 text-gray-400 shrink-0" />
              <select
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm text-white focus:outline-none cursor-pointer"
              >
                <option value="0" className="bg-gray-900">All Ratings</option>
                <option value="4.0" className="bg-gray-900">4.0+ Stars</option>
                <option value="4.5" className="bg-gray-900">4.5+ Stars</option>
                <option value="4.8" className="bg-gray-900">4.8+ Stars</option>
              </select>
            </div>

            {/* Sort Options */}
            <div className="sm:col-span-3 flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl px-3 py-2">
              <ArrowUpDown className="w-4 h-4 text-gray-400 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-sm text-white focus:outline-none cursor-pointer"
              >
                <option value="rating" className="bg-gray-900">Sort by Rating</option>
                <option value="price-low" className="bg-gray-900">Tokens: Low to High</option>
                <option value="price-high" className="bg-gray-900">Tokens: High to Low</option>
                <option value="name" className="bg-gray-900">Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Quick Course Filter Tags */}
          {courseTags.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-gray-400 font-medium whitespace-nowrap">Course:</span>
              {courseTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedCourseTag(tag)}
                  className={`px-3 py-1 rounded-lg font-mono font-semibold transition whitespace-nowrap ${
                    selectedCourseTag === tag
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* Grid of Verified Mentors */}
          {filteredMentors.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredMentors.map((mentor) => (
                <MentorCard 
                  key={mentor.verificationId || `${mentor.id}-${mentor.courseCode}`} 
                  mentor={mentor} 
                  onBookSession={onSelectMentor} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-900/40 border border-gray-800 rounded-2xl p-6">
              <BookOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">No verified mentors found</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
                No mentors match your search and filter criteria. Try resetting filters or be the first verified mentor for this course!
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setMinRating('0');
                    setSelectedCourseTag('ALL');
                  }}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-xs font-semibold text-white rounded-xl transition"
                >
                  Clear Filters
                </button>
                <button
                  onClick={onOpenVerificationModal}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white rounded-xl transition"
                >
                  Apply as Mentor
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY SESSIONS & ESCROWS */}
      {activeTab === 'sessions' && (
        <div className="space-y-4">
          {sessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sessions.map((s) => {
                const isScheduled = s.status === 'SCHEDULED' || s.status === 'REQUESTED' || s.status === 'IN_PROGRESS';
                const isCompleted = s.status === 'COMPLETED';

                return (
                  <div 
                    key={s.sessionId || s.id}
                    className="p-5 bg-gray-900/90 border border-gray-800 rounded-2xl shadow-lg flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold rounded-lg font-mono uppercase">
                          {s.courseCode || 'COURSE'}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isCompleted
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}>
                          {s.status}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white mb-1">
                        Mentor: {s.mentorName || 'Senior Mentor'}
                      </h4>
                      <p className="text-xs text-gray-400 mb-3">
                        Mentee: {s.menteeName || 'You'}
                      </p>

                      <div className="grid grid-cols-2 gap-2 p-3 bg-gray-800/40 rounded-xl mb-3 text-xs">
                        <div>
                          <span className="text-gray-400 block text-[10px]">Held in Escrow:</span>
                          <span className="font-bold text-yellow-400 flex items-center gap-1">
                            <Coins className="w-3.5 h-3.5" />
                            {s.tokenAmount} Tokens
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 block text-[10px]">Scheduled Time:</span>
                          <span className="font-medium text-gray-200">
                            {s.scheduledStartTime ? new Date(s.scheduledStartTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Flexible'}
                          </span>
                        </div>
                      </div>

                      {s.rating && (
                        <div className="p-2.5 bg-gray-800/30 rounded-lg text-xs text-amber-300 flex items-center gap-2 mb-3">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Rated: <strong>{s.rating} Stars</strong></span>
                          {s.feedback && <span className="text-gray-400 truncate">• "{s.feedback}"</span>}
                        </div>
                      )}
                    </div>

                    {isScheduled && (
                      <div className="flex flex-col sm:flex-row gap-2 mt-2">
                        {onOpenStudyRoom && (
                          <button
                            onClick={() => onOpenStudyRoom(s)}
                            className="flex-1 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                          >
                            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-300" />
                            <span>Join Live Study Room</span>
                          </button>
                        )}
                        {onOpenCompletionModal && (
                          <button
                            onClick={() => onOpenCompletionModal(s)}
                            className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Complete & Escrow</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-14 bg-gray-900/40 border border-gray-800 rounded-2xl p-6">
              <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">No Mentorship Sessions Yet</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
                You haven't booked any mentorship sessions yet. Explore verified mentors and book your first 1-on-1 session!
              </p>
              <button
                onClick={() => setActiveTab('mentors')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white rounded-xl transition"
              >
                Find a Mentor
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ANTI-COLLUSION ARCHITECTURE EXPLAINER */}
      {activeTab === 'anti-collusion' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Token Escrow */}
          <div className="p-6 bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 rounded-2xl space-y-3">
            <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl w-fit">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">1. Token Escrow Hold</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              When booking a session, tokens are safely held in an immutable <code className="text-indigo-300">TokenEscrow</code> contract. Funds are only transferred after the mentee confirms active participation of at least 20 minutes.
            </p>
          </div>

          {/* Card 2: 15% Platform Token Burn */}
          <div className="p-6 bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 rounded-2xl space-y-3">
            <div className="p-3 bg-rose-600/20 text-rose-400 rounded-xl w-fit">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">2. 15% Platform Token Burn</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Upon session completion, 15% of the escrow tokens are permanently burned. This makes <strong>Review Farming</strong> between colluding friends mathematically unsustainable, as token balances decay rapidly on every circular transaction.
            </p>
          </div>

          {/* Card 3: Pairwise Rating Decay */}
          <div className="p-6 bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 rounded-2xl space-y-3">
            <div className="p-3 bg-amber-600/20 text-amber-400 rounded-xl w-fit">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">3. Pairwise Rating Decay</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Ratings between the same mentor and mentee pair are weighted by <span className="font-mono text-amber-300">1 / Previous Sessions</span>. Additionally, mentors with under 5 unique mentees receive a probationary penalty (0.8x multiplier) until verified with a diverse student cohort.
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: MY MENTOR APPLICATIONS */}
      {activeTab === 'applications' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-gray-900/60 border border-gray-800 rounded-2xl">
            <div className="space-y-1">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-indigo-400" />
                <span>Mentor Application Status Tracker</span>
              </h2>
              <p className="text-xs text-gray-400 max-w-xl">
                Transcripts undergo cryptographic SHA-256 fingerprinting and automated Apache PDFBox forensic scanning. Once verified, you are immediately listed in the discovery directory.
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              {onRefreshVerifications && (
                <button
                  onClick={onRefreshVerifications}
                  className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  title="Refresh status"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
              )}
              <button
                onClick={onOpenVerificationModal}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Submit Another Transcript</span>
              </button>
            </div>
          </div>

          {verifications.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {verifications.map((v) => {
                const isVerified = v.status === 'VERIFIED';
                const isPending = v.status === 'PENDING';
                const isTampered = v.status === 'FLAGGED_TAMPERED';
                const isRejected = v.status === 'REJECTED';

                return (
                  <div
                    key={v.id}
                    className={`p-6 rounded-2xl border transition shadow-lg ${
                      isVerified
                        ? 'bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-500/60'
                        : isPending
                        ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-500/60'
                        : isTampered
                        ? 'bg-rose-950/30 border-rose-500/50 hover:border-rose-500/70'
                        : 'bg-gray-900/60 border-gray-800'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      {/* Left: Course & Status */}
                      <div className="space-y-3 flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="px-3 py-1 bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 font-mono text-sm font-extrabold rounded-xl">
                            {v.courseCode}
                          </span>
                          <span className="px-2.5 py-1 bg-gray-800 border border-gray-700 text-gray-300 text-xs font-bold rounded-xl">
                            Grade: {v.gradeObtained}
                          </span>

                          {/* Status Badge */}
                          {isVerified && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                              <ShieldCheck className="w-4 h-4 text-emerald-400" />
                              VERIFIED MENTOR
                            </span>
                          )}
                          {isPending && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-amber-500/20 border border-amber-500/40 text-amber-300">
                              <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
                              PENDING REVIEW
                            </span>
                          )}
                          {isTampered && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-rose-500/20 border border-rose-500/40 text-rose-300">
                              <ShieldAlert className="w-4 h-4 text-rose-400" />
                              FLAGGED: TAMPERING DETECTED
                            </span>
                          )}
                          {isRejected && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-gray-800 border border-red-500/40 text-red-400">
                              <XCircle className="w-4 h-4 text-red-400" />
                              REJECTED
                            </span>
                          )}
                        </div>

                        {/* Status Description Banner */}
                        <div className="text-xs leading-relaxed">
                          {isVerified && (
                            <p className="text-emerald-300/90 font-medium">
                              Your academic credentials have been verified by institutional administration. You are officially eligible to host peer mentorship sessions and earn tokens for {v.courseCode}.
                            </p>
                          )}
                          {isPending && (
                            <p className="text-amber-300/90 font-medium">
                              Your PDF passed automated cryptographic scan and is awaiting administrative approval in the institutional queue.
                            </p>
                          )}
                          {isTampered && (
                            <div className="p-3 bg-rose-950/40 border border-rose-500/30 rounded-xl space-y-1 text-rose-200">
                              <div className="font-semibold flex items-center gap-1.5 text-rose-300">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                                <span>Forensic Rejection Reason:</span>
                              </div>
                              <p className="text-xs opacity-90">
                                {v.rejectionReason || 'Metadata inspection detected image editing software (e.g. Canva/Photoshop/GIMP).'}
                              </p>
                            </div>
                          )}
                          {isRejected && (
                            <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl space-y-1 text-red-200">
                              <div className="font-semibold flex items-center gap-1.5 text-red-300">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>Rejection Reason:</span>
                              </div>
                              <p className="text-xs opacity-90">
                                {v.rejectionReason || 'Document did not meet institutional peer mentorship eligibility criteria.'}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Metadata Row */}
                        <div className="flex flex-wrap items-center gap-4 text-[11px] text-gray-400 pt-2 border-t border-gray-800/80">
                          <div>
                            <span className="text-gray-500">Submitted:</span>{' '}
                            <span className="text-gray-300">
                              {v.createdAt ? new Date(v.createdAt).toLocaleString() : 'Just now'}
                            </span>
                          </div>
                          {v.verifiedAt && (
                            <div>
                              <span className="text-gray-500">Verified:</span>{' '}
                              <span className="text-emerald-300">
                                {new Date(v.verifiedAt).toLocaleString()}
                              </span>
                            </div>
                          )}
                          {v.documentHash && (
                            <div title={`Full SHA-256: ${v.documentHash}`}>
                              <span className="text-gray-500">SHA-256 Hash:</span>{' '}
                              <span className="font-mono text-indigo-300">
                                {v.documentHash.length > 20 ? `${v.documentHash.substring(0, 16)}...` : v.documentHash}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex flex-col gap-2 shrink-0 md:min-w-[200px]">
                        {isVerified && (
                          <button
                            onClick={() => {
                              setSelectedCourseTag(v.courseCode);
                              setActiveTab('mentors');
                            }}
                            className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>View Public Listing</span>
                          </button>
                        )}

                        {isPending && (
                          <div className="space-y-2">
                            <button
                              disabled={reviewLoadingId === v.id}
                              onClick={() => handleSimulateReview(v.id, 'VERIFIED')}
                              className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50 cursor-pointer"
                              title="Test instant approval in local environment"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Simulate Admin Approval</span>
                            </button>
                            <button
                              disabled={reviewLoadingId === v.id}
                              onClick={() => handleSimulateReview(v.id, 'REJECTED', 'Course prerequisite not satisfied in official transcripts.')}
                              className="w-full py-2 px-3 bg-gray-800 hover:bg-rose-900/50 hover:text-rose-200 text-gray-400 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Simulate Rejection</span>
                            </button>
                          </div>
                        )}

                        {(isTampered || isRejected) && (
                          <button
                            onClick={onOpenVerificationModal}
                            className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Re-apply with Official PDF</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-14 bg-gray-900/40 border border-gray-800 rounded-2xl p-6">
              <FileCheck2 className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">No Applications Submitted</h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
                You haven't applied as a peer mentor yet. Upload your official university transcript to get verified and start mentoring junior students!
              </p>
              <button
                onClick={onOpenVerificationModal}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-xs font-bold text-white rounded-xl shadow-lg transition cursor-pointer"
              >
                Apply as Verified Mentor
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
