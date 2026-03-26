const fs = require('fs');
let b = fs.readFileSync('src/features/student/hooks/useFlashcardGenerator.ts', 'utf8');

if (!b.includes('./useUsageLimits')) {
  b = b.replace("import { toast } from 'sonner';", 
  \import { toast } from 'sonner';
import { checkAndIncrementUsage } from './useUsageLimits';\);
}

b = b.replace("const { subject, topic, difficulty, count } = options;",
\const { subject, topic, difficulty, count } = options;

      if (!user) {
        toast.error("You must be logged in to generate flashcards.");
        setIsGenerating(false);
        return null;
      }

      // Check limits before proceeding
      const canGenerate = await checkAndIncrementUsage(user.uid, user.plan || 'free', 'flashcards');
      if (!canGenerate) {
        toast.error("Daily flashcard generation limit reached. Upgrade to Pro for unlimited decks!");
        setIsGenerating(false);
        return null;
      }\);

fs.writeFileSync('src/features/student/hooks/useFlashcardGenerator.ts', b);
