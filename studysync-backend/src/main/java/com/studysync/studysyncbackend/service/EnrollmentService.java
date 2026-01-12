package com.studysync.studysyncbackend.service;

import com.studysync.studysyncbackend.dto.EnrollmentResponseDto;
import com.studysync.studysyncbackend.model.Course;
import com.studysync.studysyncbackend.model.Enrollment;
import com.studysync.studysyncbackend.model.User;
import com.studysync.studysyncbackend.repository.CourseRepository;
import com.studysync.studysyncbackend.repository.EnrollmentRepository;
import com.studysync.studysyncbackend.repository.UserRepository; // If needed to fetch full user entity
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final CourseService courseService; // Injected

    @Transactional
    public EnrollmentResponseDto enrollUser(Long courseId) {
        User currentUser = getCurrentUser();

        // Ensure we have the fresh user entity attached to the session
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new EntityNotFoundException("Course not found with id: " + courseId));

        if (enrollmentRepository.existsByUserIdAndCourseId(user.getId(), courseId)) {
            throw new IllegalStateException("User is already enrolled in this course.");
        }

        Enrollment enrollment = Enrollment.builder()
                .user(user)
                .course(course)
                .build();

        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);
        return mapToDto(savedEnrollment);
    }

    @Transactional(readOnly = true)
    public List<EnrollmentResponseDto> getCurrentUserEnrollments() {
        User currentUser = getCurrentUser();
        return enrollmentRepository.findByUserId(currentUser.getId())
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public boolean isEnrolled(Long courseId) {
        User currentUser = getCurrentUser();
        return enrollmentRepository.existsByUserIdAndCourseId(currentUser.getId(), courseId);
    }

    @Transactional
    public void updateProgress(Long courseId, int progress) {
        User currentUser = getCurrentUser();
        Enrollment enrollment = enrollmentRepository.findByUserIdAndCourseId(currentUser.getId(), courseId)
                .orElseThrow(() -> new EntityNotFoundException("Enrollment not found"));

        enrollment.setProgress(progress);
        enrollment.setLastAccessed(java.time.LocalDateTime.now());
        enrollmentRepository.save(enrollment);
    }

    private EnrollmentResponseDto mapToDto(Enrollment enrollment) {
        return EnrollmentResponseDto.builder()
                .id(enrollment.getId())
                .userId(enrollment.getUser().getId())
                .courseId(enrollment.getCourse().getId())
                .courseTitle(enrollment.getCourse().getTitle())
                .enrolledAt(enrollment.getEnrolledAt())
                .progress(enrollment.getProgress())
                .lastAccessed(enrollment.getLastAccessed())
                .course(courseService.mapCourseToDto(enrollment.getCourse())) // Map full course
                .build();
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof User)) {
            throw new IllegalStateException("User must be authenticated.");
        }
        return (User) authentication.getPrincipal();
    }
}
