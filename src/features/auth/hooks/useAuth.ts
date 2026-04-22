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
      try {
        if (result) {
          console.log('[Auth] Redirect result found, user UID:', result.user.uid);
          const user = result.user;
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          console.log('[Auth] User document exists:', userDoc.exists());

          if (userDoc.exists() && userDoc.data().isSuspended) {
            console.warn('[Auth] User account is suspended after redirect');
            await firebaseSignOut(auth);
            return;
          }

          if (!userDoc.exists()) {
            const intendedRole = localStorage.getItem('oauth_intended_role');
            console.log('[Auth] User document not found, intended role:', intendedRole);
            
            if (intendedRole === 'student' || intendedRole === 'teacher') {
              console.log('[Auth] Creating user document with role:', intendedRole);
              try {
                await setDoc(userDocRef, buildUserDoc(user, intendedRole));
                console.log('[Auth] User document created successfully');
              } catch (docError: any) {
                console.error('[Auth] Error creating user document:', docError);
                throw docError;
              }
            } else {
              console.error('[Auth] No intended role found in localStorage after redirect');
              // New user from OAuth redirect without role selection
              await user.delete().catch(() => {});
              await firebaseSignOut(auth);
              return;
            }
          }
          localStorage.removeItem('oauth_intended_role');
        } else {
          console.log('[Auth] No redirect result found');
        }
      } catch (error: any) {
        console.error('[Auth] Error handling redirect result:', error);
      }
    }).catch((error: any) => {
      // Only log non-standard errors
      if (error.code !== 'auth/no-redirect-client-id') {
        console.error('[Auth] getRedirectResult error:', error);
      }
    });

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        set({ isLoading: true }); // Ensure loading state while fetching profile
        try {
          // Fetch additional user data from Firestore
          let userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          console.log('[Auth] onAuthStateChanged - user UID:', firebaseUser.uid, 'has doc:', userDoc.exists());
          
          // During registration, the Auth user is created slightly before the Firestore document.
          // If the document doesn't exist yet, wait and retry a few times.
          let retries = 0;
          while (!userDoc.exists() && retries < 4) {
            console.log(`[Auth] User doc not found, retrying (${retries + 1}/4)...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            retries++;
          }

          // If still not exists, maybe it's a popup flow that got interrupted? Check for intendedRole just in case
          if (!userDoc.exists()) {
            const intendedRole = localStorage.getItem('oauth_intended_role');
            console.log('[Auth] After retries, user doc still not found. Intended role:', intendedRole);
            
            if (intendedRole === 'student' || intendedRole === 'teacher') {
              console.log('[Auth] Creating user doc as fallback with role:', intendedRole);
              try {
                await setDoc(doc(db, 'users', firebaseUser.uid), buildUserDoc(firebaseUser as any, intendedRole));
                userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                console.log('[Auth] Fallback user doc created successfully');
              } catch (fallbackError: any) {
                console.error('[Auth] Error creating fallback user doc:', fallbackError);
                throw fallbackError;
              }
              localStorage.removeItem('oauth_intended_role');
            }
          }

          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            console.log('[Auth] User authenticated successfully, role:', userData.role);
            set({ user: userData, isAuthenticated: true, isLoading: false });
          } else {
            console.error('[Auth] User document not found in Firestore after all attempts');
            // If user exists in Auth but not Firestore (edge case), sign them out
             await firebaseSignOut(auth);
             set({ user: null, isAuthenticated: false, isLoading: false });
          }
        } catch (error: any) {
          console.error('[Auth] Error fetching user profile:', error);
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      } else {
        console.log('[Auth] User signed out');
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
