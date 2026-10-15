/**
 * Demonstration courses dataset for StudySync.
 * Used as mock data and initial state fallback for the Explore Courses dashboard.
 */
export const DEMO_COURSES = [
  {
    id: 1,
    title: "Full-Stack Web Development with Spring Boot & React",
    description: "Master end-to-end web development by building enterprise applications using Spring Boot, React.js, Tailwind CSS, and RESTful APIs.",
    category: "Development",
    level: "Intermediate",
    price: 29.99,
    instructor: "Harsha Vardhan",
    imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop",
    averageRating: 4.9,
    viewCount: 154,
    isPublished: true,
    tutor: { id: 10, firstName: "Harsha", lastName: "Vardhan", email: "harshavardhan@studysync.com" }
  },
  {
    id: 2,
    title: "Deep Learning & Computer Vision Fundamentals",
    description: "Learn image classification, object detection, and transfer learning pipelines using PyTorch, TensorFlow, and ResNet architectures.",
    category: "Artificial Intelligence",
    level: "Advanced",
    price: 49.99,
    instructor: "AI Research Lab",
    imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
    averageRating: 4.8,
    viewCount: 98,
    isPublished: true,
    tutor: { id: 11, firstName: "AI", lastName: "Research Lab", email: "airesearchlab@studysync.com" }
  },
  {
    id: 3,
    title: "Data Structures & Algorithms Mastery in Java",
    description: "Master core algorithmic problem-solving techniques, Big-O analysis, dynamic programming, and graph traversal for technical interviews.",
    category: "Computer Science",
    level: "Beginner",
    price: 0.00,
    instructor: "Algo Expert",
    imageUrl: "https://images.unsplash.com/photo-1516116211223-4258568882c6?q=80&w=800&auto=format&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1516116211223-4258568882c6?q=80&w=800&auto=format&fit=crop",
    averageRating: 4.95,
    viewCount: 220,
    isPublished: true,
    tutor: { id: 12, firstName: "Algo", lastName: "Expert", email: "algoexpert@studysync.com" }
  },
  {
    id: 4,
    title: "Database Design & SQL Query Optimization",
    description: "Learn schema normalization, indexing strategies, join algorithms, and execution plan analysis in MySQL for high-concurrency systems.",
    category: "Database",
    level: "Intermediate",
    price: 19.99,
    instructor: "Database Lead",
    imageUrl: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=800&auto=format&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=800&auto=format&fit=crop",
    averageRating: 4.7,
    viewCount: 85,
    isPublished: true,
    tutor: { id: 13, firstName: "Database", lastName: "Lead", email: "databaselead@studysync.com" }
  },
  {
    id: 5,
    title: "Real-Time Systems with WebSockets & STOMP",
    description: "Build scalable low-latency interactive messaging pipelines, live chat rooms, and notification engines using Spring WebSocket.",
    category: "Backend Architecture",
    level: "Advanced",
    price: 34.99,
    instructor: "System Architect",
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop",
    averageRating: 4.85,
    viewCount: 110,
    isPublished: true,
    tutor: { id: 14, firstName: "System", lastName: "Architect", email: "systemarchitect@studysync.com" }
  },
  {
    id: 6,
    title: "UI/UX Design Systems with Tailwind CSS & React",
    description: "Design sleek, accessible, and responsive dashboards with reusable components, modern typography, and dark mode support.",
    category: "Design",
    level: "Beginner",
    price: 14.99,
    instructor: "Design Studio",
    imageUrl: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=800&auto=format&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?q=80&w=800&auto=format&fit=crop",
    averageRating: 4.6,
    viewCount: 75,
    isPublished: true,
    tutor: { id: 15, firstName: "Design", lastName: "Studio", email: "designstudio@studysync.com" }
  },
  {
    id: 7,
    title: "Docker, Microservices & Container Orchestration",
    description: "Containerize Spring Boot services, set up multi-container Docker Compose environments, and automate deployments.",
    category: "DevOps",
    level: "Intermediate",
    price: 39.99,
    instructor: "DevOps Team",
    imageUrl: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?q=80&w=800&auto=format&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?q=80&w=800&auto=format&fit=crop",
    averageRating: 4.75,
    viewCount: 130,
    isPublished: true,
    tutor: { id: 16, firstName: "DevOps", lastName: "Team", email: "devopsteam@studysync.com" }
  },
  {
    id: 8,
    title: "Information Theory & Coding Essentials",
    description: "Explore entropy, channel capacity, error-detecting and correcting codes, Huffman coding, and data compression techniques.",
    category: "Computer Science",
    level: "Intermediate",
    price: 0.00,
    instructor: "Academic Faculty",
    imageUrl: "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=800&auto=format&fit=crop",
    thumbnail: "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=800&auto=format&fit=crop",
    averageRating: 4.65,
    viewCount: 65,
    isPublished: true,
    tutor: { id: 17, firstName: "Academic", lastName: "Faculty", email: "academicfaculty@studysync.com" }
  }
];

export default DEMO_COURSES;
