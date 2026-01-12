package com.studysync.studysyncbackend.repository;

import com.studysync.studysyncbackend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

// JpaRepository<EntityType, PrimaryKeyType>
public interface UserRepository extends JpaRepository<User, Long> {

    // Spring Data JPA automatically creates the implementation for this method
    // based on the method name. It knows to look for a user by the 'email' field.
    Optional<User> findByEmail(String email);
}