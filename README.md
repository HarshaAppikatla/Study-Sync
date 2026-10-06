<div align="center">

  <h1>📚 StudySync</h1>
  
  <p>
    <strong>Next-Gen Learning Management System & EdTech Platform with Gamification and Verifiable Certifications</strong>
  </p>

  <p>
    <a href="https://github.com/HarshaAppikatla/Study-Sync"><img src="https://img.shields.io/badge/Java-21%2B-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java" /></a>
    <a href="https://spring.io/projects/spring-boot"><img src="https://img.shields.io/badge/Spring_Boot-3.5+-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white" alt="Spring Boot" /></a>
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" /></a>
    <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-7.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" /></a>
    <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" /></a>
    <a href="https://www.mysql.com/"><img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" /></a>
    <a href="https://jwt.io/"><img src="https://img.shields.io/badge/JWT-Secure_Auth-black?style=for-the-badge&logo=json-web-tokens&logoColor=white" alt="JWT" /></a>
  </p>
  
  <h3>
    <a href="#-about-the-project">About</a>
    <span> · </span>
    <a href="#-architecture--tech-stack">Architecture</a>
    <span> · </span>
    <a href="#-role-based-features">Features</a>
    <span> · </span>
    <a href="#-technical-highlights">Engineering Highlights</a>
    <span> · </span>
    <a href="#-getting-started">Getting Started</a>
    <span> · </span>
    <a href="#-default-accounts">Demo Accounts</a>
  </h3>
</div>

<br />

---

## 📖 About The Project

**StudySync** is a production-ready, full-stack **Learning Management System (LMS)** engineered with a **"Design-First & Structured-Engagement"** philosophy. Traditional online learning platforms frequently suffer from high student dropout rates, disconnected lesson notes, clunky interfaces, and non-verifiable credentials. 

StudySync addresses these challenges directly by unifying:
1. **Curated Modular Courses:** High-definition video streaming, embedded PDF study guides, and module-level interactive quizzes.
2. **Engagement & Gamification:** Daily streak trackers, experience points (XP), unlocked milestone badges, and live competitive leaderboards.
3. **Automated Verifiable Certification:** Programmatic PDF certificate generation featuring unique UUID verification codes and an open public validation portal.
4. **Comprehensive Governance:** A 3-tier Role-Based Access Control (**Student**, **Tutor**, **Admin**) system complete with course moderation pipelines, platform-wide announcements, and maintenance switchboards.

---

## 🏛️ Architecture & Tech Stack

StudySync adopts a decoupled **3-Tier Client-Server Monolith** designed for high developer velocity, strict relational integrity, and rapid horizontal scalability:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Presentation Layer (Frontend)                   │
│          React 19 SPA • Vite • Tailwind CSS 4 • Framer Motion          │
│               Recharts • Lucide Icons • React Player • Axios           │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP REST (Bearer JWT Auth)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Application Layer (Backend)                     │
│                  Spring Boot 3.5+ • Spring Security 6                  │
│             Spring Data JPA (Hibernate) • Bucket4j Rate Limiter        │
│                iText PDF Engine • JavaMailSender (SMTP)                │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
                    ▼                                ▼
     ┌─────────────────────────────┐   ┌───────────────────────────────┐
     │      Persistence Layer      │   │     External Cloud Services   │
     │      MySQL 8 / H2 Memory    │   │ • Cloudinary (Media Hosting)  │
     │  ACID Relational Constraints│   │ • SMTP Mail Service           │
     └─────────────────────────────┘   └───────────────────────────────┘
