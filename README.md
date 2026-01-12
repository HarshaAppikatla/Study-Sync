
<div align="center">

  <h1>📚 Study-Sync</h1>
  
  <p>
    <strong>Next-Gen Learning Management System for the Modern Era</strong>
  </p>

  <p>
    <img src="https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java" />
    <img src="https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white" alt="Spring Boot" />
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
    <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
  </p>
  
  <h3>
    <a href="#-demo">View Demo</a>
    <span> | </span>
    <a href="#-getting-started">Getting Started</a>
    <span> | </span>
    <a href="#-features">Features</a>
  </h3>
</div>

<br />

## 📖 About The Project

**Study-Sync** reimagines the educational experience by seamlessly connecting ambitious students with expert tutors. Unlike traditional LMS platforms that feel clunky and outdated, Study-Sync is built with a **"Design First"** philosophy—ensuring that learning is not just functional, but beautiful, intuitive, and engaging.

Whether you are a **Student** looked to master new skills or a **Tutor** aiming to share knowledge, Study-Sync provides the tailored tools you need in a modern, responsive interface.

---

## ✨ Key Features

### 🎓 For Students
| Feature | Description |
| :--- | :--- |
| **🔍 Smart Discovery** | Effortlessly browse courses with advanced filtering and search capabilities. |
| **📊 Interactive Dashboard** | Visual learner? Track your progress with dynamic heatmaps and learning streaks. |
| **❤️ Wishlist System** | Save courses for later and build your own curriculum path. |
| **👤 Profile Management** | Customize your learner profile and track your learning journey. |

### 👨‍🏫 For Tutors
| Feature | Description |
| :--- | :--- |
| **✍️ Course Creator Studio** | A powerful suite to design courses, structure modules, and upload resources. |
| **📈 Analytics & Insights** | (Coming Soon) Detailed metrics on student performance and course popularity. |
| **📁 Resource Management** | Securely manage files, assignments, and supplementary materials. |

### 🛡️ System Core
*   **Bank-Grade Security**: Full JWT implementation with Spring Security ensures data privacy.
*   **Role-Based Access**: Distinct, secure portals for Admin, Tutors, and Students.
*   **Responsive Design**: A fluid glassmorphism UI that works perfectly on Desktop, Tablet, and Mobile.

---

## 🛠️ Architecture & Tech Stack

This project uses a decoupled Monolithic architecture for simplicity and performance.

### **Backend (The Powerhouse)**
*   **Language**: Java 17
*   **Framework**: Spring Boot 3.x
*   **Database**: MySQL / PostgreSQL
*   **Security**: Spring Security + JWT
*   **Build Tool**: Maven

### **Frontend (The Experience)**
*   **Framework**: React.js 18
*   **Build Tool**: Vite (Blazing fast builds)
*   **Styling**: Modern CSS3 with Glassmorphism effects & complex animations
*   **State Management**: React Hooks (Context API)
*   **HTTP Client**: Axios

---

## 🚀 Getting Started

Follow these steps to get a local copy up and running.

### Prerequisites

*   **Java JDK 17+**
*   **Node.js** (v18 or higher)
*   **MySQL Database** running on port `3306`

### Installation

1.  **Clone the Repo**
    ```bash
    git clone https://github.com/HarshaAppikatla/Study-Sync.git
    ```

2.  **Backend Setup**
    ```bash
    cd Study-Sync/studysync-backend
    # Update src/main/resources/application.properties with your DB creds
    mvn spring-boot:run
    ```

3.  **Frontend Setup**
    ```bash
    # Open a new terminal
    cd Study-Sync/studysync-frontend
    npm install
    npm run dev
    ```

4.  **Access the App**
    *   Frontend: `http://localhost:5173`
    *   Backend API: `http://localhost:8080`

---

## 📸 Screen Previews

> *Tip: Add screenshots here to show off your UI!*

| **Student Dashboard** | **Course Details** |
|:---:|:---:|
| <img src="https://via.placeholder.com/400x200?text=Dashboard+Screenshot" alt="Dashboard" /> | <img src="https://via.placeholder.com/400x200?text=Course+Details" alt="Details" /> |

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📧 Contact

**Harsha Appikatla** - [GitHub Profile](https://github.com/HarshaAppikatla)

Project Link: [https://github.com/HarshaAppikatla/Study-Sync](https://github.com/HarshaAppikatla/Study-Sync)

<div align="center">
  <sub>Built with ❤️ by Harsha Appikatla</sub>
</div>
