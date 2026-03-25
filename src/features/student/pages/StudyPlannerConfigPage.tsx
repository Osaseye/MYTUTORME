import { useState } from 'react';
import { Calendar, Target, BrainCircuit, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useStudyPlanGenerator } from '../hooks/useStudyPlanGenerator';

export const StudyPlannerConfigPage = () => {
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [targetExam, setTargetExam] = useState('');
  const [durationWeeks, setDurationWeeks] = useState([4]);
  const [proficiency, setProficiency] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  
  const { generatePlan, isGenerating } = useStudyPlanGenerator();

  const handleGenerate = async () => {
    if (!subject.trim() || !targetExam.trim()) {
      toast.error('Please enter both subject and target exam.');
      return;
    }

    const planId = await generatePlan({
      subject: subject.trim(),
      targetExam: targetExam.trim(),
      durationWeeks: durationWeeks[0],
      proficiency
    });

    if (planId) {
      navigate(`/student/exam-prep/planner/${planId}`);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 px-4 sm:px-6 lg:px-8 w-full min-h-[80vh] flex flex-col pt-8">
      <div className="max-w-3xl mx-auto space-y-6 md:space-y-8 w-full">

        <div className="text-center">
           <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-4 text-primary">
              <Calendar className="w-8 h-8" />
           </div>
           <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">
             AI Study Planner
           </h1>
           <p className="text-slate-600 dark:text-slate-400">
             Generate a personalized, day-by-day roadmap tailored to your specific exams.
           </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8 space-y-8">
           
           {/* Subject & Exam */}
           <div className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                 <Target className="w-5 h-5 text-primary" />
                 Target Goals
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Subject Name</label>
                    <Input
                      placeholder="e.g. Mathematics, Chemistry"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Target Exam</label>
                    <Input
                      placeholder="e.g. WAEC, JAMB, PHY101"
                      value={targetExam}
                      onChange={(e) => setTargetExam(e.target.value)}
                    />
                 </div>
              </div>
           </div>

           {/* Proficiency */}
           <div className="space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                 <BrainCircuit className="w-5 h-5 text-primary" />
                 Current Proficiency
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                 {['beginner', 'intermediate', 'advanced'].map((level) => (
                    <button
                       key={level}
                       onClick={() => setProficiency(level as any)}
                       className={`p-3 rounded-xl border-2 transition-all capitalize font-medium
                             ${proficiency === level 
                             ? 'border-primary bg-primary/5 text-primary' 
                             : 'border-slate-200 dark:border-slate-800 text-slate-600 hover:border-primary/30'}`}
                    >
                       {level}
                    </button>
                 ))}
              </div>
           </div>

           {/* Timeframe */}
           <div className="space-y-6 pt-2">
              <div className="flex justify-between items-center">
                 <h2 className="text-lg font-bold flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Study Duration (Weeks)
                 </h2>
                 <span className="text-xl font-bold text-primary">{durationWeeks[0]} Weeks</span>
              </div>
              <Slider
                value={durationWeeks}
                onValueChange={setDurationWeeks}
                max={16}
                min={1}
                step={1}
                className="py-4" 
              />
           </div>

           <Button 
               className="w-full py-6 text-lg rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
               onClick={handleGenerate}
               disabled={isGenerating}
           >
              {isGenerating ? (
                 <>
                   <Sparkles className="w-5 h-5 animate-pulse" />
                   Structuring Roadmap...
                 </>
              ) : (
                 <>
                   Generate Plan
                   <ChevronRight className="w-5 h-5" />
                 </>
              )}
           </Button>
        </div>
      </div>
    </div>
  );
};