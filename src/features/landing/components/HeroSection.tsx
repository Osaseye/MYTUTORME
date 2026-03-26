import { Link } from 'react-router-dom';

export const HeroSection = () => {
    return (
      <section className="relative pt-20 lg:pt-28 pb-16 overflow-hidden flex flex-col justify-center">
        <div className="absolute inset-0 z-0 grid-bg-complex opacity-100 pointer-events-none"></div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] filter pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[600px] h-[600px] bg-lime-500/10 rounded-full blur-[120px] filter pointer-events-none"></div>
  
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 lg:mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center lg:items-start xl:items-center">
            
            {/* Left Column: Text Content */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left mt-8 lg:mt-0 xl:max-w-xl">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-display font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 lg:mb-8 leading-[1.1]">
                Master Your <br className="hidden lg:block" /> Future with <br className="hidden md:block lg:hidden" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-emerald-400 to-teal-500 dark:from-emerald-400 dark:via-teal-300 dark:to-emerald-500">
                  AI-Powered
                </span>{' '}
                Tutoring
              </h1>
      
              <p className="mt-2 max-w-xl text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-8 sm:mb-10 leading-relaxed font-medium px-4 lg:px-0">
                Curriculum-aligned 24/7 academic support to boost your GPA. Personalized learning paths designed for ambitious students.
              </p>
      
              <div className="flex flex-col w-full sm:w-auto sm:flex-row gap-4 justify-center lg:justify-start mb-8 sm:mb-12 px-4 sm:px-0">
                <Link
                  to="/register"
                  className="group inline-flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4 border border-transparent text-base sm:text-lg font-bold rounded-full text-white bg-primary hover:bg-primary-dark transition-all shadow-glow-primary hover:shadow-emerald-500/40 transform hover:-translate-y-1"
                >
                  Start Learning Now
                  <span className="material-symbols-outlined ml-2 group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </Link>
                <a
                  href="#platform"
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3.5 sm:py-4 border border-slate-200 dark:border-slate-700 text-base sm:text-lg font-bold rounded-full text-slate-700 dark:text-white bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm hover:bg-white dark:hover:bg-slate-800 transition-all hover:border-slate-300 dark:hover:border-slate-600 shadow-sm hover:shadow-lg"
                >
                  Explore Platform
                </a>
              </div>
            </div>
    
            {/* Right Column: Image & Floating Stats */}
            <div className="relative w-full flex justify-center lg:justify-end mt-10 lg:mt-0">
              <div className="relative w-full max-w-md lg:max-w-lg xl:max-w-xl">
                {/* Visual Glow behind image */}
                <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/30 to-teal-500/30 rounded-full blur-[80px]"></div>
                
                {/* Main Subject Image */}
                <img
                  src="/hero-student.png"
                  alt="Student learning with AI"
                  className="relative z-10 w-full h-auto object-contain drop-shadow-2xl max-h-[600px] lg:scale-110 xl:scale-125 origin-bottom"
                />

              </div>
            </div>
          </div>
  
          {/* Trusted by Nigerian Institutions */}
          <div className="mt-24 lg:mt-32 w-full text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-widest mb-8">
              Trusted by students from
            </p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
              {['Babcock University', 'New Horizon', 'Adeleke Univeristy', 'Bells University'].map((uni) => (
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
