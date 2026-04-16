import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, getCountFromServer, getAggregateFromServer, sum, or } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  Users,
  BookOpen,
  DollarSign,
  UserCheck,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GlobalLoader } from '@/components/ui/global-loader';

interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalRevenue: number;
  pendingVerifications: number;
  pendingCourseReviews: number;
  platformCuts: number;
}

export const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<{name: string, users: number}[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Run aggregation queries in parallel
        const [
            usersSnap, 
            studentsSnap, 
            teachersSnap, 
              publishedCoursesSnap,
              pendingCoursesSnap, 
              pendingTeachersSnap,
              revenueSnap,
              platformFeesSnap,
              usersCollection
          ] = await Promise.all([
              getCountFromServer(collection(db, 'users')),
              getCountFromServer(query(collection(db, 'users'), where('role', '==', 'student'))),
              getCountFromServer(query(collection(db, 'users'), where('role', '==', 'teacher'))),
              getCountFromServer(query(collection(db, 'courses'), where('status', '==', 'published'))),
              getCountFromServer(query(collection(db, 'courses'), or(where('status', '==', 'pending_review'), where('status', '==', 'pending')))),
              getCountFromServer(query(collection(db, 'users'), where('role', '==', 'teacher'), where('verificationStatus', '==', 'pending'))),
              getAggregateFromServer(collection(db, 'transactions'), { totalRevenue: sum('amount') }),
              getAggregateFromServer(collection(db, 'transactions'), { platformCuts: sum('platformFee') }),
              getDocs(collection(db, 'users'))
          ]);

          setStats({
              totalUsers: usersSnap.data().count,
              totalStudents: studentsSnap.data().count,
              totalTeachers: teachersSnap.data().count,
              totalCourses: publishedCoursesSnap.data().count,
              totalRevenue: revenueSnap.data().totalRevenue || 0,
              pendingVerifications: pendingTeachersSnap.data().count,
              pendingCourseReviews: pendingCoursesSnap.data().count,
              platformCuts: platformFeesSnap.data().platformCuts || 0,
          });

          const monthCounts: Record<string, number> = {};
        // Initialize last 6 months for a clean chart even if empty
        const today = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthName = d.toLocaleString('en-US', { month: 'short' });
            monthCounts[monthName] = 0;
        }

        usersCollection.forEach((doc) => {
            const data = doc.data();
            if (data.createdAt) {
                let date;
                if (typeof data.createdAt === 'number') {
                    date = new Date(data.createdAt);
                } else if (data.createdAt.toDate) {
                    date = data.createdAt.toDate();
                } else if (typeof data.createdAt === 'string') {
                    date = new Date(data.createdAt);
                }
                
                if (date && !isNaN(date.getTime())) {
                    const monthName = date.toLocaleString('en-US', { month: 'short' });
                    if (monthCounts[monthName] !== undefined) {
                        monthCounts[monthName] += 1;
                    } else {
                        // If it's an older month outside our 6 month window, we can still add it
                        monthCounts[monthName] = (monthCounts[monthName] || 0) + 1;
                    }
                }
            }
        });

        const formattedChartData = Object.entries(monthCounts).map(([name, count]) => ({
            name,
            users: count
        }));

        setChartData(formattedChartData);

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <GlobalLoader />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-display">
            Admin Overview ????
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Monitoring MyTutorMe growth across Nigeria.
          </p>
        </div>
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full dark:bg-slate-800 flex items-center">
                <Calendar className="w-3 h-3 mr-2" />
                {new Date().toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-green-600 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Users</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">{stats?.totalUsers?.toLocaleString() || '0'}</div>
            <p className="text-xs text-green-600 flex items-center gap-1 font-medium mt-1">
               <TrendingUp className="w-3 h-3" />
               Real-time
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Pending Verification</CardTitle>
            <UserCheck className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">{stats?.pendingVerifications?.toLocaleString() || '0'}</div>
            <p className="text-xs text-slate-500 mt-1">NIN/BVN Verification Queue</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">{stats?.totalCourses?.toLocaleString() || '0'}</div>
            <p className="text-xs text-slate-500 mt-1">WAEC, JAMB, Professional</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Revenue & Cuts</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-2xl font-bold font-display">?{(stats?.platformCuts || 0).toLocaleString()}</div>
                <p className="text-xs text-green-600 flex items-center gap-1 font-medium mt-1">
                  <TrendingUp className="w-3 h-3" />
                  Net Income (Platform)
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-slate-400">Gross: ?{(stats?.totalRevenue || 0).toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        {/* General Growth Chart */}
        <div className="md:col-span-4 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Total User Growth</CardTitle>
                </CardHeader>
                <CardContent className="pl-0">
                    <div className="h-[300px] w-full min-h-[300px]">
                        <ResponsiveContainer width="100%" height="100%" minHeight={300}>
                            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                <XAxis 
                                    dataKey="name" 
                                    stroke="#64748b" 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={false} 
                                />
                                <YAxis 
                                    stroke="#64748b" 
                                    fontSize={12} 
                                    tickLine={false} 
                                    axisLine={false} 
                                />
                                <Tooltip 
                                    cursor={{fill: '#f1f5f9'}}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="users" fill="#16a34a" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Recent Activity Feed */}
        <div className="md:col-span-3 space-y-6">
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>Platform Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <span className="text-sm text-slate-500">Total Students</span>
                            <span className="font-bold">{stats?.totalStudents?.toLocaleString() || '0'}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                            <span className="text-sm text-slate-500">Total Teachers</span>
                            <span className="font-bold">{stats?.totalTeachers?.toLocaleString() || '0'}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border-l-2 border-l-amber-500">
                            <span className="text-sm text-slate-500">Pending Course Reviews</span>
                            <span className="font-bold text-amber-600">{stats?.pendingCourseReviews?.toLocaleString() || '0'}</span>
                        </div>
                        <div className="pt-4 mt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                            <p className="text-xs text-slate-400">Live Database Aggregation</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
};
