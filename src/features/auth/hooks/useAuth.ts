import { create } from 'zustand';
import type { User } from '@/types/user';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut, getRedirectResult } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { buildUserDoc } from '../api/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => Promise<void>;
  checkAuth: () => () => void; // Returns unsubscribe function
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  signOut: async () => {
    await firebaseSignOut(auth);
    set({ user: null, isAuthenticated: false });
  },
  checkAuth: () => {
    set({ isLoading: true });
    
    // Handle redirect result from OAuth on mobile
    getRedirectResult(auth).then(async (result) => {
      if (result) {
        const user = result.user;
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists() && userDoc.data().isSuspended) {
          await firebaseSignOut(auth);
          return;
        }

        if (!userDoc.exists()) {
          const intendedRole = localStorage.getItem('oauth_intended_role');
          if (intendedRole === 'student' || intendedRole === 'teacher') {
            await setDoc(userDocRef, buildUserDoc(user, intendedRole));
          } else {
            // New user from Login page redirect, delete user and error out
            await user.delete().catch(() => {});
            await firebaseSignOut(auth);
            return;
          }
        }
        localStorage.removeItem('oauth_intended_role');
      }
    }).catch(console.error);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        set({ isLoading: true }); // Ensure loading state while fetching profile
        try {
          // Fetch additional user data from Firestore
          let userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          // During registration, the Auth user is created slightly before the Firestore document.
          // If the document doesn't exist yet, wait and retry a few times.
          let retries = 0;
          while (!userDoc.exists() && retries < 4) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            retries++;
          }

          // If still not exists, maybe it's a popup flow that got interrupted? Check for intendedRole just in case
          if (!userDoc.exists()) {
            const intendedRole = localStorage.getItem('oauth_intended_role');
            if (intendedRole === 'student' || intendedRole === 'teacher') {
              await setDoc(doc(db, 'users', firebaseUser.uid), buildUserDoc(firebaseUser as any, intendedRole));
              userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
              localStorage.removeItem('oauth_intended_role');
            }
          }

          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            set({ user: userData, isAuthenticated: true, isLoading: false });
          } else {
            console.error('User document not found in Firestore after retries');
            // If user exists in Auth but not Firestore (edge case), sign them out
             await firebaseSignOut(auth);
             set({ user: null, isAuthenticated: false, isLoading: false });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    });
    
    return unsubscribe;
  },
}));

// Helper hook for components to easily access auth state
export const useAuth = () => {
  const { user, isLoading, isAuthenticated, signOut } = useAuthStore();
  return { user, isLoading, isAuthenticated, signOut };
};
