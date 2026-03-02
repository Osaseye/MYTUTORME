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
    community: '/student/community',
    settings: '/student/settings',
  },
  teacher: {
    dashboard: '/teacher/dashboard',
    courses: '/teacher/courses',
    coursesNew: '/teacher/courses/new',
    students: '/teacher/students',
    analytics: '/teacher/analytics',
    resources: '/teacher/resources',
    community: '/teacher/community',
    settings: '/teacher/settings'
  },
  admin: {
    dashboard: '/admin/dashboard',
    users: '/admin/users',
  }
} as const;
