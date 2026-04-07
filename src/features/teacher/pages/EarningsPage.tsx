/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DollarSign, TrendingUp, Calendar, ArrowUpRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useEffect, useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "@/lib/firebase";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const EarningsPage = () => {
  const { user } = useAuth();
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const hasPremium = user?.teacherSubscriptionPlan === 'premium_tools' || user?.teacherSubscriptionPlan === 'enterprise';

  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || !bankCode || !accountNumber) return;

    const amount = Number(withdrawAmount);
    if (amount > (user?.balance || 0)) {
      toast.error("Insufficient balance for this withdrawal.");
      return;
    }
    if (amount < 100) {
      toast.error("Minimum withdrawal amount is ₦100.");
      return;
    }

    setIsWithdrawing(true);
    const toastId = toast.loading("Processing payout request...");

    try {
      const requestPayout = httpsCallable(functions, "requestPayout");
      await requestPayout({ amount, bankCode, accountNumber });
      
      toast.success("Payout requested successfully!", { id: toastId });
      setIsWithdrawModalOpen(false);
      setWithdrawAmount("");
      setBankCode("");
      setAccountNumber("");
      // optionally trigger a re-fetch of user balance here
    } catch (err: any) {
      console.error("Payout error:", err);
      toast.error(err.message || "Failed to process payout.", { id: toastId });
    } finally {
      setIsWithdrawing(false);
    }
  };

  useEffect(() => {
    const fetchEarnings = async () => {
      if (!user?.uid) return;
      try {
        const q = query(
          collection(db, "transactions"),
          where("teacherId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        let total = 0;
        const txList: any[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Use teacherEarnings if it exists, otherwise mathematically deduce 70% for legacy fallback
          const amt = data.teacherEarnings !== undefined ? data.teacherEarnings : ((data.amount || 0) * 0.70);
          total += amt;
          txList.push({ id: doc.id, ...data, displayAmount: amt });
        });
        setTotalEarnings(total);
        setTransactions(txList);
      } catch (error) {
        console.error("Error fetching earnings:", error);
      }
    };
    fetchEarnings();
  }, [user]);

  // Calculate real chart data based on transactions
  const chartData = (() => {
    const dataByMonth = new Map<string, number>();
    const today = new Date();
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        dataByMonth.set(d.toLocaleString("en-US", { month: "short" }), 0);
    }
    
    transactions.forEach(t => {
      if (t.createdAt) {
        let date;
        if (typeof t.createdAt === 'number') date = new Date(t.createdAt);
        else if (t.createdAt.toDate) date = t.createdAt.toDate();
        else if (typeof t.createdAt === 'string') date = new Date(t.createdAt);
        
        if (date && !isNaN(date.getTime())) {
          const monthName = date.toLocaleString("en-US", { month: "short" });
          if (dataByMonth.has(monthName)) {
            dataByMonth.set(monthName, dataByMonth.get(monthName)! + (t.displayAmount || 0));
          }
        }
      }
    });

    return Array.from(dataByMonth.entries()).map(([name, revenue]) => ({
      name,
      revenue
    }));
  })();

  return (
    <div className="bg-background-light dark:bg-background-dark font-body text-slate-800 dark:text-slate-100 transition-colors duration-300 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">
              Earnings Overview
            </h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">
              Track your revenue and manage payouts.
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              variant="outline"
              className="inline-flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              This Month
            </Button>
            <Button onClick={() => setIsWithdrawModalOpen(true)} className="inline-flex items-center gap-2 bg-primary hover:bg-green-700 text-white">
              <DollarSign className="w-4 h-4" />
              Withdraw Funds
            </Button>
          </div>
        </div>

        {isWithdrawModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 shadow-2xl relative">
              <button 
                onClick={() => setIsWithdrawModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
              <div className="mb-6">
                <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white mb-2">Request Payout</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Submit your withdrawal details to initiate a transfer using Flutterwave.<br/>
                  Current Wallet Balance: <strong className="text-slate-900 dark:text-white">₦{Number(user?.balance || 0).toLocaleString()}</strong>
                </p>
              </div>
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Withdrawal Amount (NGN)</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    min="100" 
                    value={withdrawAmount} 
                    onChange={(e) => setWithdrawAmount(e.target.value)} 
                    placeholder="e.g. 5000" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankCode">Bank Code</Label>
                  <Input 
                    id="bankCode" 
                    type="text" 
                    value={bankCode} 
                    onChange={(e) => setBankCode(e.target.value)} 
                    placeholder="e.g. 044 (Access Bank)" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input 
                    id="accountNumber" 
                    type="text" 
                    maxLength={10}
                    value={accountNumber} 
                    onChange={(e) => setAccountNumber(e.target.value)} 
                    placeholder="10-digit account number" 
                    required 
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsWithdrawModalOpen(false)}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isWithdrawing || !withdrawAmount || !bankCode || !accountNumber} 
                    className="w-full"
                  >
                    {isWithdrawing ? 'Processing...' : 'Withdraw'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-primary to-secondary rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/20 rounded-full blur-2xl"></div>
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-primary-100 text-sm font-medium mb-1">
                  Available Balance
                </p>
                <h3 className="text-3xl font-display font-bold">₦{Number(user?.balance || 0).toLocaleString()}</h3>
                <div className="flex items-center gap-1 mt-2 text-emerald-100 text-xs bg-white/10 w-fit px-2 py-1 rounded-full">
                  <span className="material-symbols-outlined text-xs">
                    verified
                  </span>
                  <span>Ready to payout</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">
                0%
              </span>
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">
              ₦{totalEarnings.toLocaleString()}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Total Revenue (This Year)
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center">
                <ArrowUpRight className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 px-2 py-1 rounded-full">
                Next Payout
              </span>
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">
              -
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Scheduled Date
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm mb-8 relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
              AI Revenue Insights & Forecast
            </h3>
            {!hasPremium && (
              <span className="text-xs bg-gradient-to-r from-orange-100 to-rose-100 text-orange-700 px-3 py-1 rounded-full font-medium flex items-center gap-1">
                <Lock className="w-3 h-3" /> Premium Feature
              </span>
            )}
          </div>
          <div className={`h-80 w-full transition-all ${!hasPremium ? 'blur-sm select-none pointer-events-none opacity-50' : ''}`}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#E2E8F0"
                />
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
                  cursor={{ fill: "#F1F5F9" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  dataKey="revenue"
                  fill="#16A34A"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {!hasPremium && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/40 dark:bg-slate-900/40 backdrop-blur-[2px]">
              <Lock className="w-10 h-10 text-orange-500 mb-3" />
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Unlock AI Revenue Insights</h4>
              <p className="text-slate-600 dark:text-slate-300 mb-4 max-w-sm text-center text-sm">
                Get predictable forecasting, optimal pricing suggestions, and student purchasing trends.
              </p>
              <Link to="/teacher/settings?tab=billing">
                <Button className="bg-gradient-to-r from-orange-500 to-rose-500 text-white border-0 hover:from-orange-600 hover:to-rose-600 shadow-lg">
                  Upgrade to Premium
                </Button>
              </Link>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
              Recent Transactions
            </h3>
          </div>
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                  scope="col"
                >
                  Date
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                  scope="col"
                >
                  Type
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                  scope="col"
                >
                  Course
                </th>
                <th
                  className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                  scope="col"
                >
                  Amount
                </th>
                <th
                  className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                  scope="col"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-900">
              {transactions.length > 0 ? transactions.map((t, idx) => {
                 let dateStr = "Unknown";
                 if (t.createdAt) {
                    if (t.createdAt.toDate) dateStr = t.createdAt.toDate().toLocaleDateString();
                    else if (typeof t.createdAt === 'number') dateStr = new Date(t.createdAt).toLocaleDateString();
                    else if (typeof t.createdAt === 'string') dateStr = new Date(t.createdAt).toLocaleDateString();
                 }
                 return (
                 <tr key={t.id || idx}>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{dateStr}</td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white capitalize">{t.type || 'Course Sale'}</td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{t.courseId || 'Unknown'}</td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600">₦{(t.displayAmount || 0).toLocaleString()}</td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-right"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 capitalize">{t.status || 'completed'}</span></td>
                 </tr>
                 );
              }) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  <span className="material-symbols-outlined text-4xl mb-2 text-slate-300">receipt_long</span>
                  <p>No recent transactions.</p>
                </td>
              </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
