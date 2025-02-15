export const seedUsers = [
  {
    name: "John Developer",
    email: "john@example.com",
    password: "password123"
  },
  {
    name: "Sarah Tech",
    email: "sarah@example.com",
    password: "password123"
  },
  {
    name: "Admin User",
    email: "admin@example.com",
    password: "admin123"
  }
];

export const seedTasks = [
  {
    title: "Full Stack Development Path",
    description: "Complete journey to become a full stack developer",
    priority: "high",
    steps: [
      {
        description: "Learn HTML5, CSS3, and Modern JavaScript",
        dueDate: new Date("2024-03-30"),
        isCompleted: false
      },
      {
        description: "Master React.js and State Management",
        dueDate: new Date("2024-04-15"),
        isCompleted: false
      },
      {
        description: "Build Node.js & Express Backend",
        dueDate: new Date("2024-04-30"),
        isCompleted: false
      }
    ]
  },
  {
    title: "AI/ML Learning Path",
    description: "Learn artificial intelligence fundamentals",
    priority: "medium",
    steps: [
      {
        description: "Python Programming Basics",
        dueDate: new Date("2024-04-01"),
        isCompleted: false
      },
      {
        description: "Data Analysis with Pandas",
        dueDate: new Date("2024-04-15"),
        isCompleted: false
      }
    ]
  }
];

export const seedPaths = [
  {
    title: "Web Development",
    description: "Full stack web development learning path",
    category: "development",
    difficulty: "intermediate",
    estimatedHours: 120,
    topics: ["HTML", "CSS", "JavaScript", "React", "Node.js"],
    prerequisites: ["Basic programming knowledge"]
  },
  {
    title: "Machine Learning",
    description: "AI and ML fundamentals",
    category: "data-science",
    difficulty: "advanced",
    estimatedHours: 160,
    topics: ["Python", "Statistics", "ML Algorithms"],
    prerequisites: ["Mathematics", "Python basics"]
  }
]; 