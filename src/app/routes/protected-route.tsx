import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';

export const ProtectedRoute = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    if (location.pathname.startsWith('/admin')) {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to their appropriate dashboard if they try to access a restricted route
    const dashboardMap = {
      student: '/dashboard',
      teacher: '/teacher/dashboard',
      admin: '/admin/dashboard',
    };
    return <Navigate to={dashboardMap[user.role as keyof typeof dashboardMap] || '/'} replace />;
  }

  return <Outlet />;
};
