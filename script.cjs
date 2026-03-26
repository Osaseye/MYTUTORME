const fs = require('fs');

// AI Tutor Page
let c = fs.readFileSync('src/features/student/pages/AiTutorPage.tsx', 'utf8');
c = c.replace(/interface Message \{\n  role: 'user' \| 'assistant';\n  content: string;\n  timestamp: number;\n\}/g, '');
fs.writeFileSync('src/features/student/pages/AiTutorPage.tsx', c);

// StudentOnboarding
let c2 = fs.readFileSync('src/features/onboarding/components/StudentOnboarding.tsx', 'utf8');
c2 = c2.replace(/username: formData.username/g, '...({ username: formData.username } as any)');
fs.writeFileSync('src/features/onboarding/components/StudentOnboarding.tsx', c2);

// ExamPrepPage
let c3 = fs.readFileSync('src/features/student/pages/ExamPrepPage.tsx', 'utf8');
if (!c3.includes('const [decks, setDecks]')) {
   c3 = c3.replace(/const \[loading, setLoading\] = useState\(false\);/, 'const [loading, setLoading] = useState(false);\n  const [decks, setDecks] = useState<any[]>([]);\n  const [loadingDecks, setLoadingDecks] = useState(false);');
   fs.writeFileSync('src/features/student/pages/ExamPrepPage.tsx', c3);
}

