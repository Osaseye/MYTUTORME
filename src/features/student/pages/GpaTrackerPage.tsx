// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { 
  Calculator, 
  Plus, 
  Trash2, 
  Target, 
  TrendingUp, 
  BookOpen,
  GraduationCap,
  AlertCircle,
  RotateCcw,
  Loader2,
  ChevronDown,
  ChevronUp,
  Lock,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useAuthStore } from '@/features/auth/hooks/useAuth';
import type { StudentProfile } from '@/types/user';
import { toast } from 'sonner';
import { 
  SCALE_4_0, 
  SCALE_5_0 
} from '../types/gpa';
import type { 
  Course, 
  Semester, 
  GradeScaleType
} from '../types/gpa';
import { 
  calculateSemesterGPA, 
  calculateCumulativeGPA, 
  calculateRequiredGPA,
  getGradePoints
} from '../utils/gpaUtils';
import { usePlanGate } from '@/hooks/usePlanGate';
import { useTourStore, TourStep } from '@/app/stores/useTourStore';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

function gpaColorClass(gpa: number, maxScale: number): string {
  const ratio = maxScale > 0 ? gpa / maxScale : 0;
  if (ratio >= 0.8) return 'text-emerald-600 dark:text-emerald-400';
  if (ratio >= 0.6) return 'text-amber-500 dark:text-amber-400';
  return 'text-red-500 dark:text-red-400';
}

