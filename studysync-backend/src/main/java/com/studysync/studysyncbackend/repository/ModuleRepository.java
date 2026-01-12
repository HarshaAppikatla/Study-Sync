package com.studysync.studysyncbackend.repository;

import com.studysync.studysyncbackend.model.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List; // Import List

// JpaRepository<EntityType, PrimaryKeyType>
public interface ModuleRepository extends JpaRepository<Module, Long> {

    // You can add custom query methods here later if needed
    // For example, to find all modules for a specific course:
    // List<Module> findByCourseId(Long courseId);

}