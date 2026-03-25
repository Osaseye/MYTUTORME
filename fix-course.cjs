const fs = require('fs');
const p = 'src/features/admin/pages/CourseModerationPage.tsx';
let c = fs.readFileSync(p, 'utf8');

const target = `course.status === 'published' ? 'Live' :
                 (course.status === 'pending_review' || course.status === 'pending') ? 'Pending' :

            {/* Quick Preview overlay */}`;

const replacement = `course.status === 'published' ? 'Live' :
                 (course.status === 'pending_review' || course.status === 'pending') ? 'Pending' :
                 course.status === 'rejected' ? 'Rejected' :
                 course.status === 'draft' ? 'Draft' : 'Flagged'}
            </Badge>

            {/* Quick Preview overlay */}`;

const badgeTarget = `course.status === 'rejected' ? 'bg-red-500 hover:bg-red-600 text-white' :
                'bg-rose-600 hover:bg-rose-700 text-white'
            }\`}>`;

const badgeReplacement = `course.status === 'rejected' ? 'bg-red-500 hover:bg-red-600 text-white' :
                course.status === 'draft' ? 'bg-slate-500 hover:bg-slate-600 text-white' :
                'bg-rose-600 hover:bg-rose-700 text-white'
            }\`}>`;

c = c.replace(target, replacement);
c = c.replace(badgeTarget, badgeReplacement);

const btnTarget = `<Button variant="secondary" size="sm" className="bg-white/90 hover:bg-white text-slate-900">
                    <Eye className="w-4 h-4 mr-2" /> View Course
                </Button>`;
const btnReplacement = `<Button variant="secondary" size="sm" className="bg-white/90 hover:bg-white text-slate-900" onClick={() => window.open(\`/course/\${course.id}\`, '_blank')}>
                    <Eye className="w-4 h-4 mr-2" /> View Course
                </Button>`;

c = c.replace(btnTarget, btnReplacement);
fs.writeFileSync(p, c);
console.log("Fixed!");