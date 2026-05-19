import { Link } from 'react-router-dom';

const freeFeatures = [
  'Access to 2 courses',
  '3 AI tutor queries per day',
  'Basic GPA tracker',
  'Exam practice (limited)',
];

const monthlyFeatures = [
  'Full course library access',
  'Unlimited AI tutor queries',
  'GPA Predictor & Score Simulator',
  '20% off all course purchases',
  '1 guided assignment per month',
  'Offline access (2 courses)',
];

const yearlyFeatures = [
  'Everything in Pro Monthly',
  '5 guided assignments per term',
  'Unlimited offline courses',
  'Priority support',
  'Early access to new features',
];

export const PricingSection = () => {
  return (
    <section className="py-24 bg-slate-50 dark:bg-[#080f1e]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-14">
          <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-3">Pricing</p>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white leading-tight">
            Less than a data plan.<br />Way more value.
          </h2>
          <p className="mt-4 text-slate-500 dark:text-slate-400 text-lg max-w-xl">
            Start free with no card required. Upgrade only when you need more.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

          {/* Free */}
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-8 border border-slate-200 dark:border-slate-700 flex flex-col">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Free</p>
            <div className="mb-1">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white">₦0</span>
            </div>
            <p className="text-sm text-slate-400 mb-8">No card. No expiry. Just start.</p>
            <ul className="space-y-3 mb-10 flex-1 text-sm text-slate-600 dark:text-slate-300">
              {freeFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  </span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              to="/register"
              className="block w-full text-center py-3 px-6 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:border-slate-400 dark:hover:border-slate-500 transition-colors text-sm"
            >
              Get started free
            </Link>
          </div>

          {/* Pro Monthly */}
          <div className="bg-white dark:bg-surface-dark rounded-2xl p-8 border border-slate-200 dark:border-slate-700 flex flex-col">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-5">Pro &middot; Monthly</p>
            <div className="mb-1 flex items-end gap-1.5">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-white">₦4,000</span>
              <span className="text-slate-400 text-sm mb-1">/month</span>
            </div>
            <p className="text-sm text-slate-400 mb-8">&#8776;&#8202;&#8202;₦133/day &mdash; less than a Gala and juice.</p>
            <ul className="space-y-3 mb-10 flex-1 text-sm text-slate-600 dark:text-slate-300">
              {monthlyFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-emerald-500 text-base leading-none shrink-0 mt-0.5">check_circle</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              to="/register"
              className="block w-full text-center py-3 px-6 rounded-xl border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors text-sm"
            >
              Start Pro Monthly
            </Link>
          </div>

          {/* Pro Yearly */}
          <div className="bg-slate-900 dark:bg-white rounded-2xl p-8 flex flex-col relative overflow-hidden shadow-2xl">
            <div className="absolute top-5 right-5 bg-emerald-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
              Best Value
            </div>
            <p className="text-xs font-bold text-emerald-400 dark:text-emerald-600 uppercase tracking-widest mb-5">Pro &middot; Yearly</p>
            <div className="mb-1 flex items-end gap-1.5">
              <span className="text-4xl font-extrabold text-white dark:text-slate-900">₦40,000</span>
              <span className="text-slate-400 dark:text-slate-500 text-sm mb-1">/year</span>
            </div>
            <p className="text-sm text-emerald-400 dark:text-emerald-600 font-semibold mb-8">
              Save ₦8,000 vs monthly billing
            </p>
            <ul className="space-y-3 mb-10 flex-1 text-sm text-slate-300 dark:text-slate-700">
              {yearlyFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-emerald-400 dark:text-emerald-600 text-base leading-none shrink-0 mt-0.5">check_circle</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              to="/register"
              className="block w-full text-center py-3 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold transition-colors text-sm shadow-lg"
            >
              Get Pro Yearly
            </Link>
          </div>

        </div>

        {/* Trust row */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">lock</span>
            Secure payment via Paystack
          </span>
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">cancel</span>
            Cancel anytime
          </span>
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base">school</span>
            Built for Nigerian students
          </span>
        </div>

      </div>
    </section>
  );
};
