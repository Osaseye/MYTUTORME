import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DollarSign, TrendingUp, Calendar, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const data = [
  { name: "Jan", revenue: 4000 },
  { name: "Feb", revenue: 5000 },
  { name: "Mar", revenue: 4500 },
  { name: "Apr", revenue: 6000 },
  { name: "May", revenue: 7890 },
  { name: "Jun", revenue: 9390 },
];

export const EarningsPage = () => {
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
            <Button className="inline-flex items-center gap-2 bg-primary hover:bg-green-700 text-white">
              <DollarSign className="w-4 h-4" />
              Withdraw Funds
            </Button>
          </div>
        </div>

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
                <h3 className="text-3xl font-display font-bold">₦125,450</h3>
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
                +15%
              </span>
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">
              ₦450,230
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
              Mar 15, 2026
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Scheduled Date
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm mb-8">
          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-6">
            Revenue Trend
          </h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
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
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white font-medium">
                  Mar 02, 2026
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  Course Sale
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  Advanced Calculus
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-emerald-600 dark:text-emerald-400 font-bold">
                  +₦4,500
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    Completed
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-white font-medium">
                  Mar 01, 2026
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  Withdrawal
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  -
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-slate-900 dark:text-white font-bold">
                  -₦50,000
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    Processing
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
