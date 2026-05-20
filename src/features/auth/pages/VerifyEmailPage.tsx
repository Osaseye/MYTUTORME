import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { reload } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions } from '@/lib/firebase';
import { useAuthStore } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, RefreshCw, Mail } from 'lucide-react';

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
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    const checkVerified = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      await reload(currentUser);
      if (currentUser.emailVerified) {
        clearInterval(intervalId);
        try {
          await updateDoc(doc(db, 'users', currentUser.uid), { emailVerified: true });
        } catch (_e) { /* non-critical */ }
        if (user) setUser({ ...user, emailVerified: true });
        setIsVerified(true);
      }
    };

    checkVerified();
    intervalId = setInterval(checkVerified, 4000);
    return () => clearInterval(intervalId);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Redirect after success flash
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

  if (!isLoading && !user) return <Navigate to="/login" replace />;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
      </div>
    );
  }

  // ── SUCCESS STATE ──
  if (isVerified) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center p-4">
        <div className="relative mb-10 flex flex-col items-center">
          <div className="absolute inset-0 blur-3xl bg-emerald-500/25 rounded-full scale-[2]" />
          <img src="/icon.png" alt="MyTutorMe" className="relative w-20 h-20 drop-shadow-2xl" />
          <span className="relative mt-3 text-lg font-extrabold font-display text-white tracking-tight">
            MyTutorMe
          </span>
        </div>

        <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-sm rounded-3xl border border-slate-800 shadow-2xl p-8 text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/30 to-lime-500/20 border border-emerald-500/40 flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 text-emerald-400" strokeWidth={1.75} />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold font-display text-white mb-3">You're verified!</h1>
          <p className="text-slate-400 mb-4 leading-relaxed">
            Your <span className="text-emerald-400 font-semibold">MyTutorMe</span> account is now active.
          </p>
          <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
            <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
            Setting things up…
          </div>
        </div>
      </div>
    );
  }

  // ── WAITING / HOLDING STATE ──
  return (
    <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center p-4">

      {/* Brand header with glow */}
      <div className="relative mb-10 flex flex-col items-center">
        <div className="absolute inset-0 blur-3xl bg-emerald-500/20 rounded-full scale-[2.5]" />
        <img src="/icon.png" alt="MyTutorMe" className="relative w-20 h-20 drop-shadow-2xl" />
        <span className="relative mt-3 text-lg font-extrabold font-display text-white tracking-tight">
          MyTutorMe
        </span>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-sm rounded-3xl border border-slate-800 shadow-2xl p-8 text-center">

        {/* Animated mail icon */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          {/* Slow pulse ring */}
          <div className="absolute inset-0 rounded-2xl bg-emerald-500/15 animate-pulse" />
          <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-lime-500/10 border border-emerald-500/30 flex items-center justify-center">
            <Mail className="w-9 h-9 text-emerald-400" strokeWidth={1.75} />
          </div>
        </div>

        <h1 className="text-2xl font-extrabold font-display text-white mb-2">
          Check your inbox
        </h1>
        <p className="text-slate-400 text-sm mb-1">We sent a verification link to</p>
        <p className="font-semibold text-emerald-400 mb-5 break-all text-sm">{user?.email}</p>

        <p className="text-sm text-slate-500 leading-relaxed mb-8">
          Click the link in that email to activate your account.
          The link expires in <span className="text-slate-400 font-medium">24&nbsp;hours</span>.
          This page will update automatically once verified.
        </p>

        {/* Resend button */}
        <Button
          onClick={handleResend}
          disabled={isSending || cooldown > 0}
          className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl font-semibold mb-3 transition-all"
        >
          {isSending ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending…</>
          ) : cooldown > 0 ? (
            <><RefreshCw className="w-4 h-4 mr-2" />Resend in {cooldown}s</>
          ) : (
            'Resend verification email'
          )}
        </Button>

        {sendError && (
          <p className="text-xs text-red-400 mb-3">{sendError}</p>
        )}

        <button
          onClick={() => signOut()}
          className="text-sm text-slate-500 hover:text-slate-300 transition-colors underline underline-offset-2"
        >
          Sign out and use a different account
        </button>
      </div>

      {/* Spam notice */}
      <p className="text-center text-xs text-slate-600 mt-5">
        Didn't receive it? Check your spam folder or{' '}
        <a href="mailto:support@mytutorme.org" className="text-emerald-600 hover:text-emerald-500 transition-colors">
          contact support
        </a>
        .
      </p>
    </div>
  );
};
