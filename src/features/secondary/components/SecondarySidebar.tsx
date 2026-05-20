// @ts-nocheck
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  Settings,
  LogOut,
  Sparkles,
  FileEdit,
  HelpCircle,
  Target,
  Users,
  BookOpen,
  LayoutDashboard,
  Brain,
  Award,
  Bell,
} from 'lucide-react';

export const SecondarySidebar = () => {
  const location = useLocation();
  const { signOut } = useAuth();

  const menuItems = [
    { title: 'Dashboard', icon: LayoutDashboard, path: '/secondary/dashboard' },
    { title: 'Nova AI', icon: Brain, path: '/secondary/ai-tutor', highlight: true },
    { title: 'Assignment Helper', icon: FileEdit, path: '/secondary/assignment-helper' },
    { title: 'My Subjects', icon: BookOpen, path: '/secondary/subjects' },
    { title: 'Exam Prep', icon: Target, path: '/secondary/exam-prep' },
    { title: 'My Courses', icon: BookOpen, path: '/secondary/courses' },
    { title: 'Community', icon: Users, path: '/secondary/community' },
    { title: 'Certificates', icon: Award, path: '/secondary/certificates' },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-transform hidden md:block">
      <div className="flex h-16 items-center border-b border-slate-200 dark:border-slate-800 px-6">
        <Link to="/" className="flex items-center gap-2">
          <img src="/icon.png" alt="MyTutorMe" className="w-8 h-8 rounded-lg" />
          <span className="font-display font-bold text-lg text-slate-900 dark:text-white tracking-tight">
            MyTutor<span className="text-primary">Me</span>
          </span>
        </Link>
      </div>

      <div className="flex flex-col h-[calc(100vh-4rem)] justify-between py-6 px-3">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all group relative',
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border border-transparent',
                )}
              >
                {item.highlight && !isActive && (
                  <span className="absolute right-2 w-2 h-2 rounded-full bg-primary animate-pulse" />
                )}
                <Icon
                  className={cn(
                    'h-5 w-5',
                    isActive
                      ? 'text-primary'
                      : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300 transition-colors',
                  )}
                />
                {item.title}
                {item.highlight && isActive && <Sparkles className="ml-auto w-4 h-4 text-primary animate-pulse" />}
              </Link>
            );
          })}
        </div>

        <div className="space-y-1 pt-6 border-t border-slate-200 dark:border-slate-800">
          <Link
            to="/secondary/notifications"
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white',
              location.pathname === '/secondary/notifications' && 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white',
            )}
          >
            <Bell className="h-4 w-4 text-slate-400" />
            Notifications
          </Link>
          <Link
            to="/support"
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white',
              location.pathname === '/support' && 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white',
            )}
          >
            <HelpCircle className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:text-slate-500" />
            Support
          </Link>
          <Link
            to="/secondary/settings"
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white',
              location.pathname === '/secondary/settings' && 'bg-primary/10 text-primary border border-primary/20',
            )}
          >
            <Settings className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:text-slate-500" />
            Settings
          </Link>
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all text-slate-500 hover:bg-red-50 dark:text-slate-400 dark:hover:bg-red-900/10 hover:text-red-600 dark:hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
};
