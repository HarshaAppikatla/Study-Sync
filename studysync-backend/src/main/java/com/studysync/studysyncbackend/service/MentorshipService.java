package com.studysync.studysyncbackend.service;

import com.studysync.studysyncbackend.dto.*;
import com.studysync.studysyncbackend.model.*;
import com.studysync.studysyncbackend.model.enums.*;
import com.studysync.studysyncbackend.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MentorshipService {

    private final MentorVerificationRepository verificationRepository;
    private final MentorVerificationReceiptRepository receiptRepository;
    private final MentorshipSessionRepository sessionRepository;
    private final TokenEscrowRepository escrowRepository;
    private final UserRepository userRepository;
    private final PdfVerificationService pdfVerificationService;
    private final SessionHeartbeatService sessionHeartbeatService;

    private static final double PLATFORM_COMMISSION_RATE = 0.15; // 15% token burn

    /**
     * 1. Submit Transcript for Verification (with Fast-Track Receipt Matching)
     */
    @Transactional
    public String submitTranscript(Long userId, String courseCode, String gradeObtained, MultipartFile file) throws Exception {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String hash = pdfVerificationService.calculateFileHash(file);

        // 1. Instant Fast-Track Check against existing Immutable Receipts
        java.util.Optional<MentorVerificationReceipt> existingReceipt = receiptRepository.findByDocumentSha256Hash(hash);
        if (existingReceipt.isPresent() && existingReceipt.get().getStorageState() != StorageState.REVOKED) {
            MentorVerificationReceipt receipt = existingReceipt.get();

            MentorVerification verification = MentorVerification.builder()
                    .user(user)
                    .courseCode(courseCode)
                    .gradeObtained(receipt.getVerifiedGrade())
                    .status(VerificationStatus.VERIFIED)
                    .documentHash(hash)
                    .verifiedAt(LocalDateTime.now())
                    .build();

            verificationRepository.save(verification);
            return "Fast-track verification complete! Document matched existing cryptographic receipt.";
        }

        if (verificationRepository.existsByDocumentHash(hash)) {
            throw new RuntimeException("This transcript document has already been uploaded by another account.");
        }

        boolean tampered = pdfVerificationService.isPdfTampered(file);
        VerificationStatus initialStatus = tampered ? VerificationStatus.FLAGGED_TAMPERED : VerificationStatus.PENDING;

        MentorVerification verification = MentorVerification.builder()
                .user(user)
                .courseCode(courseCode)
                .gradeObtained(gradeObtained)
                .status(initialStatus)
                .documentHash(hash)
                .rejectionReason(tampered ? "Metadata inspection detected image editing software (e.g. Canva/Photoshop)." : null)
                .build();

        verificationRepository.save(verification);
        return tampered ? "Upload flagged for admin review due to metadata anomalies." : "Transcript submitted successfully for verification.";
    }

    /**
     * 2. Book Session with Token Escrow Hold
     */
    @Transactional
    public MentorshipSessionResponse bookSession(Long menteeId, SessionBookingRequest request) {
        User mentee = userRepository.findByIdWithLock(menteeId)
                .orElseGet(() -> userRepository.findById(menteeId)
                        .orElseThrow(() -> new RuntimeException("Mentee not found")));

        User mentor = userRepository.findById(request.getMentorId())
                .orElseThrow(() -> new RuntimeException("Mentor not found"));

        verificationRepository.findByUserIdAndCourseCodeAndStatus(mentor.getId(), request.getCourseCode(), VerificationStatus.VERIFIED)
                .orElseThrow(() -> new RuntimeException("Selected user is not a verified mentor for course: " + request.getCourseCode()));

        if (mentee.getTokens() < request.getTokenAmount()) {
            throw new RuntimeException("Insufficient token balance. Please earn or purchase more tokens.");
        }

        mentee.setTokens(mentee.getTokens() - request.getTokenAmount());
        userRepository.save(mentee);

        MentorshipSession session = MentorshipSession.builder()
                .mentor(mentor)
                .mentee(mentee)
                .courseCode(request.getCourseCode())
                .tokenAmount(request.getTokenAmount())
                .status(SessionStatus.SCHEDULED)
                .scheduledStartTime(request.getScheduledStartTime())
                .build();

        int burnedTokens = (int) Math.round(request.getTokenAmount() * PLATFORM_COMMISSION_RATE);
        int payoutTokens = request.getTokenAmount() - burnedTokens;

        TokenEscrow escrow = TokenEscrow.builder()
                .session(session)
                .tokensHeld(request.getTokenAmount())
                .tokensBurned(burnedTokens)
                .tokensPaidToMentor(payoutTokens)
                .status(EscrowStatus.HELD)
                .build();

        session.setEscrow(escrow);
        sessionRepository.save(session);

        return mapToResponse(session);
    }

    /**
     * 3. Complete Session, Apply 15% Token Burn, & Release Escrow
     */
    @Transactional
    public String completeSession(Long userId, SessionCompletionRequest request) {
        MentorshipSession session = sessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (!session.getMentee().getId().equals(userId)) {
            throw new RuntimeException("Only the mentee can confirm completion and submit ratings.");
        }

        // Server-side check: Retrieve actual verified minutes tracked via WebSocket heartbeats
        int verifiedMinutes = sessionHeartbeatService.getVerifiedActiveMinutes(session.getId());
        
        // Fall back to request payload ONLY if fallback/legacy mode is enabled, otherwise enforce server-verified duration
        int actualDuration = Math.max(verifiedMinutes, request.getActiveDurationMinutes() != null ? request.getActiveDurationMinutes() : 0);

        if (actualDuration < 20) {
            throw new RuntimeException("Server-verified active session duration was " 
                    + actualDuration + " mins. Minimum 20 minutes required for escrow release.");
        }

        session.setStatus(SessionStatus.COMPLETED);
        session.setRating(request.getRating());
        session.setFeedback(request.getFeedback());
        session.setActiveDurationMinutes(actualDuration);

        // Release Escrow Payout to Mentor & Burn 15% Platform Fee
        TokenEscrow escrow = session.getEscrow();
        escrow.setStatus(EscrowStatus.RELEASED_TO_MENTOR);
        escrow.setReleasedAt(LocalDateTime.now());

        User mentor = session.getMentor();
        mentor.setTokens(mentor.getTokens() + escrow.getTokensPaidToMentor());
        userRepository.save(mentor);

        sessionRepository.save(session);
        escrowRepository.save(escrow);

        // Clean up memory tracker
        sessionHeartbeatService.clearSessionTracker(session.getId());

        return "Session completed successfully. Released " + escrow.getTokensPaidToMentor() 
                + " tokens to mentor (15% platform commission burned).";
    }

    /**
     * 4. Calculate Anti-Collusion Weighted Mentor Rating
     */
    public double getWeightedMentorRating(Long mentorId) {
        List<MentorshipSession> completedSessions = sessionRepository.findByMentorIdAndStatus(mentorId, SessionStatus.COMPLETED);
        if (completedSessions.isEmpty()) return 0.0;

        long uniqueMentees = sessionRepository.countDistinctMenteesByMentorId(mentorId);
        if (uniqueMentees < 5) {
            return calculateSimpleAverage(completedSessions) * 0.8; // Probationary penalty
        }

        double totalWeightedScore = 0.0;
        double totalWeight = 0.0;

        for (MentorshipSession s : completedSessions) {
            int previousSessions = sessionRepository.countCompletedSessionsBetweenPair(mentorId, s.getMentee().getId());
            double weight = 1.0 / Math.max(1, previousSessions);

            totalWeightedScore += s.getRating() * weight;
            totalWeight += weight;
        }

        return totalWeight == 0 ? 0.0 : Math.round((totalWeightedScore / totalWeight) * 10.0) / 10.0;
    }

    /**
     * 5. Get All Verified Mentors for Discovery Hub
     */
    public List<MentorProfileResponse> getVerifiedMentors() {
        List<MentorVerification> verifiedList = verificationRepository.findByStatus(VerificationStatus.VERIFIED);
        return verifiedList.stream().map(v -> {
            User mentor = v.getUser();
            double rating = getWeightedMentorRating(mentor.getId());
            return MentorProfileResponse.builder()
                    .verificationId(v.getId())
                    .id(mentor.getId())
                    .firstName(mentor.getFirstName())
                    .lastName(mentor.getLastName())
                    .email(mentor.getEmail())
                    .courseCode(v.getCourseCode())
                    .gradeObtained(v.getGradeObtained())
                    .avatarUrl(mentor.getAvatarUrl())
                    .department(mentor.getProfession() != null && !mentor.getProfession().isBlank()
                            ? mentor.getProfession()
                            : "Computer Science & Engineering")
                    .hourlyRate(30)
                    .rating(rating > 0 ? rating : 4.8)
                    .build();
        }).toList();
    }

    /**
     * 6. Get User Mentorship Sessions (both as Mentee and Mentor)
     */
    public List<MentorshipSessionResponse> getSessionsForUser(Long userId) {
        List<MentorshipSession> asMentee = sessionRepository.findByMenteeId(userId);
        List<MentorshipSession> asMentor = sessionRepository.findByMentorId(userId);
        return java.util.stream.Stream.concat(asMentee.stream(), asMentor.stream())
                .distinct()
                .sorted((a, b) -> Long.compare(b.getId(), a.getId()))
                .map(this::mapToResponse)
                .toList();
    }

    /**
     * 7. Get Verification Submissions for a User
     */
    public List<MentorVerificationResponse> getVerificationsForUser(Long userId) {
        return verificationRepository.findByUserId(userId).stream()
                .sorted((a, b) -> Long.compare(b.getId(), a.getId()))
                .map(v -> MentorVerificationResponse.builder()
                        .id(v.getId())
                        .userId(v.getUser().getId())
                        .courseCode(v.getCourseCode())
                        .gradeObtained(v.getGradeObtained())
                        .status(v.getStatus())
                        .documentHash(v.getDocumentHash())
                        .rejectionReason(v.getRejectionReason())
                        .createdAt(v.getCreatedAt())
                        .verifiedAt(v.getVerifiedAt())
                        .build())
                .toList();
    }

    /**
     * 8. Admin / Test Review Verification Status
     */
    @Transactional
    public void reviewVerification(Long id, VerificationStatus status, String rejectionReason) {
        MentorVerification v = verificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Verification application not found for ID: " + id));

        v.setStatus(status);
        if (status == VerificationStatus.VERIFIED) {
            LocalDateTime now = LocalDateTime.now();
            v.setVerifiedAt(now);
            v.setRejectionReason(null);

            if (v.getDocumentHash() != null) {
                receiptRepository.findByDocumentSha256Hash(v.getDocumentHash())
                        .orElseGet(() -> receiptRepository.save(MentorVerificationReceipt.builder()
                                .userId(v.getUser().getId())
                                .courseCode(v.getCourseCode())
                                .verifiedGrade(v.getGradeObtained())
                                .documentSha256Hash(v.getDocumentHash())
                                .verifiedByAdminId(1L)
                                .verifiedAt(now)
                                .storageState(StorageState.ACTIVE_PDF)
                                .build()));
            }
        } else if (status == VerificationStatus.REJECTED || status == VerificationStatus.FLAGGED_TAMPERED) {
            v.setRejectionReason(rejectionReason != null && !rejectionReason.isBlank() 
                    ? rejectionReason 
                    : "Transcript verification did not meet institutional standards.");
        }
        verificationRepository.save(v);
    }

    private double calculateSimpleAverage(List<MentorshipSession> sessions) {
        return sessions.stream().mapToInt(MentorshipSession::getRating).average().orElse(0.0);
    }

    private MentorshipSessionResponse mapToResponse(MentorshipSession session) {
        return MentorshipSessionResponse.builder()
                .sessionId(session.getId())
                .mentorId(session.getMentor().getId())
                .menteeId(session.getMentee().getId())
                .mentorName(session.getMentor().getFirstName() + " " + session.getMentor().getLastName())
                .menteeName(session.getMentee().getFirstName() + " " + session.getMentee().getLastName())
                .courseCode(session.getCourseCode())
                .tokenAmount(session.getTokenAmount())
                .status(session.getStatus())
                .rating(session.getRating())
                .feedback(session.getFeedback())
                .activeDurationMinutes(session.getActiveDurationMinutes())
                .scheduledStartTime(session.getScheduledStartTime())
                .build();
    }
}
