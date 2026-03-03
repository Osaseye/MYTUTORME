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
import { Link } from 'react-router-dom';

const data = [
  { name: 'Mon', revenue: 4000 },
  { name: 'Tue', revenue: 3000 },
  { name: 'Wed', revenue: 5000 },
  { name: 'Thu', revenue: 2780 },
  { name: 'Fri', revenue: 6890 },
  { name: 'Sat', revenue: 8390 },
  { name: 'Sun', revenue: 7490 },
];

export const TeacherDashboard = () => {
    return (
        <div className="bg-background-light dark:bg-background-dark font-body text-slate-800 dark:text-slate-100 transition-colors duration-300">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Instructor Dashboard</h1>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">Welcome back, Dr. Smith. Here's what's happening today.</p>
                </div>
                <div className="flex gap-4">
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
                            <h3 className="text-3xl font-display font-bold">₦450,230</h3>
                            <div className="flex items-center gap-1 mt-2 text-emerald-100 text-xs bg-white/10 w-fit px-2 py-1 rounded-full">
                                <span className="material-symbols-outlined text-xs">trending_up</span>
                                <span>+12.5% this month</span>
                            </div>
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
                        <span className="text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">+24 new</span>
                     </div>
                     <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Active Students</p>
                        <h3 className="text-3xl font-display font-bold text-slate-900 dark:text-white">2,350</h3>
                        <p className="text-xs text-slate-400 mt-2">Across 4 published courses</p>
                     </div>
                </div>

                {/* Rating Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group hover:border-yellow-500/50 transition-colors">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                     <div className="flex justify-between items-start mb-4">
                        <div className="w-12 h-12 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                             <span className="material-symbols-outlined text-2xl">kid_star</span>
                        </div>
                        <span className="text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 px-2 py-1 rounded-full">Top Rated</span>
                     </div>
                     <div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">Instructor Rating</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-display font-bold text-slate-900 dark:text-white">4.9</h3>
                            <span className="text-sm text-slate-400">/ 5.0</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">Based on 842 reviews</p>
                     </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 {/* Chart Section */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">Revenue Analytics</h3>
                        <select className="bg-slate-50 dark:bg-slate-800 border-none text-xs font-medium text-slate-600 dark:text-slate-400 rounded-md py-1 px-2 focus:ring-0">
                            <option>Last 7 Days</option>
                            <option>Last Month</option>
                            <option>This Year</option>
                        </select>
                    </div>
                    <div className="h-80 w-full">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
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
                        <div className="flex gap-4">
                             <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-sm">person_add</span>
                             </div>
                             <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">New student enrolled</p>
                                <p className="text-xs text-slate-500">Sarah J. joined "Advanced Calculus"</p>
                                <p className="text-[10px] text-slate-400 mt-1">2 mins ago</p>
                             </div>
                        </div>
                        <div className="flex gap-4">
                             <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-yellow-600 dark:text-yellow-400 text-sm">reviews</span>
                             </div>
                             <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">New 5-star review</p>
                                <p className="text-xs text-slate-500">"Best course on Python I've taken..."</p>
                                <p className="text-[10px] text-slate-400 mt-1">1 hour ago</p>
                             </div>
                        </div>
                        <div className="flex gap-4">
                             <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                                <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-sm">payments</span>
                             </div>
                             <div>
                                <p className="text-sm font-medium text-slate-900 dark:text-white">Payout Processed</p>
                                <p className="text-xs text-slate-500">₦125,000 sent to your bank account</p>
                                <p className="text-[10px] text-slate-400 mt-1">Yesterday</p>
                             </div>
                        </div>
                    </div>
                    <Button variant="outline" className="w-full mt-6 text-xs h-10 border-dashed">View All Activity</Button>
                </div>
            </div>
        </div>
    );
};
