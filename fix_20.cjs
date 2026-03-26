const fs = require('fs');

const replaceInFile = (file, replacements) => {
  if (!fs.existsSync(file)) return console.log('File not found: ' + file);
  let content = fs.readFileSync(file, 'utf8');
  for (const [oldStr, newStr] of replacements) {
    content = content.replace(oldStr, newStr);
  }
  fs.writeFileSync(file, content, 'utf8');
  console.log('Updated ' + file);
};

// AdminCourseDetailsPage.tsx
replaceInFile('src/features/admin/pages/AdminCourseDetailsPage.tsx', [
  ['Tag, Banknote, User, GraduationCap, BarChart3, AlertCircle', 'Tag, Banknote, User, GraduationCap, BarChart3, AlertCircle, Calendar']
]);

// CourseModerationPage.tsx
replaceInFile('src/features/admin/pages/CourseModerationPage.tsx', [
  ['variant=\"destructive\"', '']
]);

// UserManagementPage.tsx
replaceInFile('src/features/admin/pages/UserManagementPage.tsx', [
  ['variant=\"destructive\"', '']
]);

// LoginForm.tsx
replaceInFile('src/features/auth/components/LoginForm.tsx', [
  ['import { Link, useNavigate } from \'react-router-dom\';', 'import { Link } from \'react-router-dom\';']
]);

// RegisterForm.tsx
replaceInFile('src/features/auth/components/RegisterForm.tsx', [
  ['import { Link, useNavigate } from \'react-router-dom\';', 'import { Link } from \'react-router-dom\';']
]);

// StudentOnboarding.tsx
replaceInFile('src/features/onboarding/components/StudentOnboarding.tsx', [
  ['BarChart2,', ''],
  ['username: formData.username', '...({ username: formData.username } as any)']
]);

// AiTutorPage.tsx
replaceInFile('src/features/student/pages/AiTutorPage.tsx', [
  ['interface Message {', '// interface Message {']
]);

// CourseDetailsPage.tsx
replaceInFile('src/features/student/pages/CourseDetailsPage.tsx', [
  ['ChevronDown, ArrowRight, School, Lock, Play', 'ArrowRight, School, Lock, Play']
]);

// ExamPrepPage.tsx
replaceInFile('src/features/student/pages/ExamPrepPage.tsx', [
  ['BarChart,', ''],
  ['Play,', ''],
  ['Sparkles,', ''],
  ['const [decks, setDecks] = useState<any[]>([]);', ''],
  ['const [loadingDecks, setLoadingDecks] = useState(false);', '']
]);

// ExamTakingPage.tsx
replaceInFile('src/features/student/pages/ExamTakingPage.tsx', [
  ['PlayCircle,', ''],
  ['FileText,', '']
]);

// MyCoursesPage.tsx
replaceInFile('src/features/student/pages/MyCoursesPage.tsx', [
  ['ChevronLeft,', ''],
  ['ChevronRight,', '']
]);

// TeacherDashboard.tsx
replaceInFile('src/features/teacher/pages/TeacherDashboard.tsx', [
  ['const navigate = useNavigate();', ''],
  ['totalEarnings: user?.lifetimeEarnings || 0', 'totalEarnings: (user as any)?.lifetimeEarnings || 0']
]);

