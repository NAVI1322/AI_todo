import React from 'react';
import { CircularProgress } from './CircularProgress';
import { Clock, ChevronRight, CheckCircle, Circle } from 'lucide-react';
import { formatTimeAgo } from '../../utils';

export function TaskCard({ task, onClick, onCheckStep }) {
  const completedSteps = task.steps.filter(step => step.isCompleted).length;
  const progress = Math.round((completedSteps / task.steps.length) * 100);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {task.title}
          </h3>
          <CircularProgress progress={progress} />
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          {task.description}
        </p>

        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
          <Clock size={16} className="mr-2" />
          {formatTimeAgo(task.createdAt)}
        </div>

        {/* Preview of first 2 steps */}
        <div className="space-y-3 mb-4">
          {task.steps.slice(0, 2).map(step => (
            <div key={step._id} className="flex items-start gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCheckStep(task._id, step._id, !step.isCompleted);
                }}
                className="mt-0.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
              >
                {step.isCompleted ? (
                  <CheckCircle className="text-green-500 fill-current" size={18} />
                ) : (
                  <Circle size={18} />
                )}
              </button>
              <span className={`text-sm ${
                step.isCompleted 
                  ? 'text-gray-500 dark:text-gray-400 line-through' 
                  : 'text-gray-900 dark:text-gray-100'
              }`}>
                {step.description}
              </span>
            </div>
          ))}
        </div>

        {/* View Details Button */}
        <button
          onClick={onClick}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 
            text-sm font-medium text-blue-600 hover:text-blue-700 
            dark:text-blue-500 dark:hover:text-blue-400
            border border-blue-600 dark:border-blue-500 rounded-lg
            hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
        >
          View Details
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Progress Footer */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Progress
          </span>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {completedSteps} of {task.steps.length} steps
          </span>
        </div>
      </div>
    </div>
  );
} 