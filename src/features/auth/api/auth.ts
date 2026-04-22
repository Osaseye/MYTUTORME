import { auth, db } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  signOut
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import type { LoginCredentials, RegisterCredentials } from '../types';

type AuthRole = RegisterCredentials['role'];

export const buildUserDoc = (
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

const isPWA = window.matchMedia("(display-mode: standalone)").matches;

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  let result;
  
  if (isPWA) {
    console.log('[Google Auth] PWA mode detected for login, using signInWithRedirect');
    await signInWithRedirect(auth, provider);
    return;
  }
  
  try {
    console.log('[Google Auth] Attempting loginWithGoogle via popup');
    result = await signInWithPopup(auth, provider);
    console.log('[Google Auth] Login popup successful, user:', result.user.uid);
  } catch (error: any) {
    console.warn('[Google Auth] Login popup failed:', error.code, error.message);
    if (
      error.code === 'auth/popup-blocked' ||
      error.code === 'auth/popup-closed-by-user' ||
      error.code === 'auth/cancelled-popup-request' ||
      error.code === 'auth/unauthorized-domain' ||
      error.message?.includes('Cross-Origin-Opener-Policy')
    ) {
      console.log('[Google Auth] Falling back to signInWithRedirect for login');
      await signInWithRedirect(auth, provider);
      return;
    }
    console.error('[Google Auth] Unrecoverable login error:', error);
    throw error;
  }
  const user = result.user;

  try {
    // Check if Firestore document exists (returning user vs new user)
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    console.log('[Google Auth] User doc exists for login:', userDoc.exists());

    if (userDoc.exists() && userDoc.data().isSuspended) {
      console.warn('[Google Auth] User account suspended during login');
      await signOut(auth);
      throw { code: 'auth/account-suspended', message: 'Your account has been suspended.' };
    }

    if (!userDoc.exists()) {
      console.warn('[Google Auth] No user document found during login - user must sign up first');
      // Force new users to use the Register page so they can select their role.
      await user.delete().catch(() => {});
      await signOut(auth);
      throw { code: 'auth/user-not-found', message: 'No account found. Please sign up to choose your account type (Student or Teacher).' };
    }

    return result;
  } catch (error: any) {
    console.error('[Google Auth] Error during login Firestore check:', error);
    throw error;
  }
};

export const registerWithGoogle = async (role: AuthRole) => {
  const provider = new GoogleAuthProvider();
  let result;
  
  if (role) {
     localStorage.setItem('oauth_intended_role', role);
     console.log('[Google Auth] Set oauth_intended_role:', role);
  }

  if (isPWA) {
    console.log('[Google Auth] PWA mode detected, using signInWithRedirect');
    await signInWithRedirect(auth, provider);
    return;
  }

  try {
    console.log('[Google Auth] Attempting signInWithPopup');
    result = await signInWithPopup(auth, provider);
    console.log('[Google Auth] Popup successful, user:', result.user.uid);
  } catch (error: any) {
    console.warn('[Google Auth] Popup failed with error:', error.code, error.message);
    if (
      error.code === 'auth/popup-blocked' ||
      error.code === 'auth/popup-closed-by-user' ||
      error.code === 'auth/cancelled-popup-request' ||
      error.code === 'auth/unauthorized-domain' ||
      error.message?.includes('Cross-Origin-Opener-Policy')
    ) {
      console.log('[Google Auth] Falling back to signInWithRedirect');
      await signInWithRedirect(auth, provider);
      return;
    }
    console.error('[Google Auth] Unrecoverable error:', error);
    throw error;
  }
  const user = result.user;

  try {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    console.log('[Google Auth] User doc exists:', userDoc.exists());

    if (userDoc.exists() && userDoc.data().isSuspended) {
      console.warn('[Google Auth] User account suspended');
      await signOut(auth);
      throw { code: 'auth/account-suspended', message: 'Your account has been suspended.' };
    }

    if (!userDoc.exists()) {
      console.log('[Google Auth] Creating new user document');
      await setDoc(userDocRef, buildUserDoc(user, role));
      console.log('[Google Auth] User document created successfully');
    }

    localStorage.removeItem('oauth_intended_role');
    return result;
  } catch (error: any) {
    console.error('[Google Auth] Error during Firestore operations:', error);
    throw error;
  }
};
