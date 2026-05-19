import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { reload } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions } from '@/lib/firebase';
import { useAuthStore } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle, Loader2, RefreshCw } from 'lucide-react';

export const VerifyEmailPage = () => {
  const { user, isLoading, setUser, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [isVerified, setIsVerified] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [sendError, setSendError] = useState('');

  // If user already verified (e.g. Google OAuth or prior verification), skip this page
  useEffect(() => {
    if (user?.emailVerified) {
      const destination = user.isOnboardingComplete
        ? `/${user.role}/dashboard`
        : user.role === 'teacher'
        ? '/onboarding/teacher'
        : '/onboarding/student';
      navigate(destination, { replace: true });
    }
  }, [user, navigate]);

  // Poll Firebase Auth to detect when the user clicks their verification email link.
  // Also runs immediately on mount to catch redirect-back from Firebase's action handler.
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    const checkVerified = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      await reload(currentUser);
      if (currentUser.emailVerified) {
        clearInterval(intervalId);
        // Sync verified status to Firestore
        try {
          await updateDoc(doc(db, 'users', currentUser.uid), { emailVerified: true });
        } catch (_e) {
          // non-critical
        }
        // Sync local Zustand state so guards re-evaluate
        if (user) setUser({ ...user, emailVerified: true });
        setIsVerified(true);
      }
    };

    checkVerified();
    intervalId = setInterval(checkVerified, 4000);
    return () => clearInterval(intervalId);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Redirect to onboarding / dashboard after showing success screen
  useEffect(() => {
    if (!isVerified || !user) return;
    const timer = setTimeout(() => {
      const destination = user.isOnboardingComplete
        ? `/${user.role}/dashboard`
        : user.role === 'teacher'
        ? '/onboarding/teacher'
        : '/onboarding/student';
      navigate(destination, { replace: true });
    }, 2500);
    return () => clearTimeout(timer);
  }, [isVerified, user, navigate]);

  // 60-second cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (isSending || cooldown > 0 || !user) return;
    setIsSending(true);
    setSendError('');
    try {
      const sendVerificationEmail = httpsCallable(functions, 'sendVerificationEmail');
      await sendVerificationEmail({ uid: user.uid, email: user.email, name: user.displayName });
      setCooldown(60);
    } catch (err: any) {
      setSendError(err?.message || 'Failed to send. Please try again shortly.');
    } finally {
      setIsSending(false);
    }
  };

  // No session at all → send to login
  if (!isLoading && !user) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B1120]">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  // Success state
  if (isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B1120] p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white mb-3">
            Email verified!
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            Your account is now active. Setting things up…
          </p>
          <Loader2 className="w-5 h-5 animate-spin text-emerald-500 mx-auto" />
        </div>
      </div>
    );
  }

  // Waiting / holding state
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0B1120] p-4">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-lg p-8 text-center">

          {/* Icon */}
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-emerald-600" />
          </div>

          <h1 className="text-2xl font-extrabold font-display text-slate-900 dark:text-white mb-3">
            Check your inbox
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-1 text-sm">
            We sent a verification link to
          </p>
          <p className="font-semibold text-slate-900 dark:text-slate-100 mb-6 break-all text-sm">
            {user?.email}
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mb-8 leading-relaxed">
            Click the link in the email to activate your account.
            The link expires in <span className="font-medium">24 hours</span>.
          </p>

          {/* Resend button */}
          <Button
            onClick={handleResend}
            disabled={isSending || cooldown > 0}
            className="w-full mb-3"
          >
            {isSending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending…</>
            ) : cooldown > 0 ? (
              <><RefreshCw className="w-4 h-4 mr-2" />Resend in {cooldown}s</>
            ) : (
              <><RefreshCw className="w-4 h-4 mr-2" />Resend verification email</>
            )}
          </Button>

          {sendError && (
            <p className="text-sm text-red-500 mb-3">{sendError}</p>
          )}

          {/* Sign out */}
          <button
            onClick={() => signOut()}
            className="text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline underline-offset-2 transition-colors"
          >
            Sign out and use a different account
          </button>
        </div>

        {/* Help text */}
        <p className="text-center text-xs text-slate-400 mt-5">
          Didn't receive it? Check your spam folder or{' '}
          <a href="mailto:support@mytutorme.org" className="text-emerald-600 hover:underline">
            contact support
          </a>
          .
        </p>
      </div>
    </div>
  );
};
