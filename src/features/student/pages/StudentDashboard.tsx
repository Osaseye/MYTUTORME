import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  PlayCircle, 
  ArrowRight, 
  BrainCircuit, 
  Clock,
  Target,
  MoreVertical,
  BookOpen,
  Calendar
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PerformanceChart } from '../components/PerformanceChart';

export const StudentDashboard = () => {
  // Empty states ready for actual API integration
  const student = {
    name: "Student",
    currentCGPA: 0.0,
    targetCGPA: 0.0,
    progress: 0,
  };

  const performanceData: number[] = [];
  const performanceLabels: string[] = [];

  const upcomingTasks: Array<{ title: string; due: string; type: string; course: string; }> = [];

  const recentCourses: Array<{ title: string; progress: number; lastAccessed: string; color: string; code: string; }> = [];

  return (
    <div className="space-y-8 pb-10">
      {/* 1. Header & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Welcome Card */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 shadow-glow-primary/20 flex flex-col justify-center min-h-[280px]">
           {/* Background Decoration */}
           <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
           <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

           <div className="relative z-10">
              <div className="flex flex-col items-start mb-6">
                <Badge variant="outline" className="mb-4 border-white/20 text-white/90 bg-white/10 backdrop-blur-md px-3 py-1">
                    <BrainCircuit className="w-3.5 h-3.5 mr-2 text-primary" /> AI Learning Path Active
                </Badge>
                <h1 className="text-3xl md:text-4xl font-display font-bold leading-tight mb-2">
                  Welcome back, {student.name}.
                </h1>
                <p className="text-slate-300 text-lg max-w-lg leading-relaxed">
                  You're hitting your strides! Ready to <span className="text-primary font-semibold">Learn</span>?
                </p>
              </div>

              <div className="flex flex-wrap gap-4 mt-4">
                 <Button size="lg" className="bg-primary hover:bg-primary-dark text-white border-0 shadow-lg shadow-primary/20 gap-2 font-medium px-6 h-12 rounded-xl transition-all hover:scale-105 active:scale-95">
                    <PlayCircle className="w-5 h-5 fill-current" /> Resume Learning
                 </Button>
                 <Button size="lg" variant="outline" className="text-black border-white/20 hover:bg-white/10 gap-2 h-12 rounded-xl px-6">
                    Daily Quiz <ArrowRight className="w-4 h-4" />
                 </Button>
              </div>
           </div>
        </div>

        {/* Target CGPA Widget */}
        <div className="bg-white dark:bg-card-bg-dark rounded-3xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between shadow-sm relative overflow-hidden h-full min-h-[280px]">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white font-display">Target CGPA</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Your goal for this semester</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-2xl">
                <Target className="w-6 h-6 text-primary" />
              </div>
            </div>

            <div className="flex items-end gap-2 mb-4">
              <span className="text-5xl font-bold text-slate-900 dark:text-white tracking-tight">{student.currentCGPA}</span>
              <span className="text-lg text-slate-400 mb-2 font-medium">/ 5.0</span>
            </div>
            
            <div className="space-y-3 mt-auto">
              <div className="flex justify-between text-xs font-semibold uppercase tracking-wider">
                <span className="text-slate-500">Current Progress</span>
                <span className="text-primary">{student.progress}% to Target ({student.targetCGPA})</span>
              </div>
              <Progress value={student.progress} className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full" indicatorClassName="bg-primary rounded-full" />
            </div>

        </div>
      </div>

      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Performance Chart & Recent Courses */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Chart Section */}
          <div className="bg-white dark:bg-card-bg-dark border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
             <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">Performance Overview</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Track your weekly quiz scores</p>
                </div>
                <select className="bg-slate-50 dark:bg-slate-800 border-0 text-sm font-medium rounded-xl px-4 py-2 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  <option>This Semester</option>
                  <option>Last Month</option>
                  <option>All Time</option>
                </select>
             </div>

             <div className="h-[300px] w-full flex items-center justify-center border-t border-slate-100 dark:border-slate-800 mt-4 pt-4">
                {performanceData.length > 0 ? (
                  <PerformanceChart data={performanceData} labels={performanceLabels} isDark={true} />
                ) : (
                  <p className="text-slate-500">No performance data yet. Take quizzes to see your progress!</p>
                )}
             </div>
          </div>

          {/* Recent Courses */}
          <div className="space-y-4">
             <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white font-display">Pick up where you left off</h2>
                <Button variant="link" className="text-primary font-medium hover:text-primary-dark">View All Courses</Button>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recentCourses.length > 0 ? recentCourses.map((course, idx) => (
                  <div key={idx} className="group p-5 bg-white dark:bg-card-bg-dark border border-slate-200 dark:border-slate-800 rounded-3xl hover:border-primary/50 transition-all shadow-sm hover:shadow-md cursor-pointer relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-transparent to-slate-50 dark:to-slate-800/50 rounded-bl-full pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <div className={`w-12 h-12 rounded-xl ${course.color} bg-opacity-10 flex items-center justify-center`}>
                        <BookOpen className={`w-6 h-6 text-${course.color.replace('bg-', '')}`} />
                      </div>
                      <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 border-0">
                        {course.code}
                      </Badge>
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary transition-colors line-clamp-1">{course.title}</h3>
                    
                    <div className="flex items-center text-xs text-slate-500 mb-4 font-medium">
                       <Clock className="w-3.5 h-3.5 mr-1.5" /> Reviewed {course.lastAccessed}
                    </div>
                    
                    <div className="space-y-2">
                       <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-500 dark:text-slate-400">Progress</span>
                          <span className="text-primary">{course.progress}%</span>
                       </div>
                       <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div className={`h-full ${course.color.replace('bg-', 'bg-')} rounded-full transition-all duration-1000 ease-out`} style={{ width: `${course.progress}%` }} />
                       </div>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-1 sm:col-span-2 py-10 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                    <BookOpen className="w-10 h-10 text-slate-400 mb-3" />
                    <p className="text-slate-500 font-medium">You haven't started any courses yet.</p>
                    <Button variant="link" className="mt-2">Browse Courses</Button>
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* Right Column: Sidebar Widgets */}
        <div className="space-y-6">
          {/* Upcoming Tasks Widget */}
          <div className="bg-white dark:bg-card-bg-dark border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-primary" /> Upcoming
              </h3>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-1 relative">
              {upcomingTasks.length > 0 ? (
                <>
                  {/* Timeline Line */}
                  <div className="absolute left-[19px] top-2 bottom-4 w-0.5 bg-slate-100 dark:bg-slate-800" />
                  
                  {upcomingTasks.map((task, i) => (
                    <div key={i} className="flex items-start gap-4 py-3 relative z-10 group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl px-2 -mx-2 transition-colors">
                      <div className={`w-10 h-10 rounded-full border-4 border-white dark:border-card-bg-dark shrink-0 flex items-center justify-center ${
                        task.type === 'quiz' ? 'bg-red-100 text-red-600' : task.type === 'assignment' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {task.type === 'quiz' ? (
                           <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                        ) : task.type === 'assignment' ? (
                           <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        ) : (
                           <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors">{task.title}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5 h-4 border-slate-200 text-slate-500">{task.course}</Badge>
                          <p className="text-xs text-slate-500 truncate">{task.due}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="py-6 text-center text-slate-500 text-sm">
                  No upcoming tasks. Enjoy your free time!
                </div>
              )}
            </div>
            
            <Button variant="outline" className="w-full mt-4 text-xs font-semibold border-slate-200 dark:border-slate-700 h-10 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800">
              View Full Calendar
            </Button>
          </div>

          {/* AI Doubt Solver Widget */}
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-3xl p-6 text-white text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-md border border-white/10 shadow-xl group-hover:scale-110 transition-transform duration-300">
                <BrainCircuit className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Stuck on a problem?</h3>
              <p className="text-sm text-indigo-100 mb-6 max-w-[200px] leading-relaxed">
                Snap a photo or type your question. Your AI Tutor is ready.
              </p>
              <Button size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50 w-full font-bold shadow-xl border-0 h-11 rounded-xl">
                Ask AI Tutor
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
