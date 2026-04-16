const fs = require('fs');

const examFile = './src/pages/PublicExamPage.tsx';
let code = fs.readFileSync(examFile, 'utf8');

code = code.replace(/^\uFEFF/g, '');
code = code.replace(/^[\s\S]*?import/, 'import');

code = code.replace(/onClick=\{handlePause\}/g, 'onClick={() => setShowSignupWall(true)}');

code = code.replace(/>\s*Save & Pause for later\s*<\/Button>/g, '>\n                     Sign up to save\n                  </Button>');
code = code.replace(/>\s*Save & Exit \(Pause\)\s*<\/Button>/g, '>\n                     Sign up to save\n                  </Button>');

const navbarRegex = /<Button\s+variant="outline"\s+size="sm"\s+onClick=\{[^\}]+\}\s+className="hidden md:flex items-center text-slate-600 dark:text-slate-400 gap-2"\s*>\s*<LogOut className="w-4 h-4" \/>\s*Save & Exit\s*<\/Button>/;
code = code.replace(navbarRegex, '');

if (!code.includes('Lock,')) {
    code = code.replace(/import \{([^}]+)\} from 'lucide-react';/, "import { Lock, $1 } from 'lucide-react';");
}

const modalCode = `
      {/* Sign Up Wall Modal */}
      {showSignupWall && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-800 text-center animate-in fade-in zoom-in duration-300">
               <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                 <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
               </div>
               <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                  Unlock the Full Exam
               </h3>
               <p className="text-slate-500 dark:text-slate-400 mb-8 whitespace-pre-wrap leading-relaxed">
                  You've reached the end of the free preview! Create an account or log in to track your progress, get an AI-analyzed score, and complete the full exam.
               </p>
               <div className="flex flex-col gap-3">
                  <Button 
                     className="w-full py-6 text-lg rounded-xl shadow-lg shadow-blue-500/20"
                     onClick={() => navigate('/register?returnTo=/student/exam-prep/active/' + quizId)}
                  >
                     Create your free account
                  </Button>
                  <Button 
                     variant="outline" 
                     className="w-full py-6 text-lg rounded-xl"
                     onClick={() => navigate('/login?returnTo=/student/exam-prep/active/' + quizId)}
                  >
                     Log In
                  </Button>
                  <Button 
                     variant="ghost" 
                     className="w-full mt-2 text-slate-500"
                     onClick={() => setShowSignupWall(false)}
                  >
                     Keep Browsing Preview
                  </Button>
               </div>
            </div>
         </div>
      )}
`;

if (!code.includes('Sign Up Wall Modal')) {
  let lastCloseDivIndex = code.lastIndexOf('</div>');
  if (lastCloseDivIndex !== -1) {
     code = code.substring(0, lastCloseDivIndex) + modalCode + '\n' + code.substring(lastCloseDivIndex);
  }
}

fs.writeFileSync(examFile, code);
console.log('Fixed for real');
