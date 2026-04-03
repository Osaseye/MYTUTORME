import { useState } from 'react';
import { functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import { toast } from 'sonner';

interface FlashcardGenerationOptions {
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'adaptive';
  count: number;
  fileData?: { data: string, mimeType: string }[];
}

export const useFlashcardGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateDeck = async (options: FlashcardGenerationOptions) => {
    setIsGenerating(true);
    try {
      const genFn = httpsCallable<FlashcardGenerationOptions, { success: boolean, deckId: string }>(functions, 'generateFlashcardDeck');
      const response = await genFn(options);
      
      console.log('Deck created:', response.data.deckId);
      return response.data.deckId;
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
