export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  createdAt: number;
  isOnboardingComplete?: boolean;
  plan?: string;
  subscriptionStatus?: string | null;
  subscriptionId?: string | null;
  planStartDate?: number | null;
  planRenewalDate?: number | null;
  planCancelledAt?: number | null;
  guidedAssignmentsRemaining?: number;
  premiumMockExamsRemaining?: number;
  aiQueryCount?: number;
  aiQueryDate?: string;
  totalAmountPaid?: number;
  firstPaymentDate?: number | null;
  acquisitionSource?: string;
  permissions?: string[];
  teacherSubscriptionPlan?: string;
  currentCommissionRate?: number;
  generationStats?: {
    date: string;
    mockExams: number;
    flashcards: number;
  };
}

export interface StudentProfile extends User {
  role: 'student';
  username?: string;
  level: string; // 'secondary' | 'tertiary'
  institution?: string;
  courseOfStudy?: string;
  classLevel?: string;
  gradingSystem: string; // '4.0' | '5.0'
  currentCGPA?: number;
  targetCGPA?: number;
  painPoint?: string;
  interests?: string[];
  studyStreak?: number;
}

export interface TeacherProfile extends User {
  role: 'teacher';
  bio?: string;
  subjects: string[];
  verificationStatus?: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}
