# Study-Sync

**Study-Sync** is a comprehensive Learning Management System (LMS) designed to bridge the gap between students and tutors. It provides a seamless platform for course creation, enrollment, and progress tracking, featuring interactive dashboards and a robust course management engine.

## 🚀 Features

### For Students
- **Course Discovery**: Browse and search for courses across various categories.
- **Interactive Dashboards**: Track learning progress, view enrolled courses, and manage personal profiles.
- **Wishlist**: Save interesting courses for later.
- **Engagement Tracking**: Visual learning streaks and activity heatmaps.

### For Tutors
- **Course Creation**: Intuitive tools to create and publish courses with rich content.
- **Module Management**: Organize course content into structured modules and lessons.
- **Student Insights**: Monitor student enrollment and course performance.

### Core System Features
- **Secure Authentication**: Role-based access control (RBAC) using JWT and Spring Security.
- **Responsive Design**: Modern, glassmorphism-inspired UI built with React and Vite.
- **File Management**: Secure upload and retrieval of course materials and user assets.

## 🛠️ Technology Stack

### Backend
- **Java** (Spring Boot Framework)
- **Spring Security** (JWT Authentication)
- **Spring Data JPA**
- **Maven** (Dependency Management)

### Frontend
- **React.js**
- **Vite** (Build Tool)
- **CSS3** (Custom Modern Styling & Animations)
- **Axios** (API Integration)

## 📂 Project Structure

The project is organized into two main synchronized directories:

- **`studysync-backend/`**: The robust server-side application handling API requests, database interactions, and business logic.
- **`studysync-frontend/`**: The dynamic client-side application providing the user interface and experience.

## 🏁 Getting Started

### Prerequisites
- Node.js & npm
- Java Development Kit (JDK) 17+
- MySQL (or configured database)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/HarshaAppikatla/Study-Sync.git
    cd Study-Sync
    ```

2.  **Setup Backend**
    ```bash
    cd studysync-backend
    # Configure application.properties with your database credentials
    mvn spring-boot:run
    ```

3.  **Setup Frontend**
    ```bash
    cd ../studysync-frontend
    npm install
    npm run dev
    ```

## 🤝 Contribution

Contributions are welcome! Please feel free to submit a Pull Request.
