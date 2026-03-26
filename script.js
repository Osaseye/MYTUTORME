const fs = require('fs');

let c = fs.readFileSync('src/features/student/pages/AiTutorPage.tsx', 'utf8');
c = c.replace(/import \{ useState, useRef, useEffect \/\/ \} from 'react';/, 'import { useState, useRef, useEffect } from \'react\';');
c = c.replace(/id: string;\n  \/\/ role: 'user' \| 'assistant';\n  \/\/ content: string;\n  timestamp: string;\n\}/g, '');
c = c.replace(/\/\/ Types for our chat\n  \/\/ interface Message \{\n/, '');

fs.writeFileSync('src/features/student/pages/AiTutorPage.tsx', c);

