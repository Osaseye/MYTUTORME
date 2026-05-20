// Secondary school portal – page exports
// Purpose-built secondary pages
export { SecondaryLayout } from './layouts/SecondaryLayout';
export { SecondaryDashboard } from './pages/SecondaryDashboard';
export { SecondarySubjectTrackerPage } from './pages/SecondarySubjectTrackerPage';
export { SecondaryExamPrepPage } from './pages/SecondaryExamPrepPage';
export { SecondaryExamConfigPage } from './pages/SecondaryExamConfigPage';

// Student pages re-used under the secondary layout (all navigation is basePath-aware)
export {
  AiTutorPage as SecondaryAiTutorPage,
  AssignmentHelperPage as SecondaryAssignmentHelperPage,
  CommunityPage as SecondaryCommunityPage,
  MyCoursesPage as SecondaryCoursesPage,
  CourseDetailsPage as SecondaryCourseDetailsPage,
  GeneratedCourseDetailsPage as SecondaryGeneratedCourseDetailsPage,
  SettingsPage as SecondarySettingsPage,
  MyCertificatesPage as SecondaryCertificatesPage,
  CertificatePage as SecondaryCourseCertificatePage,
  ExamTakingPage as SecondaryExamTakingPage,
  ExamResultsPage as SecondaryExamResultsPage,
  FlashcardConfigPage as SecondaryFlashcardConfigPage,
  FlashcardPlayerPage as SecondaryFlashcardPlayerPage,
  StudyPlannerConfigPage as SecondaryStudyPlannerConfigPage,
  StudyPlannerViewPage as SecondaryStudyPlannerViewPage,
} from '@/features/student';
