import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/features/auth/hooks/useAuth';

const adminLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type AdminLoginCredentials = z.infer<typeof adminLoginSchema>;

export const AdminLoginPage = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    // Redirect if already logged in as admin
    useEffect(() => {
        if (isAuthenticated && user?.role === 'admin') {
            navigate('/admin/dashboard', { replace: true });
        }
    }, [isAuthenticated, user, navigate]);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<AdminLoginCredentials>({
        resolver: zodResolver(adminLoginSchema),
    });

    const onSubmit = async (data: AdminLoginCredentials) => {
        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, data.email, data.password);
            toast.success('Admin access granted');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error(error);
            toast.error('Invalid admin credentials');
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full space-y-6">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold font-display text-slate-900 dark:text-white">Admin Portal</h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Authorized personnel only
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 dark:text-slate-300">Email Address</label>
                    <Input
                        id="email"
                        {...register('email')}
                        placeholder="admin@mytutorme.com"
                        type="email"
                        autoCapitalize="none"
                        autoComplete="email"
                        autoCorrect="off"
                    />
                    {errors.email && <p className="text-sm font-medium text-red-500">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700 dark:text-slate-300">Password</label>
                    <div className="relative">
                        <Input
                            id="password"
                            {...register('password')}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="��������"
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 focus:outline-none"
                        >
                            <span className="material-symbols-outlined text-lg">
                                {showPassword ? 'visibility_off' : 'visibility'}
                            </span>
                        </button>
                    </div>
                    {errors.password && <p className="text-sm font-medium text-red-500">{errors.password.message}</p>}
                </div>

                <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Authenticating...
                        </>
                    ) : (
                        'Access Portal'
                    )}
                </Button>
            </form>

            <div className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
                 Are you a Student or Teacher?{' '}
                <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 transition-colors">
                    Back to portal
                </Link>
            </div>
        </div>
    );
};
