export const PainPointSection = () => {
  return (
    <section className="py-20 bg-white dark:bg-[#080f1e]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="mb-14">
          <p className="text-sm font-bold text-rose-500 uppercase tracking-widest mb-4">Sound familiar?</p>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white leading-tight">
            Nigerian university is hard.<br className="hidden md:block" />
            Your tools are making it worse.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">

          <div>
            <p className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-3 leading-snug">
              &ldquo;I study hard but my GPA never seems to show it.&rdquo;
            </p>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              You pass some courses, struggle with others, but you have no clear picture of what is dragging your CGPA down or what to actually fix.
            </p>
          </div>

          <div>
            <p className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-3 leading-snug">
              &ldquo;JAMB prep is just downloading PDFs and hoping.&rdquo;
            </p>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Ten different websites. Conflicting past questions. No structure. No way to know if you are covering the right topics or just wasting time.
            </p>
          </div>

          <div>
            <p className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-3 leading-snug">
              &ldquo;Stuck at 2am with nobody to explain it.&rdquo;
            </p>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Lecturers are unreachable. Tutorial groups cancel. You are paying for a degree but getting zero help the moment a concept does not click.
            </p>
          </div>

          <div>
            <p className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-3 leading-snug">
              &ldquo;Exam season hits and it already feels too late.&rdquo;
            </p>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              No early warning. No way to simulate where your grades will land. By the time you see the damage, the semester is nearly over.
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};
