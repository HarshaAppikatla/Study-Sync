<div align="center">

  <h1>📚 StudySync</h1>
  
  <p>
    <strong>Next-Gen Learning Management System & Peer Mentorship Platform with Gamification and Verifiable Certifications</strong>
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
    <a href="#-executive-overview">About</a>
    <span> · </span>
    <a href="#-architecture--tech-stack">Architecture</a>
    <span> · </span>
    <a href="#-core-engineering--system-design-highlights">Engineering Highlights</a>
    <span> · </span>
    <a href="#-module-1-peer-to-peer-mentorship-engine">Peer Mentorship</a>
    <span> · </span>
    <a href="#-module-2-role-based-features--lms-core">Features</a>
    <span> · </span>
    <a href="#-getting-started">Getting Started</a>
    <span> · </span>
    <a href="#-demo-accounts">Demo Accounts</a>
  </h3>
</div>

<br />

---

## 📖 Executive Overview

**StudySync** is an enterprise-grade **Learning Management & Peer Collaboration Platform** engineered with a **Design-First & Structured-Engagement** philosophy. Traditional online learning management systems frequently suffer from high student dropout rates, static unassisted video content, and isolated learners struggling through difficult course modules without instant assistance. 

StudySync bridges this gap by unifying five core pillars into a single full-stack ecosystem:
1. **Curated Modular Courses:** HD video streaming, embedded PDF study guides, and module-level interactive quizzes.
2. **Verified Peer Mentorship:** Connecting top-performing senior students directly with struggling juniors for 1-on-1 mentorship.
3. **Engagement & Gamification:** Daily streak trackers, experience points (XP), unlocked milestone badges, and live competitive leaderboards.
4. **Verifiable Certification:** Programmatic PDF certificate generation featuring unique UUID verification codes and an open public verification portal.
5. **Comprehensive Governance:** Multi-tier Role-Based Access Control (**Student**, **Mentor**, **Tutor**, **Admin**) with forensic document audits and dispute resolution workflows.

---

## 🏛️ Architecture & Tech Stack

StudySync adopts a decoupled **3-Tier Client-Server Architecture** designed for high developer velocity, strict relational integrity, and real-time collaboration:

```text
┌────────────────────────────────────────────────────────────────────────┐
│                        Presentation Layer (Frontend)                   │
│          React 19 SPA • Vite • Tailwind CSS 4 • Framer Motion          │
│               Recharts • Lucide Icons • STOMP WebSocket Client         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP REST / WebSocket (JWT Auth)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Application Layer (Backend)                     │
│               Spring Boot 3.5+ • Spring Security 6 • WebSockets        │
│          Spring Data JPA (Hibernate) • PDFBox Cryptographic Validator  │
│               iText PDF Engine • Bucket4j Rate Limiter                 │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
                    ▼                                ▼
┌─────────────────────────────┐   ┌───────────────────────────────┐
│      Persistence Layer      │   │     External Cloud Services   │
│      MySQL 8 / H2 Memory    │   │ • Cloudinary (Media Hosting)  │
│ ACID Relational Constraints │   │ • SMTP Mail Service           │
└─────────────────────────────┘   └───────────────────────────────┘
```

### **Backend (Core Engine)**
- **Framework:** Spring Boot 3.5.x on Java 21 / 25
- **Real-Time Messaging:** Spring WebSockets with STOMP protocol & SockJS fallback
- **Security:** Spring Security + Stateless JWT + Persistent Refresh Token Rotation + Pessimistic Locking
- **Data Access:** Spring Data JPA with Hibernate ORM
- **Database:** MySQL 8.0 (Production) with zero-config H2 In-Memory fallback for testing
- **Verification Engine:** Apache PDFBox for digital signature & forensic transcript analysis
- **Document Processing:** iText / Lowagie for verifiable PDF certificate generation

### **Frontend (User Interface)**
- **Framework:** React 19 bootstrapped with Vite
- **Styling:** Tailwind CSS 4 with glassmorphism design system & complex animations
- **Data Visualization:** Recharts for analytics heatmaps and student performance trends
- **Real-Time Client:** `@stomp/stompjs` for live study rooms & mentorship telemetry

---

## ⚡ Core Engineering & System Design Highlights

### 1. Cryptographic PDF Signature & Metadata Inspection
Prevents grade forgery by inspecting metadata streams and creator signatures in uploaded university transcripts (`Apache PDFBox`). Any post-export editing in graphics software (Canva, Photoshop, GIMP) invalidates the signature layer, causing the backend to automatically flag the upload for administrative inspection.

