import { 
   
  Calendar, 
  Clock, 
  BrainCircuit, 
   
  TrendingUp,
  FileText,
  AlertCircle,
  CheckCircle,
  Plus,
  
  Layers,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/features/auth/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

import { Link } from 'react-router-dom';
import { usePlanGate } from '@/hooks/usePlanGate';

export const ExamPrepPage = () => {
  const { hasAccess } = usePlanGate('premium_mock_exams');
  const [activeTab, setActiveTab] = useState<'exams' | 'flashcards' | 'planner'>('exams');
  
  
  const [studyPlans, setStudyPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [decks, setDecks] = useState<any[]>([]);
  console.log(setDecks);
  const [loadingDecks, setLoadingDecks] = useState(false);
  console.log(setLoadingDecks);
  const [stats, setStats] = useState({
    studyTime: 0,
    questionsSolved: 0,
    avgScore: 0,
    focusArea: 'None',
    streak: 0
  });

  const { user } = useAuthStore();

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      try {
        const q = query(
          collection(db, 'quiz_attempts'),
          where('studentId', '==', user.uid)
        );
        const snapshot = await getDocs(q);
        
        let totalTime = 0;
        let totalQuestions = 0;
        let totalScore = 0;
        let attemptCount = 0;
        const topicScores: Record<string, {score: number, count: number}> = {};
        const activityDates: Set<string> = new Set();

        snapshot.forEach(doc => {
          const data = doc.data();
          totalTime += data.timeTaken || 0;
          const qCount = data.answers ? Object.keys(data.answers).length : 0;
          totalQuestions += qCount;
          
          if (typeof data.score === 'number') {
             totalScore += data.score;
             attemptCount++;
          }

          // Topic Analysis
          if (data.topicBreakdown) {
              Object.entries(data.topicBreakdown).forEach(([topic, stats]: [string, any]) => {
                  if (!topicScores[topic]) topicScores[topic] = { score: 0, count: 0 };
                  const score = (stats.correct / stats.total) * 100;
                  topicScores[topic].score += score;
                  topicScores[topic].count += 1;
              });
          }
          
          if (data.completedAt) {
             try {
                const date = data.completedAt.toDate();
                activityDates.add(date.toISOString().split('T')[0]);
             } catch (e) { /* ignore invalid dates */ }
          }
        });

        const avgScore = attemptCount > 0 ? Math.round(totalScore / attemptCount) : 0;
        
        let focusArea = 'None';
        let lowestAvg = 101;
        
        Object.entries(topicScores).forEach(([topic, s]) => {
            const avg = s.score / s.count;
            if (avg < lowestAvg) {
                lowestAvg = avg;
                focusArea = topic;
            }
        });

        // Simple Consecutive Streak Calc
        let streak = 0;
        const today = new Date();
        let currentCheck = new Date(today);
        let hasToday = activityDates.has(currentCheck.toISOString().split('T')[0]);
        
        // If not today, check yesterday
        if (!hasToday) {
            currentCheck.setDate(currentCheck.getDate() - 1);
            if (!activityDates.has(currentCheck.toISOString().split('T')[0])) {
                // Streak broken or 0
                streak = 0;
            } else {
                streak = 1;
                // Continue checking back
                currentCheck.setDate(currentCheck.getDate() - 1);
                while (activityDates.has(currentCheck.toISOString().split('T')[0])) {
                   streak++;
                   currentCheck.setDate(currentCheck.getDate() - 1);
                }
            }
        } else {
            // Has today
            streak = 1;
            currentCheck.setDate(currentCheck.getDate() - 1);
             while (activityDates.has(currentCheck.toISOString().split('T')[0])) {
                   streak++;
                   currentCheck.setDate(currentCheck.getDate() - 1);
            }
        }

        setStats({
            studyTime: totalTime,
            questionsSolved: totalQuestions,
            avgScore,
            focusArea,
            streak
        });

      } catch (err) {
        console.error("Failed to load stats", err);
      }
    };
    fetchStats();
  }, [user]);

  const formatTime = (seconds: number) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      return `${h}h ${m}m`;
  };

  useEffect(() => {
    const fetchPlans = async () => {
      if (!user) return;
      setLoadingPlans(true);
      try {
        const q = query(
          collection(db, 'study_plans'),
          where('userId', '==', user.uid)
        );
        const snapshot = await getDocs(q);
        const planData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setStudyPlans(planData.sort((a: any, b: any) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)));
      } catch (err) {
        console.error("Failed to load plans", err);
      } finally {
        setLoadingPlans(false);
      }
    };

    if (activeTab === 'planner') {
      fetchPlans();
    }
  }, [activeTab, user]);

  return (
    <div className="w-full px-4 md:px-8 py-8 space-y-8">
      {!hasAccess && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-500 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6" />
            <div>
              <p className="font-bold">Free Plan Limit</p>
              <p className="text-sm opacity-90">Upgrade to Pro for unlimited mock exams and advanced analytics.</p>
            </div>
          </div>
          <Link to="/student/settings" className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors">
            Upgrade Plan
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Exam Prep Center</h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">Master your subjects with targeted practice and AI-driven study plans.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-lg text-primary font-medium text-sm">
              <BrainCircuit className="w-4 h-4" />
              <span>AI Study Streak: {stats.streak} Days</span>
           </div>
           {(!hasAccess && studyPlans.length >= 2) ? (
             <Button
               className="bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed"
               title="Upgrade to create more study sessions"
             >
                <Plus className="w-4 h-4 mr-2" />
                New Study Session
             </Button>
           ) : (
             <Link to="/student/exam-prep/config">
               <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  New Study Session
               </Button>
             </Link>
           )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
           <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Clock className="w-6 h-6" />
           </div>
           <div>
              <p className="text-xs text-slate-500 uppercase font-medium">Study Time</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{formatTime(stats.studyTime)}</h3>
           </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
           <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-600 dark:text-green-400">
              <CheckCircle className="w-6 h-6" />
           </div>
           <div>
              <p className="text-xs text-slate-500 uppercase font-medium">Questions Solved</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{stats.questionsSolved}</h3>
           </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
           <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center text-purple-600 dark:text-purple-400">
              <TrendingUp className="w-6 h-6" />
           </div>
           <div>
              <p className="text-xs text-slate-500 uppercase font-medium">Avg. Score</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">{stats.avgScore}%</h3>
           </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 overflow-hidden">
           <div className="w-12 h-12 shrink-0 bg-orange-50 dark:bg-orange-900/20 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400">
              <AlertCircle className="w-6 h-6" />
           </div>
           <div className="min-w-0 flex-1">
              <p className="text-xs text-slate-500 uppercase font-medium truncate">Focus Area</p>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate" title={stats.focusArea}>{stats.focusArea}</h3>
           </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Column (Main) */}
        <div className="flex-1 space-y-6">
           
           {/* Navigation Tabs */}
           <div className="flex border-b border-slate-200 dark:border-slate-800 space-x-6">
              <button 
                onClick={() => setActiveTab('exams')}
                className={`pb-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'exams' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                Mock Exams
              </button>
              <button 
                onClick={() => setActiveTab('flashcards')}
                className={`pb-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'flashcards' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                Flashcards
              </button>
              <button 
                onClick={() => setActiveTab('planner')}
                className={`pb-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'planner' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                Study Planner
              </button>
           </div>

           {/* Content Area */}
           <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 min-h-[400px] p-6">
              
              {activeTab === 'exams' && (
                <div className="space-y-4">
                   <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-slate-900 dark:text-white">Recommended Practice Exams</h3>
                      <button className="text-sm text-primary font-medium hover:underline">View All History</button>
                   </div>
                   
                   <div className="text-center py-10">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                         <FileText className="w-8 h-8" />
                      </div>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Exams Available</h4>
                      <p className="text-slate-500 max-w-sm mx-auto mb-6">You haven't been assigned any practice exams yet. Generate custom mock exams from your notes, flashcards, or AI.</p>
                      <Link to="/student/exam-prep/config">
                         <Button className="bg-primary hover:bg-primary/90">
                            Create Mock Exam
                         </Button>
                      </Link>
                   </div>
                </div>
              )}

              {activeTab === 'flashcards' && (
                <div className="space-y-6">
                  {loadingDecks ? (
                    <div className="flex justify-center p-8">
                       <Plus className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <Link to="/student/exam-prep/flashcards" className="border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-5 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer min-h-[160px]">
                          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 mb-3">       
                             <Plus className="w-6 h-6" />
                          </div>
                          <h4 className="font-medium text-slate-600 dark:text-slate-400">Create New Deck</h4>
                          <p className="text-xs text-slate-400 mt-1">From notes or AI generation</p>
                       </Link>

                       {decks.map(deck => (
                         <Link key={deck.id} to={`/student/exam-prep/flashcards/${deck.id}`} className="block border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 hover:border-primary/50 transition-colors">
                            <div className="flex justify-between items-start mb-4">
                               <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                  <Layers className="w-5 h-5" />
                               </div>
                               <span className="text-xs font-medium px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full">
                                  {deck.flashcardIds?.length || 0} Cards
                               </span>
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white line-clamp-1 mb-1">{deck.title}</h4>
                            <p className="text-sm text-slate-500 capitalize">{deck.difficulty} • {deck.subject}</p>
                         </Link>
                       ))}
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === 'planner' && (
                <div className="space-y-6">
                  {loadingPlans ? (
                    <div className="flex justify-center p-8">
                       <Plus className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : studyPlans.length === 0 ? (
                    <div className="text-center py-12">
                       <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                          <Calendar className="w-10 h-10" />
                       </div>
                       <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">AI Study Planner</h3>
                       <p className="text-slate-500 max-w-md mx-auto mb-8">
                          Tell us your exam date and topics, and we'll generate a personalized day-by-day study schedule for you.
                       </p>
                       <Link to="/student/exam-prep/planner-config"><Button className="bg-primary hover:bg-primary/90">Generate New Plan</Button></Link> 
                    </div>
                  ) : (
                    <div className="space-y-4">
                       <div className="flex justify-between items-center mb-4">
                          <h3 className="font-bold text-slate-900 dark:text-white">Your Study Plans</h3>
                          <Link to="/student/exam-prep/planner-config"><Button className="bg-primary hover:bg-primary/90" size="sm">New Plan</Button></Link>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {studyPlans.map(plan => (
                             <Link key={plan.id} to={`/student/exam-prep/planner/${plan.id}`} className="block border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 hover:border-primary/50 transition-colors">
                                <div className="flex justify-between items-start mb-4">
                                   <div className="p-2 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                                      <Calendar className="w-5 h-5" />
                                   </div>
                                   <span className="text-xs font-medium px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full">
                                      {plan.progress || 0}% Done
                                   </span>
                                </div>
                                <h4 className="font-bold flex items-center text-slate-900 dark:text-white line-clamp-1 mb-1 capitalize">
                                  {plan.subject} <ArrowRight className="w-3 h-3 mx-1 inline text-slate-400" /> {plan.targetExam}
                                </h4>
                                <p className="text-sm text-slate-500">{plan.durationWeeks} Weeks</p>
                             </Link>
                          ))}
                       </div>
                    </div>
                  )}
                </div>
              )}

           </div>
        </div>


      </div>
    </div>
  );
};
