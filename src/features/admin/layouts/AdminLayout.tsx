import { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  Settings, 
  LogOut,
  Bell,
  Search,
  Menu,
  X,
  ShieldCheck,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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
    className={({ isActive }) =>
      cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative group",
        isActive 
          ? "bg-slate-900 text-white font-medium shadow-lg shadow-primary/20" 
          : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200",
        isCollapsed && "justify-center px-2"
      )
    }
  >
    <Icon className="h-5 w-5 flex-shrink-0" />
    {!isCollapsed && <span>{label}</span>}
    {isCollapsed && (
      <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
        {label}
      </div>
    )}
  </NavLink>
);

export const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    const navItems = [
        { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'User Management', path: '/admin/users', icon: Users },
        { label: 'Content Review', path: '/admin/moderation', icon: BookOpen },
        { label: 'Finance', path: '/admin/financials', icon: DollarSign },
        { label: 'Settings', path: '/admin/settings', icon: Settings },
    ];

    const handleLogout = () => {
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-50 flex">
            {/* Desktop Sidebar */}
            <aside 
                className={cn(
                    "hidden md:flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 sticky top-0 h-screen z-30",
                    isSidebarOpen ? "w-64" : "w-20"
                )}
            >
                <div className="h-16 flex items-center px-4 border-b border-slate-200 dark:border-slate-800 justify-between">
                    <Link to="/admin/dashboard" className={cn("flex items-center gap-2 font-bold text-xl text-slate-900 dark:text-white overflow-hidden transition-all", !isSidebarOpen && "w-0 opacity-0")}>
                        <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <span>Admin</span>
                    </Link>
                    <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors mx-auto"
                    >
                        {isSidebarOpen ? <Menu className="h-5 w-5" /> : <ShieldCheck className="h-6 w-6 text-slate-900 dark:text-white" />}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin">
                    <div className={cn("mb-6 px-3", !isSidebarOpen && "hidden")}>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Platform Admin</p>
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

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20 px-6 flex items-center justify-between">
                    {/* Mobile Menu Toggle */}
                   <div className="md:hidden flex items-center gap-3">
                        <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-slate-500">
                            <Menu className="h-6 w-6" />
                        </button>
                        <span className="font-bold text-lg">Admin Panel</span>
                   </div>

                   <div className="hidden md:block relative w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search users, content, logs..." 
                            className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-full text-sm focus:ring-2 focus:ring-slate-500/20 transition-all outline-none"
                        />
                   </div>
                   
                   <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="relative">
                            <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                        </Button>
                        
                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>
                        
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="flex items-center gap-2 p-1 pr-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                                    <Avatar className="h-8 w-8 bg-slate-900 text-white">
                                        <AvatarFallback>AD</AvatarFallback>
                                    </Avatar>
                                    <div className="text-left hidden lg:block">
                                        <p className="text-sm font-medium leading-none">System Admin</p>
                                        <p className="text-xs text-slate-500">Super User</p>
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuItem>Profile</DropdownMenuItem>
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
                             <h2 className="font-bold text-lg">Admin Menu</h2>
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
