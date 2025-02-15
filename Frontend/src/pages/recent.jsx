import React from 'react';
import { Clock } from 'lucide-react';

export function RecentPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Recent Activity
      </h2>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-40 text-gray-400 dark:text-gray-500">
          <div className="text-center">
            <Clock className="w-12 h-12 mx-auto mb-2" />
            <p>No recent activity</p>
          </div>
        </div>
      </div>
    </div>
  );
} 