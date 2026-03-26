import { useState } from 'react';
import { db } from '@/lib/firebase';
import { getModel } from '@/lib/ai';
import { useAuthStore } from '@/features/auth/hooks/useAuth';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { toast } from 'sonner';

export interface StudyPlanGenerationOptions {
  subject: string;
  targetExam: string;
  durationWeeks: number;
  proficiency: 'beginner' | 'intermediate' | 'advanced';
}

export const useStudyPlanGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuthStore();

  const generatePlan = async (options: StudyPlanGenerationOptions) => {
    setIsGenerating(true);
    try {
      // 0. Subscription Constraint Check
      const isPro = user?.plan === 'pro_monthly' || user?.plan === 'pro_yearly';
      if (!isPro && user?.uid) {
        const userPlansQuery = query(collection(db, 'study_plans'), where('userId', '==', user.uid));
        const userPlansSnap = await getDocs(userPlansQuery);
        if (userPlansSnap.docs.length >= 2) {
          toast.error('Free Plan Limit: Maximum of 2 active study plans reached. Upgrade to pro to create more.');
          setIsGenerating(false);
          return null;
        }
      }

      // 1. Smart Pooling: Check for existing templates
      const templatesRef = collection(db, 'study_plan_templates');
      const q = query(
        templatesRef,
        where('subject', '==', subject.toLowerCase()),
        where('targetExam', '==', targetExam.toLowerCase()),
        where('durationWeeks', '==', durationWeeks),
        where('proficiency', '==', proficiency)
      );

      let existingTemplates: any[] = [];
      try {
        const querySnapshot = await getDocs(q);
        existingTemplates = querySnapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      } catch (err: any) {
        console.warn('Firebase query failed for templates:', err.message);
      }

      let planData;

      // 2. Cache Hit vs Miss
      if (existingTemplates.length > 0) {
        console.log(`Cache Hit: Found ${existingTemplates.length} existing templates.`);
        planData = existingTemplates[0].plan; // Grab the most relevant one
      } else {
        console.log(`Cache Miss: Generating new ${durationWeeks}-week plan from Gemini...`);
        
        const prompt = `You are an expert academic tutor. Create a strict JSON study plan for a student preparing for "${targetExam}" in the subject of "${subject}".
        The student has ${durationWeeks} weeks to prepare, and currently identifies as having a "${proficiency}" proficiency level.
        IMPORTANT: Do not create more than 5 tasks per week to keep the plan achievable and ensure the JSON completion.

        Generate a structured timeline. Return a strict JSON object with this exact schema:
        {
          "title": "A short engaging title for the plan",
          "overview": "A brief 2-sentence summary of the strategy",
          "weeks": [
            {
              "weekNumber": 1,
              "focus": "The main theme of this week",
              "tasks": [
                { "task": "Study chapter X", "completed": false },
                { "task": "Practice 50 questions on Y", "completed": false }
              ]
            }
          ]
        }`;

        const model = getModel({ jsonMode: true, temperature: 0.5 });
        const result = await model.generateContent(prompt);
        
        try {
          const rawText = result.response.text();
          const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
          planData = JSON.parse(cleanText);
          
          if (!planData.weeks || !Array.isArray(planData.weeks)) {
             throw new Error("Invalid schema");
          }
        } catch (parseErr) {
          console.error("AI returned malformed JSON", result.response.text());
          throw new Error('Failed to parse AI study plan.');
        }

        // Save new template to global pool so future students benefit
        console.log("Saving new layout to template pool...");
        await addDoc(collection(db, 'study_plan_templates'), {
           subject: subject.toLowerCase(),
           targetExam: targetExam.toLowerCase(),
           durationWeeks,
           proficiency,
           plan: planData,
           createdAt: serverTimestamp(),
           createdBy: user?.uid || 'anonymous'
        });
      }

      // 3. Assign specific plan object to current student
      console.log("Assigning plan to current user...");
      const userPlanRef = await addDoc(collection(db, 'study_plans'), {
         userId: user?.uid,
         subject,
         targetExam,
         durationWeeks,
         proficiency,
         planData,
         progress: 0,
         createdAt: serverTimestamp(),
         lastUpdated: serverTimestamp()
      });

      return userPlanRef.id;

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