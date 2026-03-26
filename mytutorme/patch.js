const fs = require('fs');
let b = fs.readFileSync('../src/features/student/pages/ExamConfigPage.tsx', 'utf8');
const search = /const handleStartExam = async \(\) => \{[\s\S]*?let finalSub = selectedSubject;/;
const replace = `const handleStartExam = async () => {
      try {
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && userDoc.data().activeExamId) {
            const activeExamId = userDoc.data().activeExamId;
            toast.error("You have an incomplete exam. Please finish it first!", {
                action: {
                    label: "Resume",
                    onClick: () => navigate(\`/student/exam-prep/active/\${activeExamId}\`)
                }
            });
            return;
          }
        }
      } catch (err) {
        console.error("Error checking active exam status", err);
      }

      let finalSub = selectedSubject;`;
b = b.replace(search, replace);
fs.writeFileSync('../src/features/student/pages/ExamConfigPage.tsx', b);
