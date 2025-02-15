export const mockTasks = [
  {
    _id: "1",
    title: "Learn React Fundamentals",
    description: "Master the core concepts of React including components, props, and state",
    createdAt: new Date("2024-03-01"),
    steps: [
      {
        _id: "1.1",
        description: "Set up development environment",
        isCompleted: true,
        dueDate: new Date("2024-03-02"),
        estimatedHours: 2,
        resources: [
          {
            title: "Official React Setup Guide",
            url: "https://react.dev/learn/installation",
            type: "documentation"
          }
        ]
      },
      {
        _id: "1.2",
        description: "Learn JSX syntax",
        isCompleted: false,
        dueDate: new Date("2024-03-03"),
        estimatedHours: 3,
        resources: [
          {
            title: "JSX In Depth",
            url: "https://react.dev/learn/writing-markup-with-jsx",
            type: "documentation"
          }
        ]
      }
    ],
    additionalResources: [
      {
        title: "React Documentation",
        url: "https://react.dev",
        type: "documentation"
      }
    ]
  },
  {
    _id: "2",
    title: "Build a Todo App",
    description: "Create a full-featured todo application using React and modern best practices",
    createdAt: new Date("2024-03-02"),
    steps: [
      {
        _id: "2.1",
        description: "Design the UI using Figma",
        isCompleted: false,
        dueDate: new Date("2024-03-04"),
        estimatedHours: 4,
        resources: []
      },
      {
        _id: "2.2",
        description: "Implement CRUD operations",
        isCompleted: false,
        dueDate: new Date("2024-03-05"),
        estimatedHours: 6,
        resources: []
      }
    ],
    additionalResources: []
  }
];

export const mockPaths = [
  {
    _id: "1",
    title: "Frontend Development Path",
    description: "Complete guide to becoming a frontend developer",
    category: "Web Development",
    difficulty: "beginner",
    duration: 12,
    tasks: ["1", "2"],
    thumbnail: "https://example.com/frontend.jpg",
    tags: ["react", "javascript", "css"],
    createdAt: new Date("2024-03-01")
  },
  {
    _id: "2",
    title: "Backend Development Path",
    description: "Master backend development with Node.js",
    category: "Web Development",
    difficulty: "intermediate",
    duration: 16,
    tasks: [],
    thumbnail: "https://example.com/backend.jpg",
    tags: ["nodejs", "express", "mongodb"],
    createdAt: new Date("2024-03-01")
  }
];

export const mockUserPreferences = {
  _id: "1",
  userId: "user123",
  favorites: ["1"],
  recentlyViewed: [
    {
      item: "1",
      itemType: "Task",
      viewedAt: new Date("2024-03-01")
    }
  ],
  settings: {
    theme: "light",
    emailNotifications: true,
    pushNotifications: true,
    language: "en"
  }
}; 