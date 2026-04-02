import { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  MessageSquare, 
  Settings, 
  LogOut,
  Search,
  Menu,
  X,
  CreditCard,
  FileText,
  Users,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { NotificationDropdown } from '@/components/shared/NotificationDropdown';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { useAuth } from '@/features/auth/hooks/useAuth';

interface SidebarLinkProps {
  to: string;
  icon: React.ElementType;
  label: string;
  isCollapsed: boolean;
  onClick?: () => void;
}

const SidebarLink = ({ to, icon: Icon, label, isCollapsed, onClick }: SidebarLinkProps) => (
  <NavLink
    to={to}
    onClick={onClick}
    title={isCollapsed ? label : undefined}
    className={({ isActive }) =>
      cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative group",
        isActive 
          ? "bg-primary/10 text-primary font-medium" 
          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200",
        isCollapsed && "justify-center px-2"
      )
    }
  >
    <Icon className="h-5 w-5 flex-shrink-0" />
    {!isCollapsed && <span className="whitespace-nowrap">{label}</span>}
  </NavLink>
);

export const TeacherLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    const { signOut, user } = useAuth();
    
    // Placeholder navigation items for Teachers
    const navItems = [
        { label: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
        { label: 'My Courses', path: '/teacher/courses', icon: BookOpen },
        { label: 'Students', path: '/teacher/students', icon: Users },
        { label: 'Resources', path: '/teacher/resources', icon: FileText },
        { label: 'Earnings', path: '/teacher/earnings', icon: CreditCard },
        { label: 'Community', path: '/teacher/community', icon: MessageSquare },
        { label: 'Settings', path: '/teacher/settings', icon: Settings },
        { label: 'Help & Support', path: '/support', icon: HelpCircle },
    ];

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-50 flex">
            {/* Desktop Sidebar */}
            <aside 
                className={cn(
                    "hidden md:flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 sticky top-0 h-screen z-30 overflow-x-hidden",
                    isSidebarOpen ? "w-64" : "w-20"
                )}
            >
                <div className="h-16 flex items-center px-4 border-b border-slate-200 dark:border-slate-800 justify-between">
                    <Link 
                        to="/teacher/dashboard" 
                        className={cn(
                            "flex items-center gap-2 font-bold text-xl text-primary overflow-hidden transition-all duration-300", 
                            !isSidebarOpen && "w-0 opacity-0 pointer-events-none"
                        )}
                    >
                        <img src="/icon.png" alt="MyTutorMe" className="w-8 h-8 shrink-0" />
                        <span className="whitespace-nowrap">MyTutorMe</span>
                    </Link>
                    <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors shrink-0 mx-auto"
                    >
                        {isSidebarOpen ? <Menu className="h-5 w-5" /> : <img src="/icon.png" alt="MyTutorMe" className="w-8 h-8 pointer-events-none" />}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-1 scrollbar-thin">
                    <div className={cn("mb-6 px-3", !isSidebarOpen && "hidden")}>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Teacher Portal</p>
                    </div>

                    {navItems.map((item) => (
                        <SidebarLink 
                            key={item.path}
                            to={item.path}
                            icon={item.icon}
                            label={item.label}
                            isCollapsed={!isSidebarOpen}
                        />
                    ))}
                </div>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                    <button 
                         onClick={handleLogout}
                         className={cn(
                            "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors",
                            !isSidebarOpen && "justify-center px-0"
                        )}
                    >
                        <LogOut className="h-5 w-5 flex-shrink-0" />
                        {isSidebarOpen && <span>Sign Out</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile Header & Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20 px-4 flex items-center justify-between md:hidden">
                    <Link to="/teacher/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary font-display">
                        <img src="/icon.png" alt="MyTutorMe" className="w-8 h-8" />
                        <span><span className="text-slate-900 dark:text-white">MY</span>Tutor</span><span className="text-primary">Me</span>
                    </Link>
                    <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-slate-500">
                        <Menu className="h-6 w-6" />
                    </button>
                </header>

                {/* Desktop Header */}
                <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20 px-6 hidden md:flex items-center justify-between">
                   <div className="relative w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search courses, students..." 
                            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-full text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                        />
                   </div>
                   
                   <div className="flex items-center gap-4">
                        {user?.teacherSubscriptionPlan === 'premium_tools' && (
                            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-200 to-yellow-400 dark:from-amber-500/20 dark:to-yellow-500/20 text-amber-900 dark:text-amber-300 shadow-sm border border-amber-300/50 dark:border-amber-500/30">
                                <Sparkles className="w-3.5 h-3.5" />
                                <span className="text-[11px] font-bold tracking-wider uppercase">Premium</span>
                            </div>
                        )}

                        <NotificationDropdown userRole="teacher" />
                        
                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>
                        
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={user?.photoURL || ""} />
                                        <AvatarFallback>{(user?.displayName || 'Teacher').charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div className="text-left hidden lg:block">
                                        <p className="text-sm font-medium leading-none mb-1.5">{user?.displayName || "Teacher"}</p>
                                        {user?.teacherSubscriptionPlan === 'premium_tools' ? (
                                            <p className="text-[10px] font-bold bg-gradient-to-r from-amber-500 to-yellow-600 dark:from-amber-400 dark:to-yellow-500 bg-clip-text text-transparent uppercase tracking-wider leading-none">
                                                PREMIUM PLAN
                                            </p>
                                        ) : (
                                            <p className="text-xs text-slate-500 leading-none">Free Plan</p>
                                        )}
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuItem>Profile</DropdownMenuItem>
                                <DropdownMenuItem>Billing</DropdownMenuItem>
                                <DropdownMenuItem>Settings</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600" onClick={handleLogout}>Log out</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                   </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Navigation Drawer */}
            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                    <div className="absolute right-0 top-0 bottom-0 w-64 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-4 shadow-xl flex flex-col animate-in slide-in-from-right">
                        <div className="flex items-center justify-between mb-8">
                             <h2 className="font-bold text-lg">Menu</h2>
                             <button onClick={() => setIsMobileMenuOpen(false)}><X className="h-6 w-6 text-slate-500" /></button>
                        </div>
                        <nav className="flex-1 space-y-1">
                            {navItems.map((item) => (
                                <SidebarLink 
                                    key={item.path}
                                    to={item.path}
                                    icon={item.icon}
                                    label={item.label}
                                    isCollapsed={false}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                />
                            ))}
                        </nav>
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                            <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                <LogOut className="h-5 w-5" />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
