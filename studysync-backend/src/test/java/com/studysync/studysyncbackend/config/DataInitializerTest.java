package com.studysync.studysyncbackend.config;

import com.studysync.studysyncbackend.model.Course;
import com.studysync.studysyncbackend.repository.CourseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DataInitializerTest {

    @Mock
    private CourseRepository courseRepository;

    private DataInitializer dataInitializer;

    @BeforeEach
    void setUp() {
        dataInitializer = new DataInitializer(courseRepository);
    }

    @Test
    void run_whenRepositoryEmpty_seedsEightDemonstrationCourses() throws Exception {
        when(courseRepository.count()).thenReturn(0L);
        when(courseRepository.findAll()).thenReturn(Collections.emptyList());

        dataInitializer.run();

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<Course>> captor = ArgumentCaptor.forClass(List.class);
        verify(courseRepository, times(1)).saveAll(captor.capture());

        List<Course> savedCourses = captor.getValue();
        assertThat(savedCourses).hasSize(8);

        assertThat(savedCourses.get(0).getTitle())
                .isEqualTo("Full-Stack Web Development with Spring Boot & React");
        assertThat(savedCourses.get(0).getCategory()).isEqualTo("Development");
        assertThat(savedCourses.get(0).isPublished()).isTrue();
        assertThat(savedCourses.get(0).getInstructor()).isEqualTo("Harsha Vardhan");
    }

    @Test
    void run_whenRepositoryAlreadyPopulated_skipsSeeding() throws Exception {
        when(courseRepository.count()).thenReturn(8L);

        dataInitializer.run();

        verify(courseRepository, never()).saveAll(any());
    }
}
