import { Link } from 'react-router-dom';
import allMockup from '../../../assets/landing/all.png';

export const CTASection = () => {
  return (
    <section className="py-20 bg-white dark:bg-[#080f1e] border-t border-slate-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

          {/* Left — copy */}
          <div className="flex-1 text-center lg:text-left">
            <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-4">
              Start today
            </p>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white leading-tight mb-6">
              Your CGPA is not<br />fixed. Neither is<br />your situation.
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg mb-10 max-w-lg mx-auto lg:mx-0">
              MyTutorMe gives you the tools your university does not &mdash; AI tutoring at 2am, a GPA predictor before results come out, and exams that actually match your curriculum.
            </p>

            <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4 justify-center lg:justify-start">
              <Link
                to="/register"
                className="px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-full transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 text-sm w-full sm:w-auto text-center"
              >
                Join for free &mdash; no card needed
              </Link>
              <Link
                to="/register"
                className="px-8 py-4 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-full hover:border-slate-400 transition-colors text-sm w-full sm:w-auto text-center"
              >
                View pricing
              </Link>
            </div>

            <div className="mt-8 inline-flex items-center gap-2 text-sm text-slate-400">
              <span className="material-symbols-outlined text-base">install_mobile</span>
              <span>Works on any phone &mdash; install as an app in one tap, study offline.</span>
            </div>
          </div>

          {/* Right — mockup */}
          <div className="flex-1 flex items-center justify-center lg:justify-end">
            <img
              src={allMockup}
              alt="MyTutorMe on laptop and mobile"
              className="w-full max-w-lg xl:max-w-xl drop-shadow-2xl"
            />
          </div>

        </div>
      </div>
    </section>
  );
};
