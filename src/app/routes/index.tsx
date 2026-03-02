import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './protected-route';
import { paths } from './paths';
import LandingPage from '@/features/landing/LandingPage';
import { AuthLayout } from '@/layouts/AuthLayout';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { OnboardingLayout, StudentOnboarding, TeacherOnboarding } from '@/features/onboarding';
import { StudentLayout, StudentDashboard, AiTutorPage, MyCoursesPage, CourseDetailsPage, AssignmentHelperPage, GpaTrackerPage, CertificatePage, MyCertificatesPage, SettingsPage, ExamPrepPage, ExamConfigPage, ExamResultsPage, ExamTakingPage } from '@/features/student';

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
          <Route path={paths.student.courses} element={<MyCoursesPage />} />
          <Route path={paths.student.courses + '/:courseId'} element={<CourseDetailsPage />} />
          <Route path={paths.student.aiTutor} element={<AiTutorPage />} />
          <Route path={paths.student.assignmentHelper} element={<AssignmentHelperPage />} />
          <Route path={paths.student.gpa} element={<GpaTrackerPage />} />
          <Route path={paths.student.certificates} element={<MyCertificatesPage />} />
          <Route path="/student/certificates/:id" element={<CertificatePage />} />
          <Route path={paths.student.examPrep} element={<ExamPrepPage />} />
          <Route path="/student/exam-prep/config" element={<ExamConfigPage />} />
          <Route path="/student/exam-prep/active" element={<ExamTakingPage />} />
          <Route path="/student/exam-prep/results" element={<ExamResultsPage />} />
          <Route path={paths.student.settings} element={<SettingsPage />} />
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
