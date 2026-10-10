package com.studysync.studysyncbackend.service;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class SessionHeartbeatService {

    // Structure: SessionID -> (UserID -> ParticipantSessionState)
    private final Map<Long, Map<Long, ParticipantState>> sessionTracker = new ConcurrentHashMap<>();

    private static class ParticipantState {
        long lastHeartbeatEpochSec;
        int verifiedMinutes;

        ParticipantState(long now) {
            this.lastHeartbeatEpochSec = now;
            this.verifiedMinutes = 0;
        }
    }

    /**
     * Records a heartbeat ping received from a client via STOMP WebSocket.
     */
    public synchronized void recordHeartbeat(Long sessionId, Long userId) {
        long nowSec = Instant.now().getEpochSecond();

        sessionTracker.putIfAbsent(sessionId, new ConcurrentHashMap<>());
        Map<Long, ParticipantState> participants = sessionTracker.get(sessionId);

        if (!participants.containsKey(userId)) {
            // Initial join ping
            participants.put(userId, new ParticipantState(nowSec));
            return;
        }

        ParticipantState state = participants.get(userId);
        long timeSinceLastPing = nowSec - state.lastHeartbeatEpochSec;

        // Enforce a valid heartbeat interval (~60 seconds with a tolerance window of 45-120 seconds)
        // Prevents users from spamming 1,000 pings in a second to fake time
        if (timeSinceLastPing >= 45) {
            state.verifiedMinutes += Math.min((int) (timeSinceLastPing / 60), 2);
            state.lastHeartbeatEpochSec = nowSec;
        }
    }

    /**
     * Gets the server-verified active duration (in minutes) for a session.
     * Takes the minimum or maximum active minutes across participants.
     */
    public int getVerifiedActiveMinutes(Long sessionId) {
        Map<Long, ParticipantState> participants = sessionTracker.get(sessionId);
        if (participants == null || participants.isEmpty()) {
            return 0;
        }

        return participants.values().stream()
                .mapToInt(p -> p.verifiedMinutes)
                .max()
                .orElse(0);
    }

    /**
     * Clears tracker memory when session is completed or cancelled.
     */
    public void clearSessionTracker(Long sessionId) {
        sessionTracker.remove(sessionId);
    }
}
