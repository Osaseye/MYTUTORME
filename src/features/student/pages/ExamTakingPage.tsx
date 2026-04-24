// @ts-nocheck
import { useState, useEffect } from 'react';
import { 
  CheckCircle,
  Flag,
  BrainCircuit,
  Clock,
  Check,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Upload,
  Camera,
  FileText,
  Eye,
  Edit3,
  X,
  Loader2,
  ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams } from 'react-router-dom';
import { db, storage } from '@/lib/firebase';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { 
  doc,
  getDoc,
  collection,
  addDoc,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { toast } from 'sonner';
import { useTourStore } from '@/app/stores/tourStore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export const ExamTakingPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startTour } = useTourStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      startTour('student-exam-taking', [
        {
          target: '[data-tour-target="exam-question-area"]',
          title: 'Question Area',
          content: 'Read the question carefully. You can also view any associated materials or notes if present.',
          placement: 'bottom'
        },
        {
          target: '[data-tour-target="exam-timer"]',
          title: 'Exam Timer & Controls',
          content: 'Keep an eye on the remaining time. Use these controls to submit your mock exam.',
          placement: 'left'
        },
        {
          target: '[data-tour-target="exam-question-nav"]',
          title: 'Question Navigation',
          content: 'Navigate between questions quickly. You can flag questions for review or skip around.',
          placement: 'top'
        }
      ]);
    }, 1000);
    return () => clearTimeout(timer);
  }, [startTour]);
  
  const [examData, setExamData] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checkedAnswers, setCheckedAnswers] = useState<string[]>([]);
  const [flaggedQuestions, setFlaggedQuestions] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Theory question state
  const [theoryImageFiles, setTheoryImageFiles] = useState<Record<string, File>>({});
  const [theoryImagePreviews, setTheoryImagePreviews] = useState<Record<string, string>>({});
  const [theoryPreviewMode, setTheoryPreviewMode] = useState<Record<string, boolean>>({});
  const [uploadingImage, setUploadingImage] = useState<Record<string, boolean>>({});

  // Load Exam Data
  useEffect(() => {
    const loadExam = async () => {
      if (!quizId) return;
      try {
        const quizSnap = await getDoc(doc(db, 'quizzes', quizId));
        if (!quizSnap.exists()) {
          toast.error("Quiz not found");
          navigate('/student/exam-prep');
          return;
        }

        const data = quizSnap.data();
        setExamData({ id: quizSnap.id, ...data });
        setTimeLeft(data.timeLimit * 60);

        // Record that user has an active exam
        if (user) {
          try {
            await updateDoc(doc(db, 'users', user.uid), { activeExamId: quizId });
          } catch (e) {
            console.error("Could not set active exam id", e);
          }
        }

        // Fetch all questions mapped
        const qPromises = data.questionIds.map((qId: string) => getDoc(doc(db, 'questions', qId)));
        const qSnaps = await Promise.all(qPromises);
        const loadedQuestions = qSnaps.map(snap => ({ id: snap.id, ...snap.data() }));

        setQuestions(loadedQuestions);
      } catch (err) {
        console.error("Error loading exam:", err);
        toast.error("Error loading exam.");
      } finally {
        setIsLoading(false);
      }
    };

    loadExam();
  }, [quizId, navigate]);

  // Timer Effect
  useEffect(() => {
    if (isLoading || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isLoading, timeLeft]);

    useEffect(() => {
        if (isLoading) return;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [currentQuestionIndex, isLoading]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (optionText: string) => {
    setAnswers(prev => ({
      ...prev,
      [questions[currentQuestionIndex].id]: optionText
    }));
  };

  const handleTheoryAnswerChange = (questionId: string, text: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: text }));
  };

  const handleTheoryImageUpload = async (questionId: string, file: File) => {
    if (!user) return;
    const previewUrl = URL.createObjectURL(file);
    setTheoryImageFiles(prev => ({ ...prev, [questionId]: file }));
    setTheoryImagePreviews(prev => ({ ...prev, [questionId]: previewUrl }));
    setTheoryPreviewMode(prev => ({ ...prev, [questionId]: true }));
  };

  const handleConfirmTheoryImage = async (questionId: string) => {
    const file = theoryImageFiles[questionId];
    if (!file || !user) return;
    setUploadingImage(prev => ({ ...prev, [questionId]: true }));
    try {
      const storageRef = ref(storage, `theory-answers/${user.uid}/${quizId}/${questionId}-${Date.now()}`);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      setAnswers(prev => ({ ...prev, [questionId]: `[IMAGE_UPLOAD:${downloadUrl}]` }));
      setTheoryPreviewMode(prev => ({ ...prev, [questionId]: false }));
      toast.success('Answer image saved!');
    } catch (err) {
      console.error('Error uploading theory image:', err);
      toast.error('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(prev => ({ ...prev, [questionId]: false }));
    }
  };

  const handleClearTheoryImage = (questionId: string) => {
    setTheoryImageFiles(prev => { const n = { ...prev }; delete n[questionId]; return n; });
    setTheoryImagePreviews(prev => { const n = { ...prev }; delete n[questionId]; return n; });
    setTheoryPreviewMode(prev => ({ ...prev, [questionId]: false }));
    if (answers[questionId]?.startsWith('[IMAGE_UPLOAD:')) {
      setAnswers(prev => { const n = { ...prev }; delete n[questionId]; return n; });
    }
  };

  const isTheoryQuestion = (q: any) =>
    q?.type === 'theory' || q?.type === 'short-answer' || q?.questionType === 'theory' ||
    (!q?.options || q?.options?.length === 0);

  const toggleFlag = () => {
    const currentId = questions[currentQuestionIndex].id;
    setFlaggedQuestions(prev => 
      prev.includes(currentId) 
        ? prev.filter((id: string | number) => id !== currentId)
        : [...prev, currentId]
    );
  };

  const handleSubmit = async () => {
    if (!user || !quizId || isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      // Calculate score — theory questions are marked as pending AI grading
      let score = 0;
      let gradableCount = 0;
      const topicBreakdown: Record<string, { correct: number, total: number }> = {};
      const theoryAnswers: Record<string, string> = {};
      
      questions.forEach(q => {
        const studentAnswer = answers[q.id];
        const isTheory = isTheoryQuestion(q);

        if (!topicBreakdown[q.topic || 'General']) {
          topicBreakdown[q.topic || 'General'] = { correct: 0, total: 0 };
        }
        topicBreakdown[q.topic || 'General'].total++;

        if (isTheory) {
          // Theory questions are flagged for AI grading later
          if (studentAnswer) theoryAnswers[q.id] = studentAnswer;
        } else {
          gradableCount++;
          const isCorrect = studentAnswer === q.correctAnswer;
          if (isCorrect) {
            score++;
            topicBreakdown[q.topic || 'General'].correct++;
          }
        }
      });

      const objQuestions = questions.filter(q => !isTheoryQuestion(q));
      // When exam has only theory questions, mark as pending (null) rather than 0%
      const percentScore = objQuestions.length > 0 ? (score / objQuestions.length) * 100 : null;
      const hasTheoryQuestions = Object.keys(theoryAnswers).length > 0;
      const allTheory = objQuestions.length === 0 && hasTheoryQuestions;
      // Only auto-determine pass/fail for exams with objective questions
      const passed = allTheory ? null : (percentScore ?? 0) >= (examData.passingScore || 50);

      const attemptDocRef = await addDoc(collection(db, 'quiz_attempts'), {
        studentId: user.uid,
        quizId,
        courseId: null,
        startedAt: serverTimestamp(),
        completedAt: serverTimestamp(),
        score: percentScore,
        passed,
        timeTaken: (examData.timeLimit * 60) - timeLeft,
        answers,
        topicBreakdown,
        hasTheoryQuestions,
        theoryGradingStatus: hasTheoryQuestions ? 'pending' : null,
        theoryAnswers: hasTheoryQuestions ? theoryAnswers : null,
      });

      // Clear active exam status
      try {
        await updateDoc(doc(db, 'users', user.uid), { activeExamId: null });
      } catch (e) {
        console.error("Could not clear active exam id", e);
      }

      toast.success("Exam submitted successfully!");
      navigate(`/student/exam-prep/results/${attemptDocRef.id}`);

    } catch (err) {
      console.error("Error submitting exam:", err);
      toast.error("Failed to submit exam.");
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!examData || questions.length === 0) return null;

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercent = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  
  const isChecked = currentQuestion ? checkedAnswers.includes(currentQuestion.id) : false;
  const isCorrect = currentQuestion && answers[currentQuestion.id] === currentQuestion.correctAnswer;
  const currentIsTheory = currentQuestion ? isTheoryQuestion(currentQuestion) : false;

  const handleCheckAnswer = () => {
    if (!answers[currentQuestion.id]) {
      if (currentIsTheory) {
        toast.error("Please write your answer or upload an image first.");
      } else {
        toast.error("Please select an answer first.");
      }
      return;
    }
    if (!checkedAnswers.includes(currentQuestion.id)) {
      setCheckedAnswers(prev => [...prev, currentQuestion.id]);
    }
  };
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-body transition-colors duration-200">
      
      {/* Navbar (Simplified for Exam Mode) */}
      <nav className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
                <div className="flex items-center gap-3">
                    <span className="font-bold text-lg text-primary">MyTutorMe</span>
                </div>
                
                <div className="hidden md:flex flex-col items-center">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{examData.subject} - {examData.topic}</span>
                    <span className="font-display font-bold text-lg">{examData.title}</span>
                </div>

                <div data-tour-target="exam-timer" className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono font-medium ${
                        timeLeft < 300 
                            ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' 
                            : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}>
                      <Clock className="w-4 h-4" />
                      {formatTime(timeLeft)}
                    </div>
                </div>
            </div>
        </div>
      </nav>

      <main className="min-h-[calc(100vh-64px)] w-full flex justify-center p-4 md:p-8 relative">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05]" 
             style={{ 
                backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
                backgroundSize: '40px 40px'
             }}
        ></div>

        <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-8 z-10 relative">
            
            {/* Left Sidebar: Progress */}
            <aside className="lg:col-span-3 order-2 lg:order-1 flex flex-col gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                    <h3 className="font-display font-bold text-lg mb-4">Your Progress</h3>
                    <div className="flex items-end justify-between mb-2">
                        <span className="text-3xl font-bold text-primary">{String(currentQuestionIndex + 1).padStart(2, '0')}</span>
                        <span className="text-sm text-slate-500 dark:text-slate-400 mb-1 font-medium">of {questions.length} Questions</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 mb-6 overflow-hidden">
                        <div className="bg-primary h-2.5 rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-2 mb-6">
                        {questions.map((q, idx) => {
                            const isCurrent = idx === currentQuestionIndex;
                            const isFlagged = flaggedQuestions.includes(q.id);
                            // Only show status for questions we have 'checked' or answered
                            // For this demo, let's keep it simple:
                            // Green = Checked & Correct
                            // Red = Checked & Wrong
                            // Slate = Unanswered
                            // Primary Ring = Current
                            
                            const qIsChecked = checkedAnswers.includes(q.id);
                            const qAnswer = answers[q.id];
                            const qIsCorrect = qAnswer === q.correctAnswer;

                            let baseColor = "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700";
                            
                            if (qIsChecked) {
                                if (qIsCorrect) baseColor = "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800";
                                else baseColor = "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800";
                            } else if (answers[q.id]) {
                                // Answered but not checked
                                baseColor = "bg-primary/10 text-primary border border-primary/20";
                            }

                            if (isCurrent) {
                                baseColor = "bg-primary text-white ring-2 ring-offset-2 ring-primary dark:ring-offset-slate-950 shadow-md shadow-primary/30";
                            }

                            return (
                                <button 
                                    key={q.id}
                                    onClick={() => setCurrentQuestionIndex(idx)}
                                    className={`w-8 h-8 rounded-lg text-xs font-bold flex items-center justify-center transition-all ${baseColor} ${isFlagged ? 'relative' : ''}`}
                                >
                                    {idx + 1}
                                    {isFlagged && <div className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-full border-2 border-white dark:border-slate-900 translate-x-1/3 -translate-y-1/3" />}
                                </button>
                            );
                        })}
                    </div>

                    <Button 
                        variant="outline"
                        className={`w-full gap-2 ${flaggedQuestions.includes(currentQuestion.id) ? 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100' : ''}`}
                        onClick={toggleFlag}
                    >
                        <Flag className={`w-4 h-4 ${flaggedQuestions.includes(currentQuestion.id) ? 'fill-current' : ''}`} />
                        {flaggedQuestions.includes(currentQuestion.id) ? 'Flagged for Review' : 'Flag for Review'}
                    </Button>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/10 p-6 rounded-2xl shadow-sm border border-green-100 dark:border-green-900/30">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white dark:bg-green-900/50 rounded-full shadow-sm">
                            <BrainCircuit className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-bold text-green-900 dark:text-green-100">AI Insight</span>
                    </div>
                    <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed font-medium">
                        Focus on the concepts of <span className="font-bold">{examData.subject}</span>. Take your time to analyze each question in the {examData.topic} topic.
                    </p>
                </div>
            </aside>

            {/* Main Question Area */}
            <div className="lg:col-span-6 order-1 lg:order-2">
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg border border-slate-200 dark:border-slate-800 h-full flex flex-col relative overflow-hidden">
                    
                    <div className="p-4 md:p-8 pb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${currentIsTheory ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                            {currentIsTheory ? <><Edit3 className="w-3 h-3" /> Theory</> : <><FileText className="w-3 h-3" /> Objective</>}
                          </span>
                          {currentQuestion.marks && (
                            <span className="text-xs text-slate-500 font-medium">{currentQuestion.marks} mark{currentQuestion.marks !== 1 ? 's' : ''}</span>
                          )}
                        </div>
                        <div className="prose prose-slate dark:prose-invert max-w-none mb-2
                          [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-slate-900 [&_h1]:dark:text-white
                          [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:dark:text-white
                          [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-slate-800 [&_h3]:dark:text-slate-200
                          [&_p]:text-base [&_p]:text-slate-900 [&_p]:dark:text-white [&_p]:leading-relaxed
                          [&_ul]:pl-5 [&_ol]:pl-5 [&_li]:text-slate-900 [&_li]:dark:text-white [&_li]:text-base
                          [&_code]:text-sm [&_code]:bg-slate-100 [&_code]:dark:bg-slate-800 [&_code]:px-1 [&_code]:rounded
                          [&_pre]:bg-slate-900 [&_pre]:rounded-lg [&_pre_code]:text-emerald-300 [&_pre_code]:bg-transparent
                          [&_strong]:font-bold [&_strong]:text-slate-900 [&_strong]:dark:text-white">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{currentQuestion.text}</ReactMarkdown>
                        </div>
                        {currentQuestion.subtext && (
                            <p className="text-slate-500 dark:text-slate-400 mb-6 italic text-sm">
                                {currentQuestion.subtext}
                            </p>
                        )}
                    </div>

                    <div className="h-px bg-slate-100 dark:bg-slate-800 w-full"></div>

                    <div className="p-4 md:p-8 pt-6 space-y-4 flex-1">
                        {currentIsTheory ? (
                          /* THEORY QUESTION: Text area + image upload */
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                                Write your answer below:
                              </label>
                              <textarea
                                value={answers[currentQuestion.id]?.startsWith('[IMAGE_UPLOAD:') ? '' : (answers[currentQuestion.id] || '')}
                                onChange={(e) => handleTheoryAnswerChange(currentQuestion.id, e.target.value)}
                                placeholder="Type your answer here. Be thorough and explain your reasoning clearly..."
                                rows={8}
                                className="w-full p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white resize-y focus:border-primary focus:outline-none focus:ring-0 transition-colors text-base leading-relaxed placeholder:text-slate-400"
                                disabled={answers[currentQuestion.id]?.startsWith('[IMAGE_UPLOAD:')}
                              />
                            </div>

                            <div className="relative">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">or upload handwritten answer</span>
                                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                              </div>

                              {/* Image Preview / Upload area */}
                              {theoryPreviewMode[currentQuestion.id] && theoryImagePreviews[currentQuestion.id] ? (
                                <div className="rounded-xl border-2 border-primary/30 overflow-hidden bg-slate-50 dark:bg-slate-800">
                                  <div className="flex items-center justify-between p-3 bg-primary/5 border-b border-primary/20">
                                    <div className="flex items-center gap-2">
                                      <Eye className="w-4 h-4 text-primary" />
                                      <span className="text-sm font-semibold text-primary">Preview — Review before confirming</span>
                                    </div>
                                    <button
                                      onClick={() => handleClearTheoryImage(currentQuestion.id)}
                                      className="p-1 rounded-full hover:bg-red-100 text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                  <div className="p-4">
                                    <img
                                      src={theoryImagePreviews[currentQuestion.id]}
                                      alt="Your handwritten answer"
                                      className="w-full rounded-lg max-h-64 object-contain bg-white"
                                    />
                                    <p className="text-xs text-slate-500 mt-2 text-center">Review your image above. If it looks good, confirm it as your answer.</p>
                                    <div className="flex gap-2 mt-3">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 text-xs"
                                        onClick={() => handleClearTheoryImage(currentQuestion.id)}
                                      >
                                        <X className="w-3 h-3 mr-1" /> Retake
                                      </Button>
                                      <Button
                                        size="sm"
                                        className="flex-1 text-xs bg-primary hover:bg-green-700 text-white"
                                        onClick={() => handleConfirmTheoryImage(currentQuestion.id)}
                                        disabled={uploadingImage[currentQuestion.id]}
                                      >
                                        {uploadingImage[currentQuestion.id] ? (
                                          <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Saving...</>
                                        ) : (
                                          <><Check className="w-3 h-3 mr-1" /> Confirm Answer</>
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ) : answers[currentQuestion.id]?.startsWith('[IMAGE_UPLOAD:') ? (
                                <div className="rounded-xl border-2 border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4 flex items-center gap-3">
                                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center">
                                    <ImageIcon className="w-5 h-5 text-green-600" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold text-green-800 dark:text-green-200">Image answer saved</p>
                                    <p className="text-xs text-green-600 dark:text-green-400">Your handwritten answer has been uploaded successfully.</p>
                                  </div>
                                  <button
                                    onClick={() => handleClearTheoryImage(currentQuestion.id)}
                                    className="text-xs text-red-500 hover:text-red-700 underline font-medium"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ) : (
                                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all group">
                                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full group-hover:bg-primary/10 transition-colors mb-2">
                                    <Camera className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                                  </div>
                                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors">
                                    Click to upload photo of handwritten answer
                                  </p>
                                  <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 20MB</p>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      if (e.target.files?.[0]) {
                                        handleTheoryImageUpload(currentQuestion.id, e.target.files[0]);
                                      }
                                    }}
                                  />
                                </label>
                              )}
                            </div>
                          </div>
                        ) : (
                          /* OBJECTIVE / MCQ QUESTION */
                          currentQuestion.options?.map((optionText: string, idx: number) => {
                            const isSelected = answers[currentQuestion.id] === optionText;
                            const isCorrectAnswer = currentQuestion.correctAnswer === optionText;
                            const showResult = false;

                            let containerClass = "border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-primary/50 hover:shadow-md";
                            let textClass = "text-slate-400 group-hover:text-primary";
                            let valueClass = "text-slate-900 dark:text-slate-200";

                            if (isSelected) {
                              containerClass = "border-2 border-primary bg-primary/5 dark:bg-primary/10 shadow-sm";
                              textClass = "text-primary";
                              valueClass = "text-primary font-bold";
                            }

                            return (
                              <label 
                                key={idx}
                                className={`group relative flex items-center p-4 rounded-xl cursor-pointer transition-all duration-200 ${containerClass}`}
                                onClick={() => handleAnswerSelect(optionText)}
                              >
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${
                                  isSelected || (showResult && isCorrectAnswer) ? 'border-primary' : 'border-slate-300 dark:border-slate-600'
                                }`}>
                                  {isSelected && <div className="w-3 h-3 bg-primary rounded-full" />}
                                </div>
                                
                                <div className="flex-1">
                                  <span className={`block text-xs font-bold mb-0.5 uppercase tracking-wider transition-colors ${textClass}`}>
                                    Option {String.fromCharCode(65 + idx)}
                                  </span>
                                  <span className={`block text-lg font-medium transition-colors ${valueClass}`}>
                                    {optionText}
                                  </span>
                                </div>

                                {showResult && isCorrectAnswer && (
                                  <div className="bg-primary text-white p-1 rounded-full flex items-center justify-center shadow-sm animate-in zoom-in">
                                    <Check className="w-4 h-4" />
                                  </div>
                                )}
                              </label>
                            );
                          })
                        )}
                    </div>

                    <div className="p-8 pt-4 flex justify-between items-center bg-white dark:bg-slate-900 sticky bottom-0 border-t border-slate-100 dark:border-slate-800">
                        <Button
                            variant="ghost"
                            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                            disabled={currentQuestionIndex === 0}
                            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            <ArrowLeft className="w-4 h-4 mr-2" /> Previous
                        </Button>
                        
                        {(examData.mode === 'standard') ? (
                            <Button
                                onClick={() => {
                                    if (currentQuestionIndex < questions.length - 1) {
                                        setCurrentQuestionIndex(prev => prev + 1);
                                    } else {
                                        setIsSubmitModalOpen(true);
                                    }
                                }}
                                disabled={isSubmitting}
                                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-6 px-8 rounded-xl shadow-lg transition-all hover:-translate-y-0.5 flex gap-2"
                            >
                                {isSubmitting ? 'Submitting...' : (currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Exam')} 
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        ) : !isChecked ? (
                             <Button
                                onClick={handleCheckAnswer}
                                className="bg-primary hover:bg-green-700 text-white font-bold py-6 px-8 rounded-xl shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5"
                            >
                                {currentIsTheory ? 'Save Answer' : 'Check Answer'}
                            </Button>
                        ) : (
                                <Button
                                    onClick={() => {
                                        if (currentQuestionIndex < questions.length - 1) {
                                            setCurrentQuestionIndex(prev => prev + 1);
                                        } else {
                                            setIsSubmitModalOpen(true);
                                        }
                                    }}
                                    disabled={isSubmitting}
                                    className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-6 px-8 rounded-xl shadow-lg transition-all hover:-translate-y-0.5 flex gap-2"
                                >
                                    {isSubmitting ? 'Submitting...' : (currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Exam')} 
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Sidebar: Explanation */}
            <aside className="lg:col-span-3 order-3 flex flex-col gap-4">
                {isChecked && examData.mode !== 'standard' ? (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 h-full flex flex-col relative overflow-hidden animate-in slide-in-from-right duration-300">
                        {currentIsTheory ? (
                          /* Theory question feedback: show model answer */
                          <>
                            <div className="p-4 border-b bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/50">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm bg-purple-500">
                                  <BrainCircuit className="w-4 h-4" />
                                </div>
                                <div>
                                  <h4 className="font-bold text-purple-900 dark:text-purple-100">Answer Submitted</h4>
                                  <span className="text-xs text-purple-700 dark:text-purple-300">AI grading pending — see results page</span>
                                </div>
                              </div>
                            </div>
                            <div className="p-5 flex-1 overflow-y-auto space-y-4">
                              <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">Model Answer / Key Points:</p>
                                {currentQuestion.explanation || currentQuestion.correctAnswer ? (
                                  <div className="space-y-3">
                                    {currentQuestion.correctAnswer && !currentQuestion.correctAnswer?.startsWith?.('[') && (
                                      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                                        <p className="text-xs font-bold text-purple-700 dark:text-purple-300 mb-1 uppercase tracking-wide">Expected Answer</p>
                                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{currentQuestion.correctAnswer}</p>
                                      </div>
                                    )}
                                    {currentQuestion.explanation && (
                                      <div className="space-y-2">
                                        {typeof currentQuestion.explanation === 'string' ? (
                                          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{currentQuestion.explanation}</p>
                                        ) : (
                                          <>
                                            {currentQuestion.explanation?.intro && <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{currentQuestion.explanation.intro}</p>}
                                            {currentQuestion.explanation?.steps && (
                                              <ol className="space-y-1.5 list-decimal list-inside">
                                                {currentQuestion.explanation.steps.map((step: string, i: number) => (
                                                  <li key={i} className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{step}</li>
                                                ))}
                                              </ol>
                                            )}
                                            {currentQuestion.explanation?.final && (
                                              <p className="text-sm font-bold text-primary border-t border-slate-100 dark:border-slate-800 pt-2 mt-2">{currentQuestion.explanation.final}</p>
                                            )}
                                          </>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-sm text-slate-500 italic">No model answer provided. Your response will be reviewed during grading.</p>
                                )}
                              </div>
                              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                                <p className="text-xs font-bold text-amber-700 dark:text-amber-300 mb-1">📝 Grading Note</p>
                                <p className="text-xs text-amber-600 dark:text-amber-400 leading-relaxed">Theory answers are graded holistically. Your marks will reflect the accuracy, depth, and clarity of your response.</p>
                              </div>
                            </div>
                          </>
                        ) : (
                          /* MCQ feedback */
                          <>
                            <div className={`p-4 border-b ${
                                isCorrect 
                                ? 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800/50' 
                                : 'bg-red-100 dark:bg-red-900/30 border-red-200 dark:border-red-800/50'
                            }`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm ${
                                        isCorrect ? 'bg-green-500' : 'bg-red-500'
                                    }`}>
                                        {isCorrect ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <h4 className={`font-bold ${
                                            isCorrect ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'
                                        }`}>
                                            {isCorrect ? 'Correct!' : 'Incorrect'}
                                        </h4>
                                        <span className={`text-xs ${
                                            isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
                                        }`}>
                                            {isCorrect ? '+10 XP Gained' : 'Review the concept below'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-5 flex-1 overflow-y-auto">
                                {!isCorrect && currentQuestion.correctAnswer && (
                                  <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                    <p className="text-xs font-bold text-green-700 dark:text-green-300 mb-1 uppercase tracking-wide">Correct Answer</p>
                                    <p className="text-sm font-semibold text-green-800 dark:text-green-200">{currentQuestion.correctAnswer}</p>
                                  </div>
                                )}
                                <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">Detailed Explanation:</p>
                                
                                <div className="space-y-4">
                                    {typeof currentQuestion.explanation === 'string' ? (
                                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                            {currentQuestion.explanation}
                                        </p>
                                    ) : (
                                        <>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                                {currentQuestion.explanation?.intro}
                                            </p>
                                            
                                            {currentQuestion.explanation?.formula && (
                                                <div className="bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg font-mono text-xs text-center border border-slate-200 dark:border-slate-700">
                                                    {currentQuestion.explanation.formula}
                                                </div>
                                            )}

                                            {currentQuestion.explanation?.steps && (
                                                <ol className="space-y-2 list-decimal list-inside">
                                                    {currentQuestion.explanation.steps.map((step: string, i: number) => (
                                                        <li key={i} className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                                            {step}
                                                        </li>
                                                    ))}
                                                </ol>
                                            )}

                                            {currentQuestion.explanation?.final && (
                                                <p className="text-sm font-bold text-primary border-t border-slate-100 dark:border-slate-800 pt-2 mt-2">
                                                    {currentQuestion.explanation.final}
                                                </p>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                          </>
                        )}
                    </div>
                ) : (
                    /* Placeholder when question is not checked yet */
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 h-full flex flex-col items-center justify-center p-8 text-center opacity-70">
                        {answers[currentQuestion.id] && examData.mode === 'standard' ? (
                            <>
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 mb-4">
                                    <CheckCircle className="w-8 h-8 text-primary" />
                                </div>
                                <h4 className="font-bold text-slate-500 dark:text-slate-400">Answer Recorded</h4>
                                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Focus on the next question. Feedback provided at the end.</p>
                            </>
                        ) : (
                            <>
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 mb-4">
                                    <CheckCircle className="w-8 h-8" />
                                </div>
                                <h4 className="font-bold text-slate-500 dark:text-slate-400">No Feedback Yet</h4>
                                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
                                  {currentIsTheory
                                    ? 'Write your answer and click "Save Answer" to see the model answer.'
                                    : 'Select an option and click "Check Answer" to see detailed explanations and AI insights.'}
                                </p>
                            </>
                        )}
                    </div>
                )}
            </aside>
        </div>
      </main>

      {/* Submit Confirmation Modal */}
      {isSubmitModalOpen && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
               <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-full flex items-center justify-center mb-6">
                     <AlertCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Finish Exam?</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-8">
                     Are you sure you want to exit? Your progress will be saved.
                  </p>
                  <div className="flex gap-4 w-full">
                     <Button 
                        variant="outline" 
                        className="flex-1 py-6"
                        onClick={() => setIsSubmitModalOpen(false)}
                     >
                        Keep Working
                     </Button>
                     <Button 
                        className="flex-1 py-6 bg-red-600 hover:bg-red-700 text-white"
                        onClick={handleSubmit}
                                disabled={isSubmitting}
                     >
                                {isSubmitting ? (
                                  <>
                                     <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                     Submitting...
                                  </>
                                ) : 'Yes, Submit'}
                     </Button>
                  </div>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};


