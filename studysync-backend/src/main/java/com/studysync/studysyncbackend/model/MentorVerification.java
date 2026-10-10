package com.studysync.studysyncbackend.model;

import com.studysync.studysyncbackend.model.enums.VerificationStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "mentor_verifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 20)
    private String courseCode;

    @Column(nullable = false, length = 5)
    private String gradeObtained;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VerificationStatus status;

    private String transcriptDocumentUrl;

    @Column(unique = true)
    private String documentHash;

    private String rejectionReason;

    private LocalDateTime createdAt;
    private LocalDateTime verifiedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = VerificationStatus.PENDING;
        }
    }
}
