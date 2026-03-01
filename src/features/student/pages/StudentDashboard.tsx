import { Button } from '@/components/ui/button';
import { 
  PlayCircle, 
  ArrowRight, 
  BrainCircuit, 
  BookOpen, 
  FileText, 
  MoreVertical,
  Clock,
  TrendingUp
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export const StudentDashboard = () => {
  return (
    <div className="space-y-8">
      {/* 1. Focus Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 sm:p-10 shadow-glow-primary/20">
         {/* Background Decoration */}
         <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
         <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-3xl -ml-20 -mb-20 pointer-events-none" />

         <div className="relative z-10 max-w-2xl">
            <Badge variant="outline" className="mb-4 border-white/20 text-white/80 bg-white/5 backdrop-blur-sm">
                <BrainCircuit className="w-3 h-3 mr-2 text-primary" /> AI Learning Path
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-display font-bold mb-4 leading-tight">
               Welcome back, Alex. <br/>
               Ready to ace <span className="text-primary">MTH 201</span>?
            </h1>
            <p className="text-slate-300 mb-8 text-lg max-w-lg">
               You left off at "Introduction to Differential Calculus". 
               The AI suggests a quick quiz to refresh your memory.
            </p>
            <div className="flex flex-wrap gap-4">
               <Button size="lg" className="bg-primary hover:bg-primary-dark text-white border-0 shadow-lg shadow-primary/20 gap-2">
                  <PlayCircle className="w-5 h-5 fill-current" /> Resume Lesson
               </Button>
               <Button size="lg" variant="outline" className="text-white border-white/20 hover:bg-white/10 gap-2">
                  Take Quick Quiz <ArrowRight className="w-4 h-4" />
               </Button>
            </div>
         </div>
      </div>

      {/* 2. Quick Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
         {[
            { 
               title: "Ask AI Tutor", 
               desc: "Get instant answers", 
               icon: BrainCircuit, 
               color: "text-purple-500", 
               bg: "bg-purple-50 dark:bg-purple-900/10",
               border: "border-purple-100 dark:border-purple-900/20"
            },
            { 
               title: "Exam Prep", 
               desc: "Generate a mock test", 
               icon: FileText, 
               color: "text-blue-500", 
               bg: "bg-blue-50 dark:bg-blue-900/10",
               border: "border-blue-100 dark:border-blue-900/20"
            },
            { 
               title: "Summarize Notes", 
               desc: "Upload slides for summary", 
               icon: BookOpen, 
               color: "text-orange-500", 
               bg: "bg-orange-50 dark:bg-orange-900/10",
               border: "border-orange-100 dark:border-orange-900/20"
            },
         ].map((action, i) => (
            <div 
               key={i} 
               className={p-5 rounded-2xl border   flex items-center gap-4 cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-sm}
            >
               <div className={w-12 h-12 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-sm }>
                  <action.icon className="w-6 h-6" />
               </div>
               <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{action.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{action.desc}</p>
               </div>
            </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* 3. Continue Learning (2/3 width) */}
         <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
               <h2 className="text-xl font-bold text-slate-900 dark:text-white">Continue Learning</h2>
               <Button variant="link" className="text-primary">View All</Button>
            </div>
            
            <div className="space-y-4">
               {[
                  { code: "MTH 201", title: "General Mathematics II", progress: 75, next: "Integration by Parts", color: "bg-emerald-500" },
                  { code: "PHY 102", title: "General Physics II", progress: 45, next: "Wave Motion", color: "bg-blue-500" },
                  { code: "GST 102", title: "Use of English", progress: 20, next: "Essay Writing", color: "bg-orange-500" }
               ].map((course, i) => (
                  <div key={i} className="group p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary/50 transition-all flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                     <div className={w-12 h-12 rounded-lg shrink-0  flex items-center justify-center text-white font-bold text-xs}>
                        {course.code}
                     </div>
                     <div className="flex-1 min-w-0">
                        <div className="flex justify-between mb-1">
                           <h4 className="font-bold text-slate-900 dark:text-white truncate">{course.title}</h4>
                           <span className="text-xs font-medium text-slate-500">{course.progress}%</span>
                        </div>
                        <Progress value={course.progress} className="h-2 mb-2" />
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                           <PlayCircle className="w-3 h-3 text-primary" />
                           <span>Next: <span className="text-slate-700 dark:text-slate-300 font-medium">{course.next}</span></span>
                        </div>
                     </div>
                     <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="w-4 h-4" />
                     </Button>
                  </div>
               ))}
            </div>
         </div>

         {/* 4. Academic Vital Signs (1/3 width) */}
         <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Performance</h2>
            
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-6">
                <div>
                   <div className="flex justify-between items-end mb-2">
                      <span className="text-sm font-medium text-slate-500">Current CGPA</span>
                      <span className="text-2xl font-bold text-slate-900 dark:text-white">3.45</span>
                   </div>
                   <Progress value={69} className="h-3" />
                   <p className="text-xs text-slate-500 mt-2">Target: 4.50 (First Class)</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                   <div>
                      <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                         <Clock className="w-3 h-3" /> Study Time
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white">12h 30m</div>
                   </div>
                   <div>
                      <div className="text-xs text-slate-500 mb-1 flex items-center gap-1">
                         <TrendingUp className="w-3 h-3" /> Quiz Avg
                      </div>
                      <div className="font-bold text-emerald-500">82%</div>
                   </div>
                </div>

                <Button variant="outline" className="w-full text-xs h-9">View Full Report</Button>
            </div>

            {/* Daily Goal Widget */}
             <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10">
                <div className="flex items-center justify-between mb-3">
                   <h3 className="font-bold text-slate-900 dark:text-white text-sm">Daily Goal</h3>
                   <span className="text-xs font-medium text-primary bg-white dark:bg-slate-900 px-2 py-0.5 rounded-full border border-primary/20">2/3 Done</span>
                </div>
                <div className="space-y-2">
                   {['Watch 1 Lesson', 'Complete MTH201 Quiz', 'Read 1 Article'].map((task, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                         <div className={w-4 h-4 rounded-full border flex items-center justify-center }>
                            {i < 2 && <ArrowRight className="w-3 h-3 rotate-45" />}
                         </div>
                         <span className={i < 2 ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-300'}>{task}</span>
                      </div>
                   ))}
                </div>
             </div>
         </div>
      </div>
    </div>
  );
};
