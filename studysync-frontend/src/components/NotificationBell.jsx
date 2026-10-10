import React, { useState, useRef, useEffect } from 'react';
import { Bell, X, Check, CheckCheck, Trash2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// ── Icon by notification type ────────────────────────────────────────────────
const typeConfig = {
    BADGE_EARNED:     { emoji: '🏆', bg: 'bg-yellow-50', border: 'border-yellow-200', dot: 'bg-yellow-400' },
    COURSE_APPROVAL:  { emoji: '🎉', bg: 'bg-green-50',  border: 'border-green-200',  dot: 'bg-green-400' },
    COURSE_REJECTION: { emoji: '⚠️', bg: 'bg-red-50',    border: 'border-red-200',    dot: 'bg-red-400'   },
    DISCUSSION_REPLY: { emoji: '💬', bg: 'bg-blue-50',   border: 'border-blue-200',   dot: 'bg-blue-400'  },
    SYSTEM:           { emoji: '📢', bg: 'bg-gray-50',   border: 'border-gray-200',   dot: 'bg-gray-400'  },
};

const getConfig = (type) => typeConfig[type] || typeConfig.SYSTEM;

// ── Relative time helper ─────────────────────────────────────────────────────
const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
};

// ── Toast component (live incoming pop-ups) ──────────────────────────────────
export const NotificationToast = ({ toasts, onDismiss }) => (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
            {toasts.map((t) => {
                const cfg = getConfig(t.type);
                return (
                    <motion.div
                        key={t.toastId}
                        initial={{ x: 400, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 400, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className={`pointer-events-auto w-80 flex items-start gap-3 p-4 rounded-2xl shadow-2xl border ${cfg.bg} ${cfg.border}`}
                    >
                        <span className="text-xl flex-shrink-0 mt-0.5">{cfg.emoji}</span>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 leading-tight">{t.title}</p>
                            <p className="text-xs text-gray-600 mt-0.5 leading-snug line-clamp-2">{t.message}</p>
                        </div>
                        <button
                            onClick={() => onDismiss(t.toastId)}
                            className="flex-shrink-0 text-gray-400 hover:text-gray-700 transition"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </motion.div>
                );
            })}
        </AnimatePresence>
    </div>
);

// ── Notification Bell + Dropdown ─────────────────────────────────────────────
const NotificationBell = ({ notifications, unreadCount, onMarkRead, onMarkAllRead }) => {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleNotificationClick = (n) => {
        if (!n.isRead) onMarkRead(n.id);
        if (n.link) navigate(n.link);
        setOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell button */}
            <button
                onClick={() => setOpen(v => !v)}
                className="relative p-2 text-gray-400 hover:text-blue-600 transition-colors bg-gray-50 rounded-xl hover:bg-blue-50"
            >
                <Bell className="h-5 w-5" />
                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.span
                            key="badge"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center"
                        >
                            <span className="text-[10px] font-black text-white leading-none">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        </motion.span>
                    )}
                </AnimatePresence>
            </button>

            {/* Dropdown panel */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-12 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <Bell className="h-4 w-4 text-blue-600" />
                                <span className="font-bold text-gray-900 text-sm">Notifications</span>
                                {unreadCount > 0 && (
                                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                                        {unreadCount} new
                                    </span>
                                )}
                            </div>
                            {unreadCount > 0 && (
                                <button
                                    onClick={onMarkAllRead}
                                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold transition"
                                >
                                    <CheckCheck className="h-3.5 w-3.5" />
                                    Mark all read
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <div className="max-h-[420px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                    <Bell className="h-10 w-10 mb-3 opacity-30" />
                                    <p className="text-sm font-semibold">You're all caught up!</p>
                                    <p className="text-xs mt-1">No notifications yet.</p>
                                </div>
                            ) : (
                                notifications.slice(0, 20).map((n) => {
                                    const cfg = getConfig(n.type);
                                    return (
                                        <button
                                            key={n.id}
                                            onClick={() => handleNotificationClick(n)}
                                            className={`w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 ${!n.isRead ? 'bg-blue-50/40' : ''}`}
                                        >
                                            {/* Type dot */}
                                            <div className="flex-shrink-0 mt-1">
                                                <span className="text-lg">{cfg.emoji}</span>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className={`text-sm font-semibold leading-tight truncate ${!n.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                                                        {n.title}
                                                    </p>
                                                    <span className="text-[10px] text-gray-400 flex-shrink-0">
                                                        {timeAgo(n.createdAt)}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-2">
                                                    {n.message}
                                                </p>
                                                {n.link && (
                                                    <span className="text-[11px] text-blue-500 font-medium flex items-center gap-0.5 mt-1">
                                                        View <ArrowRight className="h-3 w-3" />
                                                    </span>
                                                )}
                                            </div>

                                            {/* Unread dot */}
                                            {!n.isRead && (
                                                <div className={`flex-shrink-0 mt-2 h-2 w-2 rounded-full ${cfg.dot}`} />
                                            )}
                                        </button>
                                    );
                                })
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/80">
                                <p className="text-[11px] text-gray-400 text-center">
                                    Showing last {Math.min(notifications.length, 20)} notifications
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationBell;
