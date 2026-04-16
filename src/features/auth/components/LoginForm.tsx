import { useState } from 'react'; 
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { loginSchema, type LoginCredentials } from '../types';
import { loginUser, loginWithGoogle } from '../api/auth';

export const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [suspendedError, setSuspendedError] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginCredentials) => {
    setIsLoading(true);
    setSuspendedError(false);
    try {
      await loginUser(data);
      toast.success('Welcome back!');
    } catch (error: any) {
      if (error.code === 'auth/account-suspended') {
        setSuspendedError(true);
        toast.error('Account Suspended');
      } else {
        const messages: Record<string, string> = {
          'auth/invalid-credential': 'Invalid email or password.',
          'auth/user-not-found': 'Account not found. Please sign up.',
          'auth/wrong-password': 'Incorrect password.',
        };
        toast.error(messages[error.code] ?? 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsOAuthLoading(true);
    setSuspendedError(false);
    try {
      await loginWithGoogle();
      // onAuthStateChanged handles the rest
    } catch (error: any) {
      if (error?.code === 'auth/account-suspended') {
        setSuspendedError(true);
        toast.error('Account Suspended');
      } else if (error?.code === 'auth/user-not-found') {
        toast.error(error.message);
      } else {
        toast.error('Google login failed.');
      }
    } finally {
      setIsOAuthLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-white">Welcome back</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Enter your email to sign in to your account
        </p>
      </div>

      {suspendedError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-lg p-4 flex gap-3 animate-in fade-in slide-in-from-top-2">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-500 shrink-0 mt-0.5" />
          <div className="text-sm">
            <h4 className="font-semibold text-red-800 dark:text-red-400 mb-1">Account Suspended</h4>
            <p className="text-red-700/90 dark:text-red-300/90">
              Your account has been suspended due to severe policy violations. You are no longer able to log in. If you believe this is an error, please contact platform support.
            </p>
          </div>
        </div>
      )}

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
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 dark:text-slate-300">Password</label>
                <Link
                to="/forgot-password"
                className="text-sm font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
                >
                Forgot password?
                </Link>
            </div>
            <div className="relative">
                <Input
                id="password"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
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

        <Button className="w-full bg-primary hover:bg-primary/90" type="submit" isLoading={isLoading}>
          Sign In
        </Button>
      </form>

      <div className="text-center text-sm text-slate-500 dark:text-slate-400">
        Don&apos;t have an account?{' '}
        <Link 
            to="/register" 
            className="font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 transition-colors"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
};
