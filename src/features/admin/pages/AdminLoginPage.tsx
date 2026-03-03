import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ShieldCheck, Loader2, Eye, EyeOff, UserPlus } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useEffect } from 'react';

const adminLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type AdminLoginCredentials = z.infer<typeof adminLoginSchema>;

export const AdminLoginPage = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    
    // Redirect if already logged in as admin
    useEffect(() => {
        if (isAuthenticated && user?.role === 'admin') {
            navigate('/admin/dashboard', { replace: true });
        }
    }, [isAuthenticated, user, navigate]);

    const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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
            
            // Wait for auth state to update via listener (handled by useEffect above)
            // But we can also check immediate result if needed, though role is in Firestore
            
            toast.success('Admin access granted');
            // navigate will happen automatically via useEffect when auth state updates
        } catch (error: any) {
            console.error(error);
            toast.error('Invalid admin credentials');
            setIsLoading(false); // Only set loading false on error
        }
        // Do not set loading to false on success to prevent UI from re-rendering login form momentarily
    };

    const handleCreateDemoAdmin = async () => {
        setIsCreatingAdmin(true);
        const email = "admin@mytutorme.com";
        const password = "password123";

        try {
            // 1. Create Auth User
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
             const user = userCredential.user;

            // 2. Create Firestore Document
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                email: user.email!,
                displayName: "Admin User",
                role: "admin",
                createdAt: Date.now(),
            });

            toast.success('Admin created! Use admin@mytutorme.com / password123');
        } catch (error: any) {
            console.error('Create Admin Error:', error);
            if (error.code === 'auth/email-already-in-use') {
                 // Even if auth exists, try to ensure Firestore doc exists
                 try {
                    // Try to sign in to get the UID (this might fail if password differs, but for demo it's hardcoded)
                    const signInResult = await signInWithEmailAndPassword(auth, email, password);
                    const user = signInResult.user;
                    
                    // Force write the admin doc again just in case it was missing
                    await setDoc(doc(db, 'users', user.uid), {
                        uid: user.uid,
                        email: user.email!,
                        displayName: "Admin User",
                        role: "admin", 
                        createdAt: Date.now(),
                    }, { merge: true });
                    
                    toast.info('Admin account exists & profile updated. Logging you in...');
                    // The useEffect will pick up the auth state change and redirect
                 } catch (innerError) {
                     console.error('Could not fix admin profile', innerError);
                     toast.info('Demo admin auth exists. Try logging in with admin@mytutorme.com / password123');
                 }
            } else if (error.code === 'auth/configuration-not-found' || error.code === 'auth/operation-not-allowed') {
                 toast.error('Error: Email/Password login is not enabled.', {
                    description: 'Please go to Firebase Console > Authentication > Sign-in method and enable "Email/Password".',
                    duration: 10000,
                 });
            } else {
                toast.error('Failed to create demo admin: ' + error.message);
            }
        } finally {
            setIsCreatingAdmin(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-8">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Portal</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Authorized personnel only</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                        <Input
                            {...register('email')}
                            placeholder="admin@mytutorme.com"
                            type="email"
                            className="bg-slate-50 dark:bg-slate-800"
                        />
                        {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                        <div className="relative">
                            <Input
                                {...register('password')}
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                className="bg-slate-50 dark:bg-slate-800 pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                    </div>

                    <Button 
                        type="submit" 
                        className="w-full bg-slate-900 hover:bg-slate-800 text-white mt-4"
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

                    <Button 
                        type="button"
                        variant="outline"
                        className="w-full mt-2"
                        disabled={isLoading || isCreatingAdmin}
                        onClick={handleCreateDemoAdmin}
                    > 
                         <UserPlus className="mr-2 h-4 w-4" />
                         {isCreatingAdmin ? "Creating..." : "Create Demo Admin"}
                    </Button>
                </form>

                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-xs text-slate-400">
                        Restricted area. All activities are monitored.
                    </p>
                </div>
            </div>
        </div>
    );
};
