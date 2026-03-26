const fs = require('fs');
let cTypes = fs.readFileSync('src/features/student/pages/AiTutorPage.tsx', 'utf8').split('\n');

cTypes[0] = "import { useState, useRef, useEffect } from 'react';";
for(let i=21; i<=28; i++) {
    cTypes[i] = "";
}

fs.writeFileSync('src/features/student/pages/AiTutorPage.tsx', cTypes.join('\n'));
