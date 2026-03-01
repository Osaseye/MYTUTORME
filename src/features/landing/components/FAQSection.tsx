export const FAQSection = () => {
    return (
      <section className="py-20 bg-white dark:bg-[#0B1120] border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-display font-bold text-center text-slate-900 dark:text-white mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <FAQItem
              question="How accurate is the AI tutor?"
              answer="Our AI tutor is trained on millions of academic problems and verified by human experts. While extremely accurate for most high school and college curriculums, we always recommend verifying with course materials for critical exams."
            />
            <FAQItem
              question="Is MyTutorMe free to use?"
              answer="Yes! We offer a generous free tier that includes basic AI queries and course access. Our Premium plan unlocks unlimited tutoring and advanced predictive features."
            />
            <FAQItem
              question="Can I use it on my mobile phone?"
              answer="Absolutely. MyTutorMe is fully responsive and works great on all smartphones and tablets, so you can study on the go."
            />
          </div>
        </div>
      </section>
    );
  };
  
  const FAQItem = ({ question, answer }: { question: string; answer: string }) => (
    <details className="group bg-slate-50 dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <summary className="flex justify-between items-center font-bold cursor-pointer list-none p-6 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
        <span>{question}</span>
        <span className="transition group-open:rotate-180">
          <span className="material-symbols-outlined">expand_more</span>
        </span>
      </summary>
      <div className="text-slate-600 dark:text-slate-400 mt-0 px-6 pb-6 pt-2 leading-relaxed border-t border-slate-200 dark:border-slate-700/50">
        {answer}
      </div>
    </details>
  );
