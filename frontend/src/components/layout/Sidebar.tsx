
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { 
  LayoutDashboard, 
  Upload, 
  MessageSquare, 
  BrainCircuit, 
  LineChart, 
  Calendar, 
  BarChart,
  LogOut,
  Settings,
  X
} from 'lucide-react';
import { useStore } from '@/store/useStore';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Upload, label: 'Upload Notes', href: '/upload' },
  { icon: MessageSquare, label: 'AI Study Chat', href: '/chat' },
  { icon: BrainCircuit, label: 'Quiz Generator', href: '/quiz' },
  { icon: LineChart, label: 'Weak Topic Analysis', href: '/analytics' },
  { icon: Calendar, label: 'Study Planner', href: '/planner' },
  { icon: BarChart, label: 'Progress Tracking', href: '/progress' },
  { icon: Settings, label: 'Settings', href: '/settings' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar = ({ isOpen = false, onClose }: SidebarProps) => {
  const pathname = usePathname();
  const { user, logout } = useStore();

  return (
    <aside 
      className={`h-screen w-65 bg-[#0A0A0A] border-r border-[#2A2A2A] flex flex-col justify-between fixed top-0 left-0 z-50 text-white transition-all duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
    >
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#2A2A2A]">
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight">StudyGenie AI</span>
            <span className="text-[10px] text-gray-400">Learn Smarter, Not Harder</span>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="md:hidden text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-all"
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={onClose}>
                <div className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 cursor-pointer
                  ${isActive ? 'bg-white text-black shadow-sm' : 'text-gray-400 hover:bg-[#111111] hover:text-gray-200'}
                `}>
                  <item.icon size={20} className={isActive ? 'text-black' : ''} />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-3 border-t border-[#2A2A2A]">
        <div className="flex items-center justify-between p-2 rounded-xl hover:bg-[#1E1E1E]/50 border border-transparent hover:border-[#2A2A2A] transition-all duration-300">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center text-xs font-bold shrink-0 shadow-md">
              {user?.fullName 
                ? user.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) 
                : (user?.email ? user.email[0].toUpperCase() : 'S')}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-white truncate" title={user?.fullName || 'Student'}>
                {user?.fullName || 'Student'}
              </span>
              <span className="text-[10px] text-gray-500 truncate" title={user?.email || ''}>
                {user?.email || ''}
              </span>
            </div>
          </div>
          <button 
            onClick={logout} 
            className="text-gray-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-all duration-200 shrink-0"
            title="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
