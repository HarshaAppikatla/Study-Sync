package com.studysync.studysyncbackend.model;

import com.studysync.studysyncbackend.model.enums.EscrowStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "token_escrows")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TokenEscrow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private MentorshipSession session;

    @Column(nullable = false)
    private Integer tokensHeld;

    @Column(nullable = false)
    private Integer tokensBurned;

    @Column(nullable = false)
    private Integer tokensPaidToMentor;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EscrowStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime releasedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = EscrowStatus.HELD;
        }
    }
}
