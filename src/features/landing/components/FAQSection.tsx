import { useState } from 'react';

const faqs = [
  {
    q: 'Is MyTutorMe free to use?',
    a: 'Yes. The Free plan gives you 2 courses and 3 AI queries per day with no credit card required. Upgrade to Pro when you need unlimited tutoring, GPA prediction, and exam simulations.',
  },
  {
    q: 'Does it support JAMB, WAEC, and NECO?',
    a: 'Yes. MyTutorMe is curriculum-aligned for JAMB CBT, WAEC, NECO, and university POST-UTME. You can practice with past questions and AI-generated mock papers tailored to each exam format.',
  },
  {
    q: 'How accurate is the AI tutor?',
    a: 'It is built specifically for Nigerian academic syllabi and breaks problems down step-by-step. Human experts verify the content. We always recommend cross-checking with your course materials for high-stakes exams.',
  },
  {
    q: "What is the difference between Pro Monthly and Pro Yearly?",
    a: 'Both unlock the full platform: unlimited AI, the complete course library, GPA Predictor, Score Simulator, offline access, and 20% off individual course purchases. Pro Yearly costs ₦40,000 and saves you ₦8,000 vs monthly — plus it includes 5 guided assignments per term and unlimited offline courses.',
  },
  {
    q: 'Can I use it on a slow connection or offline?',
    a: 'Yes. MyTutorMe is a Progressive Web App (PWA). You can install it to your phone home screen and access saved notes, flashcards, and downloaded courses even when campus WiFi is unavailable.',
  },
  {
    q: 'Is my data safe?',
    a: 'Your notes, exam results, and personal information are encrypted and never sold to third parties. We comply with applicable data protection standards.',
  },
];

export const FAQSection = () => {
  return (
    <section className="py-20 bg-white dark:bg-[#0B1120] border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col md:flex-row md:gap-20">

          {/* Left — sticky header */}
          <div className="md:w-64 shrink-0 mb-10 md:mb-0">
            <p className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-3">FAQ</p>
            <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white leading-snug">
              Questions<br />we get a lot.
            </h2>
            <p className="mt-4 text-sm text-slate-400 leading-relaxed">
              Anything else? Email us at{' '}
              <a
                href="mailto:support@mytutorme.org"
                className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline"
              >
                support@mytutorme.org
              </a>
            </p>
          </div>

          {/* Right — accordion */}
          <div className="flex-1 divide-y divide-slate-100 dark:divide-slate-800">
            {faqs.map((item) => (
              <FAQItem key={item.q} question={item.q} answer={item.a} />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="py-5">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full justify-between items-center text-left gap-6 group"
        aria-expanded={open}
      >
        <span className="font-semibold text-slate-900 dark:text-white text-[15px] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
          {question}
        </span>
        <span
          className={`material-symbols-outlined text-slate-400 dark:text-slate-500 transition-transform duration-200 shrink-0 ${open ? 'rotate-45' : ''}`}
        >
          add
        </span>
      </button>
      {open && (
        <p className="mt-4 text-slate-500 dark:text-slate-400 leading-relaxed text-[15px] pr-8">
          {answer}
        </p>
      )}
    </div>
  );
};
