package com.studysync.studysyncbackend.service;

import com.studysync.studysyncbackend.dto.CourseComparisonDto;
import com.studysync.studysyncbackend.dto.CourseRequestDto;
import com.studysync.studysyncbackend.dto.CourseResponseDto;
import com.studysync.studysyncbackend.dto.ModuleRequestDto;
import com.studysync.studysyncbackend.dto.ModuleResponseDto;
import com.studysync.studysyncbackend.dto.TutorDto;
import com.studysync.studysyncbackend.model.Course;
import com.studysync.studysyncbackend.model.Module;
import com.studysync.studysyncbackend.model.User;
import com.studysync.studysyncbackend.repository.CourseRepository;
import com.studysync.studysyncbackend.repository.ModuleRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseRepository courseRepository;
    private final ModuleRepository moduleRepository;

    @Transactional
    public Course createCourse(Course course) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof User)) {
            throw new IllegalStateException("Valid authentication principal not found.");
        }
        User currentUser = (User) authentication.getPrincipal();
        course.setTutor(currentUser);
        return courseRepository.save(course);
    }

    @Transactional(readOnly = true)
    public List<CourseResponseDto> findAllCourses(Boolean isPublished) {
        List<Course> courses;
        if (isPublished != null) {
            courses = courseRepository.findByIsPublished(isPublished);
        } else {
            courses = courseRepository.findAll();
        }
        return courses.stream()
                .map(this::mapCourseToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CourseResponseDto> searchCourses(String keyword, BigDecimal minPrice, BigDecimal maxPrice,
            Boolean isFree, String sortBy, String category, String level) {
        Specification<Course> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (keyword != null && !keyword.isEmpty()) {
                String likePattern = "%" + keyword.toLowerCase() + "%";
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), likePattern));
            }

            // Only show published courses in search
            predicates.add(criteriaBuilder.isTrue(criteriaBuilder.coalesce(root.get("isPublished"), false)));

            // Category filter
            if (category != null && !category.isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("category"), category));
            }

            // Level filter
            if (level != null && !level.isEmpty()) {
                predicates.add(criteriaBuilder.equal(root.get("level"), level));
            }

            if (isFree != null && isFree) {
                predicates.add(criteriaBuilder.equal(root.get("price"), BigDecimal.ZERO));
            } else {
                if (minPrice != null) {
                    predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("price"), minPrice));
                }
                if (maxPrice != null) {
                    predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("price"), maxPrice));
                }
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        Sort sort = Sort.unsorted();
        if (sortBy != null) {
            switch (sortBy) {
                case "price_asc":
                    sort = Sort.by(Sort.Direction.ASC, "price");
                    break;
                case "price_desc":
                    sort = Sort.by(Sort.Direction.DESC, "price");
                    break;
                case "rating":
                    sort = Sort.by(Sort.Direction.DESC, "averageRating");
                    break;
                case "views":
                    sort = Sort.by(Sort.Direction.DESC, "viewCount");
                    break;
                default:
                    sort = Sort.by(Sort.Direction.DESC, "id");
            }
        }

        return courseRepository.findAll(spec, sort)
                .stream()
                .map(this::mapCourseToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public Module addModuleToCourse(Long courseId, Module module) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new EntityNotFoundException("Course not found with id: " + courseId));
        User currentUser = getCurrentUser();
        if (!course.getTutor().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("User is not authorized to add modules to this course.");
        }
        module.setCourse(course);
        return moduleRepository.save(module);
    }

    @Transactional(readOnly = true)
    public List<CourseComparisonDto> findCoursesForComparison(List<Long> courseIds) {
        return courseRepository.findAllById(courseIds)
                .stream()
                .map(this::mapCourseToComparisonDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public Course updateCourse(Long courseId, CourseRequestDto courseDetails) {
        Course existingCourse = courseRepository.findById(courseId)
                .orElseThrow(() -> new EntityNotFoundException("Course not found with id: " + courseId));

        User currentUser = getCurrentUser();
        if (!existingCourse.getTutor().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("User is not authorized to update this course.");
        }

        existingCourse.setTitle(courseDetails.getTitle());
        existingCourse.setDescription(courseDetails.getDescription());
        existingCourse.setPrice(courseDetails.getPrice());
        existingCourse.setPublished(courseDetails.isPublished());
        existingCourse.setThumbnail(courseDetails.getThumbnail());
        existingCourse.setCategory(courseDetails.getCategory());
        existingCourse.setLevel(courseDetails.getLevel());

        return courseRepository.save(existingCourse);
    }

    @Transactional
    public void deleteCourse(Long courseId) {
        Course courseToDelete = courseRepository.findById(courseId)
                .orElseThrow(() -> new EntityNotFoundException("Course not found with id: " + courseId));

        User currentUser = getCurrentUser();
        if (!courseToDelete.getTutor().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("User is not authorized to delete this course.");
        }

        courseRepository.delete(courseToDelete);
    }

    @Transactional(readOnly = true)
    public CourseResponseDto mapCourseToDto(Course course) {
        User tutor = course.getTutor();
        TutorDto tutorDto = TutorDto.builder()
                .id(tutor.getId())
                .firstName(tutor.getFirstName())
                .lastName(tutor.getLastName())
                .email(tutor.getEmail())
                .build();
        return CourseResponseDto.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .price(course.getPrice())
                .isPublished(course.isPublished())
                .thumbnail(course.getThumbnail())
                .category(course.getCategory())
                .level(course.getLevel())
                .tutor(tutorDto)
                .modules(course.getModules() != null
                        ? course.getModules().stream().map(this::mapModuleToDto).collect(Collectors.toList())
                        : null)
                .build();
    }

    @Transactional(readOnly = true)
    public CourseResponseDto getCourseById(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new EntityNotFoundException("Course not found with id: " + courseId));
        return mapCourseToDto(course);
    }

    @Transactional
    public Module addModuleToCourse(Long courseId, ModuleRequestDto moduleDto) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new EntityNotFoundException("Course not found with id: " + courseId));

        User currentUser = getCurrentUser();
        if (!course.getTutor().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("User is not authorized to add modules to this course.");
        }

        Module newModule = Module.builder()
                .title(moduleDto.getTitle())
                .content(moduleDto.getContent())
                .videoUrl(moduleDto.getVideoUrl())
                .notesUrl(moduleDto.getNotesUrl())
                .course(course)
                .build();

        return moduleRepository.save(newModule);
    }

    @Transactional(readOnly = true)
    public CourseComparisonDto mapCourseToComparisonDto(Course course) {
        User tutor = course.getTutor();
        List<Module> modules = course.getModules();
        TutorDto tutorDto = TutorDto.builder()
                .id(tutor.getId())
                .firstName(tutor.getFirstName())
                .lastName(tutor.getLastName())
                .email(tutor.getEmail())
                .build();
        List<String> moduleTitles = modules.stream()
                .map(Module::getTitle)
                .collect(Collectors.toList());
        return CourseComparisonDto.builder()
                .id(course.getId())
                .title(course.getTitle())
                .price(course.getPrice())
                .tutor(tutorDto)
                .moduleTitles(moduleTitles)
                .build();
    }

    public ModuleResponseDto mapModuleToDto(Module module) {
        return ModuleResponseDto.builder()
                .id(module.getId())
                .title(module.getTitle())
                .content(module.getContent())
                .videoUrl(module.getVideoUrl())
                .notesUrl(module.getNotesUrl())
                .courseId(module.getCourse() != null ? module.getCourse().getId() : null)
                .build();
    }

    @Transactional(readOnly = true)
    public List<CourseResponseDto> findCoursesByTutor() {
        User currentUser = getCurrentUser();
        return courseRepository.findByTutorId(currentUser.getId())
                .stream()
                .map(this::mapCourseToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteModule(Long courseId, Long moduleId) {
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new EntityNotFoundException("Module not found with id: " + moduleId));

        if (!module.getCourse().getId().equals(courseId)) {
            throw new IllegalArgumentException("Module does not belong to the specified course.");
        }

        User currentUser = getCurrentUser();
        if (!module.getCourse().getTutor().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("User is not authorized to delete this module.");
        }

        moduleRepository.delete(module);
    }

    @Transactional
    public Module updateModule(Long courseId, Long moduleId, ModuleRequestDto moduleDto) {
        Module module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new EntityNotFoundException("Module not found with id: " + moduleId));

        if (!module.getCourse().getId().equals(courseId)) {
            throw new IllegalArgumentException("Module does not belong to the specified course.");
        }

        User currentUser = getCurrentUser();
        if (!module.getCourse().getTutor().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("User is not authorized to update this module.");
        }

        module.setTitle(moduleDto.getTitle());
        module.setContent(moduleDto.getContent());
        module.setVideoUrl(moduleDto.getVideoUrl());
        module.setNotesUrl(moduleDto.getNotesUrl());

        return moduleRepository.save(module);
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