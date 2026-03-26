const fs = require('fs');
let b = fs.readFileSync('src/features/student/hooks/useExamGenerator.ts', 'utf8');

// 1. imports
b = b.replace("import { toast } from 'sonner';", 
\import { toast } from 'sonner';
import { useAuthStore } from '@/features/auth/hooks/useAuth';
import { checkAndIncrementUsage } from './useUsageLimits';\);

// 2. hook start
b = b.replace("const [isGenerating, setIsGenerating] = useState(false);",
\const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuthStore();\);

// 3. usage check
b = b.replace("const { subject, topic, difficulty, count, mode } = options;",
\const { subject, topic, difficulty, count, mode } = options;

      if (!user) {
        toast.error("You must be logged in to generate an exam.");
        setIsGenerating(false);
        return null;
      }

      const canGenerate = await checkAndIncrementUsage(user.uid, user.plan || 'free', 'mockExams');
      if (!canGenerate) {
        toast.error("Daily exam generation limit reached. Upgrade to Pro for unlimited mock exams!");
        setIsGenerating(false);
        return null;
      }\);

// 4. include userId in quiz
b = b.replace("aiGenerated: true,",
\iGenerated: true,
        userId: user?.uid || null,\);

fs.writeFileSync('src/features/student/hooks/useExamGenerator.ts', b);
