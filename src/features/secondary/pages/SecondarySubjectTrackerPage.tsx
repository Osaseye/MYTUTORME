import { useEffect, useState } from 'react';
import {
  collection,
  query,
  getDocs,
  setDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';
import { Plus, Trash2, BookOpen, TrendingUp, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SubjectGrade {
  id: string;
  subject: string;
  grade: string;
  score?: number;
  term: string;
}

// Nigerian secondary school grading scale
const GRADES = ['A1', 'B2', 'B3', 'C4', 'C5', 'C6', 'D7', 'E8', 'F9'] as const;
const GRADE_INFO: Record<string, { range: string; label: string; color: string; passBg: string }> = {
  A1: { range: '75–100', label: 'Excellent', color: 'text-emerald-700 dark:text-emerald-300', passBg: 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800' },
  B2: { range: '70–74', label: 'Very Good', color: 'text-emerald-600 dark:text-emerald-400', passBg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900' },
  B3: { range: '65–69', label: 'Good', color: 'text-teal-600 dark:text-teal-400', passBg: 'bg-teal-50 dark:bg-teal-900/20 border-teal-100 dark:border-teal-900' },
  C4: { range: '60–64', label: 'Credit', color: 'text-blue-600 dark:text-blue-400', passBg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900' },
  C5: { range: '55–59', label: 'Credit', color: 'text-blue-500 dark:text-blue-400', passBg: 'bg-blue-50/60 dark:bg-blue-900/10 border-blue-100/60 dark:border-blue-900' },
  C6: { range: '50–54', label: 'Credit', color: 'text-indigo-600 dark:text-indigo-400', passBg: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-900' },
  D7: { range: '45–49', label: 'Pass', color: 'text-amber-600 dark:text-amber-400', passBg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900' },
  E8: { range: '40–44', label: 'Pass', color: 'text-orange-600 dark:text-orange-400', passBg: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-900' },
  F9: { range: '0–39', label: 'Fail', color: 'text-red-600 dark:text-red-400', passBg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900' },
};

const TERMS = ['First Term', 'Second Term', 'Third Term'] as const;

const COMMON_SUBJECTS = [
  'Mathematics', 'English Language', 'Physics', 'Chemistry', 'Biology',
  'Economics', 'Further Mathematics', 'Literature in English', 'Government',
  'Accounting', 'Commerce', 'Geography', 'Agricultural Science',
  'Civic Education', 'Technical Drawing', 'French',
];

export const SecondarySubjectTrackerPage = () => {
  const { user } = useAuth();
  const [grades, setGrades] = useState<SubjectGrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const [newSubject, setNewSubject] = useState('');
  const [newGrade, setNewGrade] = useState<string>('');
  const [newTerm, setNewTerm] = useState<string>(TERMS[0]);
  const [newScore, setNewScore] = useState('');

  const fetchGrades = async () => {
    if (!user?.uid) return;
    try {
      const q = query(collection(db, 'users', user.uid, 'subjectGrades'));
      const snap = await getDocs(q);
      setGrades(
        snap.docs.map((d) => ({ id: d.id, ...d.data() } as SubjectGrade)).sort((a, b) =>
          a.subject.localeCompare(b.subject),
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGrades(); }, [user?.uid]);

  const handleAdd = async () => {
    if (!newSubject.trim() || !newGrade || !user?.uid) return;
    setSaving(true);
    try {
      const id = `${newSubject.trim().toLowerCase().replace(/\s+/g, '_')}_${newTerm.replace(/\s+/g, '_')}`;
      await setDoc(doc(db, 'users', user.uid, 'subjectGrades', id), {
        subject: newSubject.trim(),
        grade: newGrade,
        score: newScore ? parseFloat(newScore) : null,
        term: newTerm,
        updatedAt: serverTimestamp(),
      });
      toast.success('Grade saved!');
      setNewSubject('');
      setNewGrade('');
      setNewScore('');
      setShowAdd(false);
      await fetchGrades();
    } catch {
      toast.error('Failed to save grade');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user?.uid) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'subjectGrades', id));
      setGrades((prev) => prev.filter((g) => g.id !== id));
      toast.success('Removed');
    } catch {
      toast.error('Failed to remove');
    }
  };

  const creditCount = grades.filter((g) => !['D7', 'E8', 'F9'].includes(g.grade)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold font-display text-slate-900 dark:text-white">My Subjects</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track your grades per subject per term</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Info className="w-4 h-4" />
          </button>
          <Button onClick={() => setShowAdd(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Add grade
          </Button>
        </div>
      </div>

      {/* 5-credit indicator */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <div className="flex items-center gap-3 mb-3">
          <TrendingUp className="w-5 h-5 text-primary" />
          <span className="text-sm font-semibold text-slate-900 dark:text-white">WAEC / NECO Credits</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={cn('h-3 rounded-full transition-all', creditCount >= 5 ? 'bg-emerald-500' : 'bg-primary')}
              style={{ width: `${Math.min((creditCount / 9) * 100, 100)}%` }}
            />
          </div>
          <span className={cn('text-sm font-bold', creditCount >= 5 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300')}>
            {creditCount} / 9 subjects with credit (C6+)
          </span>
        </div>
        {creditCount >= 5 && (
          <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            ✓ You have 5+ credits — minimum WAEC/NECO requirement met (including English & Maths recommended)
          </p>
        )}
      </div>

      {/* Grading guide */}
      {showGuide && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Nigerian Grading Scale</h3>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {GRADES.map((g) => (
              <div key={g} className={cn('rounded-xl border p-2 text-center', GRADE_INFO[g].passBg)}>
                <p className={cn('text-lg font-bold', GRADE_INFO[g].color)}>{g}</p>
                <p className="text-[10px] text-slate-500 font-semibold">{GRADE_INFO[g].range}</p>
                <p className="text-[10px] text-slate-400">{GRADE_INFO[g].label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add grade form */}
      {showAdd && (
        <div className="rounded-2xl border border-primary/20 bg-white dark:bg-slate-900 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Add a grade</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Subject</label>
              <Input
                list="subject-suggestions"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="e.g. Mathematics"
              />
              <datalist id="subject-suggestions">
                {COMMON_SUBJECTS.map((s) => <option key={s} value={s} />)}
              </datalist>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Term</label>
              <select
                value={newTerm}
                onChange={(e) => setNewTerm(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
              >
                {TERMS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Grade</label>
              <div className="flex flex-wrap gap-1.5">
                {GRADES.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setNewGrade(g)}
                    className={cn(
                      'px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors',
                      newGrade === g
                        ? 'bg-primary text-white border-primary'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-primary/40',
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 mb-1 block">Score (optional)</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={newScore}
                onChange={(e) => setNewScore(e.target.value)}
                placeholder="e.g. 78"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd} disabled={!newSubject.trim() || !newGrade || saving}>
              {saving ? 'Saving...' : 'Save grade'}
            </Button>
            <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Grades list */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : grades.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No grades tracked yet</p>
          <p className="text-xs text-slate-400 mt-1">Add your first subject to get started</p>
          <Button className="mt-4" onClick={() => setShowAdd(true)}>
            <Plus className="w-4 h-4 mr-1" /> Add grade
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {grades.map((g) => {
            const info = GRADE_INFO[g.grade] ?? GRADE_INFO['F9'];
            return (
              <div
                key={g.id}
                className={cn(
                  'flex items-center justify-between px-4 py-3 rounded-2xl border transition-all',
                  info.passBg,
                )}
              >
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{g.subject}</p>
                  <p className="text-xs text-slate-500">{g.term}{g.score != null ? ` · ${g.score}%` : ''}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className={cn('text-xl font-bold', info.color)}>{g.grade}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">{info.label}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(g.id)}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
