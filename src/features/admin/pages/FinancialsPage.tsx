import { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,  
  Download,
  Calendar,
  Wallet,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Building,
  History,
  Activity
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
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Badge } from '@/components/ui/badge';

interface Transaction {
  id: string;
  amount: number;
  type: 'subscription' | 'course_purchase' | 'addon_purchase' | 'payout';
  status: 'successful' | 'pending' | 'failed';
  createdAt: number | Timestamp | any;
  userRole?: string;
  platformFee?: number;
  teacherPayoutAmount?: number;
  description?: string;
  reference?: string;
}

export const FinancialsPage = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [userStats, setUserStats] = useState({ studentPro: 0, teacherPro: 0 });
    const [userMap, setUserMap] = useState<Record<string, string>>({});

    useEffect(() => {
        const q = query(collection(db, 'transactions'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
            setTransactions(fetched);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching transactions:", error);
            setLoading(false);
        });

        // Fetch pro users and build a map of user names
        import('firebase/firestore').then(({ getDocs, collection }) => {
            const fetchProUsers = async () => {
                try {
                    const usersRef = collection(db, 'users');
                    const allUsersSnap = await getDocs(usersRef);
                    
                    let stdPro = 0;
                    let tchPro = 0;
                    const tempMap: Record<string, string> = {};

                    allUsersSnap.forEach(doc => {
                        const data = doc.data();
                        tempMap[doc.id] = data.displayName || data.username || data.email || 'Unknown User';
                        
                        if (data.role === 'student') {
                            const plan = data.plan;
                            if (plan === 'pro' || plan === 'pro_monthly' || plan === 'pro_yearly') stdPro++;
                        } else if (data.role === 'teacher') {
                            const plan = data.teacherSubscriptionPlan;
                            if (plan === 'premium_tools' || plan === 'enterprise') tchPro++;
                        }
                    });

                    setUserMap(tempMap);
                    setUserStats({
                        studentPro: stdPro,
                        teacherPro: tchPro
                    });
                } catch(err) {
                    console.error("Error fetching pro users & user map:", err);
                }
            };
            fetchProUsers();
        });

        return () => unsubscribe();
    }, []);

    const isSuccessful = (t: Transaction) => t.status === 'successful' || (t.status as string) === 'completed';

    // Calculate Metrics
    const totalRevenue = transactions
        .filter(t => isSuccessful(t) && t.type !== 'payout')
        .reduce((acc, curr) => acc + (curr.amount || 0), 0);

    const teacherPayouts = transactions
        .filter(t => isSuccessful(t) && t.type === 'payout')
        .reduce((acc, curr) => acc + (curr.amount || 0), 0);
        
    const pendingPayouts = transactions
        .filter(t => t.status === 'pending' && t.type === 'payout')
        .reduce((acc, curr) => acc + (curr.amount || 0), 0);

    const platformFees = transactions
        .filter(t => isSuccessful(t))
        .reduce((acc, curr) => acc + (curr.platformFee || 0), 0);

    // If platform fees aren't explicitly tracked, estimate net profit
    const owedToTeachers = transactions
        .filter(t => isSuccessful(t) && (t.type === 'course_purchase' || (t.type as string) === 'purchase'))
        .reduce((acc, curr) => acc + ((curr as any).teacherEarnings !== undefined ? (curr as any).teacherEarnings : (curr.amount * 0.70)), 0);
        
    const totalNetProfit = platformFees > 0 ? platformFees : (totalRevenue - owedToTeachers);

    // Get Subscription Count
    const studentSubscriptions = userStats.studentPro;
    const teacherSubscriptions = userStats.teacherPro;

    const formatCurrency = (amt: number) => `₦${(amt || 0).toLocaleString()}`;

    // Format Timestamp
    const formatDate = (val: any) => {
        if (!val) return 'Recently';
        if (val.seconds) return new Date(val.seconds * 1000).toLocaleDateString();
        if (val.toMillis) return new Date(val.toMillis()).toLocaleDateString();
        return new Date(val).toLocaleDateString();
    };

    return (
        <div className="space-y-8 max-w-[1600px] mx-auto pb-10">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 -mx-4 -mt-4 md:-mx-6 md:-mt-6 p-4 md:p-6 md:px-10 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <Activity className="h-6 w-6 text-emerald-500" />
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Financial Overview</h1>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">Monitor revenue, teacher payouts, platform fees, and network growth.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm">
                        <Calendar className="h-4 w-4 text-slate-500" /> This Month
                    </Button>
                    <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20">
                        <Download className="h-4 w-4" /> Export Report
                    </Button>
                </div>
            </div>

            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard 
                    title="Gross Revenue" 
                    value={formatCurrency(totalRevenue)} 
                    change="+12.5%" 
                    icon={DollarSign} 
                    trend="up" 
                    subtitle="Total incoming funds"
                />
                <MetricCard 
                    title="Net Profit" 
                    value={formatCurrency(totalNetProfit)} 
                    change="+8.2%" 
                    icon={TrendingUp} 
                    trend="up" 
                    subtitle="Platform take & subscriptions"
                />
                <MetricCard 
                    title="Processed Payouts" 
                    value={formatCurrency(teacherPayouts)} 
                    change="+15.3%" 
                    icon={Wallet} 
                    trend="up" 
                    subtitle="Paid to teachers"
                />
                <MetricCard 
                    title="Pending Liabilities" 
                    value={formatCurrency(pendingPayouts + owedToTeachers - teacherPayouts)} 
                    change="-2.4%" 
                    icon={AlertCircle} 
                    trend="down" 
                    subtitle="Owed to teachers (unpaid)"
                    alertMode={(pendingPayouts + owedToTeachers - teacherPayouts) > 100000}
                />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Recent Transactions List */}
                <Card className="xl:col-span-2 shadow-sm border-slate-200 dark:border-slate-800 overflow-hidden">
                    <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <History className="h-5 w-5 text-indigo-500" /> Transaction Ledger
                                </CardTitle>
                                <CardDescription>Latest platform transactions (payouts & purchases)</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" className="text-indigo-600 dark:text-indigo-400">View All</Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
                                <p>Loading financial records...</p>
                            </div>
                        ) : transactions.length === 0 ? (
                            <div className="p-16 text-center flex flex-col items-center justify-center bg-slate-50/30 dark:bg-slate-900/10">
                                <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                    <CreditCard className="h-8 w-8 text-slate-400" />
                                </div>
                                <p className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-1">No transactions found</p>
                                <p className="text-slate-500">Sales and payouts will appear here in real-time.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-500 font-medium">
                                        <tr>
                                            <th className="h-12 px-6">Transaction</th>
                                            <th className="h-12 px-6">User</th>
                                            <th className="h-12 px-6">Amount</th>
                                            <th className="h-12 px-6">Status</th>
                                            <th className="h-12 px-6">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {transactions.slice(0, 8).map((t) => (
                                            <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                                                <td className="p-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-full ${
                                                            t.type === 'payout' ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' :
                                                            t.type === 'subscription' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' :
                                                            'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                        }`}>
                                                            {t.type === 'payout' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-slate-900 dark:text-slate-100 capitalize">{t.type.replace('_', ' ')}</p>
                                                            <p className="text-xs text-slate-500">{t.description || t.reference || t.id.substring(0, 10)}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 px-6 text-sm text-slate-600 dark:text-slate-400">
                                                    {(() => {
                                                        const uid = (t as any).studentId || (t as any).userId || (t as any).teacherId;
                                                        if (uid && userMap[uid]) return userMap[uid];
                                                        return (t as any).studentEmail || (t as any).customer?.email || uid || "System";
                                                    })()}
                                                </td>
                                                <td className="p-4 px-6 font-semibold text-slate-700 dark:text-slate-300">
                                                    {t.type === 'payout' ? '-' : '+'}{formatCurrency(t.amount)}
                                                </td>
                                                <td className="p-4 px-6">
                                                    <Badge className={
                                                        t.status === 'successful' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                                        t.status === 'pending' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400' :
                                                        'bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-400'
                                                    } variant="outline" style={{ border: 'none' }}>
                                                        {t.status}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 px-6 text-slate-500">
                                                    {formatDate(t.createdAt)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Right Column / Subscriptions Overview */}
                <div className="space-y-6">
                    <Card className="shadow-sm border-slate-200 dark:border-slate-800">
                        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Building className="h-5 w-5 text-blue-500" /> Platform Growth
                            </CardTitle>
                            <CardDescription>Breakdown of active plan subscriptions.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-slate-700 dark:text-slate-300">Student Pro Plans</span>
                                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{studentSubscriptions} Active</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                        <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${Math.min(studentSubscriptions * 5, 100)}%`, minWidth: '5%' }}></div>
                                    </div>
                                    <p className="text-xs text-slate-400 text-right">₦4,000/mo or ₦40,000/yr</p>
                                </div>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-slate-700 dark:text-slate-300">Teacher Premium Tools</span>
                                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{teacherSubscriptions} Active</span>
                                    </div>
                                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${Math.min(teacherSubscriptions * 10, 100)}%`, minWidth: '5%' }}></div>
                                    </div>
                                    <p className="text-xs text-slate-400 text-right">₦12,000/yr</p>
                                </div>

                                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 p-4 rounded-xl flex gap-3">
                                        <div className="mt-0.5 shrink-0">
                                            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-amber-800 dark:text-amber-400 mb-1">Billing Reminder</h4>
                                            <p className="text-xs text-amber-700/80 dark:text-amber-500/80">Teacher payouts are processed automatically at the end of every week via Paystack Transfers.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

// Helper Components
const MetricCard = ({ title, value, change, icon: Icon, trend, subtitle, alertMode }: { 
    title: string, value: string, change: string, icon: LucideIcon, trend: 'up' | 'down', subtitle: string, alertMode?: boolean 
}) => (
    <Card className={`shadow-sm border-slate-200 dark:border-slate-800 transition-all hover:shadow-md ${alertMode ? 'border-amber-300 dark:border-amber-700/50 relative overflow-hidden' : ''}`}>
        {alertMode && <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>}
        <CardContent className="p-6">
            <div className="flex justify-between items-start">
                <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
                    <p className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{value}</p>
                </div>
                <div className={`p-3 rounded-xl ${
                    trend === 'up' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' 
                    : alertMode ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                    : 'bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400'
                }`}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
            <div className="mt-4 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-sm">
                    <span className={`inline-flex items-center font-medium ${trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {trend === 'up' ? <TrendingUp className="h-3.5 w-3.5 mr-1" /> : <TrendingDown className="h-3.5 w-3.5 mr-1" />}
                        {change}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500">vs last month</span>
                </div>
                <p className="text-xs text-slate-400">{subtitle}</p>
            </div>
        </CardContent>
    </Card>
);
