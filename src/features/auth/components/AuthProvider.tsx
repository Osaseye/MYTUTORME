import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/hooks/useAuth';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    const unsubscribe = checkAuth();
    return () => unsubscribe();
  }, [checkAuth]);

  return <>{children}</>;
};
