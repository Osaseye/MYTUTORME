import { Routes, Route, Navigate } from 'react-router-dom';
import { ScrollToTop } from '@/components/ScrollToTop';
import { ProtectedRoute } from './protected-route';
import { paths } from './paths';
import LandingPage from '@/features/landing/LandingPage';
import { AuthLayout } from '@/layouts/AuthLayout';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { OnboardingLayout, StudentOnboarding, TeacherOnboarding } from '@/features/onboarding';
import { StudentLayout, StudentDashboard, AiTutorPage, MyCoursesPage, CourseDetailsPage, AssignmentHelperPage, GpaTrackerPage, CertificatePage, MyCertificatesPage, SettingsPage, ExamPrepPage, ExamConfigPage, ExamResultsPage, ExamTakingPage, FlashcardConfigPage, FlashcardPlayerPage, CommunityPage, StudyPlannerConfigPage, StudyPlannerViewPage } from '@/features/student';
import { TeacherLayout, TeacherDashboard, TeacherCoursesPage, TeacherCourseDetailsPage, CourseCreationPage, ResourcesPage, EarningsPage, CommunityPage as TeacherCommunityPage, TeacherSettingsPage, StudentsPage, TeacherPendingPage } from '@/features/teacher';
import { AdminLayout, AdminDashboard, UserManagementPage, AdminLoginPage, CourseModerationPage, AdminCourseDetailsPage, FinancialsPage, SettingsPage as AdminSettingsPage } from '@/features/admin';
import { SupportPage } from '@/pages/SupportPage';
import { VerifyCertificatePage } from '@/pages/VerifyCertificatePage';

export const AppRoutes = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path={paths.support} element={<SupportPage />} />
        <Route path={paths.verifyCertificate} element={<VerifyCertificatePage />} />
        <Route element={<AuthLayout />}>
          <Route path={paths.auth.login} element={<LoginPage />} />
          <Route path={paths.auth.register} element={<RegisterPage />} />
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
          <Route path="/student/exam-prep/planner/:planId" element={<StudyPlannerViewPage />} />          <Route path={paths.student.settings} element={<SettingsPage />} />
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
          {/* Add other teacher routes here as we build them */}
        </Route>
      </Route>

      {/* Admin Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin'] as ('student' | 'teacher' | 'admin')[]} />}>
          <Route element={<AdminLayout />}>
              <Route path={paths.admin.dashboard} element={<AdminDashboard />} />
              <Route path={paths.admin.users} element={<UserManagementPage />} />              <Route path={paths.admin.moderation} element={<CourseModerationPage />} />
              <Route path={paths.admin.courseDetails} element={<AdminCourseDetailsPage />} />
              <Route path={paths.admin.financials} element={<FinancialsPage />} />
              <Route path={paths.admin.settings} element={<AdminSettingsPage />} />
          </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
};
