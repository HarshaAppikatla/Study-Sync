package com.studysync.studysyncbackend.service;

import com.studysync.studysyncbackend.model.MentorVerification;
import com.studysync.studysyncbackend.model.MentorVerificationReceipt;
import com.studysync.studysyncbackend.model.enums.StorageState;
import com.studysync.studysyncbackend.repository.MentorVerificationReceiptRepository;
import com.studysync.studysyncbackend.repository.MentorVerificationRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.File;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TranscriptRetentionSchedulerTest {

    @Mock
    private MentorVerificationReceiptRepository receiptRepository;

    @Mock
    private MentorVerificationRepository verificationRepository;

    @InjectMocks
    private TranscriptRetentionScheduler retentionScheduler;

    @Test
    @DisplayName("Should purge raw PDF pointer and transition storageState to PURGED_RECEIPT_ONLY for transcripts > 30 days")
    void purgeExpiredRawTranscripts_Success() throws Exception {
        // Create temporary dummy file to simulate raw stored PDF
        File tempPdf = File.createTempFile("transcript_test_", ".pdf");
        tempPdf.deleteOnExit();
        assertTrue(tempPdf.exists());

        MentorVerificationReceipt receipt = MentorVerificationReceipt.builder()
                .id(100L)
                .userId(10L)
                .courseCode("CSE2001")
                .verifiedGrade("S")
                .documentSha256Hash("hash-receipt-30d")
                .storageState(StorageState.ACTIVE_PDF)
                .verifiedAt(LocalDateTime.now().minusDays(35))
                .build();

        MentorVerification verification = MentorVerification.builder()
                .id(200L)
                .courseCode("CSE2001")
                .transcriptDocumentUrl(tempPdf.getAbsolutePath())
                .build();

        when(receiptRepository.findByStorageStateAndVerifiedAtBefore(eq(StorageState.ACTIVE_PDF), any(LocalDateTime.class)))
                .thenReturn(List.of(receipt));

        when(verificationRepository.findByUserIdAndCourseCode(10L, "CSE2001"))
                .thenReturn(Optional.of(verification));

        // When scheduler runs
        retentionScheduler.purgeExpiredRawTranscripts();

        // Then:
        // 1. File on disk deleted
        assertFalse(tempPdf.exists(), "Raw PDF file on disk should be deleted");

        // 2. Verification entity pointer cleared
        assertNull(verification.getTranscriptDocumentUrl(), "Document URL pointer on verification entity should be nullified");
        verify(verificationRepository).save(verification);

        // 3. Receipt storageState updated to PURGED_RECEIPT_ONLY
        assertEquals(StorageState.PURGED_RECEIPT_ONLY, receipt.getStorageState());
        assertNotNull(receipt.getPurgedAt());
        verify(receiptRepository).save(receipt);
    }
}
