import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  BookOpen,
  Award,
  Settings,
  MoreHorizontal,
  ChevronRight,
  FileEdit,
  Users,
  Bell,
  LayoutDashboard,
  Target,
  Brain,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function SecondaryMobileNav() {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: 'Dashboard', path: '/secondary/dashboard', icon: LayoutDashboard },
    { label: 'Subjects', path: '/secondary/subjects', icon: BookOpen },
    { label: 'Exam Prep', path: '/secondary/exam-prep', icon: Target },
  ];

  const moreMenuItems = [
    { label: 'Nova AI', path: '/secondary/ai-tutor', icon: Brain, desc: 'AI tutor for any subject' },
    { label: 'Assignment Helper', path: '/secondary/assignment-helper', icon: FileEdit, desc: 'Get help with assignments' },
    { label: 'My Courses', path: '/secondary/courses', icon: BookOpen, desc: 'Browse secondary courses' },
    { label: 'Community', path: '/secondary/community', icon: Users, desc: 'Connect with other students' },
    { label: 'Certificates', path: '/secondary/certificates', icon: Award, desc: 'View your achievements' },
    { label: 'Notifications', path: '/secondary/notifications', icon: Bell, desc: 'Stay updated' },
    { label: 'Settings', path: '/secondary/settings', icon: Settings, desc: 'Manage your account' },
  ];

  return (
    <>
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

      <AnimatePresence>
        {isMoreOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl border-t border-slate-200 dark:border-slate-800 md:hidden"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 80px)' }}
          >
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full" />
            </div>
            <div className="px-4 py-2">
              <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">More</h2>
                <button
                  onClick={() => setIsMoreOpen(false)}
                  className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500"
                >
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

      {/* Bottom Nav Bar */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-colors',
                  isActive ? 'text-primary' : 'text-slate-400',
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-semibold">{item.label}</span>
              </Link>
            );
          })}

          {/* Center: Nova AI */}
          <Link
            to="/secondary/ai-tutor"
            className={cn(
              'flex flex-col items-center gap-1 px-3 -mt-4',
              location.pathname.startsWith('/secondary/ai-tutor') ? 'text-primary' : 'text-white',
            )}
          >
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-[10px] font-semibold text-slate-400">Nova</span>
          </Link>

          <button
            onClick={() => setIsMoreOpen(true)}
            className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-slate-400"
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] font-semibold">More</span>
          </button>
        </div>
      </div>
    </>
  );
}
