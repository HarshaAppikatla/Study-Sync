package com.studysync.studysyncbackend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MentorProfileResponse {
    private Long verificationId;
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String courseCode;
    private String gradeObtained;
    private String avatarUrl;
    private String department;
    private Integer hourlyRate;
    private Double rating;
}
