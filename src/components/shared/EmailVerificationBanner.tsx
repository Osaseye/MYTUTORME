import { useState, useEffect } from 'react';
import { X, Mail, Loader2 } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { isLegacyUser } from '@/config/emailVerification';
import { Button } from '@/components/ui/button';

const DISMISSED_KEY = 'emailVerificationBannerDismissed';

export const EmailVerificationBanner = () => {
  const { user } = useAuth();
  const [isDismissed, setIsDismissed] = useState(
    () => localStorage.getItem(DISMISSED_KEY) === 'true',
  );
  const [isSending, setIsSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Only show to legacy users who haven't verified yet.
  // Google OAuth users already have emailVerified = true so they're naturally excluded.
  if (!user || user.emailVerified || !isLegacyUser(user.createdAt) || isDismissed) return null;

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, 'true');
    setIsDismissed(true);
  };

  const handleSend = async () => {
    if (isSending || cooldown > 0) return;
    setIsSending(true);
    try {
      const sendVerificationEmail = httpsCallable(functions, 'sendVerificationEmail');
      await sendVerificationEmail({ uid: user.uid, email: user.email, name: user.displayName });
      setSent(true);
      setCooldown(60);
    } catch (_err) {
      // Silently fail — non-blocking banner
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex items-start gap-3 p-4 mb-6 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
      <Mail className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
          Your email isn't verified
        </p>
        <p className="text-sm text-amber-700 dark:text-amber-300 mt-0.5">
          {sent
            ? 'Verification email sent — check your inbox.'
            : 'Secure your account by verifying your email address.'}
        </p>
        {!sent && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleSend}
            disabled={isSending || cooldown > 0}
            className="mt-2 h-8 text-xs border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-800/30 bg-transparent"
          >
            {isSending ? (
              <>
                <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                Sending…
              </>
            ) : cooldown > 0 ? (
              `Resend in ${cooldown}s`
            ) : (
              'Send verification email'
            )}
          </Button>
        )}
      </div>
      <button
        onClick={handleDismiss}
        className="text-amber-400 hover:text-amber-600 dark:hover:text-amber-300 transition-colors shrink-0"
        aria-label="Dismiss email verification banner"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
