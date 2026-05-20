import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { BookOpen, Target, Brain, FileEdit, TrendingUp, Flame, ChevronRight, Award } from 'lucide-react';

interface SubjectGrade {
  subject: string;
  grade: string;
  score?: number;
  term: string;
}

const gradeColor = (grade: string) => {
  if (['A1', 'B2', 'B3'].includes(grade)) return 'text-emerald-600 dark:text-emerald-400';
  if (['C4', 'C5', 'C6'].includes(grade)) return 'text-amber-600 dark:text-amber-400';
  return 'text-red-500 dark:text-red-400';
};

const gradePoints: Record<string, number> = {
  A1: 9, B2: 8, B3: 7, C4: 6, C5: 5, C6: 4, D7: 3, E8: 2, F9: 1,
};

export const SecondaryDashboard = () => {
  const { user } = useAuth();
  const [grades, setGrades] = useState<SubjectGrade[]>([]);
  const [loading, setLoading] = useState(true);

  const targetExams: string[] = (user as any)?.targetExams ?? [];
  const currentClass: string = (user as any)?.currentClass ?? '';
  const studyStreak: number = (user as any)?.studyStreak ?? 0;
  const displayName = (user as any)?.username || user?.displayName || 'Student';

  useEffect(() => {
    if (!user?.uid) return;
    const fetchGrades = async () => {
      try {
        const q = query(
          collection(db, 'users', user.uid, 'subjectGrades'),
          orderBy('updatedAt', 'desc'),
          limit(20),
        );
        const snap = await getDocs(q);
        setGrades(snap.docs.map((d) => d.data() as SubjectGrade));
      } catch {
        // no grades yet
      } finally {
        setLoading(false);
      }
    };
    fetchGrades();
  }, [user?.uid]);

  const weakSubjects = grades
    .filter((g) => (gradePoints[g.grade] ?? 10) <= 4)
    .slice(0, 3);

  const creditCount = grades.filter((g) => (gradePoints[g.grade] ?? 0) >= 4).length;

  const quickActions = [
    { label: 'Nova AI', desc: 'Ask any question', icon: Brain, path: '/secondary/ai-tutor', color: 'bg-primary/10 text-primary' },
    { label: 'Exam Prep', desc: 'Mock tests & past questions', icon: Target, path: '/secondary/exam-prep', color: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300' },
    { label: 'My Subjects', desc: 'Track your grades', icon: BookOpen, path: '/secondary/subjects', color: 'bg-violet-100 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300' },
    { label: 'Assignment Helper', desc: 'Essay & homework help', icon: FileEdit, path: '/secondary/assignment-helper', color: 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
            {currentClass ? `${currentClass} Student` : 'Secondary School'}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold font-display text-slate-900 dark:text-white">
            Welcome back, {displayName.split(' ')[0]} 👋
          </h1>
        </div>
        {targetExams.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {targetExams.map((exam) => (
              <span
                key={exam}
                className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20"
              >
                {exam}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Subjects</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{grades.length}</p>
          <p className="text-xs text-slate-500 mt-1">being tracked</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Credits</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{creditCount}</p>
          <p className="text-xs text-slate-500 mt-1">C6 or above</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Streak</span>
          </div>
          <p className="text-2xl font-bold text-orange-500">{studyStreak}</p>
          <p className="text-xs text-slate-500 mt-1">days in a row</p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Exams</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{targetExams.length}</p>
          <p className="text-xs text-slate-500 mt-1">target exams</p>
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-3">Quick actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.path}
              to={action.path}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 hover:border-primary/30 hover:shadow-sm transition-all group"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${action.color}`}>
                <action.icon className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                {action.label}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{action.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Grades overview + weak subjects */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent grades */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Subject grades</h2>
            <Link
              to="/secondary/subjects"
              className="text-xs text-primary hover:underline flex items-center gap-0.5"
            >
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : grades.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">No grades tracked yet.</p>
              <Link to="/secondary/subjects" className="text-xs text-primary hover:underline mt-1 block">
                Add your first subject →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {grades.slice(0, 6).map((g, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{g.subject}</p>
                    <p className="text-xs text-slate-500">{g.term}</p>
                  </div>
                  <span className={`text-lg font-bold ${gradeColor(g.grade)}`}>{g.grade}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Focus areas */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Needs attention</h2>
          {weakSubjects.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">All looking good!</p>
              <p className="text-xs text-slate-500 mt-1">
                {grades.length === 0
                  ? 'Add subjects to see focus areas.'
                  : 'No subjects below C6 right now.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {weakSubjects.map((g, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-red-100 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 p-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{g.subject}</p>
                    <p className="text-xs text-slate-500">{g.term}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-red-500">{g.grade}</span>
                    <Link
                      to={`/secondary/ai-tutor?subject=${encodeURIComponent(g.subject)}`}
                      className="text-xs px-2 py-1 rounded-lg bg-primary text-white font-semibold"
                    >
                      Study
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {targetExams.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Preparing for</p>
              <div className="flex flex-wrap gap-2">
                {targetExams.map((exam) => (
                  <Link
                    key={exam}
                    to="/secondary/exam-prep"
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                  >
                    {exam} →
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
