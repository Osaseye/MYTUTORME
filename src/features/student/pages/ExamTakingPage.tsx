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
  PlayCircle,
  FileText,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate, useParams } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { 
  doc, 
  getDoc, 
  collection, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { toast } from 'sonner';

export const ExamTakingPage = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
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
      // Calculate score
      let score = 0;
      const topicBreakdown: Record<string, { correct: number, total: number }> = {};
      
      questions.forEach(q => {
        const studentAnswer = answers[q.id];
        const isCorrect = studentAnswer === q.correctAnswer;
        
        if (isCorrect) score++;
        
        if (!topicBreakdown[q.topic]) {
          topicBreakdown[q.topic] = { correct: 0, total: 0 };
        }
        topicBreakdown[q.topic].total++;
        if (isCorrect) topicBreakdown[q.topic].correct++;
      });

      const percentScore = (score / questions.length) * 100;
      const passed = percentScore >= examData.passingScore;

      const attemptDocRef = await addDoc(collection(db, 'quiz_attempts'), {
        studentId: user.uid,
        quizId,
        courseId: null,
        startedAt: serverTimestamp(), // Ideally we'd log this on mount, but good enough
        completedAt: serverTimestamp(),
        score: percentScore,
        passed,
        timeTaken: (examData.timeLimit * 60) - timeLeft,
        answers,
        topicBreakdown
      });

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

  const handleCheckAnswer = () => {
    if (!answers[currentQuestion.id]) {
        toast.error("Please select an answer first.");
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

                <div className="flex items-center gap-4">
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

      Main Content Area
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
                        <h2 className="text-xl md:text-2xl font-bold font-display leading-tight text-slate-900 dark:text-white mb-2">
                            {currentQuestion.text}
                        </h2>
                        {currentQuestion.subtext && (
                            <p className="text-slate-500 dark:text-slate-400 mb-6 italic text-sm">
                                {currentQuestion.subtext}
                            </p>
                        )}
                    </div>

                    <div className="h-px bg-slate-100 dark:bg-slate-800 w-full"></div>

                    <div className="p-4 md:p-8 pt-6 space-y-4 flex-1">
                        {currentQuestion.options.map((optionText: string, idx: number) => {
                            const isSelected = answers[currentQuestion.id] === optionText;
                            const isCorrectAnswer = currentQuestion.correctAnswer === optionText;
                            const showResult = false; // We don't show result during the exam unless explicitly asked

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
                        })}
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
                                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-6 px-8 rounded-xl shadow-lg transition-all hover:-translate-y-0.5 flex gap-2"
                            >
                                {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Exam'} 
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        ) : !isChecked ? (
                             <Button
                                onClick={handleCheckAnswer}
                                className="bg-primary hover:bg-green-700 text-white font-bold py-6 px-8 rounded-xl shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5"
                            >
                                Check Answer
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
                                    className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-6 px-8 rounded-xl shadow-lg transition-all hover:-translate-y-0.5 flex gap-2"
                                >
                                    {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Exam'} 
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Sidebar: Explanation (Similar to provided HTML's right col) */}
            <aside className="lg:col-span-3 order-3 flex flex-col gap-4">
                {isChecked && examData.mode !== 'standard' ? (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 h-full flex flex-col relative overflow-hidden animate-in slide-in-from-right duration-300">
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
                                            <div className="space-y-1">
                                                {currentQuestion.explanation.steps.map((step: string, i: number) => (
                                                    <p key={i} className="text-sm text-slate-600 dark:text-slate-300 font-mono text-xs opacity-90">
                                                        {step}
                                                    </p>
                                                ))}
                                            </div>
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
                                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Select an option and click "Check Answer" to see detailed explanations and AI insights.</p>
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
                     >
                        Yes, Submit
                     </Button>
                  </div>
               </div>
            </div>
         </div>
      )}

    </div>
  );
};
