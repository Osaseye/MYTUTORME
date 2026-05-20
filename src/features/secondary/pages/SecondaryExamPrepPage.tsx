import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/features/auth/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FreePlanUsageCard } from '@/components/shared/FreePlanUsageCard';
import {
  Target,
  Clock,
  TrendingUp,
  Plus,
  Layers,
  ArrowRight,
  Trash2,
  Calendar,
  BookOpen,
  Flame,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type Tab = 'exams' | 'flashcards' | 'history' | 'planner';

export const SecondaryExamPrepPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('exams');
  const [examHistory, setExamHistory] = useState<any[]>([]);
  const [decks, setDecks] = useState<any[]>([]);
  const [studyPlans, setStudyPlans] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [stats, setStats] = useState({ questionsSolved: 0, avgScore: 0, streak: 0 });

  const targetExams: string[] = (user as any)?.targetExams ?? [];
  const currentClass: string = (user as any)?.currentClass ?? '';

  useEffect(() => {
    if (!user) return;
    const fetchHistory = async () => {
      setLoadingHistory(true);
      try {
        const q = query(collection(db, 'quiz_attempts'), where('studentId', '==', user.uid));
        const snap = await getDocs(q);
        const attempts = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a: any, b: any) => (b.completedAt?.toMillis?.() || 0) - (a.completedAt?.toMillis?.() || 0));
        setExamHistory(attempts);
        if (attempts.length) {
          const total = attempts.reduce((acc: number, a: any) => acc + (a.score ?? 0), 0);
          setStats((prev) => ({
            ...prev,
            questionsSolved: attempts.reduce((acc: number, a: any) => acc + (a.totalQuestions ?? 0), 0),
            avgScore: Math.round(total / attempts.length),
          }));
        }
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [user]);

  useEffect(() => {
    if (activeTab !== 'flashcards' || !user) return;
    getDocs(query(collection(db, 'flashcard_decks'), where('userId', '==', user.uid))).then((snap) => {
      setDecks(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)),
      );
    });
  }, [activeTab, user]);

  useEffect(() => {
    if (activeTab !== 'planner' || !user) return;
    getDocs(query(collection(db, 'study_plans'), where('userId', '==', user.uid))).then((snap) => {
      setStudyPlans(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a: any, b: any) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0)),
      );
    });
  }, [activeTab, user]);

  const deleteAttempt = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'quiz_attempts', id));
      setExamHistory((prev) => prev.filter((a) => a.id !== id));
      toast.success('Deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'exams', label: 'Mock Exams', icon: Target },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'planner', label: 'Study Planner', icon: Calendar },
    { id: 'history', label: 'History', icon: Clock },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Exam Prep</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Mock tests, flashcards, and study plans for{' '}
          {targetExams.length > 0 ? targetExams.join(', ') : 'your upcoming exams'}
          {currentClass ? ` (${currentClass})` : ''}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-center">
          <TrendingUp className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.avgScore}%</p>
          <p className="text-xs text-slate-500">Avg score</p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-center">
          <BookOpen className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.questionsSolved}</p>
          <p className="text-xs text-slate-500">Questions</p>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-center">
          <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{(user as any)?.studyStreak ?? 0}</p>
          <p className="text-xs text-slate-500">Day streak</p>
        </div>
      </div>

      <FreePlanUsageCard
        currentUsage={examHistory.length}
        maxLimit={5}
        description="Free Plan Limit: Upgrade to Pro for unlimited mock exams and advanced analytics."
        usageLabel="exams taken"
        variant="default"
      />

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all',
              activeTab === t.id
                ? 'bg-white dark:bg-slate-900 text-primary shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300',
            )}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'exams' && (
        <div className="space-y-4">
          {/* Target exam quick-start buttons */}
          {targetExams.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-3">Your target exams</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {targetExams.map((exam) => (
                  <Link
                    key={exam}
                    to={`/secondary/exam-prep/config?exam=${encodeURIComponent(exam)}`}
                    className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-4 text-center hover:border-primary/50 hover:bg-primary/10 transition-all group"
                  >
                    <Target className="w-6 h-6 text-primary mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary">
                      {exam}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">Practice test</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Generate a mock exam</h3>
            <p className="text-sm text-slate-500 mb-4">
              AI-generated questions based on your subject, exam type, and difficulty level.
            </p>
            <Button onClick={() => navigate('/secondary/exam-prep/config')} className="gap-2">
              <Plus className="w-4 h-4" /> Start new exam
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'flashcards' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => navigate('/secondary/exam-prep/flashcards')} className="gap-2">
              <Plus className="w-4 h-4" /> Create deck
            </Button>
          </div>
          {decks.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No flashcard decks yet</p>
              <Button className="mt-4" onClick={() => navigate('/secondary/exam-prep/flashcards')}>
                Create your first deck
              </Button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {decks.map((deck: any) => (
                <Link
                  key={deck.id}
                  to={`/secondary/exam-prep/flashcards/${deck.id}`}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:border-primary/30 transition-all group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-primary">
                        {deck.topic || deck.subject || 'Untitled deck'}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{deck.cards?.length ?? 0} cards</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'planner' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => navigate('/secondary/exam-prep/planner-config')} className="gap-2">
              <Plus className="w-4 h-4" /> New plan
            </Button>
          </div>
          {studyPlans.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No study plans yet</p>
              <Button className="mt-4" onClick={() => navigate('/secondary/exam-prep/planner-config')}>
                Create a study plan
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {studyPlans.map((plan: any) => (
                <Link
                  key={plan.id}
                  to={`/secondary/exam-prep/planner/${plan.id}`}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:border-primary/30 transition-all group"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-primary">
                      {plan.title || plan.subject || 'Study plan'}
                    </p>
                    <p className="text-xs text-slate-500">{plan.daysRemaining ?? 0} days remaining</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-3">
          {loadingHistory ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : examHistory.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No exam attempts yet</p>
            </div>
          ) : (
            examHistory.map((attempt: any) => (
              <div
                key={attempt.id}
                className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    {attempt.subject || attempt.topic || 'Mock exam'}
                  </p>
                  <p className="text-xs text-slate-500">
                    {attempt.totalQuestions ?? 0} questions ·{' '}
                    {attempt.completedAt?.toDate?.()?.toLocaleDateString?.() ?? ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'text-lg font-bold',
                      (attempt.score ?? 0) >= 70
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : (attempt.score ?? 0) >= 50
                        ? 'text-amber-600 dark:text-amber-400'
                        : 'text-red-500',
                    )}
                  >
                    {attempt.score ?? 0}%
                  </span>
                  <Link
                    to={`/secondary/exam-prep/results/${attempt.id}`}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary font-semibold hover:bg-primary/20"
                  >
                    Review
                  </Link>
                  <button
                    onClick={() => deleteAttempt(attempt.id)}
                    className="p-1.5 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
