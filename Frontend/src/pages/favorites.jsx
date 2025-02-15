import React from 'react';
import { Star } from 'lucide-react';

export function FavoritesPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        Favorite Learning Paths
      </h2>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-center h-40 text-gray-400 dark:text-gray-500">
          <div className="text-center">
            <Star className="w-12 h-12 mx-auto mb-2" />
            <p>No favorites yet</p>
          </div>
        </div>
      </div>
    </div>
  );
} 