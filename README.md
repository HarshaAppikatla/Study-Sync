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
    <a href="#-about-the-project">About</a>
    <span> · </span>
    <a href="#-active-development-peer-mentorship-system">Peer Mentorship (In Dev)</a>
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

**StudySync** is a full-stack **Learning Management & Peer Collaboration Platform** engineered with a **"Design-First & Structured-Engagement"** philosophy. Traditional online learning tools frequently suffer from high student dropout rates, static unassisted video content, and isolated learners struggling through difficult course modules without instant help. 

StudySync bridges this gap by unifying:
1. **Curated Modular Courses:** High-definition video streaming, embedded PDF study guides, and module-level interactive quizzes.
2. **Peer Mentorship & Live Support:** Connecting top-performing seniors directly with struggling juniors for 1-on-1 mentorship.
3. **Engagement & Gamification:** Daily streak trackers, experience points (XP), unlocked milestone badges, and live competitive leaderboards.
4. **Automated Verifiable Certification:** Programmatic PDF certificate generation featuring unique UUID verification codes and an open public validation portal.
5. **Comprehensive Governance:** A multi-tier Role-Based Access Control system (**Student**, **Mentor**, **Tutor**, **Admin**) complete with course moderation pipelines and maintenance switchboards.

---

## 🚧 Active Development: Peer-to-Peer Mentorship System

> **Current Sprint:** We are currently implementing a **Verified Peer-to-Peer Mentorship Engine** with an **Anti-Collusion Token Economy** to transform StudySync from a static video portal into an active academic community.

### 💡 Why Is This Feature Important?

* **The Problem with Video-Only Platforms:** Recorded lectures are great for broad concepts, but when students get stuck on complex coding assignments, mathematical proofs, or exam preparation, static videos fail.
* **The Solution (Verified Senior Guidance):** Connect juniors directly with seniors who achieved top grades (A / S grade) in that exact course for live 1-on-1 tutoring, code review, and exam strategy sessions.


```

```
   [Junior Student]                                   [Verified Senior Mentor]

```

(Struggling with Course)                             (Scored 'A' Grade in Course)
│                                                      │
│─── 1. Books 1-on-1 Live Session (Escrow Hold) ──────>│
│                                                      │
│<── 2. Live WebSocket Study Room (Shared Whiteboard)─>│
│                                                      │
└─── 3. Session End & Rating ──> [Escrow Releases Tokens - 15% Burn]

```

### 🛡️ How We Solve Grade Forgery & Review Abuse

A major challenge in peer-to-peer tutoring is **unqualified mentors uploading fake grade sheets** or **friends colluding to farm fake reviews/tokens**. Our architecture resolves these exact issues:

#### 1. Cryptographic Grade Verification
* **PDF Digital Signature Validation:** Uses `Apache PDFBox` to inspect uploaded university transcripts for official cryptographic digital signatures. Any edits made in tools like Canva or Photoshop invalidate the PDF signature and trigger an instant auto-rejection.
* **Metadata & Forensic Inspection:** Backend scanners automatically detect and flag files created or modified by graphics editing software (`Canva`, `Adobe Photoshop`, `GIMP`).

#### 2. Anti-Collusion Token Economics
* **Platform Token Burn (15% Commission Fee):** Every session deducts a 15% non-refundable platform fee upon completion. If friends try to repeatedly cycle tokens back and forth to fake reviews, their token balance rapidly decays, making collusion financially expensive.
* **Diminishing Pairwise Weighting:** Ratings decay mathematically when repeatedly given between the exact same pair of users:
  $$\text{Rating Weight} = \frac{1}{\text{Previous Sessions Between Pair}}$$
* **Unique Mentee Thresholds:** Mentors must achieve high ratings across a minimum of **5 distinct mentees** before unlocking top-rated badges or cash-out privileges.
* **Escrow-Backed Payouts:** Session tokens remain locked in a `TokenEscrow` state until the session finishes, a minimum 20-minute active WebSocket interaction is verified, and the mentee submits a positive rating.

---

## 🏛️ Architecture & Tech Stack

StudySync adopts a decoupled **3-Tier Client-Server Architecture** designed for high developer velocity, strict relational integrity, and real-time collaboration:


