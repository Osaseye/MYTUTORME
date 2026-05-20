import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { applyActionCode } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuthStore } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';

type PageState = 'loading' | 'success' | 'error';

export const AuthActionPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // Use getState() inside async callbacks to avoid stale closure issues

  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');

  const [state, setState] = useState<PageState>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (mode !== 'verifyEmail' || !oobCode) {
      setErrorMessage('Invalid or missing verification link. Please request a new one.');
      setState('error');
      return;
    }

    const verify = async () => {
      try {
        await applyActionCode(auth, oobCode);

        // After verification, reload the Firebase Auth user object so
        // auth.currentUser.emailVerified reflects the new status immediately.
        if (auth.currentUser) {
          try { await auth.currentUser.reload(); } catch (_e) { /* non-critical */ }
        }

        // Sync verified status to Firestore — use auth.currentUser (freshly reloaded above)
        // or fall back to the store user. This runs even if the Zustand store was null
        // when the effect closure was captured (slow-network race condition).
        const currentUid = auth.currentUser?.uid ?? useAuthStore.getState().user?.uid;
        if (currentUid) {
          try {
            await updateDoc(doc(db, 'users', currentUid), { emailVerified: true });
          } catch (_e) {
            // non-critical — checkAuth will sync on the next auth state change
          }
        }

        // Sync Zustand using getState() so we always get the latest loaded user,
        // not the stale closure value captured when this effect first ran.
        const latestUser = useAuthStore.getState().user;
        if (latestUser) {
          useAuthStore.getState().setUser({ ...latestUser, emailVerified: true });
        }

        setState('success');
      } catch (err: any) {
        const code: string = err?.code ?? '';
        if (code === 'auth/invalid-action-code' || code === 'auth/expired-action-code') {
          setErrorMessage(
            'This link has expired or already been used. Return to the app and request a new verification email.',
          );
        } else if (code === 'auth/user-disabled') {
          setErrorMessage('Your account has been suspended. Please contact support.');
        } else {
          setErrorMessage('Something went wrong. Please try again or contact support.');
        }
        setState('error');
      }
    };

    verify();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-redirect 3 seconds after success — eliminates the need for the user to click
  // and avoids edge-cases where a stale render prevents the button from working.
  useEffect(() => {
    if (state !== 'success') return;
    setCountdown(3);
    const tick = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    const timer = setTimeout(() => {
      handleContinue();
    }, 3000);
    return () => { clearInterval(tick); clearTimeout(timer); };
  }, [state]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleContinue = () => {
    // Always read the freshest user state at click-time, not a stale closure.
    const currentUser = useAuthStore.getState().user;
    if (!currentUser) {
      navigate('/login', { replace: true });
      return;
    }
    const destination = currentUser.isOnboardingComplete
      ? `/${currentUser.role}/dashboard`
      : currentUser.role === 'teacher'
      ? '/onboarding/teacher'
      : '/onboarding/student';
    navigate(destination, { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center p-4">

      {/* App logo with glow */}
      <div className="relative mb-10 flex flex-col items-center">
        <div className="absolute inset-0 blur-3xl bg-emerald-500/25 rounded-full scale-[2]" />
        <img src="/icon.png" alt="MyTutorMe" className="relative w-20 h-20 drop-shadow-2xl" />
        <span className="relative mt-3 text-lg font-extrabold font-display text-white tracking-tight">
          MyTutorMe
        </span>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-sm rounded-3xl border border-slate-800 shadow-2xl p-8 text-center">

        {/* ── LOADING ── */}
        {state === 'loading' && (
          <div className="py-6">
            <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-9 h-9 text-emerald-400 animate-spin" />
            </div>
            <h1 className="text-2xl font-extrabold font-display text-white mb-2">
              Verifying your email…
            </h1>
            <p className="text-slate-400 text-sm">Just a moment while we confirm your address.</p>
          </div>
        )}

        {/* ── SUCCESS ── */}
        {state === 'success' && (
          <>
            {/* Animated success mark */}
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/30 to-lime-500/20 border border-emerald-500/40 flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9 text-emerald-400" strokeWidth={1.75} />
              </div>
            </div>

            <h1 className="text-3xl font-extrabold font-display text-white mb-3">
              You're verified!
            </h1>
            <p className="text-slate-400 mb-2 leading-relaxed">
              Your <span className="text-emerald-400 font-semibold">MyTutorMe</span> account is now
              active and ready to use.
            </p>
            <p className="text-slate-500 text-sm mb-8">
              Start learning, exploring courses, and reaching your academic goals.
            </p>

            <Button
              onClick={handleContinue}
              className="w-full h-12 text-base font-semibold bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl gap-2 transition-all"
            >
              Continue to your account
              <ArrowRight className="w-4 h-4" />
            </Button>
            <p className="mt-4 text-xs text-slate-600">
              Redirecting automatically in {countdown}s…
            </p>
          </>
        )}

        {/* ── ERROR ── */}
        {state === 'error' && (
          <>
            <div className="w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
              <XCircle className="w-9 h-9 text-red-400" strokeWidth={1.75} />
            </div>

            <h1 className="text-2xl font-extrabold font-display text-white mb-3">
              Link invalid or expired
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed mb-8">{errorMessage}</p>

            <div className="flex flex-col gap-3">
              <Button
                onClick={() => navigate('/verify-email', { replace: true })}
                className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold"
              >
                Request a new link
              </Button>
              <Button
                onClick={() => navigate('/login', { replace: true })}
                variant="outline"
                className="w-full h-11 rounded-xl border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                Back to sign in
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="mt-8 flex items-center gap-4 text-xs text-slate-600">
        <Link to="/privacy" className="hover:text-slate-400 transition-colors">Privacy</Link>
        <span>·</span>
        <Link to="/terms" className="hover:text-slate-400 transition-colors">Terms</Link>
        <span>·</span>
        <a href="mailto:support@mytutorme.org" className="hover:text-slate-400 transition-colors">
          Support
        </a>
      </div>
    </div>
  );
};
