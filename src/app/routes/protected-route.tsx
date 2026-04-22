import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { GlobalLoader } from '@/components/ui/global-loader';

export const ProtectedRoute = ({ allowedRoles }: { allowedRoles: string[] }) => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <GlobalLoader />;
  }

  if (!isAuthenticated || !user) {
    if (location.pathname.startsWith('/admin')) {
      return <Navigate to="/admin/login" replace />;
    }
    const returnTo = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login?returnTo=${returnTo}`} replace />;
  }

  if (!user.isOnboardingComplete) {
    if (user.role === 'student' && !location.pathname.startsWith('/onboarding')) return <Navigate to="/onboarding/student" replace />;
    if (user.role === 'teacher' && !location.pathname.startsWith('/onboarding')) return <Navigate to="/onboarding/teacher" replace />;
  }

  // Teacher Verification Guard
  if (user.role === 'teacher') {
    const teacherUser = user as any; // Cast safely or check explicitly
    const isApproved = teacherUser.verificationStatus === 'approved';
    const isPendingRoute = location.pathname.startsWith('/teacher/pending');
    
    // Unapproved teachers ONLY get access to onboarding or pending page
    if (!isApproved && !isPendingRoute && !location.pathname.startsWith('/onboarding') && allowedRoles.includes('teacher')) {
      return <Navigate to="/teacher/pending" replace />;
    }
    
    // Approved teachers shouldn't stay on the pending page
    if (isApproved && isPendingRoute) {
      return <Navigate to="/teacher/dashboard" replace />;
    }
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to their appropriate dashboard if they try to access a restricted route
    const dashboardMap = {
      student: '/student/dashboard',
      teacher: '/teacher/dashboard',
      admin: '/admin/dashboard',
    };
    return <Navigate to={dashboardMap[user.role as keyof typeof dashboardMap] || '/'} replace />;
  }

  return <Outlet />;
};