### 2. Anti-Collusion Token Escrow & Rating Decay Engine
Session payments are held in a pessimistic write-locked `TokenEscrow`. Payouts are delayed until session telemetry validates a minimum 20-minute active WebSocket connection. The backend dynamically decays rating weights for repeat mentor-mentee pairs to prevent rating ring manipulations:
$$\text{Rating Weight} = \frac{1}{\text{Previous Sessions Between Pair}}$$

### 3. Automated 30-Day Retention Purge & Cryptographic Receipts
To protect student privacy, a Spring Boot scheduled cron job (`@Scheduled(cron = "0 0 2 * * ?")`) runs daily at 2:00 AM to automatically delete physical PDF binaries from storage 30 days post-verification while locking immutable SHA-256 receipts in the database forever.

### 4. Throttled Video Progress Synchronization
Instead of flooding the backend API on every player tick (which occurs every 100ms and would flood the database under high concurrency), StudySync implements a **5% threshold sync throttle**. Progress updates are dispatched to the server only when significant progress occurs, reducing database write operations by over 95%.

### 5. Multi-Threaded Concurrency & Pessimistic Locking
Token balances and escrow transactions utilize database-level pessimistic write locking (`findByIdWithLock`) to prevent race conditions during concurrent session bookings, guaranteeing token balances never drop below zero.

---

## 🤝 Module 1: Peer-to-Peer Mentorship Engine

A verified Peer-to-Peer Mentorship Engine backed by an Anti-Collusion Token Economy, forensic transcript verification, and live study room telemetry.

```text
   [Junior Student]                                   [Verified Senior Mentor]
(Struggling with Course)                             (Scored 'A' Grade in Course)
        │                                                      │
        │─── 1. Books 1-on-1 Live Session (Escrow Hold) ──────>│
        │                                                      │
        │<── 2. Live WebSocket Study Room (Active Telemetry) ─>│
        │                                                      │
        └─── 3. Session End & Rating ──> [Escrow Releases Tokens - 15% Platform Burn]
```

### 🛡️ Key Protection Mechanisms
* **Forensic Grade Verification:** Apache PDFBox scanning flags edited PDFs. SHA-256 fingerprints prevent duplicate transcript reuse.
* **Platform Token Burn (15% Commission Fee):** Every session deducts a 15% non-refundable fee upon completion, making fake review rings economically unsustainable.
* **Unique Mentee Thresholds:** Mentors must achieve positive ratings across a minimum of **5 distinct mentees** before unlocking top-rated badges or cash-out privileges.
* **Live WebSocket Telemetry:** Live STOMP heartbeats verify an active 20-minute interaction before escrow release is permitted.
* **4-Layer Student Data Privacy:** Grade sheets are isolated from public view; profiles render only a verified badge (e.g., *Grade S Verified*).

---

## ✨ Module 2: Role-Based Features & LMS Core

### 🎓 1. For Students & Mentees
- **Peer Mentorship Discovery:** Search for verified seniors by course code, department, rating, and hourly rate. Book live 1-on-1 sessions with escrow protection.
- **Smart Discovery & Multi-Filter Search:** Filter through approved courses by category, difficulty level, price range, and tutor ratings.
- **Side-by-Side Course Comparison:** Directly compare up to 3 courses simultaneously across price, curriculum depth, prerequisites, and learner ratings.
- **Interactive Course Player:** Auto-resumes playback, renders inline PDF guides, and tracks module progress with throttled sync.
- **Module Quizzes & Assessments:** Test comprehension with real-time graded multiple-choice questions and instant feedback.
- **Gamification Engine:** Learning streaks, experience points (XP), milestone badges, and global competitive leaderboards.
- **Verifiable PDF Certificates:** Download official completion certificates with unique tamper-proof UUID codes.

### 🧑‍🏫 2. For Verified Mentors & Tutors
- **Transcript Verification Portal:** Upload official semester grade reports with 30-day auto-purge protection and SHA-256 receipts.
- **Tutor Studio:** Dedicated authoring workspace for drafting, editing, and publishing course modules (Cloudinary video URLs, PDF download links, and descriptions).
- **Live Study Room:** Real-time collaborative session room with active duration heartbeat tracking.
- **Mentorship Escrow Wallet:** Track pending vs. released study tokens, active sessions, and mentee feedback analytics.

### 🛡️ 3. For Administrators
- **Admin Governance Dashboard:** Complete manual override and forensic audit workstation:
  - **Flagged Transcript Review Queue:** Inspect Apache PDFBox forensic anomalies and approve or reject submissions.
  - **Document Inspection Workstation:** View official academic record sheets with zoom, print, and watermarking.
  - **Disputed Escrow Session Audit:** Investigate reported sessions and execute manual token resolutions (`REFUND_MENTEE` or `RELEASE_MENTOR`).
