package com.studysync.studysyncbackend.service;

import com.studysync.studysyncbackend.dto.SessionBookingRequest;
import com.studysync.studysyncbackend.model.Role;
import com.studysync.studysyncbackend.model.User;
import com.studysync.studysyncbackend.model.MentorVerification;
import com.studysync.studysyncbackend.model.enums.VerificationStatus;
import com.studysync.studysyncbackend.repository.MentorVerificationRepository;
import com.studysync.studysyncbackend.repository.MentorshipSessionRepository;
import com.studysync.studysyncbackend.repository.TokenEscrowRepository;
import com.studysync.studysyncbackend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDateTime;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class MentorshipServiceIntegrationTest {

    @Autowired
    private MentorshipService mentorshipService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MentorVerificationRepository verificationRepository;

    @Autowired
    private MentorshipSessionRepository sessionRepository;

    @Autowired
    private TokenEscrowRepository escrowRepository;

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    private User mentor;
    private User mentee;

    @BeforeEach
    void setupDatabase() {
        jdbcTemplate.execute("SET REFERENTIAL_INTEGRITY FALSE");
        escrowRepository.deleteAll();
        sessionRepository.deleteAll();
        verificationRepository.deleteAll();
        userRepository.deleteAll();
        jdbcTemplate.execute("SET REFERENTIAL_INTEGRITY TRUE");

        mentor = userRepository.save(User.builder()
                .firstName("Mentor")
                .lastName("Pro")
                .email("mentor.pro@test.com")
                .password("password")
                .role(Role.STUDENT)
                .tokens(500)
                .build());

        mentee = userRepository.save(User.builder()
                .firstName("Mentee")
                .lastName("Learner")
                .email("mentee.learner@test.com")
                .password("password")
                .role(Role.STUDENT)
                .tokens(50) // Limited tokens (50 tokens)
                .build());

        verificationRepository.save(MentorVerification.builder()
                .user(mentor)
                .courseCode("CSE2001")
                .gradeObtained("A")
                .status(VerificationStatus.VERIFIED)
                .documentHash("test-hash-123")
                .build());
    }

    @Test
    @DisplayName("Concurrent Bookings: Prevent negative token balance under high thread concurrency")
    void concurrentBooking_PreventsNegativeTokenBalance() throws InterruptedException {
        int numberOfThreads = 5;
        ExecutorService executorService = Executors.newFixedThreadPool(numberOfThreads);
        CountDownLatch latch = new CountDownLatch(numberOfThreads);

        AtomicInteger successfulBookings = new AtomicInteger(0);
        AtomicInteger failedBookings = new AtomicInteger(0);

        // Mentee has 50 tokens. Each booking costs 30 tokens.
        // Only 1 booking should succeed; remaining 4 must fail with insufficient tokens.
        for (int i = 0; i < numberOfThreads; i++) {
            executorService.submit(() -> {
                try {
                    SessionBookingRequest req = new SessionBookingRequest();
                    req.setMentorId(mentor.getId());
                    req.setCourseCode("CSE2001");
                    req.setTokenAmount(30);
                    req.setScheduledStartTime(LocalDateTime.now().plusDays(1));

                    mentorshipService.bookSession(mentee.getId(), req);
                    successfulBookings.incrementAndGet();
                } catch (Exception e) {
                    failedBookings.incrementAndGet();
                } finally {
                    latch.countDown();
                }
            });
        }

        latch.await();
        executorService.shutdown();

        User updatedMentee = userRepository.findById(mentee.getId()).orElseThrow();

        // Assertions
        assertEquals(1, successfulBookings.get(), "Only 1 booking of 30 tokens should succeed for a 50-token balance");
        assertEquals(4, failedBookings.get(), "4 concurrent requests should be rejected due to insufficient tokens");
        assertEquals(20, updatedMentee.getTokens(), "Remaining token balance should be exactly 20 (50 - 30)");
        assertTrue(updatedMentee.getTokens() >= 0, "Token balance must never go negative");
    }
}
