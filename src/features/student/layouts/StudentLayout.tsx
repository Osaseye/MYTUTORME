import { Outlet } from 'react-router-dom';
import { StudentSidebar } from '../components/StudentSidebar';
import { Bell, Search, UserCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';

export const StudentLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <StudentSidebar />
      
      <div className="ml-64 min-h-screen flex flex-col">
        {/* Top Header */}
        <header className="h-16 px-8 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-30">
          <div className="max-w-md w-full relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              className="pl-10 h-10 w-full bg-slate-50 dark:bg-slate-900 border-none ring-1 ring-slate-200 dark:ring-slate-800 focus-visible:ring-primary/20" 
              placeholder="Search for courses, topic, or ask AI..." 
            />
          </div>

          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-full text-xs font-medium border border-orange-100 dark:border-orange-900/30">
                <span className="text-sm">🔥</span> 3 Day Streak
             </div>
             
             <button className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500">
               <Bell className="w-5 h-5" />
               <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
             </button>

             <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 cursor-pointer">
                <UserCircle className="w-5 h-5" />
             </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-8">
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <Outlet />
            </div>
        </main>
      </div>
    </div>
  );
};
