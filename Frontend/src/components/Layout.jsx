import React from 'react';
import { Navbar } from './ui/navbar';
import { Sidebar } from './ui/sidebar';
import { ChatBar } from './ui/chat-bar';

export function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        isSidebarOpen={isSidebarOpen}
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
      />
      
      <div className="flex">
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
        />
        
        <main className={`
          flex-1 
          transition-all duration-300 ease-in-out
          pt-16 pb-24
          px-4 md:px-6 
          ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}
        `}>
          <div className="max-w-6xl mx-auto py-8">
            {children}
          </div>
        </main>
      </div>

      <ChatBar />
    </div>
  );
} 