```

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
- **Real-Time Messaging:** Spring WebSockets with STOMP protocol
- **Security:** Spring Security + Stateless JWT + Persistent Refresh Token Rotation
- **Data Access:** Spring Data JPA with Hibernate ORM
- **Database:** MySQL 8.0 (Production) with H2 In-Memory fallback for testing
- **Verification Engine:** Apache PDFBox for digital signature and transcript forensic analysis

### **Frontend (User Interface)**
- **Framework:** React 19 bootstrapped with Vite
- **Styling:** Tailwind CSS 4 with glassmorphism design system & complex animations
- **Data Visualization:** Recharts for analytics heatmaps and student performance trends
- **Real-Time Client:** `@stomp/stompjs` for live study rooms & mentorship messaging

---

## ✨ Role-Based Features

### 🎓 1. For Students & Mentees
- **Peer Mentorship Discovery:** Search for verified seniors by course code, rating, and availability. Book live 1-on-1 tutoring sessions.
- **Smart Discovery & Multi-Filter Search:** Filter through approved courses by category, difficulty level (Beginner/Intermediate/Advanced), price range, and tutor ratings.
- **Side-by-Side Course Comparison:** Directly compare up to 3 courses simultaneously across price, curriculum depth, prerequisites, and learner ratings.
- **Interactive Course Player:** Auto-resumes playback from the exact second last watched, renders inline PDF guides, and tracks module progress.
- **Module Quizzes & Assessments:** Test comprehension with real-time graded multiple-choice questions, pass/fail thresholds, and instant answer evaluations.
- **Gamification Engine:** Learning streaks, experience points (XP), milestone badges, and global competitive leaderboards.
- **Verifiable PDF Certificates:** Upon 100% course completion, generate and download an official certificate with a unique tamper-proof UUID code.

### 🧑‍🏫 2. For Verified Mentors & Tutors
- **Transcript Verification Portal:** Upload official semester grade reports for automated digital signature validation and administrative clearance.
- **Tutor Studio:** Dedicated authoring workspace for drafting, editing, and publishing curriculum (Cloudinary video URLs, PDF download links, and descriptions).
- **Mentorship Escrow Wallet:** Track pending vs. released study tokens, active sessions, and mentee feedback analytics.

### 🛡️ 3. For Administrators
- **Verification Queue & Course Moderation:** Inspect submitted course drafts and flagged mentor grade transcripts before approving publication.
- **User Governance:** Search platform users, modify roles (`STUDENT`, `MENTOR`, `TUTOR`, `ADMIN`), and instantly enforce access revocation on abusive accounts.
- **Platform Switchboard:** Toggle global maintenance mode and broadcast platform-wide notification banners.

---

## ⚡ Technical Highlights

### 1. Cryptographic PDF Signature Inspection
Prevents grade forgery by examining the internal digital certificate signatures embedded in university grade PDFs (`Apache PDFBox`). Any post-export editing in graphics software invalidates the signature layer, causing the backend to flag the upload as tampered.

### 2. Anti-Collusion Decay & Escrow Engine
Session payments are placed in a `TokenEscrow` state. Payouts are delayed until session telemetry validates a minimum 20-minute active WebSocket connection. The backend dynamically decays rating weights for repeat mentor-mentee pairs to prevent rating ring manipulations.

### 3. Throttled Video Progress Synchronization
Instead of blasting the backend API on every player tick (which occurs every 100ms and would flood the database under high concurrency), StudySync implements a **5% threshold sync throttle**. Progress updates are dispatched to the server only when significant progress occurs, reducing database write operations by over 95%.

### 4. Instant Token Revocation for Banned Users
StudySync enhances the `JwtAuthenticationFilter` with database-level `isAccountNonLocked()` checks on incoming requests, ensuring banned accounts are blocked instantly even if their JWT token is technically unexpired.

---

## 📂 Repository Structure


```

Study-Sync/
├── studysync-backend/               # Spring Boot 3 Java Application
│   ├── src/main/java/com/studysync/
│   │   ├── config/                  # SecurityConfig, WebSocketConfig, JwtAuthFilter, CloudinaryConfig
│   │   ├── controller/              # Auth, Course, Mentorship, Quiz, Admin
│   │   ├── dto/                     # Request and Response Data Transfer Objects
│   │   ├── model/                   # JPA Entities (User, MentorVerification, MentorshipSession, TokenEscrow, etc.)
│   │   ├── repository/              # Spring Data JPA Repositories
│   │   └── service/                 # Core LMS, Verification, & Anti-Collusion Logic
│   ├── src/main/resources/
│   │   └── application.properties   # Database, JWT, Cloudinary & Mail configurations
│   ├── pom.xml                      # Maven Dependencies & Build Setup
│   └── mvnw.cmd                     # Maven Wrapper
│
├── studysync-frontend/              # React 19 + Vite Application
│   ├── src/
│   │   ├── components/              # VideoPlayer, MentorshipCard, LiveStudyRoom, QuizPlayer
│   │   ├── pages/                   # Dashboard, MentorshipHub, TutorStudio, AdminDashboard
│   │   ├── services/api.js          # Axios client with JWT interceptor & auto-logout
│   │   ├── App.jsx                  # React Router setup & maintenance guards
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
- **Database:** MySQL 8.x (the project is configured with H2 in-memory mode out of the box for instant zero-configuration testing!)

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

On startup, the system automatically bootstraps demo accounts and sample data into the database:

| Role | Email | Password | Access Rights |
| --- | --- | --- | --- |
| **Student** | `user@studysync.com` | `password` | Course enrollment, video player, mentorship booking, quizzes, badges |
| **Tutor** | `tutor@studysync.com` | `password` | Tutor Studio, course creation, module uploads, quiz authoring |
| **Admin** | *(Assign via DB or register)* | — | Course & transcript approvals, user role management, maintenance mode |

---

## 🌐 Key API Routes

| Endpoint | Method | Role | Status | Description |
| --- | --- | --- | --- | --- |
| `/api/auth/authenticate` | `POST` | Public | ✅ Active | Login & obtain JWT token |
| `/api/v1/mentorship/verify` | `POST` | Student | 🚧 In Dev | Upload transcript PDF for digital verification |
| `/api/v1/mentorship/sessions/book` | `POST` | Student | 🚧 In Dev | Book 1-on-1 session with escrow hold |
| `/api/v1/mentorship/sessions/{id}/complete` | `POST` | Mentor/Mentee | 🚧 In Dev | End session, submit rating, & trigger token release |
| `/api/courses` | `GET` | Authenticated | ✅ Active | Browse approved courses catalog |
| `/api/certificates/verify/{code}` | `GET` | Public | ✅ Active | Verify certificate validity by UUID |

---

## 📜 Certificate Verification Example

Any completion certificate contains a verifiable link in the format:

```
http://localhost:5173/verify/{CERTIFICATE_UUID}

```

The public verification endpoint performs a zero-trust database lookup to confirm:

* **Student Name**
* **Course Name**
* **Graduation / Completion Date**
* **Authenticity Seal**

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
