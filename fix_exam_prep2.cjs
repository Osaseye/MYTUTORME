const fs = require('fs');
let content = fs.readFileSync('src/features/student/pages/ExamPrepPage.tsx', 'utf8');
content = content.replace('setDecks] = useState<any[]>([]);', 'setDecks] = useState<any[]>([]);\n  console.log(setDecks);');
content = content.replace('setLoadingDecks] = useState(false);', 'setLoadingDecks] = useState(false);\n  console.log(setLoadingDecks);');
fs.writeFileSync('src/features/student/pages/ExamPrepPage.tsx', content);