```

### **Backend (Core Engine)**
- **Framework:** Spring Boot 3.5.x on Java 21 / 25
- **Security:** Spring Security + Stateless JWT + Persistent Refresh Token Rotation
- **Data Access:** Spring Data JPA with Hibernate ORM
- **Database:** MySQL 8.0 (Production) with zero-config H2 In-Memory fallback for local development
- **Security Throttling:** Bucket4j Token Bucket rate limiting
- **Document Processing:** Lowagie / iText for vector-quality PDF certificate generation
- **Communications:** JavaMailSender for system emails and notifications

### **Frontend (User Interface)**
- **Framework:** React 19 bootstrapped with Vite
- **Styling:** Tailwind CSS 4 with glassmorphism design system & complex animations
- **Motion:** Framer Motion for interactive transitions
- **Data Visualization:** Recharts for analytics heatmaps and student performance trends
- **Media Engine:** React Player with throttled progress hooks
- **Icons:** Lucide React

---

## ✨ Role-Based Features

### 🎓 1. For Students
- **Smart Discovery & Multi-Filter Search:** Filter through approved courses by category, difficulty level (Beginner/Intermediate/Advanced), price range, and tutor ratings.
- **Side-by-Side Course Comparison:** Directly compare up to 3 courses simultaneously across price, curriculum depth, prerequisites, and learner ratings.
- **Interactive Course Player:**
  - Auto-resumes playback from the exact second last watched.
  - In-browser reading of tutor-uploaded PDF lesson materials.
  - Course curriculum navigation and completion tracking.
- **Module Quizzes & Assessments:** Test comprehension with real-time graded multiple-choice questions, pass/fail thresholds, and instant answer evaluations.
- **Gamification Engine:**
  - **Learning Streaks:** Dynamic calculation of consecutive learning days.
  - **Points & XP:** Earn points for watching lessons and passing quizzes.
  - **Badges:** Automatically unlocks milestone badges (*First Step*, *Quiz Master*, *Course Finisher*).
  - **Leaderboard:** Track standing among global learners.
- **Verifiable PDF Certificates:** Upon 100% course completion, generate and download an official certificate with a unique tamper-proof UUID code.
- **Course Discussions:** Course-scoped Q&A threads with upvoting, replies, and instructor notifications.
- **Personalized Wishlist:** Bookmark courses for future enrollment.

### 👨‍🏫 2. For Tutors
- **Tutor Studio:** Dedicated authoring workspace for drafting, editing, and publishing curriculum.
- **Syllabus & Module Builder:** Create multi-module courses with mixed media (Cloudinary video URLs, supplementary PDF download links, and descriptions).
- **Quiz Creator:** Attach custom multiple-choice quizzes with flexible options and correct answer criteria to any module.
- **Tutor Leaderboard & Analytics:** Monitor total student enrollments, course views, rating averages, and platform rank.

### 🛡️ 3. For Administrators
- **Course Moderation Pipeline:** Review submitted courses in `PENDING` status; inspect content and approve or reject before publication.
- **User Governance:** Search platform users, modify roles (`STUDENT`, `TUTOR`, `ADMIN`), and instantly ban/unban abusive accounts.
- **Discussion Moderation:** Monitor, toggle visibility, or delete flagged discussions across all modules.
- **Platform Switchboard:** 
  - Toggle **Maintenance Mode** (gracefully restricts student/tutor traffic with a maintenance screen while permitting admin access).
  - Broadcast dynamic **Global Announcements** with dismissible notification banners.
- **Financial & Operational Metrics:** Real-time visibility into overall enrollments, revenue stats, and system health.

---

## ⚡ Technical Highlights

### 1. Throttled Video Progress Synchronization
Instead of blasting the backend API on every player tick (which occurs every 100ms and would flood the database under high concurrency), StudySync implements a **5% threshold sync throttle**. Progress updates are dispatched to the server only when significant progress occurs, reducing database write operations by over 95%.

### 2. Instant Token Revocation for Banned Users
Pure stateless JWT architectures suffer from the delay between account ban and token expiration. StudySync enhances the `JwtAuthenticationFilter` with database-level `isAccountNonLocked()` checks on incoming requests. Banned users are instantly blocked even if their JWT token is still technically unexpired.

### 3. Database Idempotency & Race-Condition Defense
To prevent double-enrollments and duplicate badges during rapid clicks or network retries, strict database-level unique constraints are enforced:
- `UK_enrollment_user_course (user_id, course_id)`
- `UK_earned_badge_user_badge (user_id, badge_id)`
- `UK_certificate_code (verification_code)`

### 4. Public Certificate Verification Portal
Certificates are generated with an immutable verification code. Any external entity (such as a university or employer) can navigate to `/verify/:code` without logging in to verify recipient authenticity, course details, and graduation timestamp.

---

## 📂 Repository Structure

```
Study-Sync/
├── studysync-backend/               # Spring Boot 3 Java Application
│   ├── src/main/java/com/studysync/
│   │   ├── config/                  # SecurityConfig, JwtAuthFilter, CloudinaryConfig
│   │   ├── controller/              # Auth, Course, Enrollment, Quiz, Admin, etc.
│   │   ├── dto/                     # Request and Response Data Transfer Objects
│   │   ├── model/                   # JPA Entities (User, Course, Module, Badge, etc.)
│   │   ├── repository/              # Spring Data JPA Repositories
│   │   └── service/                 # Core LMS Business Logic & Integrations
│   ├── src/main/resources/
│   │   └── application.properties   # Database, JWT, Cloudinary & Mail configurations
│   ├── pom.xml                      # Maven Dependencies & Build Setup
│   └── mvnw.cmd                     # Maven Wrapper
│
├── studysync-frontend/              # React 19 + Vite Application
│   ├── src/
│   │   ├── components/              # VideoPlayer, QuizPlayer, Sidebar, PDFViewer, etc.
│   │   ├── pages/                   # Dashboard, TutorStudio, AdminDashboard, etc.
│   │   ├── services/api.js          # Axios client with JWT interceptor & auto-logout
│   │   ├── App.jsx                  # React Router 7 setup & maintenance guards
│   │   └── index.css                # Tailwind CSS v4 styling rules
│   ├── package.json                 # Node.js dependencies
│   └── vite.config.js               # Vite configurations
│
└── README.md                        # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Java Development Kit (JDK):** Version 17+ (JDK 21 or 25 recommended)
- **Node.js:** v18.x or higher (npm v9+)
- **Database (Optional for local):** MySQL 8.x (the project is configured with H2 in-memory mode out of the box for instant zero-configuration testing!)

