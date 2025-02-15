import React from 'react';
import { X, Clock, Link2, ExternalLink } from 'lucide-react';

export function TaskDetails({ task, onClose }) {
  if (!task) return null;

  return (
    <div className="fixed top-16 right-0 bottom-0 w-[400px] bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
      <div className="sticky top-0 bg-white dark:bg-gray-800 z-10 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Task Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {task.title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {task.description}
        </p>

        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Steps
          </h3>
          <div className="space-y-4">
            {task.steps.map(step => (
              <div key={step._id} className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={step.isCompleted}
                  onChange={() => {}}
                  className="mt-1"
                />
                <div>
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {step.description}
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      {step.estimatedHours}h
                    </div>
                    <div>
                      Due {new Date(step.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                  {step.resources?.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {step.resources.map((resource, idx) => (
                        <a
                          key={idx}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-500 dark:hover:text-blue-400"
                        >
                          <Link2 size={14} />
                          {resource.title}
                          <ExternalLink size={12} />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {task.additionalResources?.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Additional Resources
            </h3>
            <div className="space-y-4">
              {task.additionalResources.map((resource, idx) => (
                <a
                  key={idx}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50"
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
  );
} 