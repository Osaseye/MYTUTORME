import { Award } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CertificatePage = () => {
  // Ready for backend data fetching logic here

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 flex flex-col items-center justify-center">
       <div className="w-full max-w-4xl mb-8 flex flex-col-reverse md:flex-row justify-between items-center gap-4">
            <Link to="/student/dashboard" className="text-sm font-medium text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors">
                ← Back to Dashboard
            </Link>
       </div>

       {/* Certificate Empty State */}
       <div className="w-full max-w-5xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-800 rounded-xl p-12 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-4 shadow-sm">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
            <Award className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Certificate Found
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm">
            We couldn't locate a certificate with the provided ID. Please check the link or return to your dashboard.
          </p>
       </div>
    </div>
  );
};
