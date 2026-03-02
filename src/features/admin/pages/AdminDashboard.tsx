import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { 
  Users, 
  BookOpen, 
  DollarSign, 
  Activity, 
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const userGrowthData = [
  { name: 'Jan', students: 400, teachers: 20 },
  { name: 'Feb', students: 300, teachers: 15 },
  { name: 'Mar', students: 500, teachers: 25 },
  { name: 'Apr', students: 450, teachers: 30 },
  { name: 'May', students: 600, teachers: 40 },
  { name: 'Jun', students: 700, teachers: 45 },
];

export const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">System Overview</h1>
          <p className="text-slate-500 dark:text-slate-400">Platform health and key metrics.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                View Alerts (3)
            </Button>
            <Button className="gap-2">
                <ShieldCheck className="h-4 w-4" />
                Review Queue
            </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,345</div>
            <p className="text-xs text-slate-500">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <UserCheck className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-slate-500">Teacher applications</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses Published</CardTitle>
            <BookOpen className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,203</div>
            <p className="text-xs text-slate-500">+8% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$124,592</div>
            <p className="text-xs text-slate-500">+15% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>New student and teacher registrations over time.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowthData}>
                    <XAxis 
                        dataKey="name" 
                        stroke="#888888" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                    />
                    <YAxis 
                        stroke="#888888" 
                        fontSize={12} 
                        tickLine={false} 
                        axisLine={false} 
                        tickFormatter={(value) => `${value}`} 
                    />
                    <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line type="monotone" dataKey="students" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="teachers" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
                </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Pending Verifications */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Verification Queue</CardTitle>
            <CardDescription>Recent teacher applications awaiting review.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                  { name: 'Dr. Sarah Connor', subject: 'Physics', date: '2 hrs ago', status: 'Pending' },
                  { name: 'Prof. John Smith', subject: 'History', date: '5 hrs ago', status: 'Pending' },
                  { name: 'Alice Johnson', subject: 'Mathematics', date: '1 day ago', status: 'Pending' },
                  { name: 'Michael Brown', subject: 'Computer Sci', date: '1 day ago', status: 'Pending' },
                  { name: 'Emily Davis', subject: 'Chemistry', date: '2 days ago', status: 'Pending' },
              ].map((user, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center font-bold text-blue-700 dark:text-blue-200">
                            {user.name.charAt(0)}
                        </div>
                        <div>
                            <p className="text-sm font-medium leading-none">{user.name}</p>
                            <p className="text-xs text-slate-500">{user.subject} • {user.date}</p>
                        </div>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs h-8">Review</Button>
                  </div>
              ))}
              <Button variant="ghost" className="w-full text-sm text-primary">View All Pending</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
