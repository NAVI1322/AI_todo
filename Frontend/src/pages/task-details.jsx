import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Clock, Link2, ExternalLink, CheckCircle, Circle, 
  Calendar, BookOpen, Timer, Target, BarChart2 
} from 'lucide-react';

export function TaskDetailsPage({ tasks, onCheckStep }) {
  const { taskId } = useParams();
  const navigate = useNavigate();
  
  const task = tasks.find(t => t._id === taskId);
  
  if (!task) return null;

  const completedSteps = task.steps.filter(step => step.isCompleted).length;
  const progress = Math.round((completedSteps / task.steps.length) * 100);

  return (
    <div>
      {/* Header Section */}
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 mb-6"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {task.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-6">
              {task.description}
            </p>

            {/* Progress Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <Target size={16} />
                  Progress
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {progress}%
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <CheckCircle size={16} />
                  Completed
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {completedSteps}/{task.steps.length}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <Timer size={16} />
                  Est. Hours
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {task.steps.reduce((acc, step) => acc + step.estimatedHours, 0)}h
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <BookOpen size={16} />
                  Resources
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {task.steps.reduce((acc, step) => acc + (step.resources?.length || 0), 0)}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Steps Column */}
        <div className="lg:col-span-2 space-y-4">
          {task.steps.map((step, index) => (
            <div 
              key={step._id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => onCheckStep(task._id, step._id, !step.isCompleted)}
                  className="mt-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {step.isCompleted ? (
                    <CheckCircle className="text-green-500 fill-current" size={24} />
                  ) : (
                    <Circle size={24} />
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Step {index + 1}
                    </span>
                    {step.isCompleted && (
                      <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                        Completed
                      </span>
                    )}
                  </div>
                  <h3 className={`text-lg font-medium mb-2 ${
                    step.isCompleted 
                      ? 'text-gray-500 dark:text-gray-400 line-through' 
                      : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {step.description}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Clock size={16} />
                      {step.estimatedHours}h
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      Due {new Date(step.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                  {step.resources?.length > 0 && (
                    <div className="space-y-2">
                      {step.resources.map((resource, idx) => (
                        <a
                          key={idx}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400 hover:underline"
                        >
                          <Link2 size={16} />
                          {resource.title}
                          <ExternalLink size={14} />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Resources Column */}
        <div className="space-y-6">
          {task.additionalResources?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
                Additional Resources
              </h2>
              <div className="space-y-4">
                {task.additionalResources.map((resource, idx) => (
                  <a
                    key={idx}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                      {resource.title}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {resource.description}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-500">
                      <ExternalLink size={14} />
                      View Resource
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 