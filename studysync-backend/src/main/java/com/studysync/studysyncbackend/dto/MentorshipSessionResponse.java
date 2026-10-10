package com.studysync.studysyncbackend.dto;

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
public class MentorshipSessionResponse {
    private Long sessionId;
    private Long mentorId;
    private Long menteeId;
    private String mentorName;
    private String menteeName;
    private String courseCode;
    private Integer tokenAmount;
    private SessionStatus status;
    private Integer rating;
    private String feedback;
    private Integer activeDurationMinutes;
    private LocalDateTime scheduledStartTime;
}
