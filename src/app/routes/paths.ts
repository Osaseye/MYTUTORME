export const paths = {
  auth: {
    login: '/login',
    register: '/register',
    forgotPassword: '/forgot-password',
  },
  onboarding: {
    student: '/onboarding/student',
    teacher: '/onboarding/teacher',
  },
  student: {
    dashboard: '/student/dashboard',
    courses: '/student/courses',
    aiTutor: '/student/ai-tutor',
    assignmentHelper: '/student/assignment-helper',
    gpa: '/student/gpa',
    certificates: '/student/certificates',
    examPrep: '/student/exam-prep',
    settings: '/student/settings',
  },
  teacher: {
    dashboard: '/teacher/dashboard',
    courses: '/teacher/courses',
    students: '/teacher/students',
    analytics: '/teacher/analytics',
  },
  admin: {
    dashboard: '/admin/dashboard',
    users: '/admin/users',
  }
} as const;
