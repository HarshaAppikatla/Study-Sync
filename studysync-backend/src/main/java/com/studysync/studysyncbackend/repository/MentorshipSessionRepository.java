package com.studysync.studysyncbackend.repository;

import com.studysync.studysyncbackend.model.MentorshipSession;
import com.studysync.studysyncbackend.model.enums.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MentorshipSessionRepository extends JpaRepository<MentorshipSession, Long> {

    List<MentorshipSession> findByMentorIdAndStatus(Long mentorId, SessionStatus status);
    List<MentorshipSession> findByMenteeId(Long menteeId);
    List<MentorshipSession> findByMentorId(Long mentorId);

    @Query("SELECT COUNT(DISTINCT s.mentee.id) FROM MentorshipSession s WHERE s.mentor.id = :mentorId AND s.status = 'COMPLETED'")
    long countDistinctMenteesByMentorId(@Param("mentorId") Long mentorId);

    @Query("SELECT COUNT(s) FROM MentorshipSession s WHERE s.mentor.id = :mentorId AND s.mentee.id = :menteeId AND s.status = 'COMPLETED'")
    int countCompletedSessionsBetweenPair(@Param("mentorId") Long mentorId, @Param("menteeId") Long menteeId);
}
