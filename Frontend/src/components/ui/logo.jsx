import React from 'react';
import { Sparkles } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-500" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full animate-pulse" />
      </div>
      <div className="flex flex-col">
        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          LearnSync
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          AI-Powered Learning
        </span>
      </div>
    </div>
  );
} 