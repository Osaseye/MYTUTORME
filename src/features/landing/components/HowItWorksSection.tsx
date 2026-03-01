export const HowItWorksSection = () => {
    return (
      <section className="py-32 bg-surface-light dark:bg-[#0B1120] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white">
              How MyTutorMe Works
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400 text-lg">
              Achieve your academic goals with our simplified workflow.
            </p>
          </div>
  
          <div className="relative max-w-5xl mx-auto">
            {/* Connector Line */}
            <div className="hidden md:block absolute top-[60px] left-0 w-full h-1 timeline-connector rounded-full z-0"></div>
  
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
              <StepCard
                icon="upload_file"
                step="1"
                title="Upload Curriculum"
                desc="Simply scan your syllabus or textbook. Our AI instantly indexes the content."
              />
              <StepCard
                icon="model_training"
                step="2"
                title="Get Personalized Plan"
                desc="Receive a tailored study schedule and practice questions based on your gaps."
              />
              <StepCard
                icon="trending_up"
                step="3"
                title="Track & Improve"
                desc="Watch your scores rise with real-time feedback and predictive exam simulations."
              />
            </div>
          </div>
        </div>
      </section>
    );
  };
  
  const StepCard = ({ icon, step, title, desc }: { icon: string; step: string; title: string; desc: string }) => (
    <div className="relative flex flex-col items-center text-center group">
      <div className="w-32 h-32 rounded-full bg-white dark:bg-slate-800 border-8 border-slate-50 dark:border-slate-800 shadow-xl flex items-center justify-center mb-8 group-hover:border-emerald-100 dark:group-hover:border-emerald-900/30 transition-all duration-300 transform group-hover:scale-105">
        <span className="material-symbols-outlined text-4xl text-emerald-500">{icon}</span>
        <div className="absolute -top-2 -right-2 bg-emerald-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg border-2 border-white dark:border-slate-900">
          {step}
        </div>
      </div>
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400 px-4">{desc}</p>
    </div>
  );
