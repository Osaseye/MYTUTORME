import { Outlet, useLocation, Link } from 'react-router-dom';
import { StudentSidebar } from '../components/StudentSidebar';
import { MobileFloatingNav } from '../components/MobileFloatingNav';
import { Search, UserCircle, Crown, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuthStore } from "@/features/auth/hooks/useAuth";
import { NotificationDropdown } from '@/components/shared/NotificationDropdown';
import { paths } from '@/app/routes/paths';

export const StudentLayout = () => {
  const { user } = useAuthStore();
  const location = useLocation();
  const isAiTutor = location.pathname.includes('/student/ai-tutor');

  const getPlanDisplay = (plan?: string) => {
    if (!plan || plan === 'free') return 'Free';
    if (plan === 'pro_monthly') return 'Pro Monthly';
    if (plan === 'pro_yearly') return 'Pro Yearly';
    if (plan === 'pro') return 'Pro';
    return plan.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const planDisplay = getPlanDisplay(user?.plan);
  const isPro = user?.plan && user.plan !== 'free';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <StudentSidebar />
      <MobileFloatingNav />
      
      <div className={`ml-0 md:ml-64 min-h-screen flex flex-col ${isAiTutor ? '' : 'pb-24 md:pb-0'}`}>
        {/* Top Header */}
        {!isAiTutor && (
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
               {isPro && (
                  <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-200 to-yellow-400 dark:from-amber-500/20 dark:to-yellow-500/20 text-amber-900 dark:text-amber-300 shadow-sm border border-amber-300/50 dark:border-amber-500/30">
                     <Crown className="w-3.5 h-3.5" />
                     <span className="text-[11px] font-bold tracking-wider uppercase">{planDisplay}</span> 
                  </div>
               )}

               <div className="hidden md:block">
                 <NotificationDropdown userRole="student" />
               </div>
               <Link to={paths.student.notifications} className="md:hidden relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors dark:text-slate-400 dark:hover:bg-slate-800">
                 <Bell className="w-5 h-5" />
                 {/* Optional: Add badge logic if unread count is available in this context, or rely on page */}
               </Link>

               <div className="flex items-center gap-3">
                 <div className="hidden sm:flex flex-col items-end justify-center">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white leading-none mb-1.5">
                      {(user as any)?.username || user?.displayName || "Student"}
                    </p>
                    {isPro ? (
                        <p className="text-[10px] font-bold bg-gradient-to-r from-amber-500 to-yellow-600 dark:from-amber-400 dark:to-yellow-500 bg-clip-text text-transparent uppercase tracking-wider leading-none">
                            {planDisplay} PLAN
                        </p>
                    ) : (
                        <p className="text-xs text-slate-500 leading-none">Free Plan</p>
                    )}
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
        )}

        {/* Main Content Area */}
          <main className={`flex-1 flex flex-col relative ${isAiTutor ? '' : 'p-4 md:p-8'}`}>
            <div className={`${isAiTutor ? 'absolute inset-0 flex flex-col overflow-hidden' : 'w-full max-w-[1600px] mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500'}`}>
               <Outlet />
            </div>
        </main>
      </div>
    </div>
  );
};
