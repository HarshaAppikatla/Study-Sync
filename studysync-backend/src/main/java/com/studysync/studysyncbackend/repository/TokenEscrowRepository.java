package com.studysync.studysyncbackend.repository;

import com.studysync.studysyncbackend.model.TokenEscrow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TokenEscrowRepository extends JpaRepository<TokenEscrow, Long> {
    Optional<TokenEscrow> findBySessionId(Long sessionId);
}
