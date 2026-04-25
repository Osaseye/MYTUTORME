import { useState } from 'react';
import { X, Globe, Copy, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InAppBrowserGuardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InAppBrowserGuard = ({ isOpen, onClose }: InAppBrowserGuardProps) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = window.location.href;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback for browsers where clipboard API isn't available
      const textArea = document.createElement('textarea');
      textArea.value = currentUrl;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="iab-guard-title"
    >
      <div
        className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative top accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-emerald-400 to-secondary" />

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6 pt-8">
          {/* Icon */}
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 dark:bg-primary/20">
            <Globe className="h-8 w-8 text-primary" />
          </div>

          {/* Heading */}
          <h2
            id="iab-guard-title"
            className="text-center text-xl font-bold font-display text-slate-900 dark:text-white mb-2"
          >
            Open in your browser
          </h2>

          {/* Description */}
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            Google Sign‑In doesn&apos;t work inside apps like Instagram or Facebook. Open MyTutorMe in{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">Chrome or Safari</span>{' '}
            to continue with Google.
          </p>

          {/* Steps */}
          <div className="mb-6 space-y-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              How to open in your browser
            </p>
            {[
              { icon: '⋯', text: 'Tap the menu ( ⋯ or ⋮ ) in the top corner of this screen' },
              { icon: '🌐', text: 'Select "Open in browser" or "Open in Chrome / Safari"' },
              { icon: '✓',  text: 'Then tap "Continue with Google"' },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                  {i + 1}
                </span>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-snug">{step.text}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-white gap-2"
              onClick={handleCopyLink}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Link copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy page link
                </>
              )}
            </Button>

            <button
              onClick={onClose}
              className="w-full flex items-center justify-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors py-1"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Dismiss — use email instead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
