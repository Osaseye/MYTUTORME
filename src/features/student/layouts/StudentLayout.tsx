import { Outlet } from 'react-router-dom';
import { StudentSidebar } from '../components/StudentSidebar';
import { MobileFloatingNav } from '../components/MobileFloatingNav';
import { Bell, Search, UserCircle, Crown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuthStore } from "@/features/auth/hooks/useAuth";
import { Badge } from '@/components/ui/badge';

export const StudentLayout = () => {
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <StudentSidebar />
      <MobileFloatingNav />
      
      <div className="ml-0 md:ml-64 min-h-screen flex flex-col pb-24 md:pb-0">
        {/* Top Header */}
        <header className="h-16 px-4 md:px-8 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-30">
          
          {/* Mobile: Logo & Text */}
          <div className="flex items-center gap-2 md:hidden">
              <img src="/icon.png" alt="MyTutorMe" className="w-8 h-8 rounded-lg" />
              <span className="font-display font-bold text-lg text-slate-900 dark:text-white tracking-tight">
                  MyTutor<span className="text-primary">Me</span>
              </span>
          </div>

          {/* Desktop Search */}
          <div className="max-w-md w-full relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input 
              className="pl-10 h-10 w-full bg-slate-50 dark:bg-slate-900 border-none ring-1 ring-slate-200 dark:ring-slate-800 focus-visible:ring-primary/20" 
              placeholder="Search for courses, topic, or ask AI..." 
            />
          </div>

          <div className="flex items-center gap-4">
             {user?.plan !== 'free' && (
                <Badge variant="outline" className="hidden sm:flex border-primary/20 bg-primary/10 text-primary px-3 py-1 items-center gap-1">
                   <Crown className="w-3.5 h-3.5" /> 
                   <span className="capitalize">{user?.plan || 'Free'}</span>
                </Badge>
             )}
             
             <button className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500">
               <Bell className="w-5 h-5" />
             </button>

             <div className="flex items-center gap-3">
               <div className="hidden sm:block text-right">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white leading-none mb-1">
                    {(user as any)?.username || user?.displayName || "Student"}
                  </p>
                  <p className="text-xs text-slate-500 capitalize">{user?.plan || 'Free'} Plan</p>
               </div>
               <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20 cursor-pointer overflow-hidden">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt={user.displayName || "User"} className="w-full h-full object-cover" />
                  ) : (
                    <UserCircle className="w-5 h-5" />
                  )}
               </div>
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
