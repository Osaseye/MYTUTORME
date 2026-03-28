const fs = require('fs');
const path = 'C:/Users/User/OneDrive/Desktop/MyTutorMe/mytutorme/src/features/admin/pages/UserManagementPage.tsx';
let c = fs.readFileSync(path, 'utf8');

c = c.replace(/selectedUser\.plan &&\s*selectedUser\.plan\.includes\('pro'\)/g, "selectedUser.plan && (selectedUser.plan.includes('pro') || selectedUser.plan === 'monthly' || selectedUser.plan === 'yearly')");
c = c.replace(/selectedUser\.plan\.includes\('yearly'\)/g, "(selectedUser.plan.includes('yearly') || selectedUser.plan === 'yearly')");

fs.writeFileSync(path, c);
