import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Check, ChevronRight, GraduationCap, Sparkles, Target, UserCircle } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { db, functions } from '@/lib/firebase';
import { useAuth, useAuthStore } from '@/features/auth/hooks/useAuth';
import { PaymentModal } from '@/components/shared/PaymentModal';

interface StudentFormData {
  fullName: string;
  username: string;
  educationLevel: 'secondary' | 'tertiary';
  institution: string;
  courseOfStudy: string;
  classLevel: string;
  gradingSystem: '4.0' | '5.0';
  cgpa: string;
  target_cgpa: string;
  painPoint: string;
  subjects: string[];
}

const stepConfig = [
  { title: 'Profile created', subtitle: 'Tell us about yourself', icon: UserCircle },
  { title: 'Academic setup', subtitle: 'Your school details', icon: GraduationCap },
  { title: 'Study focus', subtitle: 'What should we optimize', icon: Target },
  { title: 'Choose your plan', subtitle: 'Start free or upgrade', icon: Sparkles },
] as const;

export const StudentOnboarding = () => {
  const [step, setStep] = useState(() => {
    const saved = localStorage.getItem('student_onboarding_step');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [formData, setFormData] = useState<StudentFormData>(() => {
    const saved = localStorage.getItem('student_onboarding_formData');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          fullName: parsed.fullName ?? '',
          username: parsed.username ?? '',
          educationLevel: parsed.educationLevel === 'secondary' ? 'secondary' : 'tertiary',
          institution: parsed.institution ?? '',
          courseOfStudy: parsed.courseOfStudy ?? '',
          classLevel: parsed.classLevel ?? '',
          gradingSystem: parsed.gradingSystem === '4.0' ? '4.0' : '5.0',
          cgpa: parsed.cgpa ?? '',
          target_cgpa: parsed.target_cgpa ?? '',
          painPoint: parsed.painPoint ?? '',
          subjects: Array.isArray(parsed.subjects) ? parsed.subjects : [],
        };
      } catch {
        // ignore malformed local data
      }
    }

    return {
      fullName: '',
      username: '',
      educationLevel: 'tertiary',
      institution: '',
      courseOfStudy: '',
      classLevel: '',
      gradingSystem: '5.0',
      cgpa: '',
      target_cgpa: '',
      painPoint: '',
      subjects: [],
    };
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<'pro_monthly' | 'pro_yearly' | null>(null);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const { user } = useAuth();

  useEffect(() => {
    localStorage.setItem('student_onboarding_step', step.toString());
  }, [step]);

  useEffect(() => {
    localStorage.setItem('student_onboarding_formData', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    if (user?.displayName) {
      setFormData((prev) => ({ ...prev, fullName: prev.fullName || user.displayName || '' }));
    }
  }, [user]);

  const tertiaryLevels = ['100 Level', '200 Level', '300 Level', '400 Level', '500 Level'];
  const secondaryLevels = ['JSS 1', 'JSS 2', 'JSS 3', 'SS 1', 'SS 2', 'SS 3'];

  const painPoints = formData.educationLevel === 'secondary'
    ? [
        'Preparing for an upcoming exam (WAEC, JAMB, NECO, etc.)',
        'Preparing for university admission',
        'Struggling with homework & assignments',
        'General revision and continuous learning',
      ]
    : [
        'Want to boost my CGPA',
        'Preparing for professional/certification exams',
        'Struggling with coursework or assignments',
        'General revision and continuous learning',
      ];

  const subjectOptions = formData.educationLevel === 'secondary'
    ? [
        'Mathematics', 'English', 'Physics', 'Chemistry', 'Biology', 'Economics', 'Further Mathematics',
        'Literature in English', 'Government', 'Accounting', 'Commerce', 'Geography', 'Agricultural Science',
      ]
    : [
        'Computer Science', 'Engineering', 'Medicine', 'Law', 'Business Administration', 'Accounting',
        'Economics', 'Nursing', 'Pharmacy', 'Political Science', 'Mass Communication', 'English',
        'Mathematics', 'Physics', 'Chemistry', 'Biology',
      ];

  const progress = Math.round((step / stepConfig.length) * 100);
  const currentStepMeta = stepConfig[step - 1];

  const canContinue = useMemo(() => {
    if (step === 1) {
      return formData.fullName.trim().length > 1 && formData.username.trim().length > 1;
    }
    if (step === 2) {
      const baseValid = formData.institution.trim() && formData.classLevel.trim();
      if (formData.educationLevel === 'secondary') return Boolean(baseValid);
      return Boolean(baseValid && formData.courseOfStudy.trim());
    }
    if (step === 3) {
      return Boolean(formData.painPoint && formData.subjects.length > 0);
    }
    return true;
  }, [formData, step]);

  const updateField = <K extends keyof StudentFormData>(field: K, value: StudentFormData[K]) => {
    setFormData((prev) => {
      if (field === 'educationLevel' && prev.educationLevel !== value) {
        return {
          ...prev,
          educationLevel: value as StudentFormData['educationLevel'],
          painPoint: '',
          subjects: [],
          classLevel: '',
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const toggleSubject = (subject: string) => {
    setFormData((prev) => {
      const subjects = prev.subjects.includes(subject)
        ? prev.subjects.filter((item) => item !== subject)
        : [...prev.subjects, subject];
      return { ...prev, subjects };
    });
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, stepConfig.length));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleComplete = async (
    selectedPlan?: 'free' | 'pro_monthly' | 'pro_yearly' | React.MouseEvent,
    paymentProvider?: 'flutterwave' | 'paystack',
  ) => {
    const plan = typeof selectedPlan === 'string' ? selectedPlan : undefined;
    if (!user) return;

    setIsSubmitting(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        isOnboardingComplete: true,
        displayName: formData.fullName || user.displayName,
        username: formData.username,
        level: formData.educationLevel,
        institution: formData.institution,
        courseOfStudy: formData.courseOfStudy,
        classLevel: formData.classLevel,
        gradingSystem: formData.gradingSystem,
        currentCGPA: parseFloat(formData.cgpa) || 0,
        targetCGPA: parseFloat(formData.target_cgpa) || 0,
        painPoint: formData.painPoint,
        interests: formData.subjects,
        plan: 'free',
      });

      useAuthStore.getState().setUser({
        ...user,
        isOnboardingComplete: true,
        displayName: formData.fullName || user.displayName,
        ...({ username: formData.username } as any),
      });

      localStorage.removeItem('student_onboarding_step');
      localStorage.removeItem('student_onboarding_formData');

      if (plan && (plan === 'pro_monthly' || plan === 'pro_yearly')) {
        const initializeSubscription = httpsCallable(functions, 'initializeSubscription');
        const planCode = plan === 'pro_monthly' ? 'FW_PLAN_STUDENT_MONTHLY' : 'FW_PLAN_STUDENT_YEARLY';
        const result = await initializeSubscription({
          planCode,
          email: user.email,
          userId: user.uid,
          provider: paymentProvider || 'flutterwave',
          redirectUrl: `${window.location.origin}/student/dashboard`,
        });

        const data: any = result.data;
        if (data?.authorizationUrl) {
          window.location.href = data.authorizationUrl;
          return;
        }
        toast.error('Error initializing payment URL.');
      }

      if (returnTo) {
        navigate(returnTo);
      } else {
        navigate('/student/dashboard');
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Error completing onboarding');
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    if (step === 1) {
      return (
        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Full name</label>
            <Input
              value={formData.fullName}
              onChange={(e) => updateField('fullName', e.target.value)}
              placeholder="e.g. Jane Thompson"
              className="h-11 rounded-xl border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Username</label>
            <Input
              value={formData.username}
              onChange={(e) => updateField('username', e.target.value)}
              placeholder="e.g. janetwrites"
              className="h-11 rounded-xl border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950"
            />
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">This appears in community discussions and profile pages.</p>
          </div>
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="space-y-5">
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-300">Education level</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => updateField('educationLevel', 'secondary')}
                className={cn(
                  'rounded-xl border-2 px-3 py-3 text-sm font-semibold transition-colors',
                  formData.educationLevel === 'secondary'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-primary/40 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300',
                )}
              >
                Secondary
              </button>
              <button
                type="button"
                onClick={() => updateField('educationLevel', 'tertiary')}
                className={cn(
                  'rounded-xl border-2 px-3 py-3 text-sm font-semibold transition-colors',
                  formData.educationLevel === 'tertiary'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-primary/40 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300',
                )}
              >
                Tertiary
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Institution</label>
            <Input
              value={formData.institution}
              onChange={(e) => updateField('institution', e.target.value)}
              placeholder="e.g. University of Lagos"
              className="h-11 rounded-xl border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950"
            />
          </div>

          {formData.educationLevel === 'tertiary' && (
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Course of study</label>
              <Input
                value={formData.courseOfStudy}
                onChange={(e) => updateField('courseOfStudy', e.target.value)}
                placeholder="e.g. Computer Science"
                className="h-11 rounded-xl border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950"
              />
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Current class / level</label>
            <select
              value={formData.classLevel}
              onChange={(e) => updateField('classLevel', e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none ring-primary/20 transition-shadow focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
            >
              <option value="">Select level</option>
              {(formData.educationLevel === 'tertiary' ? tertiaryLevels : secondaryLevels).map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </div>
        </div>
      );
    }

    if (step === 3) {
      return (
        <div className="space-y-5">
          {formData.educationLevel === 'tertiary' && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Scale</label>
                <select
                  value={formData.gradingSystem}
                  onChange={(e) => updateField('gradingSystem', e.target.value as '4.0' | '5.0')}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none ring-primary/20 transition-shadow focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                >
                  <option value="5.0">5.0</option>
                  <option value="4.0">4.0</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Current CGPA</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.cgpa}
                  onChange={(e) => updateField('cgpa', e.target.value)}
                  placeholder="3.2"
                  className="h-11 rounded-xl border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">Target CGPA</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.target_cgpa}
                  onChange={(e) => updateField('target_cgpa', e.target.value)}
                  placeholder="4.5"
                  className="h-11 rounded-xl border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950"
                />
              </div>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Primary goal</label>
            <select
              value={formData.painPoint}
              onChange={(e) => updateField('painPoint', e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none ring-primary/20 transition-shadow focus:ring-2 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
            >
              <option value="">Choose your focus</option>
              {painPoints.map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300">Subjects of interest</label>
            <div className="flex flex-wrap gap-2">
              {subjectOptions.map((subject) => {
                const active = formData.subjects.includes(subject);
                return (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => toggleSubject(subject)}
                    className={cn(
                      'rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                      active
                        ? 'border-primary bg-primary text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-primary/40 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300',
                    )}
                  >
                    {subject}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-950">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Free</h3>
            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">N0</span>
          </div>
          <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">Core tools for everyday studying.</p>
          <Button variant="outline" className="w-full" onClick={() => handleComplete('free')} disabled={isSubmitting}>
            Continue with Free
          </Button>
        </div>

        <div className="rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-primary/10 to-white p-5 shadow-sm dark:from-primary/20 dark:to-slate-950">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pro Monthly</h3>
            <span className="rounded-full bg-primary px-2 py-1 text-xs font-bold text-white">Popular</span>
          </div>
          <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">Unlimited AI + advanced exam prep features.</p>
          <Button
            className="w-full"
            onClick={() => {
              setSelectedPlanForPayment('pro_monthly');
              setIsPaymentModalOpen(true);
            }}
            disabled={isSubmitting}
          >
            Upgrade Monthly
          </Button>
        </div>

        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 shadow-sm dark:border-amber-700 dark:bg-amber-950/20">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Pro Yearly</h3>
            <span className="rounded-full bg-amber-500 px-2 py-1 text-xs font-bold text-white">Best Value</span>
          </div>
          <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">Save more yearly with all Pro benefits included.</p>
          <Button
            className="w-full bg-amber-500 text-white hover:bg-amber-600"
            onClick={() => {
              setSelectedPlanForPayment('pro_yearly');
              setIsPaymentModalOpen(true);
            }}
            disabled={isSubmitting}
          >
            Upgrade Yearly
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-[28px] border border-slate-200 bg-[#f8f7f1] p-4 shadow-xl shadow-slate-900/5 dark:border-slate-700 dark:bg-slate-900">
          <div className="rounded-[24px] border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-950">
            <div className="mb-5 flex items-center gap-3">
              {step > 1 && step < 4 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900"
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-4 w-4" />
                </button>
              ) : (
                <div className="h-9 w-9" />
              )}

              <div className="w-full">
                <div className="mb-1 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <span>{currentStepMeta.title}</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                  <div className="h-2 rounded-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
                className="pb-4"
              >
                <div className="mb-5">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">Question {step} of {stepConfig.length}</p>
                  <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">{currentStepMeta.subtitle}</h2>
                </div>

                {renderStep()}
              </motion.div>
            </AnimatePresence>

            {step < 4 && (
              <div className="sticky bottom-0 mt-4 rounded-2xl border border-slate-200 bg-white/95 p-3 backdrop-blur dark:border-slate-700 dark:bg-slate-950/95">
                <Button
                  className="h-11 w-full justify-between rounded-xl bg-primary px-4 text-white hover:bg-primary-dark"
                  onClick={nextStep}
                  disabled={!canContinue}
                >
                  Continue
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm lg:block dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <currentStepMeta.icon className="h-6 w-6" />
          </div>
          <h3 className="mb-2 text-xl font-bold font-display text-slate-900 dark:text-white">Build your best study profile</h3>
          <p className="mb-6 text-sm leading-6 text-slate-600 dark:text-slate-300">
            This flow is optimized for mobile completion and syncs instantly to your student dashboard.
          </p>

          <div className="space-y-2">
            {stepConfig.map((item, index) => {
              const active = index + 1 === step;
              const done = index + 1 < step;
              return (
                <div
                  key={item.title}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border px-3 py-2 text-sm transition-colors',
                    active && 'border-primary bg-primary/10 text-primary',
                    done && 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300',
                    !active && !done && 'border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400',
                  )}
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                    {done ? <Check className="h-3.5 w-3.5" /> : index + 1}
                  </span>
                  {item.title}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onConfirm={async (provider) => {
          setIsPaymentModalOpen(false);
          if (selectedPlanForPayment) {
            await handleComplete(selectedPlanForPayment, provider);
          }
        }}
        planName={selectedPlanForPayment === 'pro_yearly' ? 'Pro Yearly' : 'Pro Monthly'}
      />
    </div>
  );
};
