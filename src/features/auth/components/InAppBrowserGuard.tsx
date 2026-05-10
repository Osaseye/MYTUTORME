import { WifiOff } from 'lucide-react';

export const InAppBrowserGuard = () => (
  <div className="w-full bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/5 rounded-2xl shadow-sm px-4 py-3.5 flex items-center gap-3.5">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
      <WifiOff className="h-4 w-4 text-emerald-500" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
        Google Sign‑In temporarily unavailable
      </p>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
        Please use your email and password to sign in below.
      </p>
    </div>
  </div>
);
