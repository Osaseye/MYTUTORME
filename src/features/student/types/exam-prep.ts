export interface Exam {
  id: string;
  title: string;
  courseTitle: string;
  duration: number; // minutes
  questionCount: number;
  difficulty: 'Level 1' | 'Level 2' | 'Level 3';
  topicDistribution: Record<string, number>; // e.g., { 'Vectors': 20, 'Calculus': 30 }
  status: 'not_started' | 'in_progress' | 'completed';
  lastAttempt?: string;
  score?: number;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  courseTitle: string;
  cardCount: number;
  masteryLevel: number; // 0-100
  lastStudied?: string;
}

export interface StudyPlan {
  id: string;
  examDate: string;
  topicsToCover: string[];
   dailyGoal: string;
  progress: number;
}
