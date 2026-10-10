package com.studysync.studysyncbackend.controller;

import com.studysync.studysyncbackend.dto.*;
import com.studysync.studysyncbackend.service.MentorshipService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/mentorship")
@RequiredArgsConstructor
public class MentorshipController {

    private final MentorshipService mentorshipService;

    @PostMapping("/verify")
    public ResponseEntity<String> uploadTranscript(
            @RequestParam("userId") Long userId,
            @RequestParam("courseCode") String courseCode,
            @RequestParam("gradeObtained") String gradeObtained,
            @RequestParam("file") MultipartFile file) throws Exception {

        String response = mentorshipService.submitTranscript(userId, courseCode, gradeObtained, file);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/sessions/book")
    public ResponseEntity<MentorshipSessionResponse> bookSession(
            @RequestParam("menteeId") Long menteeId,
            @Valid @RequestBody SessionBookingRequest request) {

        MentorshipSessionResponse response = mentorshipService.bookSession(menteeId, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/sessions/complete")
    public ResponseEntity<String> completeSession(
            @RequestParam("userId") Long userId,
            @Valid @RequestBody SessionCompletionRequest request) {

        String response = mentorshipService.completeSession(userId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/mentors/{mentorId}/rating")
    public ResponseEntity<Double> getMentorRating(@PathVariable Long mentorId) {
        double rating = mentorshipService.getWeightedMentorRating(mentorId);
        return ResponseEntity.ok(rating);
    }

    @GetMapping("/mentors")
    public ResponseEntity<java.util.List<MentorProfileResponse>> getVerifiedMentors() {
        return ResponseEntity.ok(mentorshipService.getVerifiedMentors());
    }

    @GetMapping("/sessions/my")
    public ResponseEntity<java.util.List<MentorshipSessionResponse>> getMySessions(@RequestParam("userId") Long userId) {
        return ResponseEntity.ok(mentorshipService.getSessionsForUser(userId));
    }

    @GetMapping("/verifications/my")
    public ResponseEntity<java.util.List<MentorVerificationResponse>> getMyVerifications(@RequestParam("userId") Long userId) {
        return ResponseEntity.ok(mentorshipService.getVerificationsForUser(userId));
    }

    @PutMapping("/verifications/{id}/review")
    public ResponseEntity<String> reviewVerification(
            @PathVariable("id") Long id,
            @RequestParam("status") com.studysync.studysyncbackend.model.enums.VerificationStatus status,
            @RequestParam(value = "rejectionReason", required = false) String rejectionReason) {
        mentorshipService.reviewVerification(id, status, rejectionReason);
        return ResponseEntity.ok("Verification status updated to " + status);
    }
}
