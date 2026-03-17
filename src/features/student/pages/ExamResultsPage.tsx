import { 
  BarChart, 
  Map, 
  Target, 
  CheckCircle,
  AlertCircle,
  PlayCircle,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const ExamResultsPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-green-500/10 dark:from-primary/20 dark:to-green-500/20 z-0"></div>
          <div className="absolute top-0 right-0 p-8 opacity-20">
             <Target className="w-64 h-64 text-primary transform rotate-12" />
          </div>
          
          <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
             <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 text-sm font-bold mb-4">
                   <CheckCircle className="w-4 h-4" /> Exam Completed
                </div>
                <h1 className="text-3xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-2">
                   Exam Finished
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-lg max-w-xl">
                   Your results are being processed.
                </p>
             </div>

             <div className="flex items-center gap-6">
                <div className="relative w-40 h-40 flex items-center justify-center">
                   <svg className="w-full h-full transform -rotate-90">
                      <circle className="text-slate-200 dark:text-slate-700" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeWidth="12"></circle>
                      <circle className="text-primary" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeDasharray="440" strokeDashoffset="0" strokeWidth="12"></circle>
                   </svg>
                   <div className="absolute flex flex-col items-center">
                      <span className="text-4xl font-display font-bold text-slate-900 dark:text-white">0%</span>
                      <span className="text-sm font-medium text-slate-500 uppercase">Score</span>
                   </div>
                </div>
                
                <div className="hidden sm:flex flex-col gap-2">
                   <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 w-32">
                      <p className="text-xs text-slate-500 uppercase font-bold">Percentile</p>
                      <p className="text-xl font-bold text-primary">-</p>
                   </div>
                   <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 w-32">
                      <p className="text-xs text-slate-500 uppercase font-bold">Time Taken</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">0m 0s</p>
                   </div>
                </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* Detailed Breakdown */}
           <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-lg border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                    <BarChart className="w-6 h-6 text-primary" />
                    Topic Breakdown
                 </h2>
                 <button className="text-sm text-primary font-bold hover:underline">View Full Report</button>
              </div>

              <div className="space-y-6">
                 {(() => {
                     const breakdowns: Array<{ topic: string; correct: number; total: number; score: number; color: string; text: string; }> = [];
                     if (breakdowns.length === 0) {
                         return (
                             <div className="text-center text-slate-500 py-6">
                                 No topic breakdown available.
                             </div>
                         );
                     }
                     return breakdowns.map((item, idx) => (
                        <div key={idx}>
                           <div className="flex justify-between items-end mb-2">
                              <div>
                                 <h3 className="font-bold text-slate-900 dark:text-white">{item.topic}</h3>
                                 <p className="text-xs text-slate-500">{item.correct}/{item.total} Questions Correct</p>
                              </div>
                              <span className={`text-lg font-bold ${item.text}`}>{item.score}%</span>
                           </div>
                           <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3">
                              <div className={`${item.color} h-3 rounded-full`} style={{ width: `${item.score}%` }}></div>
                           </div>
                        </div>
                     ));
                 })()}
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700">
                 <h3 className="font-bold text-slate-900 dark:text-white mb-4">Question Analysis</h3>
                 <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide text-center text-slate-500 py-4">
                    No questions available.
                 </div>
              </div>
           </div>

           {/* Sidebar AI Insights */}
           <div className="space-y-8">
              <div className="bg-gradient-to-b from-blue-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-3xl p-6 shadow-lg border border-blue-100 dark:border-slate-700 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Map className="w-32 h-32" />
                 </div>
                 
                 <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                       <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400">
                          <AlertCircle className="w-5 h-5" />
                       </div>
                       <h2 className="font-bold text-slate-900 dark:text-white">AI Coach Insights</h2>
                    </div>
                    
                    <div className="space-y-4">
                       <div className="bg-white/60 dark:bg-slate-800/60 p-3 rounded-xl border border-blue-50 dark:border-slate-700 text-center text-slate-500">
                           No insights available at this time.
                       </div>
                    </div>
                    
                    <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white gap-2">
                       Generate Study Plan
                       <ArrowRight className="w-4 h-4" />
                    </Button>
                 </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-lg border border-slate-200 dark:border-slate-800">
                 <h2 className="font-bold text-slate-900 dark:text-white mb-4">Recommended Review</h2>
                 <div className="space-y-3">
                    {(() => {
                        const reviews: Array<{ title: string; type: string; time: string; icon: string; }> = [];
                        if (reviews.length === 0) {
                            return (
                                <div className="text-center text-slate-500 py-4">
                                    No recommendations at this time.
                                </div>
                            );
                        }
                        return reviews.map((item, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group cursor-pointer">
                               <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${item.icon}`}>
                                  <PlayCircle className="w-6 h-6" />
                               </div>
                               <div>
                                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{item.title}</h4>
                                  <p className="text-xs text-slate-500 mb-1">{item.type} • {item.time} lesson</p>
                                  <div className="flex items-center text-xs text-primary font-semibold">
                                     <PlayCircle className="w-3 h-3 mr-1" /> Watch Lesson
                                  </div>
                               </div>
                            </div>
                        ));
                    })()}
                 </div>
                 
                 <Button variant="outline" className="w-full mt-4">
                    View All Mistakes
                 </Button>
              </div>
           </div>

        </div>

        <div className="mt-8 flex justify-center gap-4">
           <Link to="/student/dashboard">
               <Button variant="secondary" className="px-6 py-6 rounded-full text-base">
                   Back to Dashboard
               </Button>
           </Link>
           <Button className="px-6 py-6 rounded-full text-base bg-primary hover:bg-green-700 flex items-center gap-2 shadow-lg shadow-primary/30">
               Start Next Topic <ArrowRight className="w-5 h-5" />
           </Button>
        </div>

      </div>
    </div>
  );
};
