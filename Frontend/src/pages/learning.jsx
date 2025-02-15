import React, { useState } from 'react';
import { 
  BookOpen, Clock, Star, BarChart2, Award, Play, CheckCircle, 
  Calendar, Users, Timer, TrendingUp, ArrowRight
} from 'lucide-react';

const learningData = {
  inProgress: [
    {
      id: 1,
      title: 'Advanced React Patterns',
      progress: 65,
      totalHours: 12,
      completedHours: 7.8,
      lastAccessed: '2 hours ago',
      instructor: 'Sarah Wilson',
      enrolled: 1234,
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60',
      nextLesson: 'Higher Order Components'
    },
    {
      id: 2,
      title: 'System Design for Scale',
      progress: 35,
      totalHours: 15,
      completedHours: 5.25,
      lastAccessed: '1 day ago',
      instructor: 'Mike Chen',
      enrolled: 2156,
      thumbnail: 'https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?w=800&auto=format&fit=crop&q=60',
      nextLesson: 'Load Balancing Strategies'
    }
  ],
  recommended: [
    {
      id: 3,
      title: 'GraphQL Masterclass',
      level: 'Intermediate',
      duration: '10 hours',
      rating: 4.8,
      students: 1589,
      instructor: 'Alex Johnson',
      thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&auto=format&fit=crop&q=60'
    },
    {
      id: 4,
      title: 'Docker & Kubernetes',
      level: 'Advanced',
      duration: '16 hours',
      rating: 4.9,
      students: 2341,
      instructor: 'David Miller',
      thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&auto=format&fit=crop&q=60'
    }
  ],
  achievements: [
    {
      id: 1,
      title: 'Fast Learner',
      description: 'Completed 5 courses in 30 days',
      icon: TrendingUp,
      date: '2 weeks ago'
    },
    {
      id: 2,
      title: 'Perfect Score',
      description: 'Scored 100% in React Assessment',
      icon: Award,
      date: '1 month ago'
    }
  ],
  stats: {
    coursesCompleted: 12,
    hoursLearned: 156,
    certificates: 8,
    streak: 15
  }
};

export function LearningPage() {
  const [activeTab, setActiveTab] = useState('courses');

  const ProgressBar = ({ progress }) => (
    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <div 
        className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-500"
        style={{ width: `${progress}%` }}
      />
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="text-green-500" size={20} />
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {learningData.stats.coursesCompleted}
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Courses Completed</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="text-blue-500" size={20} />
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {learningData.stats.hoursLearned}h
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Hours Learned</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <Award className="text-yellow-500" size={20} />
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {learningData.stats.certificates}
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Certificates Earned</div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="text-purple-500" size={20} />
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {learningData.stats.streak}
            </div>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Day Streak</div>
        </div>
      </div>

      {/* In Progress Courses */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Continue Learning
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {learningData.inProgress.map(course => (
            <div 
              key={course.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="aspect-video relative">
                <img 
                  src={course.thumbnail} 
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <button className="p-3 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-colors">
                    <Play size={24} />
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {course.title}
                </h3>
                <ProgressBar progress={course.progress} />
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>{course.progress}% complete</span>
                  <span>{course.completedHours}/{course.totalHours} hours</span>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">Next Lesson</div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="text-gray-900 dark:text-gray-100 font-medium">
                      {course.nextLesson}
                    </div>
                    <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-full">
                      <ArrowRight size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Courses */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Recommended for You
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {learningData.recommended.map(course => (
            <div 
              key={course.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden group"
            >
              <div className="aspect-video relative">
                <img 
                  src={course.thumbnail} 
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-3 bg-blue-600 rounded-full text-white hover:bg-blue-700 transition-colors">
                    <Play size={24} />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  {course.title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <Timer size={16} />
                  <span>{course.duration}</span>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <span>{course.level}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Star className="text-yellow-400 fill-yellow-400" size={16} />
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {course.rating}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">
                    ({course.students} students)
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Achievements */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Recent Achievements
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {learningData.achievements.map(achievement => (
            <div 
              key={achievement.id}
              className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/50 rounded-lg">
                  <achievement.icon className="text-blue-600 dark:text-blue-400" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {achievement.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {achievement.description}
                  </p>
                  <div className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    {achievement.date}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 