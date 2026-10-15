package com.studysync.studysyncbackend.service;

import com.studysync.studysyncbackend.dto.EnrollmentResponseDto;
import com.studysync.studysyncbackend.model.Course;
import com.studysync.studysyncbackend.model.Enrollment;
import com.studysync.studysyncbackend.model.User;
import com.studysync.studysyncbackend.repository.CourseRepository;
import com.studysync.studysyncbackend.repository.EnrollmentRepository;
import com.studysync.studysyncbackend.repository.ModuleProgressRepository;
import com.studysync.studysyncbackend.repository.ModuleRepository;
import com.studysync.studysyncbackend.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@org.mockito.junit.jupiter.MockitoSettings(strictness = org.mockito.quality.Strictness.LENIENT)
class EnrollmentServiceTest {

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private ModuleProgressRepository moduleProgressRepository;

    @Mock
    private ModuleRepository moduleRepository;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CourseService courseService;

    @Mock
    private GamificationService gamificationService;

    @Mock
    private CertificateService certificateService;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private EnrollmentService enrollmentService;

    private User student;
    private Course course;
    private SecurityContext originalContext;

    @BeforeEach
    void setUp() {
        student = User.builder().id(1L).email("student@studysync.com").firstName("Student").lastName("One").build();
        course = Course.builder().id(10L).title("Test Course").build();

        originalContext = SecurityContextHolder.getContext();
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getPrincipal()).thenReturn(student);
        SecurityContext sc = mock(SecurityContext.class);
        when(sc.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(sc);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.setContext(originalContext);
    }

    @Test
    void enrollUser_whenNotAlreadyEnrolled_createsEnrollment() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(student));
        when(courseRepository.findById(10L)).thenReturn(Optional.of(course));
        when(enrollmentRepository.findByUserIdAndCourseId(1L, 10L)).thenReturn(Optional.empty());

        Enrollment saved = Enrollment.builder().id(100L).user(student).course(course).build();
        when(enrollmentRepository.save(any(Enrollment.class))).thenReturn(saved);

        EnrollmentResponseDto result = enrollmentService.enrollUser(10L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(100L);
        assertThat(result.getCourseId()).isEqualTo(10L);
        verify(enrollmentRepository, times(1)).save(any(Enrollment.class));
    }

    @Test
    void enrollUser_whenAlreadyEnrolled_returnsExistingIdempotently() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(student));
        when(courseRepository.findById(10L)).thenReturn(Optional.of(course));

        Enrollment existing = Enrollment.builder().id(99L).user(student).course(course).build();
        when(enrollmentRepository.findByUserIdAndCourseId(1L, 10L)).thenReturn(Optional.of(existing));

        EnrollmentResponseDto result = enrollmentService.enrollUser(10L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(99L);
        // Verify it did not attempt to save a duplicate
        verify(enrollmentRepository, never()).save(any(Enrollment.class));
    }

    @Test
    void enrollUser_whenCourseIdNull_throwsIllegalArgumentException() {
        assertThatThrownBy(() -> enrollmentService.enrollUser(null))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void enrollUser_whenCourseNotFoundById_fallsBackToCatalogIndex() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(student));
        when(courseRepository.findById(1L)).thenReturn(Optional.empty());
        when(courseRepository.findAll()).thenReturn(List.of(course));
        when(enrollmentRepository.findByUserIdAndCourseId(1L, 10L)).thenReturn(Optional.empty());

        Enrollment saved = Enrollment.builder().id(101L).user(student).course(course).build();
        when(enrollmentRepository.save(any(Enrollment.class))).thenReturn(saved);

        EnrollmentResponseDto result = enrollmentService.enrollUser(1L);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(101L);
    }
}
