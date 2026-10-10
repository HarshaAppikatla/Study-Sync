package com.studysync.studysyncbackend.dto;

import com.studysync.studysyncbackend.model.enums.StorageState;
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
public class AdminTranscriptResponse {
    private Long id;
    private Long userId;
    private String studentName;
    private String studentEmail;
    private String courseCode;
    private String gradeObtained;
    private VerificationStatus status;
    private String documentHash;
    private String transcriptDocumentUrl;
    private String rejectionReason;
    private StorageState storageState;
    private LocalDateTime verifiedAt;
    private LocalDateTime purgedAt;
    private LocalDateTime createdAt;
}