export const GpaTrackerPage = () => {
  const { hasAccess } = usePlanGate('gpa_simulator');
  const { user } = useAuthStore();
  const { startTour } = useTourStore();

  // State
  const [scale, setScale] = useState<GradeScaleType>('4.0');
  const [targetGPA, setTargetGPA] = useState<number>(3.5);
  const [targetGPAInput, setTargetGPAInput] = useState<string>('3.50');
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [predictionCourses, setPredictionCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSemesters, setExpandedSemesters] = useState<Record<string, boolean>>({});
  const isInitialLoad = useRef(true);

  // Load Data — keyed on uid so a new user-object reference (token refresh, etc.)
  // doesn't re-fetch Firestore and overwrite unsaved local edits.
  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      const profile = user as StudentProfile;

      if (user.role === 'student') {
        if (profile.gradingSystem) setScale(profile.gradingSystem as GradeScaleType);
        if (profile.targetCGPA) {
          setTargetGPA(profile.targetCGPA);
          setTargetGPAInput(profile.targetCGPA.toFixed(2));
        }
      }

      try {
        const docRef = doc(db, 'gpa_records', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          if (!(user.role === 'student' && profile.gradingSystem) && data.scale) {
            setScale(data.scale);
          }
          if (!profile.targetCGPA && data.targetGPA) {
            setTargetGPA(data.targetGPA);
            setTargetGPAInput(data.targetGPA.toFixed(2));
          }
          if (data.semesters) {
            setSemesters(data.semesters);
            const expanded: Record<string, boolean> = {};
            data.semesters.forEach((s: Semester) => { expanded[s.id] = true; });
            setExpandedSemesters(expanded);
          }
        }
      } catch (error) {
        console.error("Error loading GPA data:", error);
        toast.error("Failed to load your GPA data");
      } finally {
        setIsLoading(false);
        setTimeout(() => { isInitialLoad.current = false; }, 500);
      }
    };
    loadData();
  }, [user?.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  // Tour — runs once on mount, independent of data load
  useEffect(() => {
    const timer = setTimeout(() => {
      const steps: TourStep[] = [
        { title: "GPA Tracker", content: "Keep track of your grades across all your semesters in one easy place.", placement: "center" },
        { targetId: "add-semester-btn", title: "Add a Semester", content: "Click here to add a new semester and start inputting your courses and grades.", placement: "bottom" },
        { targetId: "gpa-calculator", title: "GPA Simulator", content: "Input hypothetical grades to see what you need to score to hit your Target CGPA.", placement: "top" }
      ];
      startTour('gpa_tracker_page_v1', steps);
    }, 1000);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-Save
  useEffect(() => {
    if (isInitialLoad.current || isLoading || !user) return;
    const timer = setTimeout(async () => {
      try {
        await setDoc(doc(db, 'gpa_records', user.uid), {
          userId: user.uid, scale, targetGPA, semesters, updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (error) {
        console.error("Error saving GPA data:", error);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [scale, targetGPA, semesters, user, isLoading]);

  // Derived State
  const currentCalculatedGPA = calculateCumulativeGPA(semesters, scale);
  const totalCreditsEarned = semesters
    .flatMap(s => s.courses)
    .reduce((sum, c) => sum + (Number(c.credits) || 0), 0);
  const displayGPA = totalCreditsEarned > 0
    ? currentCalculatedGPA
    : ((user as StudentProfile)?.currentCGPA || 0.0);
  const maxScale = parseFloat(scale);
  const activeScale = scale === '4.0' ? SCALE_4_0 : SCALE_5_0;
  const gpaProgress = targetGPA > 0 ? Math.min((displayGPA / targetGPA) * 100, 100) : 0;

  // Prediction Logic
  const predictionCredits = predictionCourses.reduce((sum, c) => sum + (Number(c.credits) || 0), 0);
  const predictionPoints = predictionCourses.reduce((sum, c) => sum + (getGradePoints(c.grade, scale) * (Number(c.credits) || 0)), 0);
  const currentTotalPoints = semesters.flatMap(s => s.courses).reduce((sum, c) => sum + (getGradePoints(c.grade, scale) * (Number(c.credits) || 0)), 0);
  const projectedTotalPoints = currentTotalPoints + predictionPoints;
  const projectedTotalCredits = totalCreditsEarned + predictionCredits;
  const projectedGPA = projectedTotalCredits > 0
    ? projectedTotalPoints / projectedTotalCredits
    : (predictionCourses.length > 0 ? calculateSemesterGPA(predictionCourses, scale) : displayGPA);

  const remainingCreditsForTarget = 15;
  const showRequiredGPA = totalCreditsEarned > 0;
  const requiredGPAForTarget = showRequiredGPA
    ? calculateRequiredGPA(currentCalculatedGPA, totalCreditsEarned, targetGPA, remainingCreditsForTarget)
    : targetGPA;

  // Handlers
  const handleTargetGPAChange = (val: string) => {
    setTargetGPAInput(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= maxScale) {
      setTargetGPA(parsed);
    }
  };

  const handleTargetGPABlur = () => {
    const parsed = parseFloat(targetGPAInput);
    if (isNaN(parsed)) {
      setTargetGPAInput(targetGPA.toFixed(2));
    } else {
      const clamped = Math.max(0, Math.min(parsed, maxScale));
      setTargetGPA(clamped);
      setTargetGPAInput(clamped.toFixed(2));
    }
  };

  const addSemester = () => {
    const newId = Date.now().toString();
    setSemesters([...semesters, { id: newId, name: `Semester ${semesters.length + 1}`, courses: [] }]);
    setExpandedSemesters(prev => ({ ...prev, [newId]: true }));
  };

  const removeSemester = (id: string) => {
    setSemesters(semesters.filter(s => s.id !== id));
    setExpandedSemesters(prev => { const next = { ...prev }; delete next[id]; return next; });
  };

  const toggleSemester = (id: string) => {
    setExpandedSemesters(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const addCourseToSemester = (semesterId: string) => {
    setSemesters(semesters.map(sem => sem.id === semesterId ? {
      ...sem,
      courses: [...sem.courses, { id: Date.now().toString(), name: '', credits: 3, grade: activeScale[0].grade, isCompleted: true }]
    } : sem));
  };

  const updateCourse = (semesterId: string, courseId: string, field: keyof Course, value: any) => {
    setSemesters(semesters.map(sem => sem.id === semesterId ? {
      ...sem,
      courses: sem.courses.map(c => c.id === courseId ? { ...c, [field]: value } : c)
    } : sem));
  };

  const removeCourse = (semesterId: string, courseId: string) => {
    setSemesters(semesters.map(sem => sem.id === semesterId ? {
      ...sem, courses: sem.courses.filter(c => c.id !== courseId)
    } : sem));
  };

  const addPredictionCourse = () => {
    setPredictionCourses([...predictionCourses, {
      id: Date.now().toString(), name: '', credits: 3, grade: activeScale[0].grade, isCompleted: false
    }]);
  };

  const updatePredictionCourse = (id: string, field: keyof Course, value: any) => {
    setPredictionCourses(predictionCourses.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const removePredictionCourse = (id: string) => {
    setPredictionCourses(predictionCourses.filter(c => c.id !== id));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 md:pb-10">

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-slate-900 dark:text-white">
            GPA Tracker
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor your grades and simulate future scenarios.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300">
          <GraduationCap className="w-3.5 h-3.5 text-primary" />
          {scale} Scale
        </span>
      </div>

      {/* ── Stat Cards ────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">

        {/* Current GPA */}
        <div className="bg-white dark:bg-card-bg-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-3 sm:p-5 shadow-sm relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/5 rounded-full hidden sm:block" />
          <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5 sm:mb-3">GPA</p>
          <div className="flex items-baseline gap-1 mb-2 sm:mb-4">
            <span className={cn("text-xl sm:text-4xl font-display font-bold", gpaColorClass(displayGPA, maxScale))}>
              {displayGPA.toFixed(2)}
            </span>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">/ {scale}</span>
          </div>
          <div className="space-y-1">
            <div className="hidden sm:flex justify-between text-[11px] font-semibold">
              <span className="text-slate-400">Progress to target</span>
              <span className="text-primary">{Math.round(Math.min(gpaProgress, 100))}%</span>
            </div>
            <Progress
              value={gpaProgress}
              className="h-1 sm:h-1.5 bg-slate-100 dark:bg-slate-700"
              indicatorClassName="bg-primary rounded-full"
            />
          </div>
        </div>

        {/* Target GPA */}
        <div className="bg-white dark:bg-card-bg-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-3 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1.5 sm:mb-3">
            <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Target</p>
            <Target className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
          </div>
          <div className="flex items-baseline gap-1 mb-1.5 sm:mb-3">
            <input
              type="number"
              value={targetGPAInput}
              onChange={(e) => handleTargetGPAChange(e.target.value)}
              onBlur={handleTargetGPABlur}
              step="0.1"
              min="0"
              max={scale}
              className="text-xl sm:text-4xl font-display font-bold text-slate-900 dark:text-white bg-transparent border-none outline-none w-16 sm:w-24 p-0 focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">/ {scale}</span>
          </div>
          {showRequiredGPA ? (
            requiredGPAForTarget && requiredGPAForTarget <= maxScale ? (
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1.5 rounded-lg">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                Need avg <strong>{requiredGPAForTarget.toFixed(2)}</strong> in next {remainingCreditsForTarget} credits
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1.5 rounded-lg">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                Target may be unreachable at this rate
              </div>
            )
          ) : (
            <p className="hidden sm:block text-[11px] text-slate-400 dark:text-slate-500">Add courses to see what's needed</p>
          )}
        </div>

        {/* Credits Earned */}
        <div className="bg-white dark:bg-card-bg-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-3 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between mb-1.5 sm:mb-3">
            <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Credits</p>
            <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" />
          </div>
          <div className="flex items-baseline gap-1 mb-1.5 sm:mb-3">
            <span className="text-xl sm:text-4xl font-display font-bold text-slate-900 dark:text-white">{totalCreditsEarned}</span>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">units</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500">
            {semesters.length} {semesters.length === 1 ? 'sem' : 'sems'}
          </p>
        </div>

      </div>

      {/* ── Main Two-Column Grid ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Course History ──────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              Course History
            </h2>
            <button
              id="add-semester-btn"
              onClick={addSemester}
              className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-dark bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Semester
            </button>
          </div>

          {semesters.length === 0 ? (
            <div className="bg-white dark:bg-card-bg-dark rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-10 text-center">
              <GraduationCap className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">No semesters yet</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Add your first semester to start tracking your GPA.</p>
              <button
                onClick={addSemester}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-xl transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add First Semester
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {semesters.map((semester) => (
                <div
                  key={semester.id}
                  className="bg-white dark:bg-card-bg-dark rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
                >
                  {/* Semester Header */}
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer select-none hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                    onClick={() => toggleSemester(semester.id)}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {expandedSemesters[semester.id]
                        ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                        : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                      <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">{semester.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                        {calculateSemesterGPA(semester.courses, scale).toFixed(2)}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeSemester(semester.id); }}
                        className="p-1 rounded-lg text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Semester Body */}
                  {expandedSemesters[semester.id] && (
                    <div className="px-4 pb-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      {/* Column labels — desktop only */}
                      {semester.courses.length > 0 && (
                        <div className="hidden sm:grid grid-cols-12 gap-2 pt-3 pb-1 px-0.5">
                          <span className="col-span-6 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Course</span>
                          <span className="col-span-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400 text-center">Cr</span>
                          <span className="col-span-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Grade</span>
                          <span className="col-span-1" />
                        </div>
                      )}

                      {semester.courses.map((course) => (
                        <div key={course.id} className="pt-2">
                          {/* Mobile: stacked. Desktop: grid */}
                          <div className="flex flex-col sm:grid sm:grid-cols-12 gap-2">
                            {/* Course name — full row on mobile */}
                            <div className="sm:col-span-6">
                              <input
                                type="text"
                                value={course.name}
                                onChange={(e) => updateCourse(semester.id, course.id, 'name', e.target.value)}
                                className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                                placeholder="Course name"
                              />
                            </div>
                            {/* Credits + Grade + Delete — same row on mobile */}
                            <div className="flex gap-2 items-center sm:contents">
                              <div className="w-16 sm:col-span-2">
                                <input
                                  type="number"
                                  value={course.credits}
                                  onChange={(e) => updateCourse(semester.id, course.id, 'credits', parseFloat(e.target.value) || 0)}
                                  className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2 text-center text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                                />
                              </div>
                              <div className="flex-1 sm:col-span-3">
                                <select
                                  value={course.grade}
                                  onChange={(e) => updateCourse(semester.id, course.id, 'grade', e.target.value)}
                                  className="w-full text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                                >
                                  {activeScale.map(g => (
                                    <option key={g.grade} value={g.grade}>{g.grade} — {g.points}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="sm:col-span-1 flex justify-end">
                                <button
                                  onClick={() => removeCourse(semester.id, course.id)}
                                  className="p-1.5 rounded-lg text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      <button
                        onClick={() => addCourseToSemester(semester.id)}
                        className="w-full mt-2 py-2 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-400 hover:text-primary hover:border-primary transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Course
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── What-If Simulator ───────────────────────────────── */}
        <div className="space-y-4" id="gpa-calculator">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-display font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-primary" />
              "What If" Simulator
            </h2>
            {hasAccess && predictionCourses.length > 0 && (
              <button
                onClick={() => setPredictionCourses([])}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>

          {!hasAccess ? (
            <div className="bg-white dark:bg-card-bg-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-base font-display font-bold text-slate-900 dark:text-white mb-1">Pro Feature</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 max-w-xs mx-auto">
                Upgrade to Pro to simulate hypothetical courses and see exactly what grades you need to hit your target CGPA.
              </p>
              <a
                href="/student/settings"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
              >
                <Sparkles className="w-4 h-4" /> Upgrade to Pro
              </a>
            </div>
          ) : (
            <>
              <div className="bg-white dark:bg-card-bg-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Add hypothetical courses to preview how they'd move your cumulative GPA.
                </p>

                {predictionCourses.map((course) => (
                  <div key={course.id} className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 space-y-2">
                    <input
                      type="text"
                      value={course.name}
                      onChange={(e) => updatePredictionCourse(course.id, 'name', e.target.value)}
                      className="w-full text-sm bg-transparent border-none outline-none focus:ring-0 p-0 font-medium text-slate-700 dark:text-slate-200 placeholder-slate-400"
                      placeholder="Course name (optional)"
                    />
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        value={course.credits}
                        onChange={(e) => updatePredictionCourse(course.id, 'credits', parseFloat(e.target.value) || 0)}
                        className="w-16 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 text-center focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                      />
                      <select
                        value={course.grade}
                        onChange={(e) => updatePredictionCourse(course.id, 'grade', e.target.value)}
                        className="flex-1 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-1.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
                      >
                        {activeScale.map(g => (
                          <option key={g.grade} value={g.grade}>{g.grade}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => removePredictionCourse(course.id)}
                        className="p-1.5 rounded-lg text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addPredictionCourse}
                  className="w-full py-2.5 border border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Hypothetical Course
                </button>
              </div>

              {/* Simulated Result */}
              {predictionCourses.length > 0 && (
                <div className="bg-gradient-to-br from-primary/5 to-blue-500/5 dark:from-primary/10 dark:to-blue-500/10 rounded-2xl border border-primary/20 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-display font-bold text-slate-900 dark:text-white">Projected Outcome</h3>
                    <TrendingUp className="w-4 h-4 text-primary" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">Projected CGPA</p>
                      <div className="flex items-baseline gap-1">
                        <span className={cn("text-3xl font-display font-bold", gpaColorClass(projectedGPA, maxScale))}>
                          {projectedGPA.toFixed(2)}
                        </span>
                        <span className="text-xs text-slate-400">/ {scale}</span>
                      </div>
                      {projectedGPA > displayGPA ? (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 mt-1">
                          <TrendingUp className="w-3 h-3" /> +{(projectedGPA - displayGPA).toFixed(2)} boost
                        </span>
                      ) : projectedGPA < displayGPA ? (
                        <span className="text-xs text-red-500 flex items-center gap-0.5 mt-1">
                          ↓ {(displayGPA - projectedGPA).toFixed(2)} drop
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 mt-1">No change</span>
                      )}
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">Sem. GPA</p>
                      <span className="text-3xl font-display font-bold text-slate-900 dark:text-white">
                        {calculateSemesterGPA(predictionCourses, scale).toFixed(2)}
                      </span>
                      <p className="text-[11px] text-slate-400 mt-1">{predictionCredits} sim. credits</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Quick Tip */}
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-100 dark:border-blue-900/30 p-4">
            <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" /> Quick Tip
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
              High-credit courses move your CGPA the most. Focus on these when aiming for your target of <strong>{targetGPA.toFixed(2)}</strong>.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
