'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useSharedState } from '@/context/SharedStateContext';
import { logOut } from '@/services/firebaseService';
import { ArrowLeftStartOnRectangleIcon } from './IconComponents'; 

const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

// Removed local definition of ArrowLeftStartOnRectangleIcon

const HeaderBar: React.FC = () => {
  const { currentUser } = useSharedState();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logOut();
      // Auth listener in Layout will handle redirect to /login
      // router.replace('/login'); // Or explicitly redirect
    } catch (error) {
      console.error("Logout failed:", error);
      // Handle logout error (e.g., show a notification)
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            {/* You can add a logo here if you have one */}
            <span className="font-bold text-2xl text-sky-700">HAKIM LLM</span>
          </div>
          {currentUser && (
            <div className="flex items-center space-x-3">
              <div className="flex items-center text-sm text-slate-600">
                <UserIcon className="w-5 h-5 mr-1.5 text-slate-500" />
                <span className="hidden sm:inline">{currentUser.email || currentUser.displayName || 'Pengguna'}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-sky-700 hover:bg-sky-50 rounded-md transition-colors duration-150 ease-in-out"
                title="Logout"
                aria-label="Logout"
              >
                <ArrowLeftStartOnRectangleIcon className="w-5 h-5 sm:mr-1.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderBar;