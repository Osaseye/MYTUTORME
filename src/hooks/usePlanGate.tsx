import React from 'react';
import { useAuthStore } from '@/features/auth/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

export type GatedFeature =
  | 'full_course_library'
  | 'gpa_simulator'
  | 'unlimited_ai'
  | 'offline_downloads'
  | 'guided_assignments'
  | 'premium_mock_exams'
  | 'priority_support';

const PLAN_FEATURES: Record<GatedFeature, string[]> = {
  full_course_library:  ['pro_monthly', 'pro_yearly'],
  gpa_simulator:        ['pro_monthly', 'pro_yearly'],
  unlimited_ai:         ['pro_monthly', 'pro_yearly'],
  offline_downloads:    ['pro_monthly', 'pro_yearly'],
  guided_assignments:   ['pro_monthly', 'pro_yearly'],
  premium_mock_exams:   ['pro_monthly', 'pro_yearly'],
  priority_support:     ['pro_yearly'],
};

export const UpgradePrompt = ({ feature }: { feature: GatedFeature }) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-center">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Upgrade to Unlock {feature.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</h3>
      <p className="text-slate-500 mb-6 max-w-sm">
        This feature requires a premium plan. Upgrade now to enhance your learning experience.
      </p>
      <button 
        onClick={() => navigate('/student/settings')}
        className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
      >
        Upgrade Plan
      </button>
    </div>
  );
};

export const usePlanGate = (feature: GatedFeature) => {
  const { user } = useAuthStore();
  const plan = user?.plan || 'free';
  const hasAccess = PLAN_FEATURES[feature].includes(plan);

  const gate = (
    content: React.ReactNode,
    fallback?: React.ReactNode
  ): React.ReactNode =>
    hasAccess ? content : (fallback ?? <UpgradePrompt feature={feature} />);

  return {
    hasAccess,
    isFreeTier: plan === 'free',
    gate,
  };
};
