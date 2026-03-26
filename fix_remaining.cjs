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

// ExamPrepPage
let examPrepFile = 'src/features/student/pages/ExamPrepPage.tsx';
if (fs.existsSync(examPrepFile)) {
    let content = fs.readFileSync(examPrepFile, 'utf8');
    content = content.replace('const [loadingDecks, setLoadingDecks]', 'const [loadingDecks, setLoadingDecks]');
    if (!content.includes('const [decks, setDecks]')) {
        content = content.replace('const [loading, setLoading] = useState(false);', 'const [loading, setLoading] = useState(false);\n  const [decks, setDecks] = useState<any[]>([]);\n  const [loadingDecks, setLoadingDecks] = useState(false);');
    }
    fs.writeFileSync(examPrepFile, content, 'utf8');
}


// AiTutorPage
let aiTutorPage = 'src/features/student/pages/AiTutorPage.tsx';
if (fs.existsSync(aiTutorPage)) {
    let content = fs.readFileSync(aiTutorPage, 'utf8');
    content = content.replace(/interface Message \{\s*role: 'user' \| 'assistant';\s*content: string;\s*timestamp: number;\s*\}/, '');
    fs.writeFileSync(aiTutorPage, content, 'utf8');
}


replaceInFile('src/features/onboarding/components/StudentOnboarding.tsx', [
    ['username: formData.username', '...({ username: formData.username } as any)']
]);

replaceInFile('src/features/teacher/pages/TeacherDashboard.tsx', [
    ['import { Link, useNavigate } from \'react-router-dom\';', 'import { Link } from \'react-router-dom\';']
]);

