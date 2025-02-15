import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Settings, Folder, Star, Clock, User, X } from 'lucide-react';

const menuItems = [
  { icon: Home, label: 'Dashboard', to: '/dashboard' },
  { icon: BookOpen, label: 'My Learning', to: '/learning' },
  { icon: Folder, label: 'All Paths', to: '/paths' },
  { icon: Star, label: 'Favorites', to: '/favorites' },
  { icon: Clock, label: 'Recent', to: '/recent' },
  { icon: User, label: 'Profile', to: '/profile' },
  { icon: Settings, label: 'Settings', to: '/settings' },
];

export function Sidebar({ isOpen, onClose }) {
  return (
    <>
      {/* Mobile backdrop */}
      <div 
        className={`
          fixed inset-0 bg-black/20 dark:bg-black/40 md:hidden z-40
          transition-opacity duration-300
          ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
        onClick={onClose}
      />

      <aside className={`
        fixed top-16 bottom-0 left-0
        bg-white dark:bg-gray-900 
        border-r border-gray-200 dark:border-gray-800 
        transition-all duration-300 ease-in-out
        z-50 md:z-0
        ${isOpen ? 'w-64' : 'w-20'}
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="md:hidden absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={24} />
          </button>

          <nav className="flex-1 px-4 py-6 space-y-3">
            {menuItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `
                  flex items-center justify-center md:justify-start gap-3 
                  px-3 py-2.5 rounded-xl
                  transition-all duration-200 cursor-pointer
                  group relative
                  ${isActive 
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-300'
                  }
                `}
              >
                <item.icon 
                  size={isOpen ? 26 : 24} 
                  strokeWidth={1.5}
                  className="transition-all duration-300"
                />
                <span className={`text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  isOpen ? 'opacity-100' : 'opacity-0 md:opacity-0 w-0 hidden'
                }`}>
                  {item.label}
                </span>
                {!isOpen && (
                  <div className="
                    absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm
                    rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible
                    transition-all duration-200 whitespace-nowrap
                    shadow-lg
                  ">
                    {item.label}
                  </div>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
} 