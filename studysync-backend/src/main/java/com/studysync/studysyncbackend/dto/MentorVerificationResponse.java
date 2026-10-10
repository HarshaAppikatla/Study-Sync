package com.studysync.studysyncbackend.dto;

import com.studysync.studysyncbackend.model.enums.VerificationStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MentorVerificationResponse {
    private Long id;
    private Long userId;
    private String courseCode;
    private String gradeObtained;
    private VerificationStatus status;
    private String documentHash;
    private String rejectionReason;
    private LocalDateTime createdAt;
    private LocalDateTime verifiedAt;
}
