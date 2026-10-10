package com.studysync.studysyncbackend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DisputeResolutionRequest {
    @NotBlank(message = "Action is required: REFUND_MENTEE or RELEASE_MENTOR")
    private String action; // "REFUND_MENTEE" or "RELEASE_MENTOR"

    private String resolutionNotes;
}
