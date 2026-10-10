package com.studysync.studysyncbackend.repository;

import com.studysync.studysyncbackend.model.MentorVerificationReceipt;
import com.studysync.studysyncbackend.model.enums.StorageState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MentorVerificationReceiptRepository extends JpaRepository<MentorVerificationReceipt, Long> {

    Optional<MentorVerificationReceipt> findByDocumentSha256Hash(String documentSha256Hash);

    Optional<MentorVerificationReceipt> findByUserIdAndCourseCode(Long userId, String courseCode);

    List<MentorVerificationReceipt> findByStorageStateAndVerifiedAtBefore(
        StorageState storageState, 
        LocalDateTime thresholdDate
    );
}
