'use client';

import { ReactNode, useState } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useStore } from '@/store/useStore';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useStore();

  return (
    <div className="flex min-h-screen bg-[#0A0A0A] text-[#0F172A] font-sans">
      {/* Sidebar navigation drawer */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Click-away backdrop overlay (mobile only) */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 md:hidden transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area Wrapper */}
      <div className="flex-1 ml-0 md:ml-65 transition-all duration-300 flex flex-col min-w-0">
        
        {/* Sticky Mobile Top Header Bar */}
        <header className="flex md:hidden h-16 items-center justify-between px-4 bg-[#0A0A0A] border-b border-[#2A2A2A] sticky top-0 z-30 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-[#7C3AED] p-2 rounded-xl hover:bg-[#7C3AED]/5 transition-all"
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>
            <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-[#7C3AED] to-[#3B82F6] bg-clip-text text-transparent">
              StudyGenie AI
            </span>
          </div>
          
          <Avatar className="h-8 w-8 border border-[#D6DEE8] shadow-sm">
            <AvatarFallback className="bg-gradient-to-tr from-[#7C3AED] to-[#3B82F6] text-xs text-white font-bold">
              {user?.fullName
                ? user.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                : (user?.email ? user.email[0].toUpperCase() : 'S')}
            </AvatarFallback>
          </Avatar>
        </header>

        {/* Dynamic page main content container */}
        <main className="flex-1 p-4 md:p-6 pt-6 md:pt-16 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
