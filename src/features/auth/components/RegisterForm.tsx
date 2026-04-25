import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { registerSchema, type RegisterCredentials } from '../types';
import { registerUser, registerWithGoogle } from '../api/auth';
import { InAppBrowserGuard } from './InAppBrowserGuard';

export const RegisterForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showBrowserGuard, setShowBrowserGuard] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch
  } = useForm<RegisterCredentials>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'student'
    }
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterCredentials) => {
    setIsLoading(true);
    try {
      await registerUser(data);
      toast.success('Account created! Let\'s set up your profile.');
    } catch (error: any) {
      const messages: Record<string, string> = {
        'auth/email-already-in-use': 'This email is already registered.',
        'auth/invalid-email': 'Invalid email address.',
        'auth/weak-password': 'Password is too weak.',
      };
      toast.error(messages[error.code] ?? 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsOAuthLoading(true);
    try {
      console.log('[RegisterForm] Starting Google sign-up with role:', selectedRole);
      await registerWithGoogle(selectedRole);
      // onAuthStateChanged handles the rest
      console.log('[RegisterForm] Google sign-up call completed, waiting for auth state change');
      toast.success('Signing up with Google...', { description: 'Please wait while we set up your account.' });
    } catch (error: any) {
      console.error('[RegisterForm] Google sign-up error:', error);
      const messages: Record<string, string> = {
        'auth/popup-closed-by-user': 'Google sign-up was cancelled. Please try again.',
        'auth/cancelled-popup-request': 'Google sign-up is already in progress.',
        'auth/account-suspended': 'Your account has been suspended.',
        'auth/user-not-found': error.message,
      };
      if (error?.code === 'auth/disallowed-useragent') {
        setShowBrowserGuard(true);
      } else {
        const errorMessage = messages[error?.code] ?? error?.message ?? 'Google sign-up failed. Please try again.';
        console.log('[RegisterForm] Showing error toast:', errorMessage);
        toast.error(errorMessage);
      }
      setIsOAuthLoading(false);
    }
  };

  return (
    <>
    <InAppBrowserGuard isOpen={showBrowserGuard} onClose={() => setShowBrowserGuard(false)} />
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-white">Create an account</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Enter your details below to create your account
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <Button
          variant="outline"
          type="button"
          className="w-full"
          onClick={handleGoogleLogin}
          isLoading={isOAuthLoading}
          disabled={isOAuthLoading || isLoading}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200 dark:border-slate-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-surface-light dark:bg-[#0f172a] px-2 text-slate-500">
            Or continue with
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Role Selection */}
        <div className="grid grid-cols-2 gap-4 mb-2">
            <button
                type="button"
                onClick={() => setValue('role', 'student')}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    selectedRole === 'student' 
                    ? 'border-primary bg-primary/5 text-primary' 
                    : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
                }`}
            >
                <span className="material-symbols-outlined text-2xl">school</span>
                <span className="font-bold text-sm">Student</span>
            </button>
            <button
                type="button"
                onClick={() => setValue('role', 'teacher')}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                    selectedRole === 'teacher' 
                    ? 'border-primary bg-primary/5 text-primary' 
                    : 'border-slate-200 dark:border-slate-700 hover:border-primary/50'
                }`}
            >
                <span className="material-symbols-outlined text-2xl">person_apron</span>
                <span className="font-bold text-sm">Teacher</span>
            </button>
        </div>

        <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 dark:text-slate-300">Full Name</label>
            <Input
            id="name"
            placeholder="John Doe"
            autoCapitalize="words"
            autoCorrect="off"
            {...register('name')}
            />
            {errors.name && <p className="text-sm font-medium text-red-500">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 dark:text-slate-300">Email</label>
            <Input
            id="email"
            placeholder="m@example.com"
            type="email"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect="off"
            {...register('email')}
            />
            {errors.email && <p className="text-sm font-medium text-red-500">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 dark:text-slate-300">Password</label>
            <div className="relative">
                <Input
                id="password"
                placeholder="Create a password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                {...register('password')}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                    <span className="material-symbols-outlined text-lg">
                        {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                </button>
            </div>
            {errors.password && <p className="text-sm font-medium text-red-500">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 dark:text-slate-300">Confirm Password</label>
            <div className="relative">
                <Input
                id="confirmPassword"
                placeholder="Confirm your password"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                {...register('confirmPassword')}
                />
                <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                    <span className="material-symbols-outlined text-lg">
                        {showConfirmPassword ? 'visibility_off' : 'visibility'}
                    </span>
                </button>
            </div>
            {errors.confirmPassword && <p className="text-sm font-medium text-red-500">{errors.confirmPassword.message}</p>}
        </div>

        <Button className="w-full bg-primary hover:bg-primary/90" type="submit" isLoading={isLoading}>
          Create Account
        </Button>
      </form>

      <div className="text-center text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <Link 
            to="/login" 
            className="font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 transition-colors"
        >
          Sign in
        </Link>
      </div>
    </div>
    </>
  );
};
