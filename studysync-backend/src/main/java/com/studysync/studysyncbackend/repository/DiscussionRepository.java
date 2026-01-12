package com.studysync.studysyncbackend.repository;

import com.studysync.studysyncbackend.model.Discussion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DiscussionRepository extends JpaRepository<Discussion, Long> {
    // Find top-level discussions for a module (ordered by newest)
    List<Discussion> findByModuleIdAndParentIsNullOrderByCreatedAtDesc(Long moduleId);

    // Find top-level discussions for a course (ordered by newest)
    List<Discussion> findByCourseIdAndParentIsNullOrderByCreatedAtDesc(Long courseId);
}
