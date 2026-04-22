// @ts-nocheck
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useAuthStore } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Clock, FileText, ArrowLeft, Loader2, Sparkles, Layers, Hash, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { BrandedCoursePDF } from '@/features/admin/components/BrandedCoursePDF';

const normalizeType = (type: string) => {
  if (!type) return 'theory';
  return String(type).toLowerCase().includes('mcq') ? 'mcq' : String(type).toLowerCase();
};

export const GeneratedCourseDetailsPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'material' | 'exam'>('material');

  const [examMode, setExamMode] = useState<'standard' | 'practice'>('standard');
  const [startingExam, setStartingExam] = useState(false);
  const [resumeQuizId, setResumeQuizId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      try {
        setLoading(true);
        const snap = await getDoc(doc(db, 'courses', courseId));
        if (!snap.exists()) {
          setCourse(null);
          return;
        }
        setCourse({ id: snap.id, ...snap.data() });
      } catch (error) {
        console.error('Error loading generated course:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  useEffect(() => {
    const fetchActiveExam = async () => {
      if (!user || !courseId) {
        setResumeQuizId(null);
        return;
      }

      try {
        const userSnap = await getDoc(doc(db, 'users', user.uid));
        const activeExamId = userSnap.data()?.activeExamId;
        if (!activeExamId) {
          setResumeQuizId(null);
          return;
        }

        const quizSnap = await getDoc(doc(db, 'quizzes', activeExamId));
        if (!quizSnap.exists()) {
          setResumeQuizId(null);
          return;
        }

        const quizData = quizSnap.data();
        if (quizData?.source === 'admin-generated-course' && quizData?.courseId === courseId) {
          setResumeQuizId(activeExamId);
        } else {
          setResumeQuizId(null);
        }
      } catch (error) {
        console.error('Could not check active generated exam:', error);
        setResumeQuizId(null);
      }
    };

    fetchActiveExam();
  }, [user, courseId]);

  const examData = useMemo(() => {
    if (!course) return null;
    const exam = course.mockExam || {};
    return {
      title: exam.title || `${course.title || 'Course'} Mock Exam`,
      timeAllowed: Number(exam.timeAllowed || 30),
      sections: Array.isArray(exam.sections) ? exam.sections : []
    };
  }, [course]);

  const studyMaterial = useMemo(() => {
    if (!course) return null;
    return course.studyMaterial || course.mockExam?.studyMaterial || null;
  }, [course]);

  const flattenedQuestions = useMemo(() => {
    if (!examData?.sections) return [];
    const list: any[] = [];
    examData.sections.forEach((section: any, sIdx: number) => {
      const questions = Array.isArray(section?.questions) ? section.questions : [];
      questions.forEach((q: any, qIdx: number) => {
        list.push({
          ...q,
          id: q?.id || `s${sIdx}-q${qIdx}`,
          sectionName: section?.name || `Section ${sIdx + 1}`,
          type: normalizeType(q?.type || section?.type || 'theory')
        });
      });
    });
    return list;
  }, [examData]);

  const handleContinueExam = () => {
    if (!resumeQuizId) return;
    navigate(`/student/exam-prep/active/${resumeQuizId}`);
  };

  const startExam = async () => {
    if (resumeQuizId) {
      handleContinueExam();
      return;
    }

    if (!user) {
      toast.error('Please sign in to start this exam.');
      return;
    }

    const mcqQuestions = flattenedQuestions.filter((q) => q.type === 'mcq' && Array.isArray(q.options) && q.options.length > 0);
    if (!mcqQuestions.length) {
      toast.error('No valid multiple-choice questions found for this exam.');
      return;
    }

    const loadingToastId = toast.loading('Preparing your exam session...');
    try {
      setStartingExam(true);

      const questionIds: string[] = [];
      for (const q of mcqQuestions) {
        const qRef = await addDoc(collection(db, 'questions'), {
          text: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer || '',
          explanation: q.explanation || 'Review the relevant study material for this concept.',
          topic: q.topicArea || q.sectionName || course.title || 'General'
        });
        questionIds.push(qRef.id);
      }

      const quizRef = await addDoc(collection(db, 'quizzes'), {
        title: examData?.title || `${course.title || 'Course'} Mock Exam`,
        subject: course.subject || 'General',
        topic: courseDisplayTitle,
        mode: examMode,
        timeLimit: Number(examData?.timeAllowed || 30),
        passingScore: 50,
        questionIds,
        source: 'admin-generated-course',
        courseId: course.id,
        createdAt: serverTimestamp(),
        createdBy: user.uid
      });

      toast.success(`Starting ${examMode} mode exam...`, { id: loadingToastId });
      navigate(`/student/exam-prep/active/${quizRef.id}`);
    } catch (error) {
      console.error('Failed to prepare generated course exam session:', error);
      toast.error('Could not start exam session. Please try again.', { id: loadingToastId });
    } finally {
      setStartingExam(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  if (!course) {
    return <div className="p-10 text-center">Course not found.</div>;
  }

  const courseDisplayTitle = course.title || course.mockExam?.title || course.subject || 'Course Details';
  const courseDisplayCode = course.id || courseId || 'N/A';
  const sectionCount = examData?.sections?.length || 0;
  const questionCount = flattenedQuestions.length;
  const hasStudyMaterial = !!studyMaterial?.content;

  const handleShare = async () => {
    const inviteLink = `${window.location.origin}/invite/${courseId}?ref=${user?.uid || ''}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Learn ${courseDisplayTitle} on MyTutorMe`,
          text: `Check out this course: ${courseDisplayTitle}`,
          url: inviteLink,
        });
      } else {
        await navigator.clipboard.writeText(inviteLink);
        toast.success("Invite link copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing", err);
      // Fallback
      await navigator.clipboard.writeText(inviteLink).catch(console.error);
      toast.success("Invite link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-14 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 12% 15%, rgba(16,185,129,0.12), transparent 32%), radial-gradient(circle at 85% 10%, rgba(132,204,22,0.10), transparent 30%)' }} />

      <div className="border-b border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/65 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/student/courses" className="text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 inline-flex items-center gap-2 font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to My Courses
          </Link>
          <div className="flex items-center gap-2">
            <Badge className="bg-primary text-white border-0 shadow-sm hidden sm:inline-flex">Admin Generated</Badge>
            <Button variant="outline" size="sm" className="h-7 text-xs rounded-full" onClick={handleShare}>
              <Share2 className="w-3.5 h-3.5 mr-1.5" /> Share
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 md:py-8 space-y-6 relative z-10">
        <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-[1.5rem] p-5 sm:p-6 md:p-8 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 text-[10px] sm:text-xs">
              <Sparkles className="w-3.5 h-3.5 mr-1" /> Student Learning Pack
            </Badge>
            {course.subject && <Badge variant="outline" className="bg-white/60 dark:bg-slate-900/60 text-[10px] sm:text-xs">{course.subject}</Badge>}
            <Badge variant="outline" className="bg-white/60 dark:bg-slate-900/60 text-[10px] sm:text-xs">No Enrollment Required</Badge>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-2 md:mb-3 leading-tight">{courseDisplayTitle}</h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
            {course.description || 'This learning pack includes study material and a mock exam prepared by your admin.'}
          </p>

          <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3">
              <p className="text-xs text-slate-500 mb-1 inline-flex items-center"><Hash className="w-3.5 h-3.5 mr-1" /> Course Code</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 break-all">{courseDisplayCode}</p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3">
              <p className="text-xs text-slate-500 mb-1 inline-flex items-center"><Layers className="w-3.5 h-3.5 mr-1" /> Sections</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{sectionCount}</p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3">
              <p className="text-xs text-slate-500 mb-1 inline-flex items-center"><BookOpen className="w-3.5 h-3.5 mr-1" /> Questions</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{questionCount}</p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-3">
              <p className="text-xs text-slate-500 mb-1 inline-flex items-center"><FileText className="w-3.5 h-3.5 mr-1" /> Material</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{hasStudyMaterial ? 'Available' : 'Not Available'}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              variant={activeTab === 'material' ? 'default' : 'outline'}
              className="rounded-full"
              onClick={() => setActiveTab('material')}
            >
              <FileText className="w-4 h-4 mr-2" /> Study Material
            </Button>
            <Button
              variant={activeTab === 'exam' ? 'default' : 'outline'}
              className="rounded-full"
              onClick={() => setActiveTab('exam')}
            >
              <BookOpen className="w-4 h-4 mr-2" /> Mock Exam
            </Button>
          </div>
        </div>

        {activeTab === 'material' && (
          <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
            <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white mb-2">Study Material PDF</h2>
            <p className="text-sm text-slate-500 mb-5">Your admin-prepared study guide is available as a branded PDF.</p>

            {studyMaterial?.content || examData?.sections?.length ? (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 bg-gradient-to-br from-slate-50 to-emerald-50/40 dark:from-slate-950/40 dark:to-slate-900/30">
                <PDFDownloadLink
                  document={<BrandedCoursePDF courseTitle={courseDisplayTitle} courseCode={courseDisplayCode} examData={{ ...examData, studyMaterial }} />}
                  fileName={`${courseDisplayTitle.replace(/\s+/g, '_')}_Study_Material.pdf`}
                >
                  {({ loading, error }) => {
                    if (error) {
                      console.error('Failed to prepare study material PDF:', error);
                    }

                    return (
                      <Button disabled={loading} className="bg-primary hover:bg-primary-dark text-white shadow-md shadow-primary/20">
                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileText className="w-4 h-4 mr-2" />}
                        {loading ? 'Preparing PDF...' : 'Download Study Material PDF'}
                      </Button>
                    );
                  }}
                </PDFDownloadLink>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-slate-500 bg-slate-50 dark:bg-slate-950/40">
                No study material was attached to this course.
              </div>
            )}
          </div>
        )}

        {activeTab === 'exam' && (
          <div className="space-y-4">
            <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">{examData?.title || 'Mock Exam'}</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {flattenedQuestions.length} questions across {examData?.sections?.length || 0} sections
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline"><Clock className="w-3.5 h-3.5 mr-1" /> {examData?.timeAllowed || 30} mins</Badge>
                  {resumeQuizId ? (
                    <Button onClick={handleContinueExam} className="bg-amber-600 hover:bg-amber-700 text-white shadow-sm">
                      Continue Exam
                    </Button>
                  ) : (
                    <Button onClick={startExam} disabled={flattenedQuestions.length === 0 || startingExam} className="shadow-sm">
                      {startingExam ? (
                        <span className="inline-flex items-center"><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Starting...</span>
                      ) : (
                        'Start Mock Exam'
                      )}
                    </Button>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setExamMode('standard')}
                  className={`rounded-2xl border p-4 text-left transition ${examMode === 'standard' ? 'border-primary bg-primary/10 shadow-sm' : 'border-slate-200 dark:border-slate-700 hover:border-primary/40 bg-slate-50/60 dark:bg-slate-900/40'}`}
                >
                  <p className="font-semibold text-slate-900 dark:text-white">Standard Mode</p>
                  <p className="text-xs text-slate-500 mt-1">See answers and score at the end of the exam.</p>
                </button>
                <button
                  type="button"
                  onClick={() => setExamMode('practice')}
                  className={`rounded-2xl border p-4 text-left transition ${examMode === 'practice' ? 'border-primary bg-primary/10 shadow-sm' : 'border-slate-200 dark:border-slate-700 hover:border-primary/40 bg-slate-50/60 dark:bg-slate-900/40'}`}
                >
                  <p className="font-semibold text-slate-900 dark:text-white">Practice Mode</p>
                  <p className="text-xs text-slate-500 mt-1">Check each answer immediately with explanations.</p>
                </button>
              </div>

              <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-950/40">
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  The exam opens in the regular Exam Taking session so students get the same experience as the standard exam flow.
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Mode selected: <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">{examMode}</span>
                </p>
              </div>

              {startingExam && (
                <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm text-primary inline-flex items-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Preparing your exam session, please wait...
                </div>
              )}
            </div>

            {flattenedQuestions.length === 0 && (
              <div className="bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-slate-500">
                No exam questions were generated for this course yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
