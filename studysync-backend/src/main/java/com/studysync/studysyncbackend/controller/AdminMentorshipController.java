package com.studysync.studysyncbackend.controller;

import com.studysync.studysyncbackend.dto.*;
import com.studysync.studysyncbackend.service.AdminMentorshipService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/mentorship")
@RequiredArgsConstructor
public class AdminMentorshipController {

    private final AdminMentorshipService adminMentorshipService;

    @GetMapping("/transcripts/flagged")
    public ResponseEntity<List<AdminTranscriptResponse>> getFlaggedAndPendingTranscripts() {
        return ResponseEntity.ok(adminMentorshipService.getFlaggedAndPendingTranscripts());
    }

    @PutMapping("/transcripts/{id}/review")
    public ResponseEntity<AdminTranscriptResponse> reviewTranscript(
            @PathVariable Long id,
            @Valid @RequestBody TranscriptReviewRequest request) {
        return ResponseEntity.ok(adminMentorshipService.reviewTranscript(id, request));
    }

    @GetMapping("/sessions/disputed")
    public ResponseEntity<List<AdminDisputedSessionResponse>> getDisputedSessions() {
        return ResponseEntity.ok(adminMentorshipService.getDisputedSessions());
    }

    @PutMapping("/sessions/{id}/resolve-dispute")
    public ResponseEntity<String> resolveDispute(
            @PathVariable Long id,
            @Valid @RequestBody DisputeResolutionRequest request) {
        return ResponseEntity.ok(adminMentorshipService.resolveDispute(id, request));
    }

    @PostMapping("/seed-sample-data")
    public ResponseEntity<String> seedSampleData() {
        adminMentorshipService.seedSampleAdminData();
        return ResponseEntity.ok("Sample governance test data seeded successfully: 2 flagged transcripts, 2 pending verifications, and 2 disputed sessions.");
    }
}
