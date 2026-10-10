package com.studysync.studysyncbackend.model;

import com.studysync.studysyncbackend.model.enums.SessionStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "mentorship_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorshipSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_id", nullable = false)
    private User mentor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentee_id", nullable = false)
    private User mentee;

    @Column(nullable = false, length = 20)
    private String courseCode;

    @Column(nullable = false)
    private Integer tokenAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SessionStatus status;

    private Integer rating;
    private String feedback;

    private LocalDateTime scheduledStartTime;
    private LocalDateTime actualEndTime;
    private Integer activeDurationMinutes;

    @OneToOne(mappedBy = "session", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private TokenEscrow escrow;

    @PrePersist
    protected void onCreate() {
        if (this.status == null) {
            this.status = SessionStatus.REQUESTED;
        }
    }
}
