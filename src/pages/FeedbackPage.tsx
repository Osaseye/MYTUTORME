import { useState } from 'react';
import { CheckCircle, ChevronRight, ChevronLeft, Star, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// ─── Types ──────────────────────────────────────────────────────────────────

interface FormData {
  // Step 1 — About You + Features Used
  userType: string;
  usageDuration: string;
  featuresUsed: string[];

  // Step 2 — Course & Content Generation
  courseRating: number;
  contentRelevant: string;
  contentIssues: string[];
  courseComments: string;

  // Step 3 — Exam & AI Tutor
  examRating: number;
  usedAiTutorDuringExam: string;
  aiTutorRating: number;
  examComments: string;

  // Step 4 — Overall
  overallRating: number;
  likedMost: string;
  wouldImprove: string;
  nps: number | null;
  awarenessFeatures: string[];
  otherComments: string;
}

const INITIAL_FORM: FormData = {
  userType: '',
  usageDuration: '',
  featuresUsed: [],
  courseRating: 0,
  contentRelevant: '',
  contentIssues: [],
  courseComments: '',
  examRating: 0,
  usedAiTutorDuringExam: '',
  aiTutorRating: 0,
  examComments: '',
  overallRating: 0,
  likedMost: '',
  wouldImprove: '',
  nps: null,
  awarenessFeatures: [],
  otherComments: '',
};

const ALL_FEATURES = [
  { id: 'ai_courses', label: 'AI-Generated Courses', description: 'Courses built from uploaded content' },
  { id: 'mock_exam', label: 'Mock Exams / Exam Prep', description: 'Practice exams from course material' },
  { id: 'ai_tutor', label: 'AI Tutor Chat', description: 'AI chat assistant for help & explanations' },
  { id: 'flashcards', label: 'Flashcards', description: 'Study cards for quick revision' },
  { id: 'assignment_helper', label: 'Assignment Helper', description: 'AI assistance with assignments' },
  { id: 'gpa_tracker', label: 'GPA Tracker', description: 'Track and calculate your GPA' },
  { id: 'study_planner', label: 'Study Planner', description: 'Structured study schedules' },
  { id: 'certificates', label: 'Certificates', description: 'Earn & verify course certificates' },
  { id: 'community', label: 'Community', description: 'Connect with other students' },
];

const AWARENESS_FEATURES = [
  { id: 'flashcards', label: 'Flashcards' },
  { id: 'study_planner', label: 'Study Planner' },
  { id: 'assignment_helper', label: 'Assignment Helper' },
  { id: 'gpa_tracker', label: 'GPA Tracker' },
  { id: 'certificates', label: 'Certificates' },
  { id: 'community', label: 'Community' },
];

const CONTENT_ISSUES = [
  'Incorrect or inaccurate information',
  'Content was too long',
  'Content was too short',
  'Poor structure or organisation',
  'Missing topics I expected',
  'No issues — it was great',
];

const STEPS = ['About You', 'Courses', 'Exams & AI Tutor', 'Overall'];

// ─── Star Rating Component ───────────────────────────────────────────────────

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="focus:outline-none"
          aria-label={`${star} star`}
        >
          <Star
            className={`w-8 h-8 transition-colors ${
              star <= (hovered || value)
                ? 'text-emerald-500 fill-emerald-500'
                : 'text-slate-300 dark:text-slate-600'
            }`}
          />
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 self-center text-sm text-slate-500 dark:text-slate-400">
          {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][value]}
        </span>
      )}
    </div>
  );
}

// ─── Toggle Checkbox ─────────────────────────────────────────────────────────

