import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
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
import { Badge } from '@/components/ui/badge';

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
                    value="₦12,450,000" 
                    change="+15.2%" 
                    icon={DollarSign} 
                    trend="up" 
                />
                <MetricCard 
                    title="Teacher Payouts" 
                    value="₦8,200,500" 
                    change="+12.1%" 
                    icon={Wallet} 
                    trend="up" 
                />
                <MetricCard 
                    title="Net Profit" 
                    value="₦4,249,500" 
                    change="+8.4%" 
                    icon={TrendingUp} 
                    trend="up" 
                />
                <MetricCard 
                    title="Pending Payouts" 
                    value="₦1,250,000" 
                    change="-2.5%" 
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
                            {[
                                { name: 'Chike Obi', bank: 'GTBank', account: '**** 1234', amount: '₦150,000', status: 'Completed', date: 'Today, 2:30 PM' },
                                { name: 'Amina Bello', bank: 'Access Bank', account: '**** 5678', amount: '₦85,000', status: 'Processing', date: 'Today, 1:15 PM' },
                                { name: 'David Okafor', bank: 'Zenith Bank', account: '**** 9012', amount: '₦210,000', status: 'Completed', date: 'Yesterday' },
                                { name: 'Sarah Jones', bank: 'UBA', account: '**** 3456', amount: '₦45,000', status: 'Failed', date: 'Yesterday' },
                            ].map((payout, i) => (
                                <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                                            <CreditCard className="h-5 w-5 text-slate-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-sm">{payout.name}</p>
                                            <p className="text-xs text-slate-500">{payout.bank} • {payout.account}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-sm">{payout.amount}</p>
                                        <Badge variant="outline" className={`text-[10px] ${
                                            payout.status === 'Completed' ? 'text-green-600 border-green-200 bg-green-50' :
                                            payout.status === 'Processing' ? 'text-amber-600 border-amber-200 bg-amber-50' :
                                            'text-red-600 border-red-200 bg-red-50'
                                        }`}>
                                            {payout.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
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
                            {[
                                { tier: 'Basic', price: '₦2,500/mo', users: 1250, percent: 65, color: 'bg-slate-500' },
                                { tier: 'Pro (WAEC+JAMB)', price: '₦5,000/mo', users: 850, percent: 25, color: 'bg-blue-600' },
                                { tier: 'Premium (1-on-1)', price: '₦15,000/mo', users: 120, percent: 10, color: 'bg-amber-500' },
                            ].map((plan, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">{plan.tier}</span>
                                        <span className="text-slate-500">{plan.users} users</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full ${plan.color}`} style={{ width: `${plan.percent}%` }} />
                                    </div>
                                    <div className="flex justify-between text-xs text-slate-400">
                                        <span>{plan.price}</span>
                                        <span>{plan.percent}% of total</span>
                                    </div>
                                </div>
                            ))}
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
