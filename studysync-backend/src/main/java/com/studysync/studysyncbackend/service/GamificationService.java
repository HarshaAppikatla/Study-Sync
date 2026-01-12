package com.studysync.studysyncbackend.service;

import com.studysync.studysyncbackend.model.Badge;
import com.studysync.studysyncbackend.model.EarnedBadge;
import com.studysync.studysyncbackend.model.User;
import com.studysync.studysyncbackend.repository.BadgeRepository;
import com.studysync.studysyncbackend.repository.EarnedBadgeRepository;
import com.studysync.studysyncbackend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j; // Import Slf4j for logging
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j // Lombok annotation for easy logging (adds a 'log' object)
public class GamificationService {

    private final UserRepository userRepository;
    private final BadgeRepository badgeRepository;
    private final EarnedBadgeRepository earnedBadgeRepository;

    /**
     * Adds the specified number of points to a user.
     *
     * @param userId The ID of the user to award points to.
     * @param pointsToAdd The number of points to add (can be negative).
     */
    @Transactional
    public void addPoints(Long userId, long pointsToAdd) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        user.setPoints(user.getPoints() + pointsToAdd);
        userRepository.save(user); // Save the updated user
        log.info("Awarded {} points to user ID {}. Total points: {}", pointsToAdd, userId, user.getPoints());
    }

    /**
     * Awards a specific badge to a user if they haven't earned it already.
     *
     * @param userId    The ID of the user to award the badge to.
     * @param badgeCode The unique code of the badge to award (e.g., "COURSE_FINISHER").
     */
    @Transactional
    public void awardBadge(Long userId, String badgeCode) {
        // Check if user already has the badge
        if (earnedBadgeRepository.existsByUser_IdAndBadge_BadgeCode(userId, badgeCode)) {
            log.debug("User ID {} already has badge {}", userId, badgeCode);
            return; // Already earned, do nothing
        }

        // Find the user and badge definitions
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));
        Badge badge = badgeRepository.findByBadgeCode(badgeCode)
                .orElseThrow(() -> new EntityNotFoundException("Badge not found with code: " + badgeCode));

        // Create the EarnedBadge record
        EarnedBadge earnedBadge = EarnedBadge.builder()
                .user(user)
                .badge(badge)
                // earnedAt is set automatically by @PrePersist
                .build();

        earnedBadgeRepository.save(earnedBadge);
        log.info("Awarded badge '{}' ({}) to user ID {}", badge.getName(), badgeCode, userId);
    }

    // --- Methods to retrieve gamification data can be added later ---
    // public long getUserPoints(Long userId) { ... }
    // public List<EarnedBadgeDto> getUserBadges(Long userId) { ... }
    // public List<LeaderboardEntryDto> getLeaderboard() { ... }

}