function MultiSelect({
  options,
  selected,
  onChange,
}: {
  options: { id: string; label: string; description?: string }[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (id: string) =>
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {options.map((opt) => {
        const active = selected.includes(opt.id);
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => toggle(opt.id)}
            className={`text-left p-3 rounded-lg border-2 transition-all ${
              active
                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700'
            }`}
          >
            <div className="flex items-start gap-2">
              <div
                className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border-2 transition-colors ${
                  active
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'border-slate-300 dark:border-slate-600'
                }`}
              >
                {active && <CheckCircle className="w-3 h-3 text-white" />}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{opt.label}</p>
                {opt.description && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{opt.description}</p>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Single Select Pills ──────────────────────────────────────────────────────

function SingleSelect({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
            value === opt
              ? 'bg-emerald-500 text-white'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

// ─── NPS Selector ─────────────────────────────────────────────────────────────

function NpsSelector({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 11 }, (_, i) => i).map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all ${
              value === n
                ? n >= 9
                  ? 'bg-emerald-500 text-white'
                  : n >= 7
                  ? 'bg-lime-400 text-slate-900'
                  : 'bg-red-400 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-xs text-slate-400">
        <span>0 — Not at all</span>
        <span>10 — Absolutely yes</span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export const FeedbackPage = () => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // ── Step Validation ────────────────────────────────────────────────────────
  const canProceed = () => {
    if (step === 0) return form.userType !== '' && form.featuresUsed.length > 0;
    if (step === 1) return form.courseRating > 0 && form.contentRelevant !== '';
    if (step === 2) return form.examRating > 0 && form.usedAiTutorDuringExam !== '';
    if (step === 3) return form.overallRating > 0 && form.nps !== null;
    return true;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      await addDoc(collection(db, 'feedbackResponses'), {
        ...form,
        submittedAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Thank You Screen ───────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark font-body text-slate-800 dark:text-slate-100">
        <Navbar />
        <main className="flex flex-col items-center justify-center min-h-[80vh] px-4 pt-16 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Thank you!</h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-md text-base leading-relaxed">
            Your feedback means a lot. We'll use it to make MyTutorMe better for every student. 🎉
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Progress bar ───────────────────────────────────────────────────────────
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-body text-slate-800 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 pt-24 pb-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
            Quick Feedback
          </span>
          <h1 className="text-3xl font-bold mb-2">How was your experience?</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Takes about 3 minutes · Helps us improve MyTutorMe for every student
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-slate-400 mb-2">
            <span>Step {step + 1} of {STEPS.length}: <span className="font-medium text-slate-600 dark:text-slate-300">{STEPS[step]}</span></span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {STEPS.map((s, i) => (
              <span
                key={s}
                className={`text-xs ${
                  i <= step ? 'text-emerald-600 dark:text-emerald-400 font-medium' : 'text-slate-400'
                }`}
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 sm:p-8">

          {/* ── STEP 1: About You + Features Used ─────────────────────────── */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-1">Who are you?</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Help us understand the context of your experience.</p>
                <SingleSelect
                  options={['Student (enrolled in a course)', 'Student (just tried a public exam)', 'Teacher / Course creator', 'Just exploring']}
                  value={form.userType}
                  onChange={(v) => set('userType', v)}
                />
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-1">How long have you used MyTutorMe?</h2>
                <SingleSelect
                  options={['Less than a week', '1–4 weeks', '1–3 months', 'More than 3 months']}
                  value={form.usageDuration}
                  onChange={(v) => set('usageDuration', v)}
                />
              </div>

              <div>
                <h2 className="text-lg font-semibold mb-1">Which features did you use? <span className="text-emerald-500">*</span></h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Select all that apply.</p>
                <MultiSelect
                  options={ALL_FEATURES}
                  selected={form.featuresUsed}
                  onChange={(v) => set('featuresUsed', v)}
                />
              </div>
            </div>
          )}

          {/* ── STEP 2: Course & Content Generation ───────────────────────── */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-1">AI-Generated Course Experience</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                  We generate courses from uploaded materials (PDFs, notes, slides). Tell us how it went.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">How satisfied were you with the course content quality? <span className="text-emerald-500">*</span></label>
                <StarRating value={form.courseRating} onChange={(v) => set('courseRating', v)} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Was the generated content relevant to your subject / exam? <span className="text-emerald-500">*</span></label>
                <SingleSelect
                  options={['Yes, very relevant', 'Mostly relevant', 'Somewhat relevant', 'Not really relevant']}
                  value={form.contentRelevant}
                  onChange={(v) => set('contentRelevant', v)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Did you notice any of these issues with the content?</label>
                <p className="text-xs text-slate-400 mb-2">Select all that apply.</p>
                <MultiSelect
                  options={CONTENT_ISSUES.map((c) => ({ id: c, label: c }))}
                  selected={form.contentIssues}
                  onChange={(v) => set('contentIssues', v)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Anything specific you want to share about the courses?</label>
                <Textarea
                  placeholder="E.g. 'The AI missed some topics from my syllabus' or 'The summaries were really clear'"
                  value={form.courseComments}
                  onChange={(e) => set('courseComments', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </div>
          )}

          {/* ── STEP 3: Exam & AI Tutor ────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-1">Mock Exams & AI Tutor</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  The mock exam feature lets you practice questions generated from course content. The AI Tutor assists you during study and exam sessions.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">How helpful was the mock exam feature for your exam preparation? <span className="text-emerald-500">*</span></label>
                <StarRating value={form.examRating} onChange={(v) => set('examRating', v)} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Did you use the AI Tutor during your exam prep? <span className="text-emerald-500">*</span></label>
                <SingleSelect
                  options={['Yes, frequently', 'Yes, occasionally', 'No, I didn\'t use it', 'I didn\'t know it existed']}
                  value={form.usedAiTutorDuringExam}
                  onChange={(v) => set('usedAiTutorDuringExam', v)}
                />
              </div>

              {(form.usedAiTutorDuringExam === 'Yes, frequently' || form.usedAiTutorDuringExam === 'Yes, occasionally') && (
                <div>
                  <label className="block text-sm font-medium mb-2">How helpful was the AI Tutor overall?</label>
                  <StarRating value={form.aiTutorRating} onChange={(v) => set('aiTutorRating', v)} />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">What did you like or dislike about the exam feature?</label>
                <Textarea
                  placeholder="E.g. 'Questions were too easy' / 'Timer was stressful but helpful' / 'I wish I could retry wrong answers'"
                  value={form.examComments}
                  onChange={(e) => set('examComments', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </div>
          )}

          {/* ── STEP 4: Overall Feedback ───────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold mb-1">Overall Experience</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">Last step — your overall thoughts.</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Overall, how would you rate MyTutorMe? <span className="text-emerald-500">*</span></label>
                <StarRating value={form.overallRating} onChange={(v) => set('overallRating', v)} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Were you aware these features exist? (select ones you didn't know about)</label>
                <p className="text-xs text-slate-400 mb-2">This helps us understand what needs more visibility.</p>
                <MultiSelect
                  options={AWARENESS_FEATURES}
                  selected={form.awarenessFeatures}
                  onChange={(v) => set('awarenessFeatures', v)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">What did you like most about MyTutorMe?</label>
                <Textarea
                  placeholder="Tell us what stood out..."
                  value={form.likedMost}
                  onChange={(e) => set('likedMost', e.target.value)}
                  className="min-h-[70px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">What would you change or improve?</label>
                <Textarea
                  placeholder="Be as specific as you like — every piece of feedback helps"
                  value={form.wouldImprove}
                  onChange={(e) => set('wouldImprove', e.target.value)}
                  className="min-h-[70px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">
                  How likely are you to recommend MyTutorMe to a friend or classmate? <span className="text-emerald-500">*</span>
                </label>
                <NpsSelector value={form.nps} onChange={(v) => set('nps', v)} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Anything else you'd like us to know?</label>
                <Textarea
                  placeholder="Open floor — no wrong answers"
                  value={form.otherComments}
                  onChange={(e) => set('otherComments', e.target.value)}
                  className="min-h-[70px]"
                />
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
            </div>
          )}

          {/* ── Navigation ────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>

            {step < STEPS.length - 1 ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canProceed()}
                className="gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || submitting}
                isLoading={submitting}
                className="gap-1"
              >
                <Send className="w-4 h-4" /> Submit Feedback
              </Button>
            )}
          </div>

          {/* Required note */}
          <p className="text-xs text-slate-400 mt-3 text-center">
            <span className="text-emerald-500">*</span> Required fields
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default FeedbackPage;
