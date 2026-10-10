import React, { useState } from 'react';
import { 
  Star, CheckCircle2, Flame, Coins, X, Clock, 
  AlertTriangle, Loader2, Sparkles, ShieldCheck 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';

const RATING_LABELS = {
  1: '1 Star - Needs Improvement',
  2: '2 Stars - Fair / Basic Help',
  3: '3 Stars - Good Session',
  4: '4 Stars - Very Helpful & Knowledgeable',
  5: '5 Stars - Exceptional Mentorship & Clear Concepts',
};

export default function SessionCompletionModal({ 
  isOpen, 
  onClose, 
  session, 
  userId, 
  onSuccess 
}) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [activeDurationMinutes, setActiveDurationMinutes] = useState(25);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !session) return null;

  // 15% platform commission calculation
  const totalTokens = session.tokenAmount || 30;
  const burnedTokens = Math.round(totalTokens * 0.15);
  const mentorPayout = totalTokens - burnedTokens;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const duration = Number(activeDurationMinutes);
    if (!duration || duration < 20) {
      setError('Active duration must be at least 20 minutes to verify study completion and trigger escrow release.');
      return;
    }

    if (!rating || rating < 1 || rating > 5) {
      setError('Please provide a rating between 1 and 5 stars.');
      return;
    }

    setLoading(true);

    try {
      // Backend endpoint: POST /api/v1/mentorship/sessions/complete?userId={userId}
      await api.post(`/v1/mentorship/sessions/complete?userId=${userId}`, {
        sessionId: session.sessionId || session.id,
        rating: Number(rating),
        feedback: feedback.trim(),
        activeDurationMinutes: duration,
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data || err.message || 'Failed to complete session.';
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
              <div className="p-2 bg-emerald-600/20 border border-emerald-500/30 rounded-xl text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">Complete & Rate Session</h2>
                <p className="text-xs text-gray-400">Burn 15% platform commission and release escrow payout</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-1.5 rounded-xl hover:bg-gray-800 text-gray-400 hover:text-white transition duration-150"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Session Overview Pill */}
          <div className="my-4 p-3.5 bg-gray-800/40 border border-gray-800 rounded-xl flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-white text-sm">{session.mentorName || 'Senior Mentor'}</p>
              <span className="font-mono text-indigo-400 font-semibold">{session.courseCode || 'CSE2001'}</span>
            </div>
            <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-indigo-300 font-semibold">
              Session #{session.sessionId || session.id}
            </span>
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

          {/* Token Burn Breakdown Summary */}
          <div className="mb-4 p-4 bg-gray-800/50 border border-gray-800 rounded-xl space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold uppercase tracking-wider text-gray-400">Token Escrow Breakdown</span>
              <span className="text-[11px] text-gray-500">Anti-Collusion Mechanism Active</span>
            </div>

            <div className="flex justify-between text-xs pt-1">
              <span className="text-gray-300">Total Tokens Held in Escrow:</span>
              <span className="font-bold text-white">{totalTokens} Tokens</span>
            </div>

            <div className="flex justify-between text-xs text-rose-400">
              <span className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-400" /> 
                15% Non-Refundable Platform Token Burn:
              </span>
              <span className="font-bold font-mono">-{burnedTokens} Tokens</span>
            </div>

            <div className="flex justify-between text-xs text-emerald-400 pt-2 border-t border-gray-700/80 font-semibold">
              <span className="flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-emerald-400" />
                Net Mentor Payout (85%):
              </span>
              <span className="font-extrabold text-sm font-mono">+{mentorPayout} Tokens</span>
            </div>

            <p className="text-[10px] text-gray-400 pt-1 leading-snug">
              *The 15% token burn permanently destroys tokens on every session, preventing colluding users from artificially inflating ratings without financial decay.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Star Rating Input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Mentor Rating <span className="text-rose-400">*</span>
                </label>
                <span className="text-xs font-bold text-amber-400">
                  {RATING_LABELS[hoverRating || rating]}
                </span>
              </div>

              <div className="flex gap-2 p-3 bg-gray-800/40 rounded-xl border border-gray-800 justify-center">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= (hoverRating || rating);
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1.5 text-amber-400 hover:scale-125 transition-transform duration-150 cursor-pointer focus:outline-none"
                    >
                      <Star 
                        className={`w-8 h-8 transition-colors ${
                          isFilled 
                            ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]' 
                            : 'text-gray-600'
                        }`} 
                      />
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-gray-500 mt-1">
                Ratings are pairwise-decay weighted: Weight = 1 / (Previous Sessions Between Pair).
              </p>
            </div>

            {/* Active Duration Input */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Active Duration (Minutes) <span className="text-rose-400">*</span>
                </label>
                <span className="text-[11px] text-indigo-400 font-semibold">Min 20 mins required</span>
              </div>
              <div className="relative">
                <Clock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="number"
                  min="20"
                  value={activeDurationMinutes}
                  onChange={(e) => setActiveDurationMinutes(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-800/80 border border-gray-700/80 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono transition"
                  required
                />
              </div>
            </div>

            {/* Written Feedback Input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                Feedback & Review
              </label>
              <textarea
                rows="3"
                placeholder="Share your experience (topics covered, problem solving approach, clarity)..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                maxLength={500}
                className="w-full px-4 py-2.5 bg-gray-800/80 border border-gray-700/80 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none transition"
              />
              <div className="flex justify-end mt-1 text-[10px] text-gray-500">
                {feedback.length}/500 characters
              </div>
            </div>

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
                disabled={loading || activeDurationMinutes < 20}
                className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Releasing Escrow...</span>
                  </>
                ) : (
                  <>
                    <Coins className="w-4 h-4" />
                    <span>Submit & Release Escrow</span>
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
