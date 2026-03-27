import { auth, db } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  signOut
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import type { LoginCredentials, RegisterCredentials } from '../types';

type AuthRole = RegisterCredentials['role'];

const buildUserDoc = (
  user: { uid: string; email: string | null; displayName: string | null; photoURL: string | null },
  role: AuthRole,
) => {
  const baseUserData: Record<string, unknown> = {
    uid: user.uid,
    email: user.email ?? '',
    displayName: user.displayName ?? '',
    role,
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
  };

  if (role === 'student') {
    return {
      ...baseUserData,
      level: 'secondary',
      gradingSystem: '5.0',
      studyStreak: 0,
    };
  }

  return {
    ...baseUserData,
    subjects: [],
  };
};

export const loginUser = async ({ email, password }: LoginCredentials) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  
  // Check suspension status
  const userDoc = await getDoc(doc(db, 'users', result.user.uid));
  if (userDoc.exists() && userDoc.data().isSuspended) {
    await signOut(auth);
    throw { code: 'auth/account-suspended', message: 'Your account has been suspended.' };
  }
  
  return result;
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
  const userDocRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists() && userDoc.data().isSuspended) {
    await signOut(auth);
    throw { code: 'auth/account-suspended', message: 'Your account has been suspended.' };
  }

  if (!userDoc.exists()) {
    // First Google auth via login defaults to student profile.
    await setDoc(doc(db, 'users', user.uid), buildUserDoc(user, 'student'));
  }

  return result;
};

export const registerWithGoogle = async (role: AuthRole) => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  const userDocRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists() && userDoc.data().isSuspended) {
    await signOut(auth);
    throw { code: 'auth/account-suspended', message: 'Your account has been suspended.' };
  }

  if (!userDoc.exists()) {
    await setDoc(userDocRef, buildUserDoc(user, role));
  }

  return result;
};
