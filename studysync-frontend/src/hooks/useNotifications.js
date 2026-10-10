import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../services/api';

const getWsBaseUrl = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL.replace('/api', '');
    }
    return `http://${window.location.hostname}:8080`;
};

export const useNotifications = (user) => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [connected, setConnected] = useState(false);
    const [toasts, setToasts] = useState([]); // Live toast popups
    const clientRef = useRef(null);

    const userId = user?.id;

    // ── Fetch existing notifications from REST on mount ─────────────────
    const fetchNotifications = useCallback(async () => {
        if (!userId) return;
        try {
            const data = await getNotifications();
            setNotifications(data.notifications || []);
            setUnreadCount(data.unreadCount || 0);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    }, [userId]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // ── WebSocket STOMP connection ───────────────────────────────────────
    useEffect(() => {
        if (!userId) return;
        const token = localStorage.getItem('token');
        if (!token) return;

        let isMounted = true;

        const client = new Client({
            webSocketFactory: () => new SockJS(`${getWsBaseUrl()}/ws`),
            connectHeaders: { Authorization: `Bearer ${token}` },
            reconnectDelay: 5000,
            onConnect: () => {
                if (!isMounted) {
                    client.deactivate();
                    return;
                }
                setConnected(true);
                // Subscribe to the user-specific topic (fallback broadcast topic)
                client.subscribe(`/topic/user.${userId}.notifications`, (frame) => {
                    if (!isMounted) return;
                    try {
                        const notification = JSON.parse(frame.body);
                        handleIncomingNotification(notification);
                    } catch (e) {
                        console.error('Error parsing notification', e);
                    }
                });
            },
            onDisconnect: () => {
                if (isMounted) setConnected(false);
            },
            onStompError: (frame) => {
                console.error('STOMP error:', frame);
                if (isMounted) setConnected(false);
            },
            onWebSocketClose: () => {
                if (isMounted) setConnected(false);
            }
        });

        client.activate();
        clientRef.current = client;

        return () => {
            isMounted = false;
            if (clientRef.current) {
                try {
                    clientRef.current.deactivate();
                } catch (e) {
                    // Suppress unmount teardown noise
                }
            }
        };
    }, [userId]);

    const handleIncomingNotification = (notification) => {
        // Prepend to notifications list
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);

        // Show toast — auto-dismiss after 5 seconds
        const id = Date.now();
        setToasts(prev => [...prev, { ...notification, toastId: id }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.toastId !== id));
        }, 5000);
    };

    // ── Actions ──────────────────────────────────────────────────────────
    const markRead = useCallback(async (id) => {
        try {
            await markNotificationRead(id);
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, isRead: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Failed to mark notification read:', err);
        }
    }, []);

    const markAllRead = useCallback(async () => {
        try {
            await markAllNotificationsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Failed to mark all read:', err);
        }
    }, []);

    const dismissToast = useCallback((toastId) => {
        setToasts(prev => prev.filter(t => t.toastId !== toastId));
    }, []);

    return {
        notifications,
        unreadCount,
        connected,
        toasts,
        markRead,
        markAllRead,
        dismissToast,
    };
};
