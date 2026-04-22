import { Link } from 'react-router-dom';
import { Home, ArrowLeft, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 relative">
        <GraduationCap className="h-8 w-8 text-primary" />
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white dark:border-slate-950">
          ?
        </div>
      </div>
      
      <h1 className="text-6xl font-display font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
        404
      </h1>
      
      <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-4">
        Page Not Found
      </h2>
      
      <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8 text-lg">
        Oops! It looks like we can't find the page you're looking for. It might have been moved, deleted, or never existed in the first place.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          variant="outline" 
          onClick={() => window.history.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Go Back
        </Button>
        <Link to="/">
          <Button className="gap-2 w-full sm:w-auto">
            <Home className="h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};
