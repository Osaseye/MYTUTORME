export type QuestionType = 'multiple-choice' | 'true-false' | 'short-answer';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  correctAnswer: string | number;
  explanation?: string;
  points: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  courseId: string;
  moduleId?: string;
  questions: Question[];
  passingScore: number;
  timeLimit?: number; // in minutes
}

export interface QuizStats {
    totalQuestions: number;
    correctAnswers: number;
    score: number;
    passed: boolean;
    timeTaken: number; // in seconds
}

export interface Certificate {
  id: string;
  studentName: string;
  courseName: string;
  instructorName: string;
  issueDate: string;
  verificationCode: string;
  grade?: string;
}
