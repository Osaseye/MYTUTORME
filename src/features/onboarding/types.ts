// Placeholder for now
export interface StudentOnboardingData {
  level: string;
  institution: string;
  department?: string;
  currentGpa?: string;
  targetGpa?: string;
}

export interface TeacherOnboardingData {
  headline: string;
  bio: string;
  subjects: string[];
  credentials?: File;
}