export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  photoURL?: string;
  createdAt: number;
}

export interface StudentProfile extends User {
  role: 'student';
  level: 'secondary' | 'tertiary';
  gradingSystem: '4.0' | '5.0';
  gpa?: number;
}

export interface TeacherProfile extends User {
  role: 'teacher';
  bio?: string;
  subjects: string[];
}
