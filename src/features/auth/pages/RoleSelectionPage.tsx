import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/features/auth/hooks/useAuth';
import { buildUserDoc, completeGoogleRoleSelection } from '../api/auth';
import type { User, UserRole } from '@/types/user';

const roleOptions: Array<{
  role: Exclude<UserRole, 'admin'>;
  title: string;
  description: string;
  icon: string;
}> = [
  {
    role: 'student',
    title: 'Student',
    description: 'Access lessons, study tools, exams, and progress tracking.',
    icon: 'school',
  },
  {
    role: 'teacher',
    title: 'Teacher',
    description: 'Create courses, manage students, and grow your teaching profile.',
    icon: 'person_apron',
  },
];

export const RoleSelectionPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const [selectedRole, setSelectedRole] = useState<Exclude<UserRole, 'admin'> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentUser = auth.currentUser;
  const canContinue = useMemo(() => Boolean(currentUser && selectedRole && !isSubmitting), [currentUser, selectedRole, isSubmitting]);

  const handleContinue = async () => {
    if (!selectedRole || !currentUser) {
      toast.error('Please sign in again to continue.');
      navigate('/login', { replace: true });
      return;
    }

    setIsSubmitting(true);
    try {
      await completeGoogleRoleSelection(selectedRole);

      const userData = buildUserDoc(
        {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
        },
        selectedRole,
      );

      useAuthStore.getState().setUser(userData as unknown as User);
      toast.success(`Welcome! Your ${selectedRole} account is ready.`);

      const nextPath = `/onboarding/${selectedRole}${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`;
      navigate(nextPath, { replace: true });
    } catch (error: any) {
      console.error('[RoleSelectionPage] Failed to complete Google role selection:', error);
      toast.error(error?.message ?? 'Could not complete role selection. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-white">Choose your role</h1>
          <p className="text-slate-500 dark:text-slate-400">
            We need to know whether you are joining as a student or a teacher.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Your Google session is missing. Please sign in again to continue.
          </p>
          <Button className="mt-4 w-full" onClick={() => navigate('/login', { replace: true })}>
            Back to login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-white">Choose your role</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Select the account type that fits how you will use MyTutorMe.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {roleOptions.map((option) => {
          const isSelected = selectedRole === option.role;
          return (
            <button
              key={option.role}
              type="button"
              onClick={() => setSelectedRole(option.role)}
              className={`rounded-2xl border-2 p-5 text-left transition-all duration-200 ${
                isSelected
                  ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10'
                  : 'border-slate-200 bg-white hover:border-primary/40 dark:border-slate-800 dark:bg-slate-900'
              }`}
            >
              <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${isSelected ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                <span className="material-symbols-outlined text-2xl">{option.icon}</span>
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{option.title}</h2>
                <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">{option.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      <Button className="w-full bg-primary hover:bg-primary/90" onClick={handleContinue} disabled={!canContinue} isLoading={isSubmitting}>
        Continue to onboarding
      </Button>
    </div>
  );
};
