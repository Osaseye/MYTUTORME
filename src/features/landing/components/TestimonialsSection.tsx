const featured = {
  quote:
    "I used the GPA simulator before my second semester and mapped out exactly which courses I needed to defend. Came out with a 4.6 CGPA. I honestly do not think I would have been as intentional without it.",
  name: 'Amara N.',
  role: 'Medicine · Year 3',
  university: 'Adeleke University',
  initials: 'AN',
};

const secondary = [
  {
    quote:
      "The JAMB practice exams on here are the best I found anywhere. I stopped guessing and started understanding why answers were wrong. Scored 312.",
    name: 'Ibrahim Y.',
    role: 'Pre-Medicine (JAMB Graduate)',
    university: 'Bells University',
    initials: 'IY',
  },
  {
    quote:
      "My Calculus grade went from a C to an A in one semester. The AI breaks down proofs in plain English, not textbook language. That alone is worth it.",
    name: 'Chinedu O.',
    role: 'Mechanical Engineering · Year 2',
    university: 'Babcock University',
    initials: 'CO',
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="py-24 bg-slate-50 dark:bg-[#0a1120]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-14">
          <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-3">Student Reviews</p>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white leading-tight">
            Real students.<br />Real results.
          </h2>
        </div>

        {/* Featured quote */}
        <div className="bg-white dark:bg-surface-dark rounded-2xl p-10 md:p-14 border border-slate-200 dark:border-slate-700 mb-6 shadow-sm">
          <div className="flex items-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="material-symbols-outlined text-yellow-400 text-lg">star</span>
            ))}
          </div>
          <p className="text-2xl md:text-3xl font-display font-semibold text-slate-900 dark:text-white leading-snug mb-8">
            &ldquo;{featured.quote}&rdquo;
          </p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-lime-400 to-emerald-500 flex items-center justify-center font-bold text-white shrink-0">
              {featured.initials}
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">{featured.name}</p>
              <p className="text-xs text-slate-500">{featured.role}</p>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{featured.university}</p>
            </div>
          </div>
        </div>

        {/* Secondary quotes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {secondary.map((t) => (
            <div
              key={t.name}
              className="bg-white dark:bg-surface-dark rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="material-symbols-outlined text-yellow-400 text-base">star</span>
                ))}
              </div>
              <p className="text-slate-700 dark:text-slate-200 leading-relaxed mb-6 text-[15px]">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/50">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center font-bold text-white text-sm shrink-0">
                  {t.initials}
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{t.university}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
