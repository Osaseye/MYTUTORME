import { Link } from 'react-router-dom';

export const FeatureShowcaseSection = () => {
    return (
      <section className="py-24 bg-slate-50 dark:bg-[#0B1120] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-3">
              Inside the Platform
            </h2>
            <h3 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-6">
              The Complete System to <span className="text-emerald-600 dark:text-emerald-400 underline decoration-4 decoration-emerald-200 dark:decoration-emerald-900 underline-offset-4">Stay Ahead</span>
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Stop switching between 5 different apps. We combined smart scheduling, AI tutoring, and real human experts into one seamless dashboard.
            </p>
          </div>
  
          {/* Feature 1: Student Dashboard & AI */}
          <div className="flex flex-col lg:flex-row items-center gap-12 mb-24">
            <div className="lg:w-1/2">
              <h4 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-4">
                Your Personal Command Center
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-lg mb-6 leading-relaxed">
                Connect your curriculum, organize your notes, and let the AI generate practice exams tailored to exactly what you need to know. Never feel lost or unprepared again.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <span className="material-symbols-outlined text-emerald-500 mr-3">check_circle</span>
                  <span className="text-slate-700 dark:text-slate-300">Custom Study Plans</span>
                </li>
                <li className="flex items-start">
                  <span className="material-symbols-outlined text-emerald-500 mr-3">check_circle</span>
                  <span className="text-slate-700 dark:text-slate-300">Predictive Score Tracking</span>
                </li>
                <li className="flex items-start">
                  <span className="material-symbols-outlined text-emerald-500 mr-3">check_circle</span>
                  <span className="text-slate-700 dark:text-slate-300">Interactive Flashcards</span>
                </li>
              </ul>
            </div>
            <div className="lg:w-1/2 w-full">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 aspect-[4/3] flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20"></div>
                <div className="text-center p-8 z-10">
                  <span className="material-symbols-outlined text-emerald-500/50 mb-4 block" style={{ fontSize: '4rem' }}>dashboard</span>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Student Dashboard UI Mockup</p>
                </div>
              </div>
            </div>
          </div>
  
          {/* Feature 2: Teacher Hub (Live Tutors) */}
          <div className="flex flex-col lg:flex-row-reverse items-center gap-12 mb-24">
            <div className="lg:w-1/2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-semibold text-sm mb-4">
                <span className="material-symbols-outlined text-sm">stars</span> Available Now
              </div>
              <h4 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-4">
                Live Expert Tutors
              </h4>
              <p className="text-slate-600 dark:text-slate-400 text-lg mb-6 leading-relaxed">
                AI is amazing, but sometimes you just need a real human to explain it. Our integrated Teacher Hub connects you with vetted experts instantly when an AI explanation isn't cutting it.
              </p>
              <Link to="/register" className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline inline-flex items-center">
                Explore the Teacher Hub <span className="material-symbols-outlined text-sm ml-1">arrow_forward</span>
              </Link>
            </div>
            <div className="lg:w-1/2 w-full">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 aspect-[4/3] flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20"></div>
                <div className="text-center p-8 z-10">
                  <span className="material-symbols-outlined text-amber-500/50 mb-4 block" style={{ fontSize: '4rem' }}>video_camera_front</span>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Live Tutor Session UI Mockup</p>
                </div>
              </div>
            </div>
          </div>
  
          {/* Feature 3: Offline / PWA App */}
          <div className="p-8 md:p-12 rounded-[2rem] bg-gradient-to-br from-emerald-600 to-teal-800 text-white relative overflow-hidden shadow-glow-primary">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/10 rounded-full blur-[80px]"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-2/3">
                <h4 className="text-3xl font-display font-bold mb-4">
                  Campus WiFi acting up again?
                </h4>
                <p className="text-emerald-50 text-lg mb-6">
                  We built MyTutorMe as a Progressive Web App (PWA). It installs directly to your phone's home screen, loads instantly, and lets you access your offline notes and tasks even when the network fails.
                </p>
                <button className="bg-white text-emerald-700 font-bold py-3 px-6 rounded-full hover:bg-emerald-50 transition-colors shadow-lg">
                  Install the App Today
                </button>
              </div>
              <div className="md:w-1/3 flex justify-center">
                <span className="material-symbols-outlined text-white/30" style={{ fontSize: '8rem' }}>wifi_off</span>
              </div>
            </div>
          </div>
  
        </div>
      </section>
    );
};
