import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  FileText, 
  TrendingUp, 
  Award, 
  Settings,
  MoreHorizontal,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { paths } from '@/app/routes/paths';
import { HubIcon, StacksIcon, NovaIcon, TargetIcon, NexusIcon } from '@/components/ui/brand-icons';

export function MobileFloatingNav() {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const location = useLocation();

  // Hide nav on the actual AI Tutor chat interface if you want it full screen
  // Or remove this condition if you want the nav always visible
  const isAiTutorFull = location.pathname === paths.student.aiTutor && false; // Disable hiding for now to align with design
  if (isAiTutorFull) return null;

  const navItems = [
    { label: 'Dashboard', path: paths.student.dashboard, icon: HubIcon },
    { label: 'Courses', path: paths.student.courses, icon: StacksIcon },
    // AI Tutor is handled specially as the center FAB
    { label: 'Exam Prep', path: paths.student.examPrep, icon: TargetIcon },
  ];

  const moreMenuItems = [
    { label: 'Assignment Helper', path: paths.student.assignmentHelper, icon: FileText, desc: 'Get help with essays & outlines' },
    { label: 'GPA Tracker', path: paths.student.gpa, icon: TrendingUp, desc: 'Simulate and track your grades' },
    { label: 'Community', path: paths.student.community, icon: NexusIcon, desc: 'Connect with other students' },
    { label: 'Certificates', path: paths.student.certificates, icon: Award, desc: 'View your achievements' },
    { label: 'Settings', path: paths.student.settings, icon: Settings, desc: 'Manage your account' },
  ];

  return (
    <>
      {/* Bottom Sheet Backdrop */}
      <AnimatePresence>
        {isMoreOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMoreOpen(false)}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Bottom Sheet Menu */}
      <AnimatePresence>
        {isMoreOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl border-t border-slate-200 dark:border-slate-800 md:hidden"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 80px)' }}
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full" />
            </div>
            
            <div className="px-4 py-2">
              <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">More</h2>
                <button onClick={() => setIsMoreOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex flex-col gap-2">
                {moreMenuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMoreOpen(false)}
                    className="flex items-center p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="ml-4 flex-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">{item.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Pill Nav Bar */}
      <div className="fixed bottom-4 left-4 right-4 z-40 flex justify-center md:hidden pointer-events-none pb-[env(safe-area-inset-bottom)]">
        <div className="relative pointer-events-auto w-full max-w-sm">
          <nav className="flex items-center justify-between h-16 px-2 rounded-[2rem] bg-white dark:bg-slate-900 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100 dark:border-slate-800">
            {/* Left Items (0 and 1) */}
            <div className="flex items-center justify-evenly flex-1">
              {[navItems[0], navItems[1]].map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMoreOpen(false)}
                    className="relative flex flex-col items-center justify-center w-14 h-14"
                  >
                    <div className="relative flex flex-col items-center justify-center z-10 gap-1">
                      {isActive && (
                        <motion.div
                          layoutId="activeTabPill"
                          className="absolute top-[-2px] bottom-[14px] left-[-10px] right-[-10px] rounded-full bg-primary/15 -z-10"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      {/* Note: In a real app we'd use solid/outline variants based on state */}
                      <item.icon className={cn("w-[22px] h-[22px] transition-colors", isActive ? "text-primary fill-primary/10" : "text-slate-500 dark:text-slate-400")} strokeWidth={isActive ? 2.5 : 2} />
                      <span className={cn("text-[10px] font-medium tracking-tight", isActive ? "text-primary" : "text-slate-500 dark:text-slate-400")}>
                        {item.label}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Center FAB (AI Tutor / Nova) */}
            <div className="relative flex items-center justify-center flex-shrink-0 w-20">
              <Link
                to={paths.student.aiTutor}
                onClick={() => setIsMoreOpen(false)}
                className="absolute -top-7 flex items-center justify-center w-[60px] h-[60px] rounded-full bg-primary shadow-[0_8px_25px_rgba(5,150,105,0.4)] text-white hover:scale-105 active:scale-95 transition-transform"
              >
                <div className="absolute inset-0 rounded-full bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                <NovaIcon className="w-8 h-8 relative z-10" />
              </Link>
              <span className="absolute bottom-1 text-[10px] font-medium text-slate-500 dark:text-slate-400">Nova</span>
            </div>

            {/* Right Items (Exam Prep + More) */}
            <div className="flex items-center justify-evenly flex-1">
               <Link
                    to={navItems[2].path}
                    onClick={() => setIsMoreOpen(false)}
                    className="relative flex flex-col items-center justify-center w-14 h-14"
                  >
                    <div className="relative flex flex-col items-center justify-center z-10 gap-1">
                      {location.pathname.startsWith(navItems[2].path) && (
                        <motion.div
                          layoutId="activeTabPill"
                          className="absolute top-[-2px] bottom-[14px] left-[-10px] right-[-10px] rounded-full bg-primary/15 -z-10"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      {(() => {
                        const Icon = navItems[2].icon;
                        return <Icon className={cn("w-[22px] h-[22px] transition-colors", location.pathname.startsWith(navItems[2].path) ? "text-primary fill-primary/10" : "text-slate-500 dark:text-slate-400")} strokeWidth={location.pathname.startsWith(navItems[2].path) ? 2.5 : 2} />;
                      })()}
                      <span className={cn("text-[10px] font-medium tracking-tight", location.pathname.startsWith(navItems[2].path) ? "text-primary" : "text-slate-500 dark:text-slate-400")}>
                        {navItems[2].label}
                      </span>
                    </div>
              </Link>

              <button
                onClick={() => setIsMoreOpen(true)}
                className="relative flex flex-col items-center justify-center w-14 h-14"
              >
                <div className="relative flex flex-col items-center justify-center z-10 gap-1">
                  {isMoreOpen && (
                    <motion.div
                      layoutId="activeTabPill"
                      className="absolute top-[-2px] bottom-[14px] left-[-10px] right-[-10px] rounded-full bg-primary/15 -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <MoreHorizontal className={cn("w-[22px] h-[22px] transition-colors", isMoreOpen ? "text-primary" : "text-slate-500 dark:text-slate-400")} strokeWidth={isMoreOpen ? 2.5 : 2} />
                  <span className={cn("text-[10px] font-medium tracking-tight", isMoreOpen ? "text-primary" : "text-slate-500 dark:text-slate-400")}>
                    More
                  </span>
                </div>
              </button>
            </div>

          </nav>
        </div>
      </div>
    </>
  );
}
