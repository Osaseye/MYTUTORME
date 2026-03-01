export const StatsSection = () => {
    return (
      <section className="py-24 bg-white dark:bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-3">
              Why Choose MyTutorMe?
            </h2>
            <p className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-6">
              Everything you need to{' '}
              <span className="text-emerald-600 dark:text-emerald-400 underline decoration-4 decoration-emerald-200 dark:decoration-emerald-900 underline-offset-4">
                ace your exams
              </span>
            </p>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
              Harness the power of AI to learn faster, retain more, and perform better with our integrated learning ecosystem.
            </p>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon="smart_toy"
              title="24/7 AI Tutor"
              desc="Instant answers to complex problems. Our AI breaks down concepts step-by-step anytime you need help."
              color="emerald"
            />
            <FeatureCard
              icon="analytics"
              title="GPA Tracker"
              desc="Monitor your academic progress in real-time. Visualize your improvements and set dynamic goals."
              color="lime"
            />
            <FeatureCard
              icon="psychology"
              title="Score Simulator"
              desc="Predictive modeling for your final grades based on current performance and study habits."
              color="emerald"
            />
            <FeatureCard
              icon="verified"
              title="Certified Exams"
              desc="Practice with real past papers and AI-generated mock exams tailored to your curriculum."
              color="lime"
            />
          </div>
        </div>
      </section>
    );
  };
  
  const FeatureCard = ({ icon, title, desc, color }: { icon: string; title: string; desc: string; color: 'emerald' | 'lime' }) => {
     // Helper for dynamic classes
     const colors = {
         emerald: {
             hoverBorder: 'hover:border-emerald-500/30',
             hoverShadow: 'hover:shadow-emerald-500/10',
             bg: 'bg-emerald-50 dark:bg-emerald-900/20',
             icon: 'text-emerald-600 dark:text-emerald-400'
         },
         lime: {
             hoverBorder: 'hover:border-lime-500/30',
             hoverShadow: 'hover:shadow-lime-500/10',
             bg: 'bg-lime-50 dark:bg-lime-900/20',
             icon: 'text-lime-600 dark:text-lime-400'
         }
     }
  
     const c = colors[color];
  
      return (
      <div className={`group relative p-8 glass-card rounded-[2rem] ${c.hoverBorder} transition-all duration-300 hover:shadow-2xl ${c.hoverShadow} hover:-translate-y-2`}>
        <div className="relative z-10">
          <div className={`h-14 w-14 ${c.bg} rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
            <span className={`material-symbols-outlined text-3xl ${c.icon}`}>{icon}</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{desc}</p>
        </div>
      </div>
    );
  };
