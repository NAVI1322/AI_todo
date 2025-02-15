import React from 'react';

export function CircularProgress({ progress }) {
  // Ensure progress is a valid number between 0-100
  const validProgress = Math.min(Math.max(0, Number(progress) || 0), 100);
  
  // Calculate the circle's circumference
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate the dash offset based on progress
  const strokeDashoffset = circumference - (validProgress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="transform -rotate-90 w-12 h-12">
        {/* Background circle */}
        <circle
          className="text-gray-200 dark:text-gray-700"
          strokeWidth="4"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="24"
          cy="24"
        />
        {/* Progress circle */}
        <circle
          className="text-blue-600 dark:text-blue-500"
          strokeWidth="4"
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="24"
          cy="24"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: strokeDashoffset
          }}
        />
      </svg>
      <span className="absolute text-xs font-medium text-gray-700 dark:text-gray-300">
        {Math.round(validProgress)}%
      </span>
    </div>
  );
} 