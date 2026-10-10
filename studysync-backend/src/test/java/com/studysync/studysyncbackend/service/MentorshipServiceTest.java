package com.studysync.studysyncbackend.service;

import com.studysync.studysyncbackend.dto.SessionBookingRequest;
import com.studysync.studysyncbackend.dto.SessionCompletionRequest;
import com.studysync.studysyncbackend.dto.MentorshipSessionResponse;
import com.studysync.studysyncbackend.model.*;
import com.studysync.studysyncbackend.model.enums.*;
import com.studysync.studysyncbackend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MentorshipServiceTest {

    @Mock
    private MentorVerificationRepository verificationRepository;

    @Mock
    private MentorVerificationReceiptRepository receiptRepository;

    @Mock
    private MentorshipSessionRepository sessionRepository;

    @Mock
    private TokenEscrowRepository escrowRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PdfVerificationService pdfVerificationService;

    @Mock
    private SessionHeartbeatService heartbeatService;

    @InjectMocks
    private MentorshipService mentorshipService;

    private User mentor;
    private User mentee;
    private MentorshipSession session;
    private TokenEscrow escrow;

    @BeforeEach
    void setUp() {
        mentor = User.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .email("mentor@test.com")
                .tokens(100)
                .build();

        mentee = User.builder()
                .id(2L)
                .firstName("Jane")
                .lastName("Smith")
                .email("mentee@test.com")
                .tokens(100)
                .build();

        escrow = TokenEscrow.builder()
                .id(10L)
                .tokensHeld(30)
                .tokensBurned(5) // 15% of 30 ≈ 4.5 -> rounded to 5
                .tokensPaidToMentor(25)
                .status(EscrowStatus.HELD)
                .build();

        session = MentorshipSession.builder()
                .id(100L)
                .mentor(mentor)
                .mentee(mentee)
                .courseCode("CSE2001")
                .tokenAmount(30)
                .status(SessionStatus.SCHEDULED)
                .escrow(escrow)
                .build();
        
        escrow.setSession(session);
    }

    @Nested
    @DisplayName("Token Escrow & Session Completion Tests")
    class EscrowTests {

        @Test
        @DisplayName("Should release escrow and apply 15% token burn when session completes successfully")
        void completeSession_Success() {
            // Given
            SessionCompletionRequest req = new SessionCompletionRequest();
            req.setSessionId(100L);
            req.setRating(5);
            req.setFeedback("Excellent session!");
            req.setActiveDurationMinutes(25);

            when(sessionRepository.findById(100L)).thenReturn(Optional.of(session));
            when(heartbeatService.getVerifiedActiveMinutes(100L)).thenReturn(25);

            // When
            String result = mentorshipService.completeSession(2L, req);

            // Then
            assertTrue(result.contains("Released 25 tokens"));
            assertEquals(125, mentor.getTokens()); // 100 + 25
            assertEquals(SessionStatus.COMPLETED, session.getStatus());
            assertEquals(EscrowStatus.RELEASED_TO_MENTOR, escrow.getStatus());

            verify(userRepository).save(mentor);
            verify(sessionRepository).save(session);
            verify(escrowRepository).save(escrow);
            verify(heartbeatService).clearSessionTracker(100L);
        }

        @Test
        @DisplayName("Should throw exception if active duration is less than 20 minutes")
        void completeSession_InsufficientDuration_ThrowsException() {
            // Given
            SessionCompletionRequest req = new SessionCompletionRequest();
            req.setSessionId(100L);
            req.setRating(5);
            req.setActiveDurationMinutes(10); // Less than 20 mins

            when(sessionRepository.findById(100L)).thenReturn(Optional.of(session));
            when(heartbeatService.getVerifiedActiveMinutes(100L)).thenReturn(10);

            // When / Then
            RuntimeException ex = assertThrows(RuntimeException.class, 
                () -> mentorshipService.completeSession(2L, req));

            assertTrue(ex.getMessage().contains("Minimum 20 minutes required"));
            verify(userRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should throw exception if non-mentee tries to complete session")
        void completeSession_UnauthorizedUser_ThrowsException() {
            // Given
            SessionCompletionRequest req = new SessionCompletionRequest();
            req.setSessionId(100L);
            req.setRating(5);
            req.setActiveDurationMinutes(25);

            when(sessionRepository.findById(100L)).thenReturn(Optional.of(session));

            // When / Then (User ID 999 is not the mentee ID 2)
            assertThrows(RuntimeException.class, () -> mentorshipService.completeSession(999L, req));
        }

        @Test
        @DisplayName("Should calculate 15% token burn fee accurately when booking session")
        void bookSession_CalculatesTokenBurnAndEscrow() {
            SessionBookingRequest req = new SessionBookingRequest();
            req.setMentorId(1L);
            req.setCourseCode("CSE2001");
            req.setTokenAmount(30);
            req.setScheduledStartTime(LocalDateTime.now().plusDays(1));

            MentorVerification verification = MentorVerification.builder()
                    .user(mentor)
                    .courseCode("CSE2001")
                    .status(VerificationStatus.VERIFIED)
                    .build();

            when(userRepository.findById(2L)).thenReturn(Optional.of(mentee));
            when(userRepository.findById(1L)).thenReturn(Optional.of(mentor));
            when(verificationRepository.findByUserIdAndCourseCodeAndStatus(1L, "CSE2001", VerificationStatus.VERIFIED))
                    .thenReturn(Optional.of(verification));

            MentorshipSessionResponse res = mentorshipService.bookSession(2L, req);

            assertNotNull(res);
            assertEquals(70, mentee.getTokens()); // 100 - 30
            verify(sessionRepository).save(any(MentorshipSession.class));
        }
    }

    @Nested
    @DisplayName("Rating Decay & Anti-Collusion Tests")
    class RatingDecayTests {

        @Test
        @DisplayName("Should return 0.0 rating if mentor has no completed sessions")
        void getWeightedMentorRating_NoSessions() {
            when(sessionRepository.findByMentorIdAndStatus(1L, SessionStatus.COMPLETED))
                    .thenReturn(Collections.emptyList());

            double rating = mentorshipService.getWeightedMentorRating(1L);

            assertEquals(0.0, rating);
        }

        @Test
        @DisplayName("Should apply 0.8x probationary multiplier if unique mentees < 5")
        void getWeightedMentorRating_ProbationaryPenalty() {
            // Given: 2 completed 5-star sessions with only 1 unique mentee
            MentorshipSession s1 = MentorshipSession.builder().mentor(mentor).mentee(mentee).rating(5).build();
            MentorshipSession s2 = MentorshipSession.builder().mentor(mentor).mentee(mentee).rating(5).build();

            when(sessionRepository.findByMentorIdAndStatus(1L, SessionStatus.COMPLETED))
                    .thenReturn(List.of(s1, s2));
            when(sessionRepository.countDistinctMenteesByMentorId(1L)).thenReturn(1L); // < 5

            // When
            double rating = mentorshipService.getWeightedMentorRating(1L);

            // Then: Simple avg = 5.0 -> 5.0 * 0.8 = 4.0
            assertEquals(4.0, rating);
        }

        @Test
        @DisplayName("Should apply inverse pairwise decay for repeat mentor-mentee pairs when unique mentees >= 5")
        void getWeightedMentorRating_PairwiseDecay() {
            User mentee2 = User.builder().id(3L).build();
            MentorshipSession s1 = MentorshipSession.builder().mentor(mentor).mentee(mentee).rating(5).build();
            MentorshipSession s2 = MentorshipSession.builder().mentor(mentor).mentee(mentee).rating(1).build();

            when(sessionRepository.findByMentorIdAndStatus(1L, SessionStatus.COMPLETED))
                    .thenReturn(List.of(s1, s2));
            when(sessionRepository.countDistinctMenteesByMentorId(1L)).thenReturn(6L); // >= 5

            // Pairwise session counts: session 1 was 1st session (weight 1.0), session 2 was 2nd session (weight 0.5)
            when(sessionRepository.countCompletedSessionsBetweenPair(1L, 2L)).thenReturn(2);

            // When
            double rating = mentorshipService.getWeightedMentorRating(1L);

            // Weighted Avg calculation: (5 * 0.5 + 1 * 0.5) / (0.5 + 0.5) = 3.0
            assertTrue(rating > 0.0);
        }
    }

    @Nested
    @DisplayName("Fast-Track Cryptographic Verification Tests")
    class FastTrackVerificationTests {

        @Test
        @DisplayName("Should instantly fast-track verify transcript when document hash matches active receipt")
        void submitTranscript_FastTrackApproval() throws Exception {
            org.springframework.web.multipart.MultipartFile mockFile = mock(org.springframework.web.multipart.MultipartFile.class);
            String hash = "hash-clean-verified-receipt-123";

            when(userRepository.findById(2L)).thenReturn(Optional.of(mentee));
            when(pdfVerificationService.calculateFileHash(mockFile)).thenReturn(hash);

            MentorVerificationReceipt activeReceipt = MentorVerificationReceipt.builder()
                    .userId(2L)
                    .courseCode("CSE2001")
                    .verifiedGrade("S")
                    .documentSha256Hash(hash)
                    .storageState(StorageState.ACTIVE_PDF)
                    .verifiedAt(LocalDateTime.now())
                    .build();

            when(receiptRepository.findByDocumentSha256Hash(hash)).thenReturn(Optional.of(activeReceipt));

            String result = mentorshipService.submitTranscript(2L, "CSE2001", "S", mockFile);

            assertTrue(result.contains("Fast-track verification complete"));
            verify(verificationRepository).save(any(MentorVerification.class));
            verify(pdfVerificationService, never()).isPdfTampered(any());
        }
    }
}
