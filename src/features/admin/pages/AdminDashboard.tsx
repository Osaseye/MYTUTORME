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

const nigeriaUserData: Array<{name: string, students: number}> = [];

export const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-display">
            Admin Overview 🇳🇬
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
            <div className="text-2xl font-bold font-display">0</div>
            <p className="text-xs text-green-600 flex items-center gap-1 font-medium mt-1">
               <TrendingUp className="w-3 h-3" />
               0% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Pending Verification</CardTitle>
            <UserCheck className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">0</div>
            <p className="text-xs text-slate-500 mt-1">NIN/BVN Verification Queue</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">0</div>
            <p className="text-xs text-slate-500 mt-1">WAEC, JAMB, Professional</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-display">₦0</div>
            <p className="text-xs text-green-600 flex items-center gap-1 font-medium mt-1">
               <TrendingUp className="w-3 h-3" />
               0% this quarter
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        {/* Regional Growth Chart */}
        <div className="md:col-span-4 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>User Growth by Region</CardTitle>
                </CardHeader>
                <CardContent className="pl-0">
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={nigeriaUserData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
                                <Bar dataKey="students" fill="#16a34a" radius={[4, 4, 0, 0]} barSize={40} />
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
                    <CardTitle>Recent Actions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6 flex flex-col items-center justify-center py-10 text-slate-500">
                        <p>No recent actions to display.</p>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
};
