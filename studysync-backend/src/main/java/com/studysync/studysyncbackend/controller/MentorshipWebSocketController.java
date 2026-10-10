package com.studysync.studysyncbackend.controller;

import com.studysync.studysyncbackend.service.SessionHeartbeatService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
@RequiredArgsConstructor
public class MentorshipWebSocketController {

    private final SessionHeartbeatService heartbeatService;
    private final SimpMessagingTemplate messagingTemplate;

    @Data
    public static class HeartbeatPayload {
        private Long sessionId;
        private Long userId;
    }

    @MessageMapping("/mentorship/heartbeat")
    public void handleHeartbeat(@Payload HeartbeatPayload payload) {
        if (payload.getSessionId() != null && payload.getUserId() != null) {
            // Log heartbeat in server memory
            heartbeatService.recordHeartbeat(payload.getSessionId(), payload.getUserId());

            int verifiedMinutes = heartbeatService.getVerifiedActiveMinutes(payload.getSessionId());

            // Broadcast verified status back to the session participants
            messagingTemplate.convertAndSend(
                    "/topic/mentorship/session/" + payload.getSessionId(),
                    Map.of(
                            "type", "HEARTBEAT_ACK",
                            "sessionId", payload.getSessionId(),
                            "verifiedActiveMinutes", verifiedMinutes
                    )
            );
        }
    }
}
