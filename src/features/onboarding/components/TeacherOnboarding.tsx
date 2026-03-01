import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserCircle, 
  BookOpen, 
  UploadCloud, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const TeacherOnboarding = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    bio: '',
    subjects: '',
    file: null
  });

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const steps = [
    { title: "Profile", icon: UserCircle },
    { title: "Review", icon: UploadCloud },
    { title: "Done", icon: CheckCircle2 }
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

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -ml-32 -mt-32 pointer-events-none" />

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Build your Instructor Profile</h2>
                <p className="text-slate-500 dark:text-slate-400">Students trust verified experts.</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Professional Headline</label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <Input 
                      className="pl-10"
                      placeholder="e.g. Senior Lecturer, Dept of Physics, UNILAG" 
                      value={formData.title}
                      onChange={(e) => updateField('title', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Core Subjects</label>
                  <div className="relative">
                    <BookOpen className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                    <Input 
                      className="pl-10"
                      placeholder="e.g. Mathematics, Further Math, Physics" 
                      value={formData.subjects}
                      onChange={(e) => updateField('subjects', e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-slate-500">Comma separated</p>
                </div>

                <div className="space-y-2">
                   <label className="text-sm font-medium">Bio / Experience</label>
                   <textarea 
                     className="w-full h-32 p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                     placeholder="Share your teaching experience, qualifications, and what students can expect..."
                     value={formData.bio}
                     onChange={(e) => updateField('bio', e.target.value)}
                   />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button onClick={nextStep} disabled={!formData.title || !formData.bio} className="w-full sm:w-auto gap-2">
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
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Verify your Credentials</h2>
                <p className="text-slate-500 dark:text-slate-400">Upload proof of qualification to start publishing.</p>
              </div>

              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                <div className="w-16 h-16 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
                    <UploadCloud className="w-8 h-8 text-primary" />
                </div>
                <div className="text-sm font-medium text-slate-900 dark:text-white mb-1">Click to upload ID or Certificate</div>
                <div className="text-xs text-slate-500">PDF, JPG, or PNG (Max 5MB)</div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg text-blue-700 dark:text-blue-400 text-sm">
                 <FileText className="w-5 h-5 shrink-0 mt-0.5" />
                 <p>Your documents are encrypted and only visible to our verification team.</p>
              </div>

              <div className="pt-4 flex justify-between">
                <Button variant="ghost" onClick={prevStep} className="gap-2">
                  <ChevronLeft className="w-4 h-4" /> Back
                </Button>
                <Button onClick={nextStep} className="gap-2">
                  Submit for Review <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-8"
            >
              <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-500">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              
              <h2 className="text-3xl font-bold font-display text-slate-900 dark:text-white mb-2">Profile Submitted!</h2>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8">
                Our team is reviewing your credentials. You can access the Creator Studio to start drafting content immediately.
              </p>

              <Button size="lg" className="w-full max-w-xs shadow-lg shadow-primary/20" onClick={() => navigate('/teacher/dashboard')}>
                Go to Creator Studio
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
