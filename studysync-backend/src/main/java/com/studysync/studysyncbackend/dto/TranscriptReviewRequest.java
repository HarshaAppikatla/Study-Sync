package com.studysync.studysyncbackend.dto;

import com.studysync.studysyncbackend.model.enums.VerificationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class TranscriptReviewRequest {
    @NotNull(message = "Review status is required (VERIFIED or REJECTED)")
    private VerificationStatus status;

    private String reviewNotes;
}
