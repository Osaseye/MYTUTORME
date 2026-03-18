import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,  
  Download,
  Calendar,
  Wallet,
  AlertCircle
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

export const FinancialsPage = () => {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Financial Overview</h1>
                    <p className="text-slate-500 dark:text-slate-400">Monitor revenue, teacher payouts, and platform fees.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <Calendar className="h-4 w-4" /> This Month
                    </Button>
                    <Button className="gap-2">
                        <Download className="h-4 w-4" /> Export Report
                    </Button>
                </div>
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard 
                    title="Total Revenue" 
                    value="₦0" 
                    change="0%" 
                    icon={DollarSign} 
                    trend="up" 
                />
                <MetricCard 
                    title="Teacher Payouts" 
                    value="₦0" 
                    change="0%" 
                    icon={Wallet} 
                    trend="up" 
                />
                <MetricCard 
                    title="Net Profit" 
                    value="₦0" 
                    change="0%" 
                    icon={TrendingUp} 
                    trend="up" 
                />
                <MetricCard 
                    title="Pending Payouts" 
                    value="₦0" 
                    change="0%" 
                    icon={AlertCircle} 
                    trend="down" 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Payouts */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Payouts</CardTitle>
                        <CardDescription>Latest transfers to teacher bank accounts.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="p-8 text-center text-slate-500 border border-dashed rounded-lg">
                                <span className="material-symbols-outlined text-3xl mb-2 text-slate-300">receipt_long</span>
                                <p>No recent payouts.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Subscriptions Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle>Subscription Plans</CardTitle>
                        <CardDescription>Active student subscriptions by tier.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="p-8 text-center text-slate-500 border border-dashed rounded-lg">
                                <span className="material-symbols-outlined text-3xl mb-2 text-slate-300">subscriptions</span>
                                <p>No subscription data available.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

// Helper Components

const MetricCard = ({ title, value, change, icon: Icon, trend }: { 
    title: string, value: string, change: string, icon: LucideIcon, trend: 'up' | 'down' 
}) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {title}
            </CardTitle>
            <Icon className="h-4 w-4 text-slate-400" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className={`text-xs flex items-center gap-1 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {change}
                <span className="text-slate-400 dark:text-slate-500 ml-1">from last month</span>
            </p>
        </CardContent>
    </Card>
);
