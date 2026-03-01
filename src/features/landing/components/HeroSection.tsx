export const HeroSection = () => {
    return (
      <section className="relative pt-32 pb-20 overflow-hidden min-h-screen flex flex-col justify-center">
        <div className="absolute inset-0 z-0 grid-bg-complex opacity-100 pointer-events-none"></div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] filter pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[600px] h-[600px] bg-lime-500/10 rounded-full blur-[120px] filter pointer-events-none"></div>
  
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
  
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-extrabold tracking-tight text-slate-900 dark:text-white mb-8 leading-[1.1]">
            Master Your Future with <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-emerald-400 to-teal-500 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-500">
              AI-Powered
            </span>{' '}
            Tutoring
          </h1>
  
          <p className="mt-2 max-w-2xl text-xl text-slate-600 dark:text-slate-400 mb-12 leading-relaxed font-medium">
            Curriculum-aligned 24/7 academic support to boost your GPA. Personalized learning paths designed for ambitious students.
          </p>
  
          <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto justify-center mb-20">
            <a
              href="#"
              className="group inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-full text-white bg-primary hover:bg-primary-dark transition-all shadow-glow-primary hover:shadow-emerald-500/40 transform hover:-translate-y-1"
            >
              Start Learning Now
              <span className="material-symbols-outlined ml-2 group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center px-8 py-4 border border-slate-200 dark:border-slate-700 text-lg font-bold rounded-full text-slate-700 dark:text-white bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all hover:border-slate-300 dark:hover:border-slate-600 shadow-sm hover:shadow-lg"
            >
              Explore Platform
            </a>
          </div>
  
          {/* Dashboard Preview */}
          <div className="relative w-full max-w-5xl mx-auto floating-dashboard perspective-1000 mt-20">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-lime-500 rounded-[2.5rem] blur opacity-20 dark:opacity-30"></div>
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl bg-slate-900 border border-slate-700/50">
              <div className="h-10 bg-slate-800/80 backdrop-blur border-b border-slate-700 flex items-center px-4 gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="mx-auto w-1/3 h-5 bg-slate-700/50 rounded-full"></div>
              </div>
              <div className="relative block">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKeSW_EE_AVSc-mUWeEtE3CDmxrqFBgYKHxEGnv6KwyM59qACF5DtIoZTtp2NqCeAqFMj856WMLOqLjpnuMfJijkyc6LHsIIJWckrDhkUk_DQZ7B9-CdQsAxj9Rdd0Xa3jKr0MGXbgHIz1V42VWTD5cFj2HkPuXqvwB7cF_3dH_xlP0NGLSlgvs1xti_iAs7NGjthy1MYsaCyFVBD1otrxSxs-R_32Teqidikvt2maO5hAMpZLqPK8Tyc3r_7_yRDC3Dfuzf4CRpA"
                  alt="Students using MyTutorMe AI platform on laptops"
                  className="w-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
                
                {/* Float Element 1 */}
                <div className="absolute top-1/4 right-1/4 md:right-32 glass-panel p-4 rounded-xl shadow-xl border border-white/10 animate-[bounce_6s_infinite] backdrop-blur-md bg-slate-900/60 hidden md:block">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                    <span className="text-xs font-mono text-emerald-300">AI_NODE_ACTIVE</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-1.5 w-32 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-3/4"></div>
                    </div>
                    <div className="h-1.5 w-24 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-1/2"></div>
                    </div>
                  </div>
                </div>
  
                {/* Float Element 2 */}
                <div className="absolute bottom-12 left-6 md:left-12 glass-panel p-5 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 flex items-center gap-4 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                  <div className="bg-gradient-to-br from-emerald-400 to-green-600 p-3 rounded-xl shadow-lg shadow-emerald-500/20 text-white">
                    <span className="material-symbols-outlined text-2xl">school</span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider mb-1">
                      Concept Mastery
                    </p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">94%</p>
                      <span className="text-xs font-bold text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded">
                        +12%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
      {/* Trusted by Nigerian Institutions */}
          <div className="mt-24 w-full">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-widest mb-8">
              Trusted by students from
            </p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
              {['Babcock University', 'Preston', 'Ace Univeristy', '    LangCenter'].map((uni) => (
                <div key={uni} className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-3xl text-emerald-600 dark:text-emerald-400">account_balance</span>
                  <span className="font-display font-bold text-xl text-slate-700 dark:text-slate-300">{uni}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  };