---

### Step 1: Start the Backend

1. Navigate to the backend directory:
   ```bash
   cd studysync-backend
   ```

2. *(Optional)* Configure your database credentials in `src/main/resources/application.properties` if connecting to an external MySQL instance:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/studysync
   spring.datasource.username=root
   spring.datasource.password=your_password
   ```

3. Run the application using the Maven wrapper:
   ```bash
   # On Windows (PowerShell / Command Prompt)
   .\mvnw.cmd spring-boot:run

   # On Linux / macOS
   ./mvnw spring-boot:run
   ```
   *The backend will boot up at `http://localhost:8080`.*

---

### Step 2: Start the Frontend

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd studysync-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will launch at `http://localhost:5173`.*

---

## 🔑 Default Accounts

On startup, the system automatically bootstraps demo accounts and sample courses into the database:

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Student** | `user@studysync.com` | `password` | Course enrollment, video player, quizzes, badges, certificate generation |
| **Tutor** | `tutor@studysync.com` | `password` | Tutor Studio, course creation, module uploads, quiz authoring |
| **Admin** | *(Assign via DB or register)* | — | Course approvals, user role management, system maintenance mode |

---

## 🌐 Key API Routes

| Endpoint | Method | Role | Description |
| :--- | :---: | :---: | :--- |
| `/api/auth/register` | `POST` | Public | Register a new student or tutor account |
| `/api/auth/authenticate` | `POST` | Public | Obtain short-lived JWT and credentials |
| `/api/courses` | `GET` | Authenticated | Browse approved, published courses |
| `/api/courses/compare?ids=1,2` | `GET` | Authenticated | Fetch side-by-side comparison matrix |
| `/api/courses/{id}/modules` | `POST` | Tutor | Append lesson modules to a course |
| `/api/enrollments` | `POST` | Student | Enroll in a course |
| `/api/enrollments/modules/{id}/progress` | `PUT` | Student | Update watched playback timestamp |
| `/api/quizzes/{id}/submit` | `POST` | Student | Submit quiz answers for grading & points |
| `/api/certificates/download/{courseId}`| `GET` | Student | Download official signed completion PDF |
| `/api/certificates/verify/{code}` | `GET` | Public | Verify certificate validity by UUID |
| `/api/admin/courses/{id}/approve` | `PUT` | Admin | Approve pending course for public catalog |
| `/api/system/settings` | `GET`/`PUT` | Admin | Get or toggle maintenance mode / banner |

---

## 📜 Certificate Verification Example

Any completion certificate contains a verifiable link in the format:
```
http://localhost:5173/verify/{CERTIFICATE_UUID}
```
The public verification endpoint performs a zero-trust database lookup to confirm:
- **Student Name**
- **Course Name**
- **Graduation / Completion Date**
- **Authenticity Seal**

---

## 🤝 Contributing

Contributions are warmly welcomed! To get started:

1. Fork the Project repository.
2. Create your Feature Branch:
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Commit your Changes:
   ```bash
   git commit -m 'Add: AmazingFeature'
   ```
4. Push to your Branch:
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Open a Pull Request.

---

## 📬 Contact & Support

**Harsha Appikatla**
- **GitHub:** [@HarshaAppikatla](https://github.com/HarshaAppikatla)
- **Project Repository:** [https://github.com/HarshaAppikatla/Study-Sync](https://github.com/HarshaAppikatla/Study-Sync)

<div align="center">
  <sub>Built with ❤️ by Harsha Appikatla for modern, accessible online learning.</sub>
</div>
