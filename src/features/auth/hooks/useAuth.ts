import { create } from 'zustand';
import type { User } from '@/types/user';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

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
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Fetch additional user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            set({ user: userData, isAuthenticated: true, isLoading: false });
          } else {
            console.error('User document not found in Firestore');
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
