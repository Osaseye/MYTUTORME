import { useState } from 'react';
import { db } from '@/lib/firebase';
import { getModel } from '@/lib/ai';
import { useAuthStore } from '@/features/auth/hooks/useAuth';
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
import { checkAndIncrementUsage } from './useUsageLimits';

interface FlashcardGenerationOptions {
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'adaptive';
  count: number;
}

export const useFlashcardGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuthStore();

  const generateDeck = async (options: FlashcardGenerationOptions) => {
    setIsGenerating(true);
    try {
      const { subject, topic, difficulty, count } = options;

      if (!user) {
        toast.error("You must be logged in to generate flashcards.");
        setIsGenerating(false);
        return null;
      }

      console.log(`Checking flashcards for ${subject} - ${topic}...`);

      // 0. Check if this user ALREADY has a deck for this topic!
      if (user) {
        const userDecksQuery = query(
          collection(db, 'flashcard_decks'),
          where('userId', '==', user.uid),
          where('subject', '==', subject),
          where('topic', '==', topic)
        );
        const existingDecksSnap = await getDocs(userDecksQuery);
        if (!existingDecksSnap.empty) {
            // Re-use the existing deck if we already have one!
            const existingDeck = existingDecksSnap.docs[0];

            // Should we add more cards if requested count > existing count?
            // For now, if the user generates it again, let's just return the existing deck to avoid duplicates.
            toast.success("Deck already exists! Redirecting...");
            setIsGenerating(false);
            return existingDeck.id;
        }
      }

      // Check limits before proceeding with actual AI generation
      const canGenerate = await checkAndIncrementUsage(user.uid, user.plan || 'free', 'flashcards');
      if (!canGenerate) {
        toast.error("Daily flashcard generation limit reached. Upgrade to Pro for unlimited decks!");
        setIsGenerating(false);
        return null;
      }

      // 1. Check existing flashcards in Firebase
      const flashcardsRef = collection(db, 'flashcards');
      const q = query(
        flashcardsRef,
        where('subject', '==', subject),
        where('topic', '==', topic),
        where('difficulty', '==', difficulty)
      );

      let existingFlashcards: any[] = [];
      try {
        const querySnapshot = await getDocs(q);
        existingFlashcards = querySnapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        }));
      } catch (err: any) {
        console.warn('Firebase query failed (likely needs index):', err.message);
      }

      let selectedFlashcardIds: string[] = [];

      // 2. Do we have enough flashcards in the pool?
      if (existingFlashcards.length >= count) {
        console.log(`Cache Hit: Found ${existingFlashcards.length} flashcards. Picking ${count}.`);
        // Shuffle and pick
        const shuffled = [...existingFlashcards].sort(() => 0.5 - Math.random());
        selectedFlashcardIds = shuffled.slice(0, count).map(f => f.id);
      } else {
        // 3. Cache Miss - Generate shortfall
        const shortfall = count - existingFlashcards.length;
        console.log(`Cache Miss: Found ${existingFlashcards.length}. Need ${shortfall} more from Gemini.`);

        const generationCount = shortfall < 5 ? 5 : shortfall;

        const prompt = `You are an expert tutor creating study flashcards.
          Generate exactly ${generationCount} flashcards for the subject "${subject}" strictly focused on the topic "${topic}" at a "${difficulty}" difficulty level.
          Return a strict JSON array. Each object MUST have this schema:
          {
            "front": "The question, concept, or term to study",
            "back": "The clear, concise answer, definition, or explanation",
            "hint": "A short optional hint to help the student remember (max 10 words)"
          }`;

        const model = getModel({ jsonMode: true, temperature: 0.6 });
        const result = await model.generateContent(prompt);

        let aiFlashcards = [];
        try {
          const rawText = result.response.text();
          const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
          aiFlashcards = JSON.parse(cleanText);
          if (!Array.isArray(aiFlashcards)) throw new Error("Not an array");
        } catch (parseErr) {
          console.error("AI returned malformed JSON", result.response.text());
          throw new Error('Failed to parse AI flashcard generation.');
        }

        console.log(`Generated ${aiFlashcards.length} new flashcards. Saving to database...`);

        // Save new flashcards via batch
        const batch = writeBatch(db);
        const newFlashcardIds: string[] = [];

        aiFlashcards.forEach((fObj: any) => {
          const newDocRef = doc(collection(db, 'flashcards'));
          batch.set(newDocRef, {
            ...fObj,
            subject,
            topic,
            difficulty,
            aiGenerated: true,
            createdAt: serverTimestamp()
          });
          newFlashcardIds.push(newDocRef.id);
        });

        await batch.commit();

        const allAvailableIds = [...existingFlashcards.map(f => f.id), ...newFlashcardIds];
        const shuffled = allAvailableIds.sort(() => 0.5 - Math.random());
        selectedFlashcardIds = shuffled.slice(0, count);
      }

      // 4. Create Deck Document
      console.log(`Creating deck with ${selectedFlashcardIds.length} flashcards...`);
      const deckDocRef = await addDoc(collection(db, 'flashcard_decks'), {
        title: `${subject} - ${topic} Flashcards`,
        subject,
        difficulty,
        topic,
        flashcardIds: selectedFlashcardIds,
        userId: user?.uid || null,
        aiGenerated: true,
        createdAt: serverTimestamp()
      });

      console.log('Deck created:', deckDocRef.id);
      return deckDocRef.id;

    } catch (error: any) {
      console.error('Error generating flashcards:', error);
      toast.error('Failed to generate flashcards: ' + error.message);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return { generateDeck, isGenerating };
};