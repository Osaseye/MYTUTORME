import { Link } from 'react-router-dom';
import dashboardImg       from '../../../assets/landing/dashboard.png';
import aiTutorImg         from '../../../assets/landing/Ai-tutor.png';
import coursesImg         from '../../../assets/landing/courses-page.png';
import gpaImg             from '../../../assets/landing/GPA-tracker.png';
import examPrepImg        from '../../../assets/landing/exam-prep-page.png';
import configureExamImg   from '../../../assets/landing/configure-exam.png';
import examTakingImg      from '../../../assets/landing/exam-taking.png';
import studyPlannerImg    from '../../../assets/landing/studyplanner.png';
import flashcardsImg      from '../../../assets/landing/flashcards.png';
import assignmentImg      from '../../../assets/landing/assignment-helper.png';
import menuImg            from '../../../assets/landing/menu.png';

const bigFeatures = [
  {
    badgeIcon: 'dashboard', badgeLabel: 'Student Dashboard', isNova: false,
    title: 'Your Personal Command Center',
    description: 'Pick up where you left off, track your CGPA target, and ask Nova anything — all from one focused dashboard built for Nigerian university students.',
    bullets: ['Resume learning with one tap','Target CGPA tracker with live progress','Ask Nova — your AI tutor, always ready','Daily quiz to stay sharp between sessions'],
    img: dashboardImg, alt: 'MyTutorMe student dashboard', reverse: false, link: null as string | null, linkLabel: '',
  },
  {
    badgeIcon: '', badgeLabel: 'Nova AI Tutor', isNova: true,
    title: 'Ask Nova. Get Answers Instantly.',
    description: 'Nova is your always-on AI tutor, trained on the Nigerian university curriculum. Ask questions, get explanations, and never feel stuck between lectures again.',
    bullets: ['Explain any topic in plain English','Curriculum-aligned answers for your school','Write, code, or learn — Nova handles it all','3 free queries daily, unlimited on Pro'],
    img: aiTutorImg, alt: 'Nova AI tutor conversation', reverse: true, link: null as string | null, linkLabel: '',
  },
  {
    badgeIcon: 'storefront', badgeLabel: 'Course Marketplace', isNova: false,
    title: 'Real Courses from Nigerian Academics',
    description: 'Nigerian lecturers upload structured course packs — videos, PDFs, slide decks, and practice sets. Study at your own pace, on any device, fully curriculum-aligned.',
    bullets: ['Videos, PDFs & practice sets in one pack','Courses aligned to your school curriculum','Pro members save 20% on every course','Revenue goes directly to the course creator'],
    img: coursesImg, alt: 'MyTutorMe course marketplace and learning hub', reverse: false, link: '/student/courses' as string | null, linkLabel: 'Browse courses',
  },
  {
    badgeIcon: 'analytics', badgeLabel: 'GPA Tracker', isNova: false,
    title: 'Know Exactly Where Your GPA Stands',
    description: 'Track your CGPA semester by semester. Run "what-if" scenarios to see how upcoming courses affect your target before exams arrive.',
    bullets: ['Real-time CGPA calculation per semester','"What-If" simulator for upcoming courses','Target GPA progress tracker','Works on 4.0 and 5.0 grading scales'],
    img: gpaImg, alt: 'MyTutorMe GPA tracker and predictor', reverse: true, link: null as string | null, linkLabel: '',
  },
];

const examFeatures = [
  { title: 'Exam Prep Center',     description: 'JAMB, WAEC, NECO & Post-UTME past questions organised and ready to practise.',                                   img: examPrepImg,      alt: 'Exam prep center'    },
  { title: 'Custom Mock Exams',    description: 'Pick subject, question type, difficulty and time limit to build your perfect practice session.',                 img: configureExamImg, alt: 'Configure mock exam'  },
  { title: 'Real Exam Experience', description: "Timed, distraction-free interface that mirrors the actual exam environment you'll face on the day.",             img: examTakingImg,    alt: 'Exam taking screen'  },
];

