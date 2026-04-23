import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { ScrollToTop } from '@/components/ScrollToTop';
import { ProtectedRoute } from './protected-route';
import { paths } from './paths';
import { useAuth } from '@/features/auth/hooks/useAuth';
import LandingPage from '@/features/landing/LandingPage';
import { AuthLayout } from '@/layouts/AuthLayout';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { OnboardingLayout, StudentOnboarding, TeacherOnboarding } from '@/features/onboarding';
import { StudentLayout, StudentDashboard, AiTutorPage, MyCoursesPage, CourseDetailsPage, GeneratedCourseDetailsPage, AssignmentHelperPage, GpaTrackerPage, CertificatePage, MyCertificatesPage, SettingsPage, ExamPrepPage, ExamConfigPage, ExamResultsPage, ExamTakingPage, FlashcardConfigPage, FlashcardPlayerPage, CommunityPage, StudyPlannerConfigPage, StudyPlannerViewPage } from '@/features/student';
import { TeacherLayout, TeacherDashboard, TeacherCoursesPage, TeacherCourseDetailsPage, CourseCreationPage, ResourcesPage, EarningsPage, CommunityPage as TeacherCommunityPage, TeacherSettingsPage, StudentsPage, TeacherPendingPage } from '@/features/teacher';
import { AdminLayout, AdminDashboard, AdminLoginPage, UserManagementPage, CourseModerationPage, AdminCourseDetailsPage, FinancialsPage, SettingsPage as AdminSettingsPage, AdminSupportPage, AdminGeneratorPage } from '@/features/admin';
import { SupportPage } from '@/pages/SupportPage';
import { VerifyCertificatePage } from '@/pages/VerifyCertificatePage';
import { PublicExamPage } from '@/pages/PublicExamPage';
import { CourseInvitePage } from '@/pages/CourseInvitePage';
import { NotificationsPage } from '@/pages/NotificationsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const AppRoutes = () => {
  const isPWA = window.matchMedia("(display-mode: standalone)").matches;
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    if (isPWA && location.pathname === "/") {
      user ? navigate("/student/dashboard") : navigate("/login");
    }
  }, [isPWA, user, location.pathname, navigate]);

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={
          user ? (
            <Navigate to={`/${user.role}/dashboard`} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } />
        <Route path={paths.support} element={<SupportPage />} />
        <Route path={paths.verifyCertificate} element={<VerifyCertificatePage />} />
        <Route path="/public/exam/:quizId" element={<PublicExamPage />} />
        <Route path="/invite/:courseId" element={<CourseInvitePage />} />
        <Route element={<AuthLayout />}>
          <Route path={paths.auth.login} element={<LoginPage />} />
          <Route path={paths.auth.register} element={<RegisterPage />} />
          <Route path="/select-role" element={<Navigate to={paths.auth.register} replace />} />
          <Route path="/slect-role" element={<Navigate to={paths.auth.register} replace />} />
          <Route path={paths.auth.forgotPassword} element={<ForgotPasswordPage />} />
          <Route path={paths.admin.login} element={<AdminLoginPage />} />
        </Route>

      {/* Onboarding Routes (Protected) */}
      <Route element={<ProtectedRoute allowedRoles={['student', 'teacher'] as ('student' | 'teacher' | 'admin')[]} />}>
          <Route element={<OnboardingLayout />}>
              <Route path={paths.onboarding.student} element={<StudentOnboarding />} />
              <Route path={paths.onboarding.teacher} element={<TeacherOnboarding />} />
          </Route>
      </Route>

      {/* Student Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['student'] as ('student' | 'teacher' | 'admin')[]} />}>
        <Route element={<StudentLayout />}>
          <Route path={paths.student.dashboard} element={<StudentDashboard />} />
          <Route path={paths.student.courses} element={<MyCoursesPage />} />
          <Route path={paths.student.courses + '/generated/:courseId'} element={<GeneratedCourseDetailsPage />} />
          <Route path={paths.student.courses + '/:courseId'} element={<CourseDetailsPage />} />
          <Route path={paths.student.aiTutor} element={<AiTutorPage />} />
          <Route path={paths.student.assignmentHelper} element={<AssignmentHelperPage />} />
          <Route path={paths.student.community} element={<CommunityPage />} />
          <Route path={paths.student.gpa} element={<GpaTrackerPage />} />
          <Route path={paths.student.certificates} element={<MyCertificatesPage />} />
          <Route path="/student/certificates/:id" element={<CertificatePage />} />
          <Route path={paths.student.examPrep} element={<ExamPrepPage />} />

          <Route path="/student/exam-prep/config" element={<ExamConfigPage />} />
          <Route path="/student/exam-prep/active/:quizId" element={<ExamTakingPage />} />
          <Route path="/student/exam-prep/results/:attemptId" element={<ExamResultsPage />} />            <Route path="/student/exam-prep/flashcards" element={<FlashcardConfigPage />} />
            <Route path="/student/exam-prep/flashcards/:deckId" element={<FlashcardPlayerPage />} />          <Route path="/student/exam-prep/planner-config" element={<StudyPlannerConfigPage />} />
          <Route path="/student/exam-prep/planner/:planId" element={<StudyPlannerViewPage />} />
          <Route path={paths.student.settings} element={<SettingsPage />} />
          <Route path={paths.student.notifications} element={<NotificationsPage userRole="student" />} />
        </Route>
      </Route>

      {/* Teacher Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['teacher'] as ('student' | 'teacher' | 'admin')[]} />}>
        <Route path={paths.teacher.pending} element={<TeacherPendingPage />} />
        <Route element={<TeacherLayout />}>
          <Route path={paths.teacher.dashboard} element={<TeacherDashboard />} />
          <Route path={paths.teacher.courses} element={<TeacherCoursesPage />} />
          <Route path={paths.teacher.coursesNew} element={<CourseCreationPage />} />            <Route path={paths.teacher.courseDetails} element={<TeacherCourseDetailsPage />} />          <Route path={paths.teacher.students} element={<StudentsPage />} />
          <Route path={paths.teacher.resources} element={<ResourcesPage />} />
          <Route path={paths.teacher.earnings} element={<EarningsPage />} />
          <Route path={paths.teacher.community} element={<TeacherCommunityPage />} />
          <Route path={paths.teacher.settings} element={<TeacherSettingsPage />} />
          <Route path={paths.teacher.notifications} element={<NotificationsPage userRole="teacher" />} />
          {/* Add other teacher routes here as we build them */}
        </Route>
      </Route>

      {/* Admin Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin'] as ('student' | 'teacher' | 'admin')[]} />}>
          <Route element={<AdminLayout />}>
              <Route path={paths.admin.dashboard} element={<AdminDashboard />} />
              <Route path={paths.admin.users} element={<UserManagementPage />} />              <Route path={paths.admin.moderation} element={<CourseModerationPage />} />
              <Route path={paths.admin.support} element={<AdminSupportPage />} />
              <Route path={paths.admin.generator} element={<AdminGeneratorPage />} />
              <Route path={paths.admin.coursesNew} element={<CourseCreationPage />} />
              <Route path={paths.admin.courseDetails} element={<AdminCourseDetailsPage />} />
              <Route path={paths.admin.financials} element={<FinancialsPage />} />
              <Route path={paths.admin.settings} element={<AdminSettingsPage />} />
          </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
    </>
  );
};
