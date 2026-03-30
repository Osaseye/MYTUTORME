const fs = require('fs');
const path = 'C:/Users/User/OneDrive/Desktop/MyTutorMe/mytutorme/functions/src/triggers/user.ts';
let content = fs.readFileSync(path, 'utf8');
content += `\nexport const onUserUpdated = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const email = after.email;
    const name = after.displayName || 'Teacher';

    if (!email || after.role !== 'teacher') return null;

    // Check for approval status change
    if (before.isApproved !== true && after.isApproved === true) {
      try {
        await sendEmail({
          to: email,
          subject: 'Your Teacher Profile is Approved!',
          react: React.createElement(TeacherApprovalEmail, {
            name,
            loginUrl: 'https://mytutorme.com/login',
          }),
        });
        console.log(\`Teacher approval email sent to \${email}\`);
      } catch (e) {
        console.error('Error sending approval email', e);
      }
    }

    // Check for rejection status
    if (before.status !== 'rejected' && after.status === 'rejected') {
      try {
        await sendEmail({
          to: email,
          subject: 'Update on Your Teacher Application',
          react: React.createElement(TeacherRejectionEmail, {
            name,
            reason: after.rejectionReason || 'Does not meet our current guidelines.',
          }),
        });
        console.log(\`Teacher rejection email sent to \${email}\`);
      } catch (e) {
        console.error('Error sending rejection email', e);
      }
    }

    return null;
  });\n`;
fs.writeFileSync(path, content);
