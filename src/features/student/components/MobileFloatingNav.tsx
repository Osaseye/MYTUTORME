import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  BookOpen, 
  Bot, 
  Users, 
  Menu, 
  X, 
  FileText, 
  GraduationCap, 
  TrendingUp, 
  Award, 
  Settings 
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function MobileFloatingNav() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Courses', path: '/student/courses', icon: BookOpen },
    { label: 'AI Tutor', path: '/student/ai-tutor', icon: Bot },
    { label: 'Community', path: '/student/community', icon: Users },
  ];

  const menuItems = [
    { label: 'Assignment Helper', path: '/student/assignment-helper', icon: FileText },
    { label: 'Exam Prep', path: '/student/exam-prep', icon: GraduationCap },
    { label: 'GPA Tracker', path: '/student/gpa', icon: TrendingUp },
    { label: 'Certificates', path: '/student/certificates', icon: Award },
    { label: 'Settings', path: '/student/settings', icon: Settings },
  ];

  if (location.pathname === '/student/ai-tutor') return null;

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 md:hidden pointer-events-none">
         <div className="relative pointer-events-auto">
            <AnimatePresence>
            {isOpen && (
                <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                transition={{ type: "spring", duration: 0.3 }}
                className="absolute bottom-full right-0 mb-4 flex flex-col items-end gap-3 z-50"
                >
                    {menuItems.map((item, index) => {
                    const Icon = item.icon;
                    const active = location.pathname.startsWith(item.path);

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsOpen(false)}
                            className="group relative flex items-center"
                        >
                            <span className="absolute right-14 whitespace-nowrap rounded-lg bg-black/80 px-3 py-1.5 text-xs font-medium text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 border border-white/10">
                                {item.label}
                            </span>
                            
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={cn(
                                    "flex h-12 w-12 items-center justify-center rounded-full border shadow-xl backdrop-blur-md transition-all",
                                    active 
                                        ? "bg-primary border-primary text-white" 
                                        : "bg-white/80 border-white/20 text-slate-600 hover:bg-white hover:text-primary dark:bg-black/80 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
                                )}
                            >
                                <Icon className="h-5 w-5" />
                            </motion.div>
                        </Link>
                    );
                    })}
                </motion.div>
            )}
            </AnimatePresence>

            <motion.nav
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="flex h-16 items-center gap-1 rounded-full border border-white/20 bg-white/80 px-2 shadow-2xl backdrop-blur-md dark:bg-black/40 dark:border-white/10"
            >
            {navItems.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.path;

                return (
                <Link
                    key={item.path} 
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className="relative flex h-12 w-12 flex-col items-center justify-center rounded-full transition-colors"
                >
                    {active && (
                    <motion.div
                        layoutId="nav-pill"
                        className="absolute inset-2 rounded-full bg-primary/20"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                    )}
                    <Icon
                    className={cn(
                        "relative z-10 h-5 w-5 transition-colors",
                        active ? "text-primary" : "text-slate-600 dark:text-slate-400"
                    )}
                    />
                </Link>
                );
            })}

            <div className="h-8 w-px bg-slate-200 dark:bg-white/10 mx-1" />

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex h-12 w-12 items-center justify-center rounded-full text-slate-600 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/10 hover:text-black dark:hover:text-white transition-colors"
                aria-label="Menu"
            >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            </motion.nav>
         </div>
      </div>
    </>
  );
}