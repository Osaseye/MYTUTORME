import { 
  Filter, 
  Plus, 
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const MyCertificatesPage = () => {

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-8 xl:col-span-9">
          
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">My Certificates</h1>
              <p className="mt-1 text-slate-600 dark:text-slate-400">Showcase your achievements and verified skills.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </Button>
              <Button className="bg-primary hover:bg-green-700 text-white flex items-center gap-2 shadow-sm">
                <Plus className="w-4 h-4" />
                Add External
              </Button>
            </div>
          </div>

          {/* Empty State */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
              <Award className="w-8 h-8 text-blue-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Certificates Yet</h3>
            <p className="text-slate-500 max-w-sm mb-6">You haven't earned any certificates yet. Complete courses and assessments to start building your portfolio.</p>
            <Button className="bg-primary hover:bg-green-700 text-white">
              Explore Courses
            </Button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-8">
          
          {/* Stats Card */}
          <div className="bg-gradient-to-br from-primary to-green-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <h3 className="font-display font-bold text-lg mb-4">Total Certifications</h3>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-4xl font-extrabold">0</span>
                <span className="text-green-200 mb-1 font-medium">Earned</span>
              </div>
              <div className="w-full bg-black/20 rounded-full h-1.5 mb-4">
                <div className="bg-white h-1.5 rounded-full" style={{ width: '0%' }}></div>
              </div>
              <p className="text-xs text-green-100">Start completing courses to earn your first certificate!</p>
            </div>
          </div>

          {/* Active Courses Progress */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white">Active Courses</h3>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-8 text-center flex flex-col items-center justify-center">
               <p className="text-sm text-slate-500">No active courses. Enroll in a course to see your progress here.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
