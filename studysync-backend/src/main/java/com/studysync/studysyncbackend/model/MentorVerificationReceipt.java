package com.studysync.studysyncbackend.model;

import com.studysync.studysyncbackend.model.enums.StorageState;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "mentor_verification_receipts", indexes = {
    @Index(name = "idx_receipt_hash", columnList = "documentSha256Hash"),
    @Index(name = "idx_receipt_user_course", columnList = "userId, courseCode")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MentorVerificationReceipt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String courseCode;

    @Column(nullable = false)
    private String verifiedGrade;

    @Column(nullable = false, unique = true, length = 64)
    private String documentSha256Hash;

    @Column(nullable = false)
    private Long verifiedByAdminId;

    @Column(nullable = false)
    private LocalDateTime verifiedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private StorageState storageState;

    private LocalDateTime purgedAt;
}
