const fs = require('fs');
let content = fs.readFileSync('src/features/student/pages/AiTutorPage.tsx', 'utf8');
content = content.replace(/\/\/ interface Message \{\s*role: 'user' \| 'assistant';\s*content: string;\s*timestamp: number;\s*\}/, '');
fs.writeFileSync('src/features/student/pages/AiTutorPage.tsx', content, 'utf8');
