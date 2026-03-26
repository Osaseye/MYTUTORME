const fs = require('fs');
let content = fs.readFileSync('src/features/student/pages/ExamPrepPage.tsx', 'utf8');
content = content.replace('const [loading, setLoading] = useState(false);', 'const [loading, setLoading] = useState(false);\n  const [decks, setDecks] = useState<any[]>([]);\n  const [loadingDecks, setLoadingDecks] = useState(false);');
fs.writeFileSync('src/features/student/pages/ExamPrepPage.tsx', content);
