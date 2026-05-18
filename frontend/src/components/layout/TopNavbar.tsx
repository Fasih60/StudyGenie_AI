import { Search, Bell, Sparkles } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useStore } from '@/store/useStore';

export const TopNavbar = () => {
  const { user } = useStore();

  return (
    <header className="h-16 bg-[#0A0A0A] border-b border-[#2A2A2A] flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center bg-[#111111] border border-[#2A2A2A] rounded-full px-4 py-1.5 w-96 transition-all focus-within:ring-1 focus-within:ring-gray-500">
        <Search size={16} className="text-gray-500 mr-2" />
        <input 
          type="text" 
          placeholder="Search notes, topics, quizzes..." 
          className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-gray-500"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 bg-white text-black px-4 py-1.5 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors">
          <Sparkles size={16} />
          <span>Ask AI</span>
        </button>

        <button className="text-gray-400 hover:text-white transition-colors">
          <Bell size={20} />
        </button>

        <Avatar className="h-8 w-8 border border-[#2A2A2A]">
          <AvatarFallback className="bg-[#1E1E1E] text-xs text-white">
            {user?.fullName?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};
