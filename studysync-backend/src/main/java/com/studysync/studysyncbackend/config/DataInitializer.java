package com.studysync.studysyncbackend.config;

import com.studysync.studysyncbackend.model.ApprovalStatus;
import com.studysync.studysyncbackend.model.Course;
import com.studysync.studysyncbackend.model.MentorVerification;
import com.studysync.studysyncbackend.model.Role;
import com.studysync.studysyncbackend.model.User;
import com.studysync.studysyncbackend.model.enums.VerificationStatus;
import com.studysync.studysyncbackend.repository.CourseRepository;
import com.studysync.studysyncbackend.repository.MentorVerificationRepository;
import com.studysync.studysyncbackend.repository.UserRepository;
import com.studysync.studysyncbackend.service.AdminMentorshipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;

@Component
public class DataInitializer implements CommandLineRunner {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final MentorVerificationRepository mentorVerificationRepository;
    private final AdminMentorshipService adminMentorshipService;

    public DataInitializer(CourseRepository courseRepository) {
        this(courseRepository, null, null, null, null);
    }

    @Autowired
    public DataInitializer(CourseRepository courseRepository,
                           UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           MentorVerificationRepository mentorVerificationRepository,
                           AdminMentorshipService adminMentorshipService) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.mentorVerificationRepository = mentorVerificationRepository;
        this.adminMentorshipService = adminMentorshipService;
    }

    @Override
    public void run(String... args) throws Exception {
        // Seed users, mentors, and admin governance data if dependencies are present
        if (userRepository != null && passwordEncoder != null) {
            initializeUsersAndMentors();
        }

        // Seed courses only if database has 1 or fewer courses
        if (courseRepository.count() <= 1) {
            List<Course> seedCourses = List.of(
                createCourse("Full-Stack Web Development with Spring Boot & React",
                        "Master end-to-end web development by building enterprise applications using Spring Boot, React.js, Tailwind CSS, and RESTful APIs.",
                        "Development", "Intermediate", 29.99, "Harsha Vardhan",
                        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop"),

                createCourse("Deep Learning & Computer Vision Fundamentals",
                        "Learn image classification, object detection, and transfer learning pipelines using PyTorch, TensorFlow, and ResNet architectures.",
                        "Artificial Intelligence", "Advanced", 49.99, "AI Research Lab",
                        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop"),

                createCourse("Data Structures & Algorithms Mastery in Java",
                        "Master core algorithmic problem-solving techniques, Big-O analysis, dynamic programming, and graph traversal for technical interviews.",
                        "Computer Science", "Beginner", 0.00, "Algo Expert",
                        "https://images.unsplash.com/photo-1516116211223-4258568882c6?q=80&w=800&auto=format&fit=crop"),

                createCourse("Database Design & SQL Query Optimization",
                        "Learn schema normalization, indexing strategies, join algorithms, and execution plan analysis in MySQL for high-concurrency systems.",
                        "Database", "Intermediate", 19.99, "Database Lead",
                        "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=800&auto=format&fit=crop"),

                createCourse("Real-Time Systems with WebSockets & STOMP",
                        "Build scalable low-latency interactive messaging pipelines, live chat rooms, and notification engines using Spring WebSocket.",
                        "Backend Architecture", "Advanced", 34.99, "System Architect",
                        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop"),

                createCourse("UI/UX Design Systems with Tailwind CSS & React",
                        "Design sleek, accessible, and responsive dashboards with reusable components, modern typography, and dark mode support.",
                        "Design", "Beginner", 14.99, "Design Studio",
                        "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=800&auto=format&fit=crop"),

                createCourse("Docker, Microservices & Container Orchestration",
                        "Containerize Spring Boot services, set up multi-container Docker Compose environments, and automate deployments.",
                        "DevOps", "Intermediate", 39.99, "DevOps Team",
                        "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?q=80&w=800&auto=format&fit=crop"),

                createCourse("Information Theory & Coding Essentials",
                        "Explore entropy, channel capacity, error-detecting and correcting codes, Huffman coding, and data compression techniques.",
                        "Computer Science", "Intermediate", 0.00, "Academic Faculty",
                        "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=800&auto=format&fit=crop")
            );

            // Filter out any courses that may already exist by title to prevent duplicate records
            List<Course> toSave = seedCourses.stream()
                    .filter(c -> courseRepository.findAll().stream().noneMatch(existing -> existing.getTitle().equalsIgnoreCase(c.getTitle())))
                    .toList();

            if (!toSave.isEmpty()) {
                courseRepository.saveAll(toSave);
                System.out.println("Seeded " + toSave.size() + " demonstration courses into StudySync database.");
            }
        }
    }

    private Course createCourse(String title, String desc, String category, String level, double price, String instructor, String img) {
        Course c = new Course();
        c.setTitle(title);
        c.setDescription(desc);
        c.setCategory(category);
        c.setLevel(level);
        c.setPrice(price);
        c.setInstructor(instructor);
        c.setImageUrl(img);
        c.setPublished(true);
        c.setApprovalStatus(ApprovalStatus.APPROVED);
        c.setAverageRating(4.8);
        c.setViewCount(120L);

        if (userRepository != null) {
            c.setTutor(getOrCreateInstructorUser(instructor));
        }

        return c;
    }

    private User getOrCreateInstructorUser(String instructorName) {
        String cleanEmail = instructorName.toLowerCase().replaceAll("[^a-z0-9]", "") + "@studysync.com";
        return userRepository.findByEmail(cleanEmail).orElseGet(() -> {
            String[] parts = instructorName.split(" ", 2);
            String firstName = parts[0];
            String lastName = parts.length > 1 ? parts[1] : "Instructor";
            User u = User.builder()
                    .email(cleanEmail)
                    .firstName(firstName)
                    .lastName(lastName)
                    .password(passwordEncoder != null ? passwordEncoder.encode("password") : "password")
                    .role(Role.TUTOR)
                    .tokens(50)
                    .points(150)
                    .build();
            return userRepository.save(u);
        });
    }

    private void initializeUsersAndMentors() {
        // Create or Update Admin User
        String adminEmail = "admin@studysync.com";
        User admin = userRepository.findByEmail(adminEmail)
                .orElse(User.builder().email(adminEmail).points(0).currentStreak(0).build());
        admin.setFirstName("Admin");
        admin.setLastName("User");
        admin.setPassword(passwordEncoder.encode("password"));
        admin.setRole(Role.ADMIN);
        userRepository.save(Objects.requireNonNull(admin));
        System.out.println("Admin user updated/created: " + adminEmail + " / password (Role: ADMIN)");

        // Create or Update Standard User/Student
        String userEmail = "user@studysync.com";
        User user = userRepository.findByEmail(userEmail)
                .orElse(User.builder().email(userEmail).points(0).currentStreak(0).build());
        user.setFirstName("Standard");
        user.setLastName("User");
        user.setPassword(passwordEncoder.encode("password"));
        user.setRole(Role.STUDENT);
        user.setTokens(150);
        userRepository.save(Objects.requireNonNull(user));
        System.out.println("Standard user updated/created: " + userEmail + " / password");

        // Create or Update Dedicated Tutor User
        String tutorEmail = "tutor@studysync.com";
        User tutor = userRepository.findByEmail(tutorEmail)
                .orElse(User.builder().email(tutorEmail).points(0).currentStreak(0).build());
        tutor.setFirstName("Dedicated");
        tutor.setLastName("Tutor");
        tutor.setPassword(passwordEncoder.encode("password"));
        tutor.setRole(Role.TUTOR);
        tutor.setTokens(50);
        userRepository.save(Objects.requireNonNull(tutor));
        System.out.println("Dedicated tutor updated/created: " + tutorEmail + " / password");

        // Seed Verified Peer Mentors for Mentorship System
        if (mentorVerificationRepository != null) {
            seedMentorUser("aarav@studysync.com", "Aarav", "Sharma", "Computer Science & Engineering", "CSE2001", "S", "hash-aarav-cse2001");
            seedMentorUser("priya@studysync.com", "Priya", "Nair", "Information Technology", "DSA", "S", "hash-priya-dsa");
            seedMentorUser("rohan@studysync.com", "Rohan", "Verma", "Data Science & AI", "CSE1002", "A+", "hash-rohan-cse1002");
            seedMentorUser("tutor@studysync.com", "Dedicated", "Tutor", "Computer Science", "JAVA101", "S", "hash-tutor-java101");
            seedMentorUser("tutor@studysync.com", "Dedicated", "Tutor", "Computer Science", "MAT2001", "A", "hash-tutor-mat2001");
        }

        // Seed Sample Admin Data
        if (adminMentorshipService != null) {
            adminMentorshipService.seedSampleAdminData();
            System.out.println("Seeded Admin Governance test data: flagged transcripts, pending verifications, and disputed escrows.");
        }
    }

    private void seedMentorUser(String email, String firstName, String lastName, String dept, String courseCode, String grade, String hash) {
        User mentorUser = userRepository.findByEmail(email).orElseGet(() -> {
            User u = User.builder()
                    .email(email)
                    .firstName(firstName)
                    .lastName(lastName)
                    .password(passwordEncoder.encode("password"))
                    .role(Role.STUDENT)
                    .tokens(100)
                    .points(250)
                    .profession(dept)
                    .build();
            return userRepository.save(u);
        });

        if (mentorVerificationRepository.findByUserIdAndCourseCodeAndStatus(mentorUser.getId(), courseCode, VerificationStatus.VERIFIED).isEmpty()) {
            MentorVerification mv = MentorVerification.builder()
                    .user(mentorUser)
                    .courseCode(courseCode)
                    .gradeObtained(grade)
                    .status(VerificationStatus.VERIFIED)
                    .documentHash(hash)
                    .verifiedAt(java.time.LocalDateTime.now())
                    .build();
            mentorVerificationRepository.save(mv);
            System.out.println("Seeded verified mentor: " + mentorUser.getFirstName() + " for " + courseCode);
        }
    }
}
