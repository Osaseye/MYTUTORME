import { useState } from 'react';
import { functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { toast } from 'sonner';

export interface StudyPlanGenerationOptions {
  subject: string;
  targetExam: string;
  durationWeeks: number;
  proficiency: 'beginner' | 'intermediate' | 'advanced';
}

export const useStudyPlanGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePlan = async (options: StudyPlanGenerationOptions) => {
    setIsGenerating(true);
    try {
      const genFn = httpsCallable<StudyPlanGenerationOptions, { success: boolean, planId: string }>(functions, 'generateStudyPlan');
      const response = await genFn(options);
      
      console.log('Study Plan created:', response.data.planId);
      toast.success("Study plan successfully generated!");
      return response.data.planId;
    } catch (error: any) {
      console.error('Error generating study plan:', error);
      toast.error('Failed to generate study plan: ' + error.message);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return { generatePlan, isGenerating };
};
