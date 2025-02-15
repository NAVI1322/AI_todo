# AI TODO - Smart Task Management System

A modern, AI-powered task management application that helps users organize, track, and complete their tasks efficiently. Built with React for the frontend and Node.js for the backend, this application leverages artificial intelligence to provide smart task suggestions and learning paths.

## 🌟 Features

- **AI-Powered Task Management**: Get intelligent suggestions for task organization and completion
- **Learning Paths**: Follow structured learning paths to achieve your goals
- **Real-time Progress Tracking**: Monitor your task completion with visual progress indicators
- **Smart Dashboard**: View all your tasks and progress in an intuitive interface
- **Subscription System**: Access premium features with our subscription plans
- **Responsive Design**: Works seamlessly across desktop and mobile devices

## 🚀 Tech Stack

### Frontend
- React.js
- Vite
- React Router DOM
- Axios for API calls
- Tailwind CSS for styling
- Framer Motion for animations
- Stripe for payment processing

### Backend
- Node.js
- Express.js
- MongoDB for database
- Redis for caching
- JWT for authentication
- WebSocket for real-time updates

## 🛠️ Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/NAVI1322/AI_todo.git
   cd AI_todo
   ```

2. Install dependencies for both frontend and backend:
   ```bash
   # Install frontend dependencies
   cd Frontend
   npm install

   # Install backend dependencies
   cd ../backend
   npm install
   ```

3. Set up environment variables:
   ```bash
   # In the backend directory
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start the development servers:
   ```bash
   # Start backend server (from backend directory)
   npm run dev

   # Start frontend development server (from Frontend directory)
   npm run dev
   ```

## 🌐 Environment Variables

### Backend
```env
PORT=3000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
REDIS_URL=your_redis_url
STRIPE_SECRET_KEY=your_stripe_secret
```

### Frontend
```env
VITE_API_URL=http://localhost:3000
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

## 📦 Project Structure

```
AI_todo/
├── Frontend/                # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── lib/           # Utility functions
│   └── public/            # Static files
│
├── backend/               # Node.js backend application
│   ├── src/
│   │   ├── config/       # Configuration files
│   │   ├── controllers/  # Route controllers
│   │   ├── middleware/   # Custom middleware
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   └── utils/        # Utility functions
│   └── tests/            # Backend tests
│
└── README.md             # Project documentation
```

## 🔑 Key Features Explained

1. **AI Integration**
   - Smart task categorization
   - Intelligent learning path recommendations
   - Progress analysis and suggestions

2. **User Management**
   - JWT-based authentication
   - Role-based access control
   - User preferences and settings

3. **Task Management**
   - Create, update, and delete tasks
   - Task categorization and tagging
   - Progress tracking and statistics

4. **Learning Paths**
   - Structured learning sequences
   - Progress tracking
   - Achievement system

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Navneet Sharma** - *Initial work* - [NAVI1322](https://github.com/NAVI1322)

## 🙏 Acknowledgments

- Thanks to all contributors who have helped shape this project
- Special thanks to the open-source community for the amazing tools and libraries 