const fs = require('fs');

function replaceFile(path, replacer) {
  if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');
    let newContent = replacer(content);
    if (newContent !== content) {
      fs.writeFileSync(path, newContent);
      console.log('Updated ' + path);
    }
  }
}

// StudentSidebar
replaceFile('./src/features/student/components/StudentSidebar.tsx', code => {
  return code.replace(/GraduationCap,/, '').replace(/History/, '');
});

// CommunityPage
replaceFile('./src/features/student/pages/CommunityPage.tsx', code => {
  return code.replace(/const \[topics, setTopics\] = useState<Discussion\[\]>\(\[\]\);/, '')
             .replace(/const \[isLoading, setIsLoading\] = useState\(true\);/, '');
});

// ExamTakingPage
replaceFile('./src/features/student/pages/ExamTakingPage.tsx', code => {
  return code.replace(/,\n\s*setDoc/, '');
});

// FlashcardConfigPage
replaceFile('./src/features/student/pages/FlashcardConfigPage.tsx', code => {
  return code.replace(/, useEffect/, '');
});

// FlashcardPlayerPage
replaceFile('./src/features/student/pages/FlashcardPlayerPage.tsx', code => {
  return code.replace(/useEffect\(\(\) => \{\s*if \(!loading && cards\.length > 0\) \{[\s\S]*?startTour\([\s\S]*?\}\s*\}, \[startTour, loading, cards\]\);/m, '');
});

// GpaTrackerPage
replaceFile('./src/features/student/pages/GpaTrackerPage.tsx', code => {
  return code.replace(/useEffect\(\(\) => \{\s*if \(user\) \{\s*const steps: TourStep\[\][^]*?startTour\('gpa_tracker_page_v1', steps\);\s*\}\s*\}, \[user, startTour\]\);/m, '');
});

// MyCoursesPage
replaceFile('./src/features/student/pages/MyCoursesPage.tsx', code => {
  return code.replace(/const \{ startTour \} = useTourStore\(\);/, 'const startTour = () => {};')
             .replace(/import \{ useTourStore \} from '@\/app\/stores\/useTourStore';/, '');
});

// SettingsPage
replaceFile('./src/features/student/pages/SettingsPage.tsx', code => {
  let res = code.replace(/, functions/, '');
  res = res.replace(/import \{ httpsCallable \} from 'firebase\/functions';/, '');
  res = res.replace(/, Info/, '').replace(/, Trash2/, '');
  res = res.replace(/logout/, 'clearUser');
  return res;
});

// StudyPlannerConfigPage
replaceFile('./src/features/student/pages/StudyPlannerConfigPage.tsx', code => {
  return code.replace(/, useEffect/, '');
});

// StudyPlannerViewPage
replaceFile('./src/features/student/pages/StudyPlannerViewPage.tsx', code => {
  return code.replace(/useEffect\(\(\) => \{\s*if \(!loading && planDoc\) \{[\s\S]*?startTour\([\s\S]*?\}\s*\}, \[startTour, loading, planDoc\]\);/m, '');
});

// TeacherDashboard
replaceFile('./src/features/teacher/pages/TeacherDashboard.tsx', code => {
  let res = code.replace(/import \{ useState, useEffect \} from 'react';/, "import { useState } from 'react';");
  res = res.replace(/import \{ collection, query, where, getDocs \} from 'firebase\/firestore';\n/, '');
  res = res.replace(/, functions/, '');
  res = res.replace(/const \[stats, setStats\] = useState\(\{[\s\S]*?\}\);\s*\}\);/, '');
  return res;
});

// TeacherPendingPage
replaceFile('./src/features/teacher/pages/TeacherPendingPage.tsx', code => {
  return code.replace(/import \{ useEffect \} from "react";/, '');
});

// PublicExamPage
replaceFile('./src/pages/PublicExamPage.tsx', code => {
  let res = code.replace(/const \[isSubmitting, setIsSubmitting\] = useState\(false\);/, '');
  
  const effectCode = "\n  useEffect(() => {\n    if (user && user.role === 'student' && quizId) {\n      navigate('/student/exam-prep/active/' + quizId, { replace: true });\n    }\n  }, [user, navigate, quizId]);\n";
  res = res.replace(/const navigate = useNavigate\(\);/, 'const navigate = useNavigate();' + effectCode);
  
  return res;
});

console.log('Done script');
