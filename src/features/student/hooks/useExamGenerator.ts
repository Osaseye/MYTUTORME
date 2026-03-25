import { useState } from 'react';
import { db } from '@/lib/firebase';
import { getModel } from '@/lib/ai';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  writeBatch, 
  doc, 
  serverTimestamp, 
  addDoc 
} from 'firebase/firestore';
import { toast } from 'sonner';

interface ExamGenerationOptions {
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'adaptive';
  count: number;
  mode: 'standard' | 'practice';
}

export const useExamGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateExam = async (options: ExamGenerationOptions) => {
    setIsGenerating(true);
    try {
      const { subject, topic, difficulty, count, mode } = options;
      const questionsRef = collection(db, 'questions');

      const q = query(
        questionsRef, 
        where('subject', '==', subject),
        where('topic', '==', topic),
        where('difficulty', '==', difficulty)
      );
      
      let existingQuestions: any[] = [];
      try {
        const querySnapshot = await getDocs(q);
        existingQuestions = querySnapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        }));
      } catch (err: any) {
        // If composite index is missing, log it and proceed with empty so it forces AI generation
        console.warn('Firebase query failed (likely needs index):', err.message);
      }

      let selectedQuestionIds: string[] = [];

      // 2. Do we have enough questions pool?
      if (existingQuestions.length >= count) {
        console.log(`Cache Hit: Found ${existingQuestions.length} questions. Picking ${count}.`);
        // Shuffle and pick
        const shuffled = [...existingQuestions].sort(() => 0.5 - Math.random());
        selectedQuestionIds = shuffled.slice(0, count).map(q => q.id);
      } else {
        // 3. Cache Miss - Generate shortfall 
        const shortfall = count - existingQuestions.length;
        console.log(`Cache Miss: Found ${existingQuestions.length}. Need ${shortfall} more from Gemini.`);
        
        // Always generate a bit more than shortfall to pad the global database
        const generationCount = shortfall < 5 ? 5 : shortfall;
        
        const prompt = `You are an expert exam creator.
          Generate exactly ${generationCount} multiple-choice questions for the subject "${subject}" specifically on the topic "${topic}" at a "${difficulty}" difficulty level.
          
          Return a strict JSON array. Each object MUST have this schema:
          {
            "text": "The question text",
            "type": "multiple-choice",
            "options": ["A", "B", "C", "D"],
            "correctAnswer": "The exact string of the correct option",
            "explanation": "A short, helpful explanation of why this answer is correct."
          }`;

        const model = getModel({ jsonMode: true, temperature: 0.6 });
        const result = await model.generateContent(prompt);
        
        // Parse results
        let aiQuestions = [];
        try {
          const rawText = result.response.text();
          // Gemini sometimes wraps JSON in markdown blocks even in jsonMode
          const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
          aiQuestions = JSON.parse(cleanText);
          if (!Array.isArray(aiQuestions)) throw new Error("Not an array");
        } catch (parseErr) {
          console.error("AI returned malformed JSON", result.response.text());
          throw new Error('Failed to parse AI question generation.');
        }

        console.log(`Generated ${aiQuestions.length} new questions. Saving to database...`);

        // Save new questions via batch
        const batch = writeBatch(db);
        const newQuestionIds: string[] = [];

        aiQuestions.forEach((qObj: any) => {
          const newDocRef = doc(collection(db, 'questions'));
          batch.set(newDocRef, {
            ...qObj,
            subject,
            topic,
            difficulty,
            aiGenerated: true,
            createdAt: serverTimestamp()
          });
          newQuestionIds.push(newDocRef.id);
        });

        await batch.commit();

        // Combine existing IDs + new IDs
        const allAvailableIds = [...existingQuestions.map(q => q.id), ...newQuestionIds];
        
        // Pick the exact count we need
        const shuffled = allAvailableIds.sort(() => 0.5 - Math.random());
        selectedQuestionIds = shuffled.slice(0, count);
      }

      // 4. Create Quiz Document
      console.log(`Creating quiz with ${selectedQuestionIds.length} questions...`);
      const quizDocRef = await addDoc(collection(db, 'quizzes'), {
        title: `${subject} - ${topic} ${mode === 'standard' ? 'Exam' : 'Practice'}`,
        subject,
        difficulty,
        topic,
        mode,
        timeLimit: count * 1.5, // 1.5 minutes per question default
        passingScore: 70,
        questionIds: selectedQuestionIds,
        aiGenerated: true,
        createdAt: serverTimestamp()
      });

      console.log('Quiz created:', quizDocRef.id);
      return quizDocRef.id;

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
