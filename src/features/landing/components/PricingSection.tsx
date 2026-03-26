import { Link } from 'react-router-dom';

export const PricingSection = () => {
    return (
      <section className="py-24 bg-background-light dark:bg-background-dark relative overflow-hidden">
        <div className="absolute inset-0 grid-bg-complex opacity-50 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-6">
              Simple, Transparent Pricing
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Invest in your future with affordable plans designed for students.
            </p>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
            
            {/* Free Plan */}
            <div className="bg-white dark:bg-surface-dark rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col h-full md:h-[90%]">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Free Access</h3>
                <p className="text-sm text-slate-500 mt-2">Perfect for getting started</p>
              </div>
              <div className="mb-6">
                <span className="text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">₦0</span>
                <span className="text-slate-500 font-medium">/month</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <span className="material-symbols-outlined text-emerald-500 text-xl">check_circle</span>
                  Access to 2 courses max
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <span className="material-symbols-outlined text-emerald-500 text-xl">check_circle</span>
                  5 AI queries per day
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                  <span className="material-symbols-outlined text-emerald-500 text-xl">check_circle</span>
                  Basic GPA summary
                </li>
              </ul>
              <Link
                to="/register"
                className="w-full block text-center py-4 px-6 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Get Started Free
              </Link>
            </div>
  
            {/* Pro Monthly Plan */}
            <div className="bg-white dark:bg-surface-dark rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 flex flex-col h-full">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Pro Monthly</h3>
                <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
                  Flexible month-to-month
                </p>
              </div>
              <div className="mb-6">
                <span className="text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">₦4,000</span>
                <span className="text-slate-500 font-medium">/month</span>
              </div>
              <ul className="space-y-4 mb-10 flex-1">
                {[
                  'Full course library access',
                  'Unlimited AI Tutor queries',
                  'GPA Predictor & Simulator',
                  '1 guided assignment/month',
                  'Offline mode (2 courses)',
                ].map((feat) => (
                  <li key={feat} className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-200">
                    <div className="bg-emerald-100 dark:bg-emerald-900/50 rounded-full p-0.5">
                      <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-sm">
                        check
                      </span>
                    </div>
                     {feat}
                  </li>
                ))}
              </ul>
              <Link
                to="/register"
                className="w-full block text-center py-4 px-6 rounded-xl border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 dark:border-emerald-500/50 font-bold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
              >
                Choose Monthly
              </Link>
            </div>

            {/* Pro Yearly Plan */}
            <div className="metallic-border rounded-3xl p-1 shadow-2xl relative transform md:scale-105">
              <div className="bg-white dark:bg-surface-dark rounded-[1.3rem] p-8 h-full flex flex-col relative overflow-hidden">
                <div className="absolute -right-12 top-6 bg-emerald-500 text-white text-xs font-bold px-12 py-1 rotate-45 shadow-sm uppercase tracking-wider">
                  Best Value
                </div>
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Pro Yearly</h3>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2 font-medium">
                    Save ₦8,000 annually
                  </p>
                </div>
                <div className="mb-6">
                  <span className="text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">₦40,000</span>
                  <span className="text-slate-500 font-medium">/year</span>
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  {[
                    'Everything in Pro Monthly',
                    '5 guided assignments/term',
                    'Priority support',
                  ].map((feat) => (
                    <li key={feat} className="flex items-center gap-3 text-sm font-medium text-slate-700 dark:text-slate-200">
                      <div className="bg-emerald-100 dark:bg-emerald-900/50 rounded-full p-0.5">
                        <span className="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-sm">
                          check
                        </span>
                      </div>
                       {feat}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className="w-full block text-center py-4 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold transition-all shadow-glow-primary hover:shadow-lg transform active:scale-95"
                >
                  Upgrade to Yearly
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };
