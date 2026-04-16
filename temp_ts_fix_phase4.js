import fs from 'fs';

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

replaceFile('./src/features/teacher/pages/TeacherDashboard.tsx', code => {
  let res = code;
  res = res.replace(/import \{ collection, query, where, getDocs \} from 'firebase\/firestore';\n/, '');
  res = res.replace(/import \{ db, functions \} from '@\/lib\/firebase';/, "import { functions } from '@/lib/firebase';");
  res = res.replace(/const \[stats, setStats\] = useState\(\{[\s\S]*?\}\);/, 'const [stats] = useState({ totalStudents: 0, activeCourses: 0, revenue: 0, averageRating: 0 });');
  return res;
});

replaceFile('./src/pages/PublicExamPage.tsx', code => {
  let res = code.replace(/const \[isSubmitting, setIsSubmitting\] = useState\(false\);/, '');
  
  res = res.replace(/\n\s*collection,\s*addDoc,\s*serverTimestamp,\s*updateDoc,\s*query,\s*where,\s*getDocs,\s*limit,\s*setDoc/m, '');
  return res;
});

console.log('Done script phase 4');
