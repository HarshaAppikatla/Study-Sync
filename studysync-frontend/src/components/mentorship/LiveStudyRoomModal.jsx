import React, { useState } from 'react';
import { Radio, Clock, ShieldCheck, CheckCircle2, X } from 'lucide-react';
import { useSessionHeartbeat } from '../../hooks/useSessionHeartbeat';

export default function LiveStudyRoomModal({ isOpen, onClose, session, userId, onCompleteSession }) {
  const [isActive, setIsActive] = useState(true);

  // Hook automatically manages WebSocket connection & pings server every 60s
  const { verifiedMinutes, isConnected } = useSessionHeartbeat(
    session?.sessionId || session?.id,
    userId,
    isOpen && isActive
  );

  if (!isOpen || !session) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 text-white">
      <div className="relative w-full max-w-2xl rounded-2xl bg-gray-900 border border-gray-800 p-6 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-indigo-400">
              <Clock className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-bold">1-on-1 Mentorship Study Room</h2>
              <p className="text-xs text-gray-400">Course: {session.courseCode}</p>
            </div>
          </div>

          {/* Connection Indicator */}
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-800 border border-gray-700 rounded-full text-xs">
            <Radio className={`w-3.5 h-3.5 ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-gray-500'}`} />
            <span className={isConnected ? 'text-emerald-300 font-medium' : 'text-gray-400'}>
              {isConnected ? 'Live WebSocket Connected' : 'Connecting...'}
            </span>
          </div>
        </div>

        {/* Live Active Duration Tracker */}
        <div className="p-6 bg-gradient-to-r from-gray-950 via-indigo-950/30 to-gray-950 border border-indigo-500/20 rounded-2xl text-center space-y-2">
          <span className="text-xs font-semibold uppercase text-gray-400 tracking-wider">
            Server-Verified Active Duration
          </span>
          <div className="text-5xl font-extrabold text-white font-mono tracking-tight">
            {verifiedMinutes} <span className="text-xl text-indigo-400 font-normal">mins</span>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 pt-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Encrypted STOMP Heartbeat Active (Interval: 60s)</span>
          </div>
        </div>

        {/* Status Threshold Indicator */}
        <div className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
          verifiedMinutes >= 20
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
            : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              {verifiedMinutes >= 20
                ? 'Minimum duration threshold satisfied (>= 20 mins). Ready for escrow release.'
                : `Need ${20 - verifiedMinutes} more verified active minutes before escrow payout can be released.`}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            Leave Room
          </button>
          <button
            onClick={() => {
              setIsActive(false);
              onCompleteSession(session, verifiedMinutes);
            }}
            disabled={verifiedMinutes < 20}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow-md transition cursor-pointer"
          >
            Complete Session & Release Escrow
          </button>
        </div>

      </div>
    </div>
  );
}
