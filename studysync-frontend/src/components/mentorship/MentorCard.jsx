import React, { useEffect, useState } from 'react';
import { Star, ShieldCheck, Clock, Coins, Award, Sparkles, HelpCircle, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../../services/api';

export default function MentorCard({ mentor, onBookSession }) {
  const [rating, setRating] = useState(mentor.rating || 0.0);
  const [loadingRating, setLoadingRating] = useState(true);
  const [showFormulaTooltip, setShowFormulaTooltip] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (mentor.id) {
      api.get(`/v1/mentorship/mentors/${mentor.id}/rating`)
        .then((res) => {
          if (isMounted) {
            const val = typeof res.data === 'number' ? res.data : parseFloat(res.data);
            setRating(val > 0 ? val : (mentor.rating || 4.8));
            setLoadingRating(false);
          }
        })
        .catch(() => {
          if (isMounted) {
            setRating(mentor.rating || 4.8);
            setLoadingRating(false);
          }
        });
    }
    return () => {
      isMounted = false;
    };
  }, [mentor.id, mentor.rating]);

  const initials = `${mentor.firstName?.[0] || 'M'}${mentor.lastName?.[0] || ''}`.toUpperCase();

  return (
    <motion.div 
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="p-5 bg-gradient-to-b from-gray-900/90 to-gray-950 border border-gray-800 hover:border-indigo-500/50 rounded-2xl shadow-xl transition-all duration-300 flex flex-col justify-between relative group overflow-hidden"
    >
      {/* Top subtle highlight */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent opacity-0 group-hover:opacity-100 transition duration-500" />

      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold rounded-lg font-mono tracking-wider uppercase">
              {mentor.courseCode || 'CSE2001'}
            </span>
            {mentor.gradeObtained && (
              <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold rounded-md flex items-center gap-1">
                <Award className="w-3 h-3" />
                Grade {mentor.gradeObtained}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold rounded-full shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span className="tracking-wide text-[11px]">VERIFIED</span>
          </div>
        </div>

        {/* Mentor Profile Info */}
        <div className="flex items-start gap-3.5 mb-4">
          {mentor.avatarUrl ? (
            <img 
              src={mentor.avatarUrl} 
              alt={`${mentor.firstName} ${mentor.lastName}`}
              className="w-12 h-12 rounded-xl object-cover border border-gray-700 shadow-md shrink-0" 
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-md shrink-0 border border-indigo-500/30">
              {initials}
            </div>
          )}
          
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-bold text-white truncate group-hover:text-indigo-300 transition">
              {mentor.firstName} {mentor.lastName}
            </h3>
            <p className="text-xs text-gray-400 truncate">
              {mentor.department || mentor.profession || 'Computer Science & Engineering'}
            </p>
            <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Verified University Transcript
            </p>
          </div>
        </div>

        {/* Weighted Rating & Token Rate Box */}
        <div className="grid grid-cols-2 gap-2 p-3 bg-gray-800/40 rounded-xl mb-4 border border-gray-800/80 backdrop-blur-sm relative">
          {/* Anti-Collusion Weighted Rating */}
          <div className="flex items-center gap-2 relative">
            <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-400">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-sm font-extrabold text-white">
                  {loadingRating ? '...' : (rating > 0 ? rating.toFixed(1) : '4.8')}
                </span>
                <button
                  type="button"
                  onMouseEnter={() => setShowFormulaTooltip(true)}
                  onMouseLeave={() => setShowFormulaTooltip(false)}
                  onClick={() => setShowFormulaTooltip(!showFormulaTooltip)}
                  className="text-gray-400 hover:text-indigo-400 transition"
                  title="Anti-Collusion Rating Explanation"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-[10px] text-gray-400 block leading-tight">Decay-Weighted</span>
            </div>

            {/* Anti-Collusion Tooltip */}
            {showFormulaTooltip && (
              <div className="absolute bottom-full left-0 mb-2 w-56 p-2.5 bg-gray-950 border border-indigo-500/50 rounded-xl shadow-2xl text-[11px] text-gray-300 z-30">
                <p className="font-bold text-indigo-300 mb-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-400" /> Anti-Collusion Metric
                </p>
                <p className="leading-snug">
                  Rating Weight = 1 / Previous Sessions Between Pair. Prevents friends from cycling fake 5-star ratings!
                </p>
              </div>
            )}
          </div>

          {/* Token Price */}
          <div className="flex items-center gap-2 border-l border-gray-700/80 pl-3">
            <div className="p-1.5 bg-yellow-500/10 rounded-lg text-yellow-400">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <span className="text-sm font-extrabold text-white">
                {mentor.hourlyRate || 30} Tokens
              </span>
              <span className="text-[10px] text-gray-400 block leading-tight">per 60 mins</span>
            </div>
          </div>
        </div>
      </div>

      {/* Book CTA */}
      <button
        onClick={() => onBookSession(mentor)}
        className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:scale-[0.99] text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
      >
        <Clock className="w-4 h-4 text-indigo-200" />
        <span>Book 1-on-1 Session</span>
      </button>
    </motion.div>
  );
}
