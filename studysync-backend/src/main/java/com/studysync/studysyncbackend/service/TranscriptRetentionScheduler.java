package com.studysync.studysyncbackend.service;

import com.studysync.studysyncbackend.model.MentorVerification;
import com.studysync.studysyncbackend.model.MentorVerificationReceipt;
import com.studysync.studysyncbackend.model.enums.StorageState;
import com.studysync.studysyncbackend.repository.MentorVerificationReceiptRepository;
import com.studysync.studysyncbackend.repository.MentorVerificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TranscriptRetentionScheduler {

    private final MentorVerificationReceiptRepository receiptRepository;
    private final MentorVerificationRepository verificationRepository;

    /**
     * Daily Cron Job at 2:00 AM (0 0 2 * * ?)
     * Purges raw PDF files older than 30 days while retaining immutable receipts.
     */
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void purgeExpiredRawTranscripts() {
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);

        List<MentorVerificationReceipt> activeReceipts = 
                receiptRepository.findByStorageStateAndVerifiedAtBefore(StorageState.ACTIVE_PDF, thirtyDaysAgo);

        log.info("Found {} raw transcripts eligible for 30-day auto-purge.", activeReceipts.size());

        for (MentorVerificationReceipt receipt : activeReceipts) {
            try {
                // Find associated verification record
                verificationRepository.findByUserIdAndCourseCode(receipt.getUserId(), receipt.getCourseCode())
                    .ifPresent(verification -> {
                        String filePath = verification.getTranscriptDocumentUrl();
                        if (filePath != null && !filePath.isBlank()) {
                            File file = new File(filePath);
                            if (file.exists() && file.delete()) {
                                log.info("Successfully deleted raw PDF binary at path: {}", filePath);
                            }
                        }
                        // Clear file path pointer on verification entity
                        verification.setTranscriptDocumentUrl(null);
                        verificationRepository.save(verification);
                    });

                // Update Receipt Storage State
                receipt.setStorageState(StorageState.PURGED_RECEIPT_ONLY);
                receipt.setPurgedAt(LocalDateTime.now());
                receiptRepository.save(receipt);

            } catch (Exception e) {
                log.error("Failed to purge raw transcript for receipt ID {}: {}", receipt.getId(), e.getMessage());
            }
        }
    }
}
