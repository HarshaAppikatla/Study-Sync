import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import NotificationBell from '../components/NotificationBell';
import { useNotifications } from '../hooks/useNotifications';
import { 
  getVerifiedMentors, getMyMentorshipSessions, getMyVerifications, getCurrentUser 
} from '../services/api';
import MentorDiscovery from '../components/mentorship/MentorDiscovery';
import TranscriptUploadModal from '../components/mentorship/TranscriptUploadModal';
import BookSessionModal from '../components/mentorship/BookSessionModal';
import SessionCompletionModal from '../components/mentorship/SessionCompletionModal';
import LiveStudyRoomModal from '../components/mentorship/LiveStudyRoomModal';
import { Coins, Sparkles, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// High-caliber fallback mentor profiles if database is empty/initializing
const SEED_MENTORS = [
  {
    id: 101,
    firstName: 'Aarav',
    lastName: 'Sharma',
    department: 'Computer Science & Engineering',
    courseCode: 'CSE2001',
    gradeObtained: 'S',
    hourlyRate: 30,
    rating: 4.9,
  },
  {
    id: 102,
    firstName: 'Priya',
    lastName: 'Nair',
    department: 'Information Technology',
    courseCode: 'DSA',
    gradeObtained: 'S',
    hourlyRate: 25,
    rating: 4.8,
  },
  {
    id: 103,
    firstName: 'Rohan',
    lastName: 'Verma',
    department: 'Data Science & AI',
    courseCode: 'CSE1002',
    gradeObtained: 'A+',
    hourlyRate: 35,
    rating: 4.7,
  },
  {
    id: 104,
    firstName: 'Ananya',
    lastName: 'Deshmukh',
    department: 'Computer Science',
    courseCode: 'MAT2001',
    gradeObtained: 'S',
    hourlyRate: 20,
    rating: 4.9,
  },
  {
    id: 105,
    firstName: 'Vikram',
    lastName: 'Rao',
    department: 'Software Engineering',
    courseCode: 'OS3001',
    gradeObtained: 'A+',
    hourlyRate: 40,
    rating: 4.6,
  },
  {
    id: 106,
    firstName: 'Sneha',
    lastName: 'Kulkarni',
    department: 'Computer Science',
    courseCode: 'DBMS2002',
    gradeObtained: 'A',
    hourlyRate: 30,
    rating: 4.7,
  }
];

export default function MentorshipPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userTokens, setUserTokens] = useState(150);
  const [mentors, setMentors] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [verifications, setVerifications] = useState([]);
  const [activeDiscoveryTab, setActiveDiscoveryTab] = useState('mentors');
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [isStudyRoomOpen, setIsStudyRoomOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [studyRoomSession, setStudyRoomSession] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const { notifications, unreadCount } = useNotifications(user);

  useEffect(() => {
    const initData = async () => {
      // 1. Load User
      const storedUser = localStorage.getItem('user');
      let currentUser = null;
      if (storedUser) {
        try {
          currentUser = JSON.parse(storedUser);
          setUser(currentUser);
          if (currentUser.tokens !== undefined) {
            setUserTokens(currentUser.tokens);
          }
        } catch (e) {
          console.error('Error parsing stored user', e);
        }
      }

      try {
        const freshUser = await getCurrentUser();
        if (freshUser) {
          setUser(freshUser);
          currentUser = freshUser;
          if (freshUser.tokens !== undefined) {
            setUserTokens(freshUser.tokens);
          }
        }
      } catch (err) {
        console.warn('Could not fetch fresh user details:', err);
      }

      const activeUserId = currentUser?.id || 2;

      // 2. Fetch Verified Mentors
      try {
        const liveMentors = await getVerifiedMentors();
        if (Array.isArray(liveMentors) && liveMentors.length > 0) {
          setMentors(liveMentors);
        } else {
          setMentors(SEED_MENTORS);
        }
      } catch (err) {
        console.warn('Using seed mentors fallback:', err);
        setMentors(SEED_MENTORS);
      }

      // 3. Fetch User Sessions
      try {
        const liveSessions = await getMyMentorshipSessions(activeUserId);
        if (Array.isArray(liveSessions)) {
          setSessions(liveSessions);
        }
      } catch (err) {
        console.warn('Could not fetch user sessions:', err);
      }

      // 4. Fetch User Transcript Verifications
      try {
        const liveVerifications = await getMyVerifications(activeUserId);
        if (Array.isArray(liveVerifications)) {
          setVerifications(liveVerifications);
        }
      } catch (err) {
        console.warn('Could not fetch user verifications:', err);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const refreshSessions = async () => {
    if (!user?.id) return;
    try {
      const liveSessions = await getMyMentorshipSessions(user.id);
      if (Array.isArray(liveSessions)) {
        setSessions(liveSessions);
      }
    } catch (e) {
      console.warn('Error refreshing sessions', e);
    }
  };

  const refreshMentors = async () => {
    try {
      const liveMentors = await getVerifiedMentors();
      if (Array.isArray(liveMentors) && liveMentors.length > 0) {
        setMentors(liveMentors);
      }
    } catch (e) {
      console.warn('Error refreshing mentors', e);
    }
  };

  const refreshVerifications = async () => {
    const activeUserId = user?.id || 2;
    try {
      const liveVerifications = await getMyVerifications(activeUserId);
      if (Array.isArray(liveVerifications)) {
        setVerifications(liveVerifications);
      }
    } catch (e) {
      console.warn('Error refreshing verifications', e);
    }
  };

  const handleOpenBooking = (mentor) => {
    setSelectedMentor(mentor);
    setIsBookModalOpen(true);
  };

  const handleBookingSuccess = () => {
    showToast('Session booked successfully! Tokens locked in TokenEscrow.');
    refreshSessions();
    setUserTokens((prev) => Math.max(0, prev - (selectedMentor?.hourlyRate || 30)));
  };

  const handleOpenCompletion = (session) => {
    setSelectedSession(session);
    setIsCompleteModalOpen(true);
  };

  const handleOpenStudyRoom = (session) => {
    setStudyRoomSession(session);
    setIsStudyRoomOpen(true);
  };

  const handleCompleteFromStudyRoom = (session) => {
    setIsStudyRoomOpen(false);
    setSelectedSession(session);
    setIsCompleteModalOpen(true);
  };

  const handleCompletionSuccess = () => {
    showToast('Session verified & completed! 15% platform tokens burned, payout released to mentor.');
    refreshSessions();
  };

  const handleUploadSuccess = () => {
    showToast('Transcript submitted successfully! Track your application status under My Applications.');
    refreshMentors();
    refreshVerifications();
    setActiveDiscoveryTab('applications');
  };

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100 overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeTab="mentorship" 
        setActiveTab={(tab) => {
          if (tab === 'mentorship') return;
          navigate('/dashboard');
        }} 
        userRole={user?.role || 'STUDENT'} 
        user={user} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800/80 px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                Peer Mentorship & Anti-Collusion Hub
              </h1>
              <p className="text-xs text-gray-400 hidden sm:block">
                Transparent Token Escrow • Forensic PDF Inspection • Pairwise Rating Decay
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* User Token Wallet Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900/90 border border-gray-800 rounded-xl shadow-sm">
              <div className="p-1 bg-yellow-500/20 rounded-md text-yellow-400">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold block leading-none">Wallet</span>
                <span className="text-xs sm:text-sm font-extrabold text-white leading-tight">
                  {userTokens} Tokens
                </span>
              </div>
            </div>

            {/* Notification Bell */}
            <NotificationBell 
              notifications={notifications} 
              unreadCount={unreadCount} 
            />
          </div>
        </header>

        {/* Toast Feedback Banner */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-6 mt-4 p-4 rounded-xl text-sm font-semibold flex items-center gap-3 border shadow-xl bg-emerald-950/80 border-emerald-500/50 text-emerald-200"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{toastMessage.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Discovery & Sessions Main Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <MentorDiscovery
            mentors={mentors}
            sessions={sessions}
            verifications={verifications}
            activeTab={activeDiscoveryTab}
            onTabChange={setActiveDiscoveryTab}
            onSelectMentor={handleOpenBooking}
            onOpenVerificationModal={() => setIsUploadModalOpen(true)}
            onOpenCompletionModal={handleOpenCompletion}
            onOpenStudyRoom={handleOpenStudyRoom}
            onRefreshVerifications={refreshVerifications}
            onRefreshMentors={refreshMentors}
          />
        </main>
      </div>

      {/* MODAL 1: Transcript Forensic Upload */}
      <TranscriptUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        userId={user?.id || 2}
        onSuccess={handleUploadSuccess}
        onViewApplications={() => setActiveDiscoveryTab('applications')}
      />

      {/* MODAL 2: Escrow Session Booking */}
      <BookSessionModal
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        mentor={selectedMentor}
        menteeId={user?.id || 2}
        userTokens={userTokens}
        onSuccess={handleBookingSuccess}
      />

      {/* MODAL 3: Session Completion & 15% Token Burn */}
      <SessionCompletionModal
        isOpen={isCompleteModalOpen}
        onClose={() => setIsCompleteModalOpen(false)}
        session={selectedSession}
        userId={user?.id || 2}
        onSuccess={handleCompletionSuccess}
      />

      {/* MODAL 4: Live Study Room with Server-Side Duration Telemetry */}
      <LiveStudyRoomModal
        isOpen={isStudyRoomOpen}
        onClose={() => setIsStudyRoomOpen(false)}
        session={studyRoomSession}
        userId={user?.id || 2}
        onCompleteSession={handleCompleteFromStudyRoom}
      />
    </div>
  );
}
