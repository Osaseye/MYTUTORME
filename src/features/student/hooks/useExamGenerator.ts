import { useState } from 'react';
import { functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { toast } from 'sonner';

interface ExamGenerationOptions {
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'adaptive';
  count: number;
  mode: 'standard' | 'practice';
  fileData?: { data: string, mimeType: string }[];
}

export const useExamGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateExam = async (options: ExamGenerationOptions) => {
    setIsGenerating(true);
    try {
      const genFn = httpsCallable<ExamGenerationOptions, { success: boolean, quizId: string, mockExamId: string }>(functions, 'generateMockExam');
      const response = await genFn(options);
      
      console.log('Quiz created:', response.data.quizId);
      return response.data.quizId;
    } catch (error: any) {
      console.error('Error generating exam:', error);
      toast.error('Failed to generate exam: ' + error.message);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return { generateExam, isGenerating };
};
