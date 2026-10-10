package com.studysync.studysyncbackend.service;

import com.studysync.studysyncbackend.dto.*;
import com.studysync.studysyncbackend.model.*;
import com.studysync.studysyncbackend.model.enums.*;
import com.studysync.studysyncbackend.repository.*;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminMentorshipService {

    private final MentorVerificationRepository verificationRepository;
    private final MentorVerificationReceiptRepository receiptRepository;
    private final MentorshipSessionRepository sessionRepository;
    private final TokenEscrowRepository escrowRepository;
    private final UserRepository userRepository;

    /**
     * Retrieve all pending or flagged transcripts for admin inspection
     */
    public List<AdminTranscriptResponse> getFlaggedAndPendingTranscripts() {
        return verificationRepository.findAll().stream()
                .filter(v -> v.getStatus() == VerificationStatus.FLAGGED_TAMPERED || v.getStatus() == VerificationStatus.PENDING)
                .map(this::mapToAdminTranscriptResponse)
                .collect(Collectors.toList());
    }

    /**
     * Approve or reject a transcript submission and lock cryptographic receipt
     */
    @Transactional
    public AdminTranscriptResponse reviewTranscript(Long verificationId, TranscriptReviewRequest request) {
        MentorVerification verification = verificationRepository.findById(verificationId)
                .orElseThrow(() -> new RuntimeException("Transcript verification record not found with ID: " + verificationId));

        if (request.getStatus() != VerificationStatus.VERIFIED && request.getStatus() != VerificationStatus.REJECTED) {
            throw new RuntimeException("Invalid status for review. Must be VERIFIED or REJECTED.");
        }

        verification.setStatus(request.getStatus());
        if (request.getReviewNotes() != null && !request.getReviewNotes().isBlank()) {
            verification.setRejectionReason(request.getReviewNotes());
        }
        LocalDateTime now = LocalDateTime.now();
        verification.setVerifiedAt(now);
        verificationRepository.save(verification);

        // Lock Immutable Cryptographic Receipt on Approval
        if (request.getStatus() == VerificationStatus.VERIFIED && verification.getDocumentHash() != null) {
            receiptRepository.findByDocumentSha256Hash(verification.getDocumentHash())
                    .orElseGet(() -> receiptRepository.save(MentorVerificationReceipt.builder()
                            .userId(verification.getUser().getId())
                            .courseCode(verification.getCourseCode())
                            .verifiedGrade(verification.getGradeObtained())
                            .documentSha256Hash(verification.getDocumentHash())
                            .verifiedByAdminId(1L)
                            .verifiedAt(now)
                            .storageState(StorageState.ACTIVE_PDF)
                            .build()));
        }

        return mapToAdminTranscriptResponse(verification);
    }

    /**
     * Direct Admin Approval with Custom Admin ID & Comment
     */
    @Transactional
    public String approveVerification(Long verificationId, Long adminId, String adminComment) {
        MentorVerification verification = verificationRepository.findById(verificationId)
                .orElseThrow(() -> new RuntimeException("Verification request not found with ID: " + verificationId));

        verification.setStatus(VerificationStatus.VERIFIED);
        LocalDateTime now = LocalDateTime.now();
        verification.setVerifiedAt(now);
        if (adminComment != null && !adminComment.isBlank()) {
            verification.setRejectionReason(adminComment);
        }
        verificationRepository.save(verification);

        // Create Immutable Cryptographic Receipt
        receiptRepository.findByDocumentSha256Hash(verification.getDocumentHash())
                .orElseGet(() -> receiptRepository.save(MentorVerificationReceipt.builder()
                        .userId(verification.getUser().getId())
                        .courseCode(verification.getCourseCode())
                        .verifiedGrade(verification.getGradeObtained())
                        .documentSha256Hash(verification.getDocumentHash())
                        .verifiedByAdminId(adminId != null ? adminId : 1L)
                        .verifiedAt(now)
                        .storageState(StorageState.ACTIVE_PDF)
                        .build()));

        return "Verification approved and immutable audit receipt locked successfully.";
    }

    /**
     * Retrieve all disputed sessions and locked escrows
     */
    public List<AdminDisputedSessionResponse> getDisputedSessions() {
        return sessionRepository.findAll().stream()
                .filter(s -> s.getStatus() == SessionStatus.DISPUTED || (s.getEscrow() != null && s.getEscrow().getStatus() == EscrowStatus.DISPUTED))
                .map(this::mapToAdminDisputedSessionResponse)
                .collect(Collectors.toList());
    }

    /**
     * Resolve escrow dispute: Refund Mentee or Release Payout to Mentor
     */
    @Transactional
    public String resolveDispute(Long sessionId, DisputeResolutionRequest request) {
        MentorshipSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found with ID: " + sessionId));

        TokenEscrow escrow = session.getEscrow();
        if (escrow == null) {
            throw new RuntimeException("No escrow record found for session ID: " + sessionId);
        }

        if ("REFUND_MENTEE".equalsIgnoreCase(request.getAction())) {
            // Full refund to Mentee
            User mentee = session.getMentee();
            mentee.setTokens(mentee.getTokens() + escrow.getTokensHeld());
            userRepository.save(mentee);

            escrow.setStatus(EscrowStatus.REFUNDED_TO_MENTEE);
            session.setStatus(SessionStatus.CANCELLED);

            escrowRepository.save(escrow);
            sessionRepository.save(session);

            return "Dispute resolved: Refunded " + escrow.getTokensHeld() + " tokens to mentee (" + mentee.getEmail() + ").";

        } else if ("RELEASE_MENTOR".equalsIgnoreCase(request.getAction())) {
            // Release payout to Mentor (with 15% platform burn applied)
            User mentor = session.getMentor();
            mentor.setTokens(mentor.getTokens() + escrow.getTokensPaidToMentor());
            userRepository.save(mentor);

            escrow.setStatus(EscrowStatus.RELEASED_TO_MENTOR);
            escrow.setReleasedAt(LocalDateTime.now());
            session.setStatus(SessionStatus.COMPLETED);

            escrowRepository.save(escrow);
            sessionRepository.save(session);

            return "Dispute resolved: Released " + escrow.getTokensPaidToMentor() + " tokens to mentor (" + mentor.getEmail() + "). " + escrow.getTokensBurned() + " tokens burned as platform fee.";

        } else {
            throw new RuntimeException("Invalid dispute action. Supported: REFUND_MENTEE, RELEASE_MENTOR.");
        }
    }

    private AdminTranscriptResponse mapToAdminTranscriptResponse(MentorVerification v) {
        StorageState state = StorageState.ACTIVE_PDF;
        LocalDateTime verifiedAt = v.getVerifiedAt();
        LocalDateTime purgedAt = null;

        if (v.getDocumentHash() != null) {
            java.util.Optional<MentorVerificationReceipt> receiptOpt = receiptRepository.findByDocumentSha256Hash(v.getDocumentHash());
            if (receiptOpt.isPresent()) {
                MentorVerificationReceipt r = receiptOpt.get();
                state = r.getStorageState();
                verifiedAt = r.getVerifiedAt();
                purgedAt = r.getPurgedAt();
            }
        }

        return AdminTranscriptResponse.builder()
                .id(v.getId())
                .userId(v.getUser().getId())
                .studentName(v.getUser().getFirstName() + " " + v.getUser().getLastName())
                .studentEmail(v.getUser().getEmail())
                .courseCode(v.getCourseCode())
                .gradeObtained(v.getGradeObtained())
                .status(v.getStatus())
                .documentHash(v.getDocumentHash())
                .transcriptDocumentUrl(v.getTranscriptDocumentUrl())
                .rejectionReason(v.getRejectionReason())
                .storageState(state)
                .verifiedAt(verifiedAt)
                .purgedAt(purgedAt)
                .createdAt(v.getCreatedAt())
                .build();
    }

    private AdminDisputedSessionResponse mapToAdminDisputedSessionResponse(MentorshipSession s) {
        TokenEscrow e = s.getEscrow();
        return AdminDisputedSessionResponse.builder()
                .sessionId(s.getId())
                .escrowId(e != null ? e.getId() : null)
                .mentorName(s.getMentor().getFirstName() + " " + s.getMentor().getLastName())
                .mentorEmail(s.getMentor().getEmail())
                .menteeName(s.getMentee().getFirstName() + " " + s.getMentee().getLastName())
                .menteeEmail(s.getMentee().getEmail())
                .courseCode(s.getCourseCode())
                .tokenAmount(s.getTokenAmount())
                .tokensHeld(e != null ? e.getTokensHeld() : s.getTokenAmount())
                .tokensBurned(e != null ? e.getTokensBurned() : 0)
                .tokensPaidToMentor(e != null ? e.getTokensPaidToMentor() : 0)
                .sessionStatus(s.getStatus())
                .escrowStatus(e != null ? e.getStatus() : null)
                .rating(s.getRating())
                .feedback(s.getFeedback())
                .activeDurationMinutes(s.getActiveDurationMinutes())
                .scheduledStartTime(s.getScheduledStartTime())
                .createdAt(e != null ? e.getCreatedAt() : null)
                .build();
    }

    /**
     * Seed realistic sample material for Admin Governance testing:
     * - Flagged Transcripts (Photoshop / Canva tampering detected)
     * - Pending Verifications
     * - Disputed Escrow Sessions with active durations and feedback
     */
    @Transactional
    public void seedSampleAdminData() {
        // 1. Create or get test student users
        User vikram = userRepository.findByEmail("vikram@studysync.com").orElseGet(() -> 
            userRepository.save(User.builder()
                .email("vikram@studysync.com")
                .firstName("Vikram")
                .lastName("Malhotra")
                .password("$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG")
                .role(Role.STUDENT)
                .tokens(80)
                .profession("Computer Science & Engineering")
                .build()));

        User ananya = userRepository.findByEmail("ananya@studysync.com").orElseGet(() -> 
            userRepository.save(User.builder()
                .email("ananya@studysync.com")
                .firstName("Ananya")
                .lastName("Gupta")
                .password("$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG")
                .role(Role.STUDENT)
                .tokens(120)
                .profession("Mathematics & Computing")
                .build()));

        User devansh = userRepository.findByEmail("devansh@studysync.com").orElseGet(() -> 
            userRepository.save(User.builder()
                .email("devansh@studysync.com")
                .firstName("Devansh")
                .lastName("Roy")
                .password("$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG")
                .role(Role.STUDENT)
                .tokens(60)
                .profession("Electrical & Electronics")
                .build()));

        User sneha = userRepository.findByEmail("sneha@studysync.com").orElseGet(() -> 
            userRepository.save(User.builder()
                .email("sneha@studysync.com")
                .firstName("Sneha")
                .lastName("Reddy")
                .password("$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG")
                .role(Role.STUDENT)
                .tokens(150)
                .profession("Software Engineering")
                .build()));

        // 2. Seed Flagged Transcripts (FLAGGED_TAMPERED)
        if (verificationRepository.findAll().stream().noneMatch(v -> "CSE3001".equals(v.getCourseCode()) && v.getStatus() == VerificationStatus.FLAGGED_TAMPERED)) {
            verificationRepository.save(MentorVerification.builder()
                .user(vikram)
                .courseCode("CSE3001")
                .gradeObtained("S")
                .status(VerificationStatus.FLAGGED_TAMPERED)
                .documentHash("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")
                .rejectionReason("Forensic inspection detected Canva 2.1 digital editing layer signatures and altered font rendering stream.")
                .createdAt(LocalDateTime.now().minusHours(2))
                .build());
        }

        if (verificationRepository.findAll().stream().noneMatch(v -> "MAT1001".equals(v.getCourseCode()) && v.getStatus() == VerificationStatus.FLAGGED_TAMPERED)) {
            verificationRepository.save(MentorVerification.builder()
                .user(ananya)
                .courseCode("MAT1001")
                .gradeObtained("A+")
                .status(VerificationStatus.FLAGGED_TAMPERED)
                .documentHash("8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4")
                .rejectionReason("Document metadata identifies Adobe Photoshop 2024 producer. Cryptographic university watermark missing.")
                .createdAt(LocalDateTime.now().minusHours(5))
                .build());
        }

        // 3. Seed Pending Transcripts (PENDING)
        if (verificationRepository.findAll().stream().noneMatch(v -> "ECE2002".equals(v.getCourseCode()) && v.getStatus() == VerificationStatus.PENDING)) {
            verificationRepository.save(MentorVerification.builder()
                .user(devansh)
                .courseCode("ECE2002")
                .gradeObtained("A")
                .status(VerificationStatus.PENDING)
                .documentHash("5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8")
                .createdAt(LocalDateTime.now().minusDays(1))
                .build());
        }

        if (verificationRepository.findAll().stream().noneMatch(v -> "CSE2005".equals(v.getCourseCode()) && v.getStatus() == VerificationStatus.PENDING)) {
            verificationRepository.save(MentorVerification.builder()
                .user(sneha)
                .courseCode("CSE2005")
                .gradeObtained("S")
                .status(VerificationStatus.PENDING)
                .documentHash("4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a")
                .createdAt(LocalDateTime.now().minusHours(3))
                .build());
        }

        // 4. Seed Disputed Escrow Sessions
        User aarav = userRepository.findByEmail("aarav@studysync.com").orElse(vikram);
        User priya = userRepository.findByEmail("priya@studysync.com").orElse(ananya);
        User stdUser = userRepository.findByEmail("user@studysync.com").orElse(devansh);

        if (sessionRepository.findAll().stream().noneMatch(s -> s.getStatus() == SessionStatus.DISPUTED)) {
            // Dispute 1: Mentee disputes incomplete session (12 min call < 20 min threshold)
            MentorshipSession session1 = MentorshipSession.builder()
                .mentor(aarav)
                .mentee(stdUser)
                .courseCode("CSE2001")
                .tokenAmount(40)
                .status(SessionStatus.DISPUTED)
                .rating(1)
                .feedback("Mentor disconnected abruptly after 12 minutes without covering the graph traversal topics requested. Requesting full token refund.")
                .activeDurationMinutes(12)
                .scheduledStartTime(LocalDateTime.now().minusDays(1))
                .actualEndTime(LocalDateTime.now().minusDays(1).plusMinutes(12))
                .build();

            TokenEscrow escrow1 = TokenEscrow.builder()
                .session(session1)
                .tokensHeld(40)
                .tokensBurned(6)
                .tokensPaidToMentor(34)
                .status(EscrowStatus.DISPUTED)
                .createdAt(LocalDateTime.now().minusDays(1))
                .build();

            session1.setEscrow(escrow1);
            sessionRepository.save(session1);

            // Dispute 2: Mentor claims mentee ghosted after 25 minutes of verified telemetry
            MentorshipSession session2 = MentorshipSession.builder()
                .mentor(priya)
                .mentee(devansh)
                .courseCode("DSA")
                .tokenAmount(30)
                .status(SessionStatus.DISPUTED)
                .rating(2)
                .feedback("Mentee claims they had network issues and left early, but WebSocket telemetry logged 25 verified active minutes. Mentor requests release.")
                .activeDurationMinutes(25)
                .scheduledStartTime(LocalDateTime.now().minusDays(2))
                .actualEndTime(LocalDateTime.now().minusDays(2).plusMinutes(25))
                .build();

            TokenEscrow escrow2 = TokenEscrow.builder()
                .session(session2)
                .tokensHeld(30)
                .tokensBurned(5)
                .tokensPaidToMentor(25)
                .status(EscrowStatus.DISPUTED)
                .createdAt(LocalDateTime.now().minusDays(2))
                .build();

            session2.setEscrow(escrow2);
            sessionRepository.save(session2);
        }

        // 5. Seed Sample Mentor Verification Receipts for Lifecycle Demonstration
        if (receiptRepository.findByDocumentSha256Hash("hash-aarav-cse2001").isEmpty()) {
            receiptRepository.save(MentorVerificationReceipt.builder()
                .userId(aarav.getId())
                .courseCode("CSE2001")
                .verifiedGrade("S")
                .documentSha256Hash("hash-aarav-cse2001")
                .verifiedByAdminId(1L)
                .verifiedAt(LocalDateTime.now().minusDays(4))
                .storageState(StorageState.ACTIVE_PDF)
                .build());
        }

        if (receiptRepository.findByDocumentSha256Hash("hash-priya-dsa").isEmpty()) {
            receiptRepository.save(MentorVerificationReceipt.builder()
                .userId(priya.getId())
                .courseCode("DSA")
                .verifiedGrade("S")
                .documentSha256Hash("hash-priya-dsa")
                .verifiedByAdminId(1L)
                .verifiedAt(LocalDateTime.now().minusDays(34))
                .storageState(StorageState.PURGED_RECEIPT_ONLY)
                .purgedAt(LocalDateTime.now().minusDays(4))
                .build());
        }
    }
}
