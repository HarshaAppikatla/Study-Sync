import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const getWsBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace('/api', '');
  }
  return `http://${window.location.hostname}:8080`;
};

export function useSessionHeartbeat(sessionId, userId, isSessionActive = false) {
  const [verifiedMinutes, setVerifiedMinutes] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const stompClientRef = useRef(null);

  useEffect(() => {
    if (!sessionId || !userId || !isSessionActive) return;

    // Connect via SockJS fallback
    const socket = new SockJS(`${getWsBaseUrl()}/ws-studysync`);
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        setIsConnected(true);

        // Subscribe to server heartbeat acknowledgments
        client.subscribe(`/topic/mentorship/session/${sessionId}`, (message) => {
          try {
            const data = JSON.parse(message.body);
            if (data.type === 'HEARTBEAT_ACK') {
              setVerifiedMinutes(data.verifiedActiveMinutes);
            }
          } catch (e) {
            console.error('Failed to parse heartbeat ACK', e);
          }
        });

        // Send initial heartbeat ping immediately upon connection
        sendHeartbeat(client);
      },
      onDisconnect: () => {
        setIsConnected(false);
      },
    });

    client.activate();
    stompClientRef.current = client;

    // Send heartbeat every 60 seconds (60,000 ms)
    const intervalId = setInterval(() => {
      if (stompClientRef.current && stompClientRef.current.connected) {
        sendHeartbeat(stompClientRef.current);
      }
    }, 60000);

    return () => {
      clearInterval(intervalId);
      if (stompClientRef.current) {
        stompClientRef.current.deactivate();
      }
    };
  }, [sessionId, userId, isSessionActive]);

  const sendHeartbeat = (client) => {
    if (client && client.connected) {
      client.publish({
        destination: '/app/mentorship/heartbeat',
        body: JSON.stringify({ sessionId, userId }),
      });
    }
  };

  return { verifiedMinutes, isConnected };
}
