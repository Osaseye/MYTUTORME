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

replaceFile('./src/features/student/pages/SettingsPage.tsx', code => {
  return code.replace(/clearUser/, 'signOut').replace(/logout/g, 'signOut');
});

replaceFile('./src/features/teacher/pages/TeacherDashboard.tsx', code => {
  let res = code.replace(/import \{ collection, query, where, getDocs \} from 'firebase\/firestore';\n/, '');
  res = res.replace(/import \{ db, functions \} from '@\/lib\/firebase';/, "import { functions } from '@/lib/firebase';");
  return res;
});

console.log('Done Script');
