import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-[#0A0A0A] text-white font-sans">
      <Sidebar />
      <div className="flex-1 ml-20 md:ml-65 transition-all duration-300 flex flex-col">
        <main className="flex-1 p-6 pt-16 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
