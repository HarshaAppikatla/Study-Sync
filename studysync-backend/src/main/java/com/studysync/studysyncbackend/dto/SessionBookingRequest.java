package com.studysync.studysyncbackend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SessionBookingRequest {
    @NotNull(message = "Mentor ID is required")
    private Long mentorId;

    @NotBlank(message = "Course code is required")
    private String courseCode;

    @NotNull
    @Min(value = 10, message = "Minimum session price is 10 tokens")
    private Integer tokenAmount;

    @NotNull
    private LocalDateTime scheduledStartTime;
}
