export const TestimonialsSection = () => {
    return (
      <section className="py-24 bg-background-light dark:bg-[#0F172A] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center text-slate-900 dark:text-white mb-16">
            Student Success Stories
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="TutorMe helped me jump from a C to an A in Calculus. The AI explanations are clearer than my textbook!"
              name="Chinedu O."
              role="Engineering Student"
              color="emerald"
            />
            <TestimonialCard
              quote="I love the GPA simulator. It really motivates me to study harder when I see how my grades can improve."
              name="Amara N."
              role="High School Senior"
              color="lime"
            />
            <TestimonialCard
              quote="The practice exams are lifesavers. I felt so much more confident walking into my JAMB finals."
              name="Ibrahim Y."
              role="Medical Student"
              color="teal"
            />
          </div>
        </div>
      </section>
    );
  };
  
  const TestimonialCard = ({ quote, name, role, color }: any) => {
    const colors = {
        emerald: { icon: 'text-2xl', bg: 'bg-emerald-500', shadow: 'shadow-emerald-500/30' },
        lime: { icon: 'text-2xl', bg: 'bg-lime-500', shadow: 'shadow-lime-500/30' },
        teal: { icon: 'text-2xl', bg: 'bg-teal-500', shadow: 'shadow-teal-500/30' }
    }
    const c = colors[color as keyof typeof colors];
  
    return (
      <div className="bg-white dark:bg-surface-dark p-8 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-800 relative hover:shadow-xl transition-shadow">
        <div className={`absolute -top-5 left-8 ${c.bg} text-white p-3 rounded-xl shadow-lg ${c.shadow}`}>
          <span className="material-symbols-outlined text-2xl">format_quote</span>
        </div>
        <p className="text-slate-600 dark:text-slate-300 mb-6 mt-6 italic leading-relaxed">"{quote}"</p>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600">
             {name.split(' ').map((n: string) => n[0]).join('')}
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white">{name}</h4>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{role}</p>
          </div>
        </div>
      </div>
    );
  };