const toolFeatures = [
  { title: 'Study Planner',        description: 'Week-by-week schedule auto-generated around your target exam dates.',                                           icon: 'calendar_today', img: studyPlannerImg, alt: 'Study planner'     },
  { title: 'Flashcards',           description: 'Create and revise flashcard decks for any topic or course.',                                                    icon: 'style',          img: flashcardsImg,   alt: 'Flashcards'        },
  { title: 'Assignment Helper',    description: 'Get help breaking down essays, outlines and complex assignment questions.',                                      icon: 'edit_note',      img: assignmentImg,   alt: 'Assignment helper' },
  { title: 'Everything in One App', description: 'Community, Certificates, GPA Tracker, Settings — all reachable in seconds from one clean menu.',              icon: 'apps',           img: menuImg,         alt: 'App menu'          },
];

export const FeatureShowcaseSection = () => {
  return (
    <section id="platform" className="py-24 bg-slate-50 dark:bg-[#0B1120] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-3">
            Inside the Platform
          </h2>
          <h3 className="text-4xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-6">
            Every Tool You Need to{' '}
            <span className="text-emerald-600 dark:text-emerald-400 underline decoration-4 decoration-emerald-200 dark:decoration-emerald-900 underline-offset-4">
              Stay Ahead
            </span>
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-lg">
            AI tutoring, curriculum-aligned courses, GPA tracking, exam prep, flashcards and more — all in one seamless app.
          </p>
        </div>

        {bigFeatures.map((f, i) => (
          <div
            key={f.title}
            className={`flex flex-col ${f.reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 ${i < bigFeatures.length - 1 ? 'mb-28' : 'mb-24'}`}
          >
            <div className="lg:w-1/2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold text-sm mb-4">
                {f.isNova ? (
                  <img src="/nova.png" alt="Nova" className="w-4 h-4 rounded-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-sm">{f.badgeIcon}</span>
                )}
                {f.badgeLabel}
              </div>
              <h4 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white mb-4">{f.title}</h4>
              <p className="text-slate-600 dark:text-slate-400 text-lg mb-6 leading-relaxed">{f.description}</p>
              <ul className="space-y-3 mb-8">
                {f.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-emerald-500 mt-0.5">check_circle</span>
                    <span className="text-slate-700 dark:text-slate-300 text-sm">{b}</span>
                  </li>
                ))}
              </ul>
              {f.link && (
                <Link to={f.link} className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline inline-flex items-center gap-1">
                  {f.linkLabel}
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              )}
            </div>
            <div className="lg:w-1/2 w-full flex justify-center">
              <img src={f.img} alt={f.alt} className="w-full max-w-xl xl:max-w-2xl h-auto object-contain drop-shadow-2xl" />
            </div>
          </div>
        ))}

        <div className="mt-8 mb-24">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold text-sm mb-4">
              <span className="material-symbols-outlined text-sm">quiz</span>
              Exam Preparation
            </div>
            <h3 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white mb-4">
              Ace JAMB, WAEC &amp; Your University Exams
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">
              From past questions to fully configurable mock exams — practise the way that matches your real exam day.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {examFeatures.map((ef) => (
              <div key={ef.title} className="flex flex-col items-center text-center">
                <img src={ef.img} alt={ef.alt} className="w-full max-w-xs sm:max-w-sm h-auto object-contain drop-shadow-xl mb-6" />
                <h4 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-2">{ef.title}</h4>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed max-w-xs">{ef.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white mb-4">Even More Powerful Tools</h3>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto">Everything you need is already inside — no extra apps, no extra cost.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {toolFeatures.map((tf) => (
              <div key={tf.title} className="bg-white dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-center bg-slate-50 dark:bg-slate-900/50 px-4 pt-6">
                  <img src={tf.img} alt={tf.alt} className="w-full max-w-[180px] h-56 object-contain object-top drop-shadow-md" />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-emerald-500 text-xl">{tf.icon}</span>
                    <h4 className="font-display font-bold text-slate-900 dark:text-white text-base">{tf.title}</h4>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{tf.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
