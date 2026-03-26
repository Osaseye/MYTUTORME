import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCircle, 
   
  Target, 
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth, useAuthStore } from '@/features/auth/hooks/useAuth';

// Defined interface for form data
interface StudentFormData {
  fullName: string;
  username: string;
  educationLevel: string;
  institution: string;
  courseOfStudy: string;
  classLevel: string;
  gradingSystem: string;
  cgpa: string;
  target_cgpa: string;
  painPoint: '';
  subjects: string[];
}

export const StudentOnboarding = () => {
  const [step, setStep] = useState(() => {
    const saved = localStorage.getItem('student_onboarding_step');
    return saved ? parseInt(saved, 10) : 1;
  });
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState<StudentFormData>(() => {
    const saved = localStorage.getItem('student_onboarding_formData');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return {
      fullName: '',
      username: '',
      educationLevel: 'tertiary', // 'secondary' | 'tertiary'
      institution: '',
      courseOfStudy: '',
      classLevel: '',
      gradingSystem: '5.0',
      cgpa: '',
      target_cgpa: '',
      painPoint: '',
      subjects: [] as string[]
    };
  });

  useEffect(() => {
    localStorage.setItem('student_onboarding_step', step.toString());
  }, [step]);

  useEffect(() => {
    localStorage.setItem('student_onboarding_formData', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    if (user?.displayName) {
      setFormData(prev => ({ ...prev, fullName: user.displayName || '' }));
    }
  }, [user]);

  const updateField = (field: string, value: any) => {
    setFormData(prev => {
      // If changing education level, reset related fields
      if (field === 'educationLevel' && prev.educationLevel !== value) {
        return {
          ...prev,
          [field]: value,
          painPoint: '',
          subjects: [], // Clear selected subjects as options change
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const toggleSubject = (subject: string) => {
    setFormData(prev => {
      const subjects = prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject];
      return { ...prev, subjects };
    });
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleComplete = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        isOnboardingComplete: true,
        displayName: formData.fullName || user.displayName,
        ...({ ...({ ...({ ...({ ...({ ...({ username: formData.username } as any) } as any) } as any) } as any) } as any) } as any),
        level: formData.educationLevel,
        institution: formData.institution,
        courseOfStudy: formData.courseOfStudy,
        classLevel: formData.classLevel,
        gradingSystem: formData.gradingSystem,
        currentCGPA: parseFloat(formData.cgpa) || 0,
        targetCGPA: parseFloat(formData.target_cgpa) || 0,
        painPoint: formData.painPoint,
        interests: formData.subjects,
      });
      useAuthStore.getState().setUser({ 
        ...user, 
        isOnboardingComplete: true, 
        displayName: formData.fullName || user.displayName,
        ...({ ...({ username: formData.username } as any) } as any)
      });
      localStorage.removeItem('student_onboarding_step');
      localStorage.removeItem('student_onboarding_formData');
      navigate('/student/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setIsSubmitting(false);
    }
  };

  const steps = [
    { title: "Profile", icon: UserCircle },
    { title: "Academic Info", icon: BookOpen },
    { title: "Goals", icon: Target },
    { title: "Plans", icon: Sparkles },
    { title: "Finish", icon: CheckCircle2 }
  ];

  const tertiaryLevels = ["100 Level", "200 Level", "300 Level", "400 Level", "500 Level"];
  const secondaryLevels = ["JSS 1", "JSS 2", "JSS 3", "SS 1", "SS 2", "SS 3"];
  
  const painPoints = formData.educationLevel === 'secondary' ? [
    "Preparing for an upcoming exam (WAEC, JAMB, NECO, etc.)", 
    "Preparing for university admission",
    "Struggling with homework & assignments", 
    "General revision and continuous learning"
  ] : [
    "Want to boost my CGPA", 
    "Preparing for professional/certification exams",
    "Struggling with coursework or assignments", 
    "General revision and continuous learning"
  ];
  
  const subjectOptions = formData.educationLevel === 'secondary' ? [
    "Mathematics", "English", "Physics", "Chemistry", 
    "Biology", "Economics", "Further Mathematics", "Literature in English",
    "Government", "Accounting", "Commerce", "Geography", "Agricultural Science"
  ] : [
    "Computer Science", "Engineering", "Medicine", "Law", 
    "Business Administration", "Accounting", "Economics", "Nursing", 
    "Pharmacy", "Political Science", "Mass Communication", 
    "English", "Mathematics", "Physics", "Chemistry", "Biology"
  ];

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Header */}
      <div className="mb-8 relative">
        <div className="flex justify-between items-center mb-4 relative z-10 w-full max-w-xl mx-auto">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isActive = step >= idx + 1;
            const isCurrent = step === idx + 1;
            
            return (
              <div key={idx} className="flex flex-col items-center gap-2">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 bg-white dark:bg-slate-900",
                  isActive ? "border-primary text-primary" : "border-slate-200 dark:border-slate-700 text-slate-400",
                  isCurrent && "ring-4 ring-primary/20 bg-primary text-white border-primary"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={cn(
                  "text-xs font-medium transition-colors duration-300 hidden sm:block",
                  isActive ? "text-primary" : "text-slate-400"
                )}>{s.title}</span>
              </div>
            );
          })}
        </div>
        
        {/* Progress Line Background */}
        <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-100 dark:bg-slate-800 -z-0" />
        
        {/* Active Progress Line */}
        <div 
           className="absolute top-5 left-0 h-0.5 bg-primary -z-0 transition-all duration-500"
           style={{ 
             width: `${((step - 1) / (steps.length - 1)) * 100}%`
           }} 
        />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm relative overflow-hidden min-h-[400px]">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Let's get to know you</h2>
                <p className="text-slate-500 dark:text-slate-400">Basic information to set up your profile.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Full Name</label>
                  <Input 
                    placeholder="e.g. John Doe" 
                    value={formData.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Username (Handle for Community)</label>
                  <Input 
                    placeholder="e.g. johndoe99"
                    value={formData.username}
                    onChange={(e) => updateField('username', e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button onClick={nextStep} disabled={!formData.fullName || !formData.username} className="w-full sm:w-auto gap-2">
                  Next Step <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Academic Details</h2>
                <p className="text-slate-500 dark:text-slate-400">Tell us where you are in your educational journey.</p>
              </div>

              <div className="flex gap-4 mb-4">
                <div 
                  onClick={() => {
                    updateField('educationLevel', 'secondary');
                    updateField('classLevel', '');
                  }}
                  className={cn(
                    "flex-1 p-4 rounded-xl border-2 text-center cursor-pointer transition-all",
                    formData.educationLevel === 'secondary' ? "border-primary bg-primary/5 text-primary" : "border-slate-200 text-slate-600 hover:border-slate-300"
                  )}
                >
                  <p className="font-bold">Secondary School</p>
                </div>
                <div 
                  onClick={() => {
                    updateField('educationLevel', 'tertiary');
                    updateField('classLevel', '');
                  }}
                  className={cn(
                    "flex-1 p-4 rounded-xl border-2 text-center cursor-pointer transition-all",
                    formData.educationLevel === 'tertiary' ? "border-primary bg-primary/5 text-primary" : "border-slate-200 text-slate-600 hover:border-slate-300"
                  )}
                >
                  <p className="font-bold">University / Tertiary</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Institution Name</label>
                  <Input 
                    placeholder="e.g. University of Lagos"
                    value={formData.institution}
                    onChange={(e) => updateField('institution', e.target.value)}
                  />
                </div>

                {formData.educationLevel === 'tertiary' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Course of Study</label>
                    <Input 
                      placeholder="e.g. Computer Science"
                      value={formData.courseOfStudy}
                      onChange={(e) => updateField('courseOfStudy', e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Level / Class</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    value={formData.classLevel}
                    onChange={(e) => updateField('classLevel', e.target.value)}
                  >
                    <option value="" disabled>Select Level...</option>
                    {(formData.educationLevel === 'tertiary' ? tertiaryLevels : secondaryLevels).map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <Button variant="ghost" onClick={prevStep} className="gap-2">
                  <ChevronLeft className="w-4 h-4" /> Back
                </Button>
                <Button onClick={nextStep} disabled={!formData.institution || !formData.classLevel || (formData.educationLevel === 'tertiary' && !formData.courseOfStudy)} className="gap-2">
                  Next Step <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Standing & Goals</h2>
                <p className="text-slate-500 dark:text-slate-400">Help us personalize your study experience.</p>
              </div>

              {formData.educationLevel === 'tertiary' && (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Grading System</label>
                    <select
                      className="flex h-10 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      value={formData.gradingSystem}
                      onChange={(e) => updateField('gradingSystem', e.target.value)}
                    >
                      <option value="5.0">5.0 Scale</option>
                      <option value="4.0">4.0 Scale</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Current CGPA</label>
                    <Input 
                      type="number"
                      step="0.01"
                      placeholder="e.g. 3.5"
                      value={formData.cgpa}
                      onChange={(e) => updateField('cgpa', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Target CGPA</label>
                    <Input 
                      type="number"
                      step="0.01"
                      placeholder="e.g. 4.5"
                      value={formData.target_cgpa}
                      onChange={(e) => updateField('target_cgpa', e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">What is your primary academic goal right now?</label>
                <select
                  className="flex h-10 w-full rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  value={formData.painPoint}
                  onChange={(e) => updateField('painPoint', e.target.value)}
                >
                  <option value="" disabled>Select your main goal...</option>
                  {painPoints.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Select core subjects of interest
                </label>
                <div className="flex flex-wrap gap-2">
                  {subjectOptions.map((subject) => (
                    <div 
                      key={subject}
                      onClick={() => toggleSubject(subject)}
                      className={cn(
                        "cursor-pointer flex items-center px-3 py-1.5 border rounded-full text-sm transition-all",
                        formData.subjects.includes(subject)
                          ? "border-primary bg-primary text-white" 
                          : "border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900"
                      )}
                    >
                      {subject}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <Button variant="ghost" onClick={prevStep} className="gap-2">
                  <ChevronLeft className="w-4 h-4" /> Back
                </Button>
                <Button onClick={nextStep} className="gap-2" disabled={!formData.painPoint || formData.subjects.length === 0}>
                  Next Step <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Choose Your Plan</h2>
                <p className="text-slate-500 dark:text-slate-400">Unlock premium AI tutoring and advanced features.</p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {/* Free Tier */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="flex flex-col p-6 rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden"
                >
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2">Free</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-bold">₦0</span>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Basic AI Assistance
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Standard Study Plans
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 10 queries / day
                    </li>
                  </ul>
                  <Button variant="outline" className="w-full mt-auto" onClick={nextStep}>
                    Skip for now
                  </Button>
                </motion.div>

                 {/* Pro Monthly Tier */}
                 <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="flex flex-col p-6 rounded-2xl border-2 border-primary bg-primary/5 relative overflow-hidden shadow-lg shadow-primary/10"
                >
                  <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                    POPULAR
                  </div>
                  <h3 className="font-bold text-lg text-primary mb-2">Pro Monthly</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-bold">₦4,000</span>
                    <span className="text-sm text-slate-500">/ month</span>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-primary" /> Unlimited AI Queries
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-primary" /> Exam Prediction Engine
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-primary" /> Advanced Analytics
                    </li>
                  </ul>
                  <Button className="w-full gap-2 shadow-md shadow-primary/20 mt-auto" onClick={nextStep}>
                    <Sparkles className="w-4 h-4" /> Upgrade Monthly
                  </Button>
                </motion.div>

                {/* Pro Yearly Tier */}
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="flex flex-col p-6 rounded-2xl border-2 border-amber-500 bg-amber-50 dark:bg-amber-900/10 relative overflow-hidden shadow-lg shadow-amber-500/10 sm:col-span-2 lg:col-span-1"
                >
                  <div className="absolute top-0 right-0 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                    BEST VALUE
                  </div>
                  <h3 className="font-bold text-lg text-amber-600 dark:text-amber-500 mb-2">Pro Yearly</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-3xl font-bold">₦40,000</span>
                    <span className="text-sm text-slate-500">/ year</span>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-amber-500" /> Everything in Pro Monthly
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-amber-500" /> 5 assignments / term
                    </li>
                    <li className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-amber-500" /> Priority Support
                    </li>
                  </ul>
                  <Button className="w-full gap-2 bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 mt-auto" onClick={nextStep}>
                    <Sparkles className="w-4 h-4" /> Upgrade Yearly
                  </Button>
                </motion.div>
              </div>

              <div className="pt-2 flex justify-between">
                <Button variant="ghost" onClick={prevStep} className="gap-2">
                  <ChevronLeft className="w-4 h-4" /> Back
                </Button>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-8"
            >
              <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-500">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              
              <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-2">You're All Set!</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8">
                Your profile has been created successfully. Welcome to MyTutorMe.
              </p>

              <Button 
                size="lg" 
                className="w-full max-w-xs shadow-lg shadow-primary/20" 
                onClick={handleComplete}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Go to Dashboard'}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
