const fs = require('fs');

const authContent = `import { auth, db } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import type { User } from '@/types/user';
import type { LoginCredentials, RegisterCredentials } from '../types';

export const loginUser = async ({ email, password }: LoginCredentials) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const registerUser = async ({ email, password, name, role }: RegisterCredentials) => {
  // 1. Create Auth User
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // 2. Update Auth Profile Display Name
  await updateProfile(user, { displayName: name });

  // 3. Create Firestore Document
  const userData: any = {
    uid: user.uid,
    email: user.email!,
    displayName: name,
    role: role,
    createdAt: Date.now(),
    isOnboardingComplete: false,
    plan: 'free',
    subscriptionStatus: null,
    subscriptionId: null,
    planStartDate: null,
    planRenewalDate: null,
    planCancelledAt: null,
    guidedAssignmentsRemaining: 0,
    premiumMockExamsRemaining: 0,
    aiQueryCount: 0,
    aiQueryDate: '',
    totalAmountPaid: 0,
    firstPaymentDate: null,
    acquisitionSource: 'organic',
  };

  // Add role-specific fields
  if (role === 'student') {
    Object.assign(userData, {
      level: 'secondary', // Default, can be updated later
      gradingSystem: '5.0', // Default
      studyStreak: 0,
    });
  } else if (role === 'teacher') {
    Object.assign(userData, {
      subjects: [],
    });
  }

  await setDoc(doc(db, 'users', user.uid), userData);

  return userCredential;
};

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  // Check if Firestore document exists (returning user vs new user)
  const userDoc = await getDoc(doc(db, 'users', user.uid));

  if (!userDoc.exists()) {
    // First Google login — create user document with student defaults
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName ?? '',
      role: 'student',
      photoURL: user.photoURL ?? '',
      createdAt: Date.now(),
      isOnboardingComplete: false,
      plan: 'free',
      subscriptionStatus: null,
      subscriptionId: null,
      planStartDate: null,
      planRenewalDate: null,
      planCancelledAt: null,
      guidedAssignmentsRemaining: 0,
      premiumMockExamsRemaining: 0,
      aiQueryCount: 0,
      aiQueryDate: '',
      totalAmountPaid: 0,
      firstPaymentDate: null,
      acquisitionSource: 'organic',
      level: 'secondary',
      gradingSystem: '5.0',
      studyStreak: 0,
    });
  }

  return result;
};
`;

fs.writeFileSync('src/features/auth/api/auth.ts', authContent);

const userTypeContent = `export type UserRole = 'student' | 'teacher' | 'admin';

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
}

export interface StudentProfile extends User {
  role: 'student';
  level: 'secondary' | 'tertiary';
  gradingSystem: '4.0' | '5.0';
  gpa?: number;
  studyStreak?: number;
}

export interface TeacherProfile extends User {
  role: 'teacher';
  bio?: string;
  subjects: string[];
}
`;

fs.writeFileSync('src/types/user.ts', userTypeContent);

console.log('auth.ts and user.ts updated.');