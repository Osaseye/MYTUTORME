import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { registerSchema, type RegisterCredentials } from '../types';
import { useAuthStore } from '../hooks/useAuth';

export const RegisterForm = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
      // await registerUser(data);
      console.log('Registering with:', data);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update auth state (mock)
      const mockUser = {
        uid: 'mock-uid', 
        email: data.email, 
        role: data.role as 'student' | 'teacher', 
        displayName: data.name,
        createdAt: Date.now(),
        photoURL: '',
      };
      
      // We need to set the user in the global store so ProtectedRoute sees them as authenticated
      useAuthStore.getState().setUser(mockUser);
      
      toast.success('Account created successfully!');
      
      // Redirect to onboarding based on role
      if (data.role === 'student') {
        navigate('/onboarding/student');
      } else {
        navigate('/onboarding/teacher');
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-white">Create an account</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Enter your details below to create your account
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" type="button" className="w-full">
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
          Google
        </Button>
        <Button variant="outline" type="button" className="w-full">
          <svg className="mr-2 h-4 w-4 fill-current" viewBox="0 0 24 24">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.78 1.18-.19 2.31-.89 3.51-.84 1.54.06 2.68.74 3.37 1.74-2.92 1.51-2.39 5.86.3 6.69-.15.42-.31.83-.51 1.21-.6 1.19-1.25 2.38-1.75 3.39zm-3.88-16.7c.39-2.32 2.15-3.52 4.19-3.58.4 2.54-1.92 4.67-4.19 3.58z" />
          </svg>
          Apple
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
  );
};