- **User Governance:** Search platform users, modify roles (`STUDENT`, `MENTOR`, `TUTOR`, `ADMIN`), and instantly revoke access on abusive accounts.
- **Platform Switchboard:** Toggle global maintenance mode and broadcast platform-wide notification banners.

---

## 🚀 Getting Started

### Prerequisites
- **Java Development Kit (JDK):** Version 17+ (JDK 21 or 25 recommended)
- **Node.js:** v18.x or higher (npm v9+)
- **Database:** MySQL 8.x *(Configured with zero-config H2 in-memory mode out of the box for instant local development!)*

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

## 🔑 Demo Accounts

On startup, the system automatically bootstraps demo accounts and sample data into the database:

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Student** | `user@studysync.com` | `password` | Course enrollment, video player, mentorship booking, quizzes, badges |
| **Tutor** | `tutor@studysync.com` | `password` | Tutor Studio, course creation, module uploads, quiz authoring |
| **Admin** | `admin@studysync.com` | `password` | Governance Dashboard, forensic transcript audits, escrow dispute resolution |

---

## 🌐 Key API Endpoint Routes

| Endpoint | Method | Role | Status | Description |
| :--- | :---: | :---: | :---: | :--- |
| `/api/auth/authenticate` | `POST` | Public | ✅ Active | Login & obtain JWT token |
| `/api/v1/mentorship/verify` | `POST` | Student | ✅ Active | Upload transcript PDF for forensic digital verification |
| `/api/v1/mentorship/sessions/book` | `POST` | Student | ✅ Active | Book 1-on-1 session with escrow hold |
| `/api/v1/mentorship/sessions/complete` | `POST` | Student | ✅ Active | Complete session, verify duration & trigger 15% burned release |
| `/api/v1/admin/mentorship/transcripts/flagged` | `GET` | Admin | ✅ Active | Retrieve flagged & pending transcripts for review |
| `/api/v1/admin/mentorship/transcripts/{id}/review` | `PUT` | Admin | ✅ Active | Approve/reject transcript and lock cryptographic receipt |
| `/api/v1/admin/mentorship/sessions/disputed` | `GET` | Admin | ✅ Active | Audit disputed escrow sessions & WebSocket duration logs |
| `/api/v1/admin/mentorship/sessions/{id}/resolve-dispute` | `PUT` | Admin | ✅ Active | Execute manual refund to mentee or release to mentor |
| `/api/courses` | `GET` | Authenticated | ✅ Active | Browse approved courses catalog |
| `/api/certificates/verify/{code}` | `GET` | Public | ✅ Active | Verify certificate validity by UUID |

---

## 📂 Repository Structure

```text
Study-Sync/
├── studysync-backend/               # Spring Boot 3 Java Application
│   ├── src/main/java/com/studysync/studysyncbackend/
│   │   ├── config/                  # SecurityConfig, WebSocketConfig, JwtAuthFilter, DataInitializer
│   │   ├── controller/              # Auth, Course, Mentorship, AdminMentorship, Quiz, Notifications
│   │   ├── dto/                     # Request and Response Data Transfer Objects
│   │   ├── model/                   # JPA Entities (User, MentorVerification, MentorVerificationReceipt, MentorshipSession, TokenEscrow)
│   │   ├── repository/              # Spring Data JPA Repositories
│   │   └── service/                 # MentorshipService, PdfVerificationService, RetentionScheduler, Escrow Logic
│   ├── src/main/resources/
│   │   └── application.properties   # Database, JWT, Cloudinary & Mail configurations
│   ├── pom.xml                      # Maven Dependencies & Build Setup
│   └── mvnw.cmd                     # Maven Wrapper
│
├── studysync-frontend/              # React 19 + Vite Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/               # AdminGovernanceDashboard (Forensic inspection, disputes)
│   │   │   ├── mentorship/          # MentorDiscovery, TranscriptUploadModal, BookSessionModal, LiveStudyRoomModal
│   │   │   └── VideoPlayer.jsx      # Video playback, Quizzes, Sidebar
│   │   ├── pages/                   # MentorshipPage, Dashboard, TutorStudio, AdminDashboard
│   │   ├── services/api.js          # Axios client with JWT interceptor & auto-logout
│   │   ├── App.jsx                  # React Router setup & maintenance guards
│   │   └── index.css                # Tailwind CSS v4 styling rules
│   ├── package.json                 # Node.js dependencies
│   └── vite.config.js               # Vite configurations
│
└── README.md                        # Project documentation
```

---

## 📜 Certificate Verification Example

Any completion certificate contains a verifiable link in the format:

```text
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

1. Fork the project repository.
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

* **GitHub:** [@HarshaAppikatla](https://github.com/HarshaAppikatla)
* **Project Repository:** [https://github.com/HarshaAppikatla/Study-Sync](https://github.com/HarshaAppikatla/Study-Sync)
