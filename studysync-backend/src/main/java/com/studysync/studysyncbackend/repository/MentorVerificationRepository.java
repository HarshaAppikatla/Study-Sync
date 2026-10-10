package com.studysync.studysyncbackend.repository;

import com.studysync.studysyncbackend.model.MentorVerification;
import com.studysync.studysyncbackend.model.enums.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MentorVerificationRepository extends JpaRepository<MentorVerification, Long> {
    List<MentorVerification> findByUserId(Long userId);
    List<MentorVerification> findByStatus(VerificationStatus status);
    Optional<MentorVerification> findByUserIdAndCourseCode(Long userId, String courseCode);
    Optional<MentorVerification> findByUserIdAndCourseCodeAndStatus(Long userId, String courseCode, VerificationStatus status);
    boolean existsByDocumentHash(String documentHash);
}
