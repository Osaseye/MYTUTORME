import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useAuthStore } from '@/features/auth/hooks/useAuth';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

const mockData = [
  { name: 'Mon', revenue: 0 },
  { name: 'Tue', revenue: 0 },
  { name: 'Wed', revenue: 0 },
  { name: 'Thu', revenue: 0 },
  { name: 'Fri', revenue: 0 },
  { name: 'Sat', revenue: 0 },
  { name: 'Sun', revenue: 0 },
];

export const TeacherDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalEarnings: (user as any)?.lifetimeEarnings || 0,
        activeStudents: 0,
        rating: 0.0,
        totalCourses: 0,
    });
    const [isUpgrading, setIsUpgrading] = useState(false);

    const isPremium = user?.teacherSubscriptionPlan === 'premium_tools';

    useEffect(() => {
        const fetchDashboardStats = async () => {
            if (!user) return;
            try {
                // Fetch teacher's courses to calculate total active students across all courses
                const coursesRef = collection(db, 'courses');
                const q = query(coursesRef, where('teacherId', '==', user.uid));
                const querySnapshot = await getDocs(q);

                let students = 0;
                let publishedCourseCount = 0;

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    students += data.enrollmentCount || 0;
                    if (data.status === 'published') {
                        publishedCourseCount++;
                    }
                });

                setStats(prev => ({
                    ...prev,
                    activeStudents: students,
                    totalCourses: publishedCourseCount,
                    totalEarnings: user?.lifetimeEarnings || 0
                }));
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        };

        fetchDashboardStats();
    }, [user]);

    const handleUpgradeToPremium = async () => {
        if (!user) return;
        setIsUpgrading(true);
        try {
            await updateDoc(doc(db, 'users', user.uid), {
                teacherSubscriptionPlan: 'premium_tools',
                currentCommissionRate: 0.15 // Standard base config for premium
            });
            
            useAuthStore.getState().setUser({
                ...user,
                teacherSubscriptionPlan: 'premium_tools',
                currentCommissionRate: 0.15
            });
            
            toast.success("Successfully upgraded to Premium Tools!");
        } catch (error) {
            toast.error("Failed to upgrade. Please try again.");
            console.error("Upgrade error:", error);
        } finally {
            setIsUpgrading(false);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-body text-slate-800 dark:text-slate-100 transition-colors duration-300">
            {/* Upgrade Banner for Free Users */}
            {!isPremium && (
                <div className="mb-8 bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-500/20 text-amber-600 rounded-xl relative overflow-hidden group">
                           <Zap className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-amber-700 dark:text-amber-500 flex items-center gap-2">
                                Upgrade to Premium Tools
                            </h3>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">
                                Unlock Priority Course Listings, Advanced Analytics, and faster payouts for ₦12,000/yr.
                            </p>
                        </div>
                    </div>
                    <Button 
                        onClick={handleUpgradeToPremium} 
                        disabled={isUpgrading}
                        className="bg-amber-500 hover:bg-amber-600 text-white border-0"
                    >
                        {isUpgrading ? 'Upgrading...' : 'Upgrade Now'} <Sparkles className="w-4 h-4 ml-2" />
                    </Button>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Instructor Dashboard</h1>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">
                        Welcome back, {user?.displayName || 'Instructor'}. Here's what's happening today.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {isPremium && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-sm font-bold shadow-sm">
                            <ShieldCheck className="w-4 h-4" /> Premium Creator
                        </div>
                    )}
                     <Link to="/teacher/courses/new">
                        <Button className="inline-flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 font-bold py-6 px-6 rounded-lg transition-all shadow-lg">
                            <span className="material-symbols-outlined text-sm">add</span>
                            New Course
                        </Button>
                     </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Revenue Card */}
                <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/20 rounded-full blur-2xl"></div>
                    <div className="relative z-10 flex flex-col justify-between h-full">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                            <span className="material-symbols-outlined text-2xl">payments</span>
                        </div>
                        <div>
                            <p className="text-primary-100 text-sm font-medium mb-1">Total Earnings</p>
                            <h3 className="text-3xl font-display font-bold">₦{stats.totalEarnings.toLocaleString()}</h3>
                        </div>
                    </div>
                </div>

                {/* Students Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:border-primary/50 transition-colors">
                     <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                     <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                             <span className="material-symbols-outlined text-2xl">school</span>
                        </div>
                     </div>
                     <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Active Students</p>
                        <h3 className="text-3xl font-display font-bold text-slate-900 dark:text-white">{stats.activeStudents}</h3>
                     </div>
                </div>

                {/* Courses Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:border-yellow-500/50 transition-colors">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                     <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                             <span className="material-symbols-outlined text-2xl">library_books</span>
                        </div>
                     </div>
                     <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Published Courses</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-display font-bold text-slate-900 dark:text-white">{stats.totalCourses}</h3>
                        </div>
                     </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 {/* Chart Section */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm relative">
                    {!isPremium && (
                        <div className="absolute inset-0 bg-slate-900/5 dark:bg-slate-900/40 backdrop-blur-[2px] z-10 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-primary/20">
                            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 text-center max-w-sm mb-4">
                                <Zap className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                                <h4 className="font-bold text-lg mb-2">Advanced Analytics Locked</h4>
                                <p className="text-sm text-slate-500 mb-4">Upgrade to Premium Tools to unlock detailed revenue breakdowns and student retention charts.</p>
                                <Button onClick={handleUpgradeToPremium} disabled={isUpgrading} className="w-full">
                                   Upgrade Now
                                </Button>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                            {isPremium && <Sparkles className="w-5 h-5 text-primary" />}
                            Revenue Analytics
                        </h3>
                        <select 
                            disabled={!isPremium}
                            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-400 rounded-md py-1 px-2 focus:ring-0 disabled:opacity-50"
                        >
                            <option>Last 7 Days</option>
                            <option>Last Month</option>
                            <option>This Year</option>
                        </select>
                    </div>
                    <div className="h-80 w-full opacity-50">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={mockData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#94A3B8" 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    dy={10}
                                />
                                <YAxis 
                                    stroke="#94A3B8" 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    tickFormatter={(value) => `₦${value}`} 
                                />
                                <Tooltip 
                                    cursor={{ fill: '#F1F5F9' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                                />
                                <Bar dataKey="revenue" fill="#16A34A" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Activity / Tasks */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-6">Recent Activity</h3>
                    <div className="space-y-6">
                        <div className="text-center py-6">
                            <span className="material-symbols-outlined text-slate-300 dark:text-slate-600 text-4xl mb-2">history</span>
                            <p className="text-sm text-slate-500">No recent activity.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
