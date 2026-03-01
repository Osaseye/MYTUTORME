import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './protected-route';
import { paths } from './paths';
import LandingPage from '@/features/landing/LandingPage';
import { AuthLayout } from '@/layouts/AuthLayout';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { OnboardingLayout, StudentOnboarding, TeacherOnboarding } from '@/features/onboarding';
import { StudentLayout, StudentDashboard } from '@/features/student';

// Placeholder layouts
const TeacherLayout = () => <div>Teacher Layout Wrapper</div>;

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route element={<AuthLayout />}>
        <Route path={paths.auth.login} element={<LoginPage />} />
        <Route path={paths.auth.register} element={<RegisterPage />} />
      </Route>

      {/* Onboarding Routes (Protected) */}
      <Route element={<ProtectedRoute allowedRoles={['student', 'teacher']} />}>
          <Route element={<OnboardingLayout />}>
              <Route path={paths.onboarding.student} element={<StudentOnboarding />} />
              <Route path={paths.onboarding.teacher} element={<TeacherOnboarding />} />
          </Route>
      </Route>

      {/* Student Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route element={<StudentLayout />}>
          <Route path={paths.student.dashboard} element={<StudentDashboard />} />
          <Route path={paths.student.courses} element={<div>My Courses</div>} />
          <Route path={paths.student.aiTutor} element={<div>AI Tutor Chat</div>} />
          <Route path={paths.student.gpa} element={<div>GPA Calculator</div>} />
          <Route path={paths.student.examPrep} element={<div>Exam Prep Center</div>} />
          <Route path={paths.student.settings} element={<div>Settings</div>} />
        </Route>
      </Route>

      {/* Teacher Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
        <Route element={<TeacherLayout />}>
          <Route path={paths.teacher.dashboard} element={<div>Teacher Dashboard</div>} />
          <Route path={paths.teacher.courses} element={<div>My Courses</div>} />
        </Route>
      </Route>

      {/* Admin Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path={paths.admin.dashboard} element={<div>Admin Dashboard</div>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
