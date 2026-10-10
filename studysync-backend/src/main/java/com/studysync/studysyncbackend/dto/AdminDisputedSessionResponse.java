package com.studysync.studysyncbackend.dto;

import com.studysync.studysyncbackend.model.enums.EscrowStatus;
import com.studysync.studysyncbackend.model.enums.SessionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDisputedSessionResponse {
    private Long sessionId;
    private Long escrowId;
    private String mentorName;
    private String mentorEmail;
    private String menteeName;
    private String menteeEmail;
    private String courseCode;
    private Integer tokenAmount;
    private Integer tokensHeld;
    private Integer tokensBurned;
    private Integer tokensPaidToMentor;
    private SessionStatus sessionStatus;
    private EscrowStatus escrowStatus;
    private Integer rating;
    private String feedback;
    private Integer activeDurationMinutes;
    private LocalDateTime scheduledStartTime;
    private LocalDateTime createdAt;
}
