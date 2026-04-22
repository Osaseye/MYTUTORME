import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FreePlanUsageCardProps {
  currentUsage: number;
  maxLimit: number | string;
  description?: string;
  usageLabel?: string;
  upgradePath?: string;
  variant?: 'default' | 'compact';
  className?: string;
}

export const FreePlanUsageCard: React.FC<FreePlanUsageCardProps> = ({
  currentUsage,
  maxLimit,
  usageLabel = 'used',
  upgradePath = '/student/settings',
  className
}) => {
  const navigate = useNavigate();

  return (
    <div className={cn("w-full max-w-sm mx-auto bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300 px-4 py-2.5 rounded-2xl text-[13px] flex items-center justify-between shadow-sm my-4", className)}>
        <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-500 fill-emerald-500/20" />
            <span className="capitalize">{usageLabel}: <strong className="text-slate-900 dark:text-white">{currentUsage}/{maxLimit}</strong></span>
        </div>
        <button onClick={() => navigate(upgradePath)} className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline">Upgrade</button>
    </div>
  );
};
