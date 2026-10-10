package com.studysync.studysyncbackend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SessionCompletionRequest {
    @NotNull
    private Long sessionId;

    @NotNull
    @Min(1) @Max(5)
    private Integer rating;

    private String feedback;

    @NotNull
    @Min(value = 20, message = "Session must be active for at least 20 minutes")
    private Integer activeDurationMinutes;
}
