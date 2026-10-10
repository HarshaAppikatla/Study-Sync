import React, { useState } from 'react';
import { 
  Calendar, Lock, Coins, X, Info, Flame, ShieldCheck, 
  Clock, AlertTriangle, Loader2, CheckCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

export default function BookSessionModal({ 
  isOpen, 
  onClose, 
  mentor, 
  menteeId, 
  userTokens = 100, 
  onSuccess 
}) {
  // Set default scheduled time to tomorrow at 15:00
  const getDefaultTime = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(15, 0, 0, 0);
    return tomorrow.toISOString().slice(0, 16);
  };

  const [scheduledStartTime, setScheduledStartTime] = useState(getDefaultTime());
  const [tokenAmount, setTokenAmount] = useState(mentor?.hourlyRate || 30);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !mentor) return null;

  // Escrow math calculations
  const totalTokens = Number(tokenAmount) || 0;
  const burnedTokens = Math.round(totalTokens * 0.15);
  const mentorPayout = totalTokens - burnedTokens;
  const hasEnoughTokens = userTokens >= totalTokens;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!hasEnoughTokens) {
      setError(`Insufficient token balance. You have ${userTokens} tokens, but ${totalTokens} tokens are required to lock in Escrow.`);
      return;
    }

    if (totalTokens < 10) {
      setError('Minimum session price is 10 tokens.');
      return;
    }

    if (!scheduledStartTime) {
      setError('Please select a valid date and time for your study session.');
      return;
    }

    setLoading(true);

    try {
      // Backend endpoint: POST /api/v1/mentorship/sessions/book?menteeId={menteeId}
      await api.post(`/v1/mentorship/sessions/book?menteeId=${menteeId}`, {
        mentorId: mentor.id,
        courseCode: mentor.courseCode || 'CSE2001',
        tokenAmount: totalTokens,
        scheduledStartTime: scheduledStartTime,
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data || err.message || 'Failed to book session.';
      setError(typeof errMsg === 'string' ? errMsg : JSON.stringify(errMsg));
    } finally {
      setLoading(false);
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
          className="relative w-full max-w-lg rounded-2xl bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 p-6 sm:p-7 shadow-2xl text-white my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-800/80">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">Book 1-on-1 Session</h2>
                <p className="text-xs text-gray-400">Lock tokens in safe escrow for verified study</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-1.5 rounded-xl hover:bg-gray-800 text-gray-400 hover:text-white transition duration-150"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mentor Profile Overview & User Wallet */}
          <div className="my-4 p-4 bg-gray-800/40 rounded-xl border border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-sm text-white shrink-0">
                {mentor.firstName?.[0] || 'M'}
              </div>
              <div className="truncate">
                <p className="text-sm font-bold text-white truncate">{mentor.firstName} {mentor.lastName}</p>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-indigo-400 font-mono font-semibold">{mentor.courseCode || 'CSE2001'}</span>
                  {mentor.gradeObtained && (
                    <span className="text-emerald-400">• Grade {mentor.gradeObtained}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right shrink-0 pl-3 border-l border-gray-700/60">
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block">Your Balance</span>
              <span className={`text-sm font-extrabold flex items-center gap-1 justify-end ${
                hasEnoughTokens ? 'text-yellow-400' : 'text-rose-400'
              }`}>
                <Coins className="w-3.5 h-3.5" />
                {userTokens} Tokens
              </span>
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3.5 bg-rose-950/70 border border-rose-500/50 rounded-xl text-xs text-rose-200 flex items-start gap-2.5"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Escrow Transparency Card */}
          <div className="mb-4 p-4 bg-indigo-950/30 border border-indigo-500/30 rounded-xl text-xs space-y-2.5">
            <div className="flex items-center gap-2 text-indigo-300 font-bold">
              <Lock className="w-4 h-4 text-indigo-400" />
              <span>Anti-Collusion Escrow Mechanism</span>
            </div>
            <p className="text-gray-300 leading-relaxed text-[11px]">
              Tokens are held in <strong className="text-indigo-200">TokenEscrow</strong> and will NOT be transferred until you confirm completion of at least 20 active minutes.
            </p>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-indigo-900/50 text-[11px]">
              <div className="p-2 bg-gray-900/60 rounded-lg">
                <span className="text-gray-400 block text-[9px] uppercase font-semibold">Held In Escrow</span>
                <span className="font-extrabold text-white">{totalTokens} Tokens</span>
              </div>
              <div className="p-2 bg-rose-950/40 rounded-lg border border-rose-900/40">
                <span className="text-rose-300 block text-[9px] uppercase font-semibold flex items-center gap-1">
                  <Flame className="w-2.5 h-2.5" /> 15% Burn Fee
                </span>
                <span className="font-extrabold text-rose-300">-{burnedTokens} Tokens</span>
              </div>
              <div className="p-2 bg-emerald-950/40 rounded-lg border border-emerald-900/40">
                <span className="text-emerald-300 block text-[9px] uppercase font-semibold">Mentor Payout</span>
                <span className="font-extrabold text-emerald-300">+{mentorPayout} Tokens</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                Session Date & Time <span className="text-rose-400">*</span>
              </label>
              <input
                type="datetime-local"
                value={scheduledStartTime}
                onChange={(e) => setScheduledStartTime(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-800/80 border border-gray-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Escrow Token Amount <span className="text-rose-400">*</span>
                </label>
                <div className="flex gap-1.5">
                  {[20, 30, 50].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setTokenAmount(val)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                        tokenAmount === val
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      {val} T
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="number"
                min="10"
                value={tokenAmount}
                onChange={(e) => setTokenAmount(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-800/80 border border-gray-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono transition"
                required
              />
              <p className="text-[10px] text-gray-500 mt-1">Minimum escrow price: 10 tokens</p>
            </div>

            {/* Buttons */}
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
                disabled={loading || !hasEnoughTokens}
                className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Locking Escrow...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Confirm & Lock Escrow</span>
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
