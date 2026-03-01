import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCircle, 
  BarChart2, 
  Target, 
  CheckCircle2,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils'; // Assuming you have this utility

export const StudentOnboarding = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  
  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    institution: '',
    level: '',
    cgpa: '',
    target_cgpa: '',
    goals: [] as string[]
  });

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleGoal = (goal: string) => {
    setFormData(prev => {
      const goals = prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal];
      return { ...prev, goals };
    });
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const steps = [
    { title: "Profile", icon: UserCircle },
    { title: "Standing", icon: BarChart2 },
    { title: "Goals", icon: Target },
    { title: "Finish", icon: CheckCircle2 }
  ];

  const levels = ["100 Level", "200 Level", "300 Level", "400 Level", "500 Level"];
  const goalsList = [
    "Improve Grades", 
    "Learn a New Skill", 
    "Exam Prep", 
    "Homework Help", 
    "Mentorship"
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
                  <label className="text-sm font-medium">Institution</label>
                  <Input 
                    placeholder="e.g. University of Lagos" 
                    value={formData.institution}
                    onChange={(e) => updateField('institution', e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button onClick={nextStep} disabled={!formData.fullName || !formData.institution} className="w-full sm:w-auto gap-2">
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
                <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Academic Standing</h2>
                <p className="text-slate-500 dark:text-slate-400">Help us tailor your learning experience.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Level</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {levels.map((level) => (
                      <div 
                        key={level}
                        onClick={() => updateField('level', level)}
                        className={cn(
                          "cursor-pointer text-sm border rounded-lg p-3 text-center transition-all hover:border-primary/50",
                          formData.level === level 
                            ? "bg-primary/5 border-primary text-primary font-medium" 
                            : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                        )}
                      >
                        {level}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Current CGPA (Optional)</label>
                  <Input 
                    placeholder="e.g. 4.5" 
                    type="number"
                    step="0.01"
                    min="0"
                    max="5.0"
                    value={formData.cgpa}
                    onChange={(e) => updateField('cgpa', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Target CGPA (Optional)</label>
                  <Input 
                    placeholder="e.g. 5.0" 
                    type="number"
                    step="0.01"
                    min="0"
                    max="5.0"
                    // @ts-ignore
                    value={formData.target_cgpa}
                    onChange={(e) => updateField('target_cgpa', e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <Button variant="ghost" onClick={prevStep} className="gap-2">
                  <ChevronLeft className="w-4 h-4" /> Back
                </Button>
                <Button onClick={nextStep} disabled={!formData.level} className="gap-2">
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
                <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Your Goals</h2>
                <p className="text-slate-500 dark:text-slate-400">Select all that apply.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {goalsList.map((goal) => (
                  <div 
                    key={goal}
                    onClick={() => toggleGoal(goal)}
                    className={cn(
                      "cursor-pointer flex items-center p-4 border rounded-xl transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50",
                      formData.goals.includes(goal)
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20" 
                        : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors",
                      formData.goals.includes(goal)
                        ? "bg-primary border-primary text-white"
                        : "border-slate-300 dark:border-slate-600"
                    )}>
                      {formData.goals.includes(goal) && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-sm font-medium">{goal}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex justify-between">
                <Button variant="ghost" onClick={prevStep} className="gap-2">
                  <ChevronLeft className="w-4 h-4" /> Back
                </Button>
                <Button onClick={nextStep} className="gap-2">
                  Next Step <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
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

              <Button size="lg" className="w-full max-w-xs shadow-lg shadow-primary/20" onClick={() => navigate('/student/dashboard')}>
                Go to Dashboard
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
