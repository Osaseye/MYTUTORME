import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { 
  PlayCircle, 
  ArrowRight, 
  BrainCircuit, 
  Clock,
  Target,
  BookOpen
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PerformanceChart } from '../components/PerformanceChart';
import { useAuthStore } from '@/features/auth/hooks/useAuth';
import type { StudentProfile } from '@/types/user';
import { db, functions } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { calculateCumulativeGPA } from '../utils/gpaUtils';
import { httpsCallable } from 'firebase/functions';
import { toast } from 'sonner';

export const StudentDashboard = () => {
  const { user } = useAuthStore();
  const studentProfile = user as StudentProfile;
  const navigate = useNavigate();
  // Dynamic States
  const [currentCGPA, setCurrentCGPA] = useState(studentProfile?.currentCGPA || 0.0);
  const [targetCGPA, setTargetCGPA] = useState(studentProfile?.targetCGPA || 0.0);
  const [gradingScale, setGradingScale] = useState(studentProfile?.gradingSystem || "5.0");
  const [performanceData, setPerformanceData] = useState<number[]>([]);
  const [performanceLabels, setPerformanceLabels] = useState<string[]>([]);
  const [recentCourses, setRecentCourses] = useState<Array<{ id: string; title: string; progress: number; lastAccessed: string; color: string; code: string; }>>([]);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const params = new URLSearchParams(window.location.search);
      const transactionId = params.get('transaction_id');
      const status = params.get('status');

      if (transactionId && status) {
        window.history.replaceState({}, document.title, window.location.pathname);
        
        const verifyPayment = httpsCallable(functions, 'verifySubscription');
        const verifyToast = toast.loading("Verifying your payment...");
        
        try {
          const result: any = await verifyPayment({ transactionId, status });
          if (result.data?.success) {
            toast.success("Payment verified! Your subscription has been updated.", { id: verifyToast });
            setTimeout(() => window.location.reload(), 1500);
          } else {
            toast.error("Payment verification pending or failed. Please check back later.", { id: verifyToast });
          }
        } catch (error: any) {
          toast.error("Error verifying payment", { description: error.message, id: verifyToast });
        }
      }
    };
    checkPaymentStatus();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      // 1. Fetch GPA
      try {
        const gpaRef = doc(db, 'gpa_records', user.uid);
        const gpaSnap = await getDoc(gpaRef);
        if (gpaSnap.exists()) {
          const data = gpaSnap.data();
          if (data.targetGPA) setTargetCGPA(data.targetGPA);
          if (data.scale) setGradingScale(data.scale);
          
          if (data.semesters && data.semesters.length > 0) {
              const calculatedGPA = calculateCumulativeGPA(data.semesters, data.scale || gradingScale);
              const totalCredits = data.semesters.flatMap((s: any) => s.courses || []).reduce((sum: number, c: any) => sum + (Number(c.credits) || 0), 0);
              if (totalCredits > 0) {
                 setCurrentCGPA(calculatedGPA);
              }
          }
        }
      } catch (err) {
        console.error("Error fetching GPA:", err);
      }

      // 2. Fetch Quiz Performance
      try {
        const q = query(
          collection(db, 'quiz_attempts'),
          where('studentId', '==', user.uid)
        );
        const snap = await getDocs(q);
        const docs = snap.docs.map(doc => doc.data());
        docs.sort((a, b) => {
          const timeA = a.completedAt?.toMillis?.() || 0;
          const timeB = b.completedAt?.toMillis?.() || 0;
          return timeA - timeB;
        });
        const scores = docs.map(d => d.score || 0);
        // Get last 10 quizzes or map dates
        const recentScores = scores.slice(-10);
        setPerformanceData(recentScores);
        setPerformanceLabels(recentScores.map((_, i) => `Q${i + 1}`));
      } catch (err) {
        console.error("Error fetching quizzes:", err);
      }

      // 3. Fetch Recent Courses
      try {
        const enrQuery = query(collection(db, 'enrollments'), where('studentId', '==', user.uid));
        const enrSnap = await getDocs(enrQuery);
        
        const coursesMap = await Promise.all(enrSnap.docs.slice(0, 4).map(async (enrDoc) => {
           const enrData = enrDoc.data();
           const cDoc = await getDoc(doc(db, 'courses', enrData.courseId));
           const cData = cDoc.exists() ? cDoc.data() : { title: 'Unknown Course' };
           
           const colors = ['bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500'];
           const randomColor = colors[Math.floor(Math.random() * colors.length)];
           
           return {
              id: enrData.courseId,
              title: cData.title,
              progress: enrData.progress || Math.floor(Math.random() * 40) + 10,
              lastAccessed: 'Recently',
              color: randomColor,
              code: cData.title ? cData.title.substring(0, 3).toUpperCase() : 'CRS'
           };
        }));
        
        setRecentCourses(coursesMap);
      } catch (err) {
        console.error("Error fetching courses:", err);
      }
    };
    fetchData();
  }, [user]);

  const student = {
    name: studentProfile?.username || studentProfile?.displayName || "Student",
    currentCGPA: currentCGPA,
    targetCGPA: targetCGPA,
    progress: targetCGPA ? Math.round((currentCGPA / targetCGPA) * 100) : 0,
    gradingScale: gradingScale,
  };

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
                 <Button onClick={() => navigate('/student/courses')} size="lg" className="bg-primary hover:bg-primary-dark text-white border-0 shadow-lg shadow-primary/20 gap-2 font-medium px-6 h-12 rounded-xl transition-all hover:scale-105 active:scale-95">
                    <PlayCircle className="w-5 h-5 fill-current" /> Resume Learning
                 </Button>
                 <Button onClick={() => navigate('/student/exam-prep')} size="lg" variant="outline" className="text-black border-white/20 hover:bg-white/10 gap-2 h-12 rounded-xl px-6">
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
              <span className="text-lg text-slate-400 mb-2 font-medium">/ {student.gradingScale}</span>
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
                <Button onClick={() => navigate('/student/courses')} variant="link" className="text-primary font-medium hover:text-primary-dark">View All Courses</Button>
             </div>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recentCourses.length > 0 ? recentCourses.map((course, idx) => (
                  <div key={idx} onClick={() => navigate(`/student/courses/${course.id}`)} className="group p-5 bg-white dark:bg-card-bg-dark border border-slate-200 dark:border-slate-800 rounded-3xl hover:border-primary/50 transition-all shadow-sm hover:shadow-md cursor-pointer relative overflow-hidden">
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
                    <Button onClick={() => navigate('/student/courses')} variant="link" className="mt-2">Browse Courses</Button>
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* Right Column: Sidebar Widgets */}
        <div className="space-y-6">
          {/* AI Doubt Solver Widget */}
          <div className="bg-gradient-to-b from-[#111111] to-[#1a1a1a] rounded-[2rem] p-6 text-white text-center relative overflow-hidden group shadow-2xl border border-white/10 transition-all hover:border-emerald-500/30">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15]" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full mix-blend-screen filter blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="relative w-20 h-20 mb-3 group-hover:scale-105 transition-transform duration-500 ease-out">
                 <img src="/nova.png" alt="Nova AI" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(34,197,94,0.3)] animate-pulse" />
              </div>
              <h3 className="font-[400] font-serif text-[1.4rem] tracking-tight mb-2 text-slate-100">Stuck on a problem?</h3>
              <p className="text-[13px] text-slate-400 mb-6 max-w-[220px] leading-relaxed font-light">
                Snap a photo or type your question. Your AI Tutor is ready.
              </p>
              <Button onClick={() => navigate('/student/ai-tutor')} size="lg" className="w-full rounded-2xl bg-white text-black hover:bg-slate-200 hover:scale-[1.02] transition-all font-medium h-12 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                Ask Nova
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
