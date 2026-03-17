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
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

// Mock Exam Data
const EXAM_DATA = {
  title: "Mock Exam",
  subtitle: "Subject Placeholder",
  totalTime: 0, // 0 minutes
  questions: [] as any[]
};

export const ExamTakingPage = () => {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<number[]>([]);
  const [checkedAnswers] = useState<number[]>([]); // Track questions where "Check Answer" was clicked
  const [timeLeft, setTimeLeft] = useState(EXAM_DATA.totalTime);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Timer Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (optionId: string) => {
    if (checkedAnswers.includes(EXAM_DATA.questions[currentQuestionIndex].id)) return; // Prevent changing after checking
    setAnswers(prev => ({
      ...prev,
      [EXAM_DATA.questions[currentQuestionIndex].id]: optionId
    }));
  };

  const toggleFlag = () => {
    const currentId = EXAM_DATA.questions[currentQuestionIndex].id;
    setFlaggedQuestions(prev => 
      prev.includes(currentId) 
        ? prev.filter(id => id !== currentId)
        : [...prev, currentId]
    );
  };

  const handleCheckAnswer = () => {
      // noop
  };

  const handleSubmit = () => {
    setTimeout(() => {
        navigate('/student/exam-prep/results');
    }, 1500);
  };

  const currentQuestion = EXAM_DATA.questions[currentQuestionIndex];
  const progressPercent = EXAM_DATA.questions.length > 0 ? ((currentQuestionIndex + 1) / EXAM_DATA.questions.length) * 100 : 0;
  
  const isChecked = currentQuestion && checkedAnswers.includes(currentQuestion.id);
  const isCorrect = isChecked && answers[currentQuestion.id] === currentQuestion.correctAnswer;
  
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-body transition-colors duration-200">
      
      {/* Navbar (Simplified for Exam Mode) */}
      <nav className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
                <div className="flex items-center gap-3">
                </div>
                
                <div className="hidden md:flex flex-col items-center">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{EXAM_DATA.subtitle}</span>
                    <span className="font-display font-bold text-lg">{EXAM_DATA.title}</span>
                </div>

                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <CheckCircle className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </Button>
                 
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
                        <span className="text-sm text-slate-500 dark:text-slate-400 mb-1 font-medium">of {EXAM_DATA.questions.length} Questions</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 mb-6 overflow-hidden">
                        <div className="bg-primary h-2.5 rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                    
                    <div className="grid grid-cols-5 gap-2 mb-6">
                        {EXAM_DATA.questions.map((q, idx) => {
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
                        You're strong in <span className="font-bold">Thermodynamics</span> but slower on calculation questions. Take your time here!
                    </p>
                </div>
            </aside>

            {/* Center: Question */}
            <section className="col-span-1 lg:col-span-6 order-1 lg:order-2">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden relative min-h-[400px] md:min-h-[600px] flex flex-col">
                    <div className="p-4 md:p-8 pb-4">
                        <div className="flex items-start justify-between mb-4">
                            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 tracking-wide uppercase">
                                Multiple Choice
                            </span>
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-3 py-1 rounded-lg">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm font-mono font-bold">{formatTime(timeLeft)}</span>
                            </div>
                        </div>
                        <h2 className="text-xl md:text-3xl font-display font-semibold leading-tight mb-4 text-slate-900 dark:text-white">
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
                        {currentQuestion.options.map((option) => {
                            const isSelected = answers[currentQuestion.id] === option.id;
                            const isCorrectAnswer = currentQuestion.correctAnswer === option.id;
                            const showResult = isChecked;

                            let containerClass = "border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-primary/50 hover:shadow-md";
                            // Circle class unused
                            let textClass = "text-slate-400 group-hover:text-primary";
                            let valueClass = "text-slate-900 dark:text-slate-200";

                            if (isSelected) {
                                containerClass = "border-2 border-primary bg-primary/5 dark:bg-primary/10 shadow-sm";
                                // circleClass updated locally if needed
                                textClass = "text-primary";
                                valueClass = "text-primary font-bold";
                            }

                            if (showResult) {
                                if (isCorrectAnswer) {
                                    containerClass = "border-2 border-primary bg-green-50/50 dark:bg-green-900/20";
                                    valueClass = "text-primary dark:text-green-300 font-bold";
                                    textClass = "text-primary";
                                } else if (isSelected && !isCorrectAnswer) {
                                    containerClass = "border-2 border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10";
                                    valueClass = "text-red-600 dark:text-red-400 font-bold";
                                    textClass = "text-red-500";
                                }
                            }

                            return (
                                <label 
                                    key={option.id}
                                    className={`group relative flex items-center p-4 rounded-xl cursor-pointer transition-all duration-200 ${containerClass}`}
                                    onClick={() => handleAnswerSelect(option.id)}
                                >
                                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${
                                        isSelected || (showResult && isCorrectAnswer) ? 'border-primary' : 'border-slate-300 dark:border-slate-600'
                                    }`}>
                                        {isSelected && <div className="w-3 h-3 bg-primary rounded-full" />}
                                    </div>
                                    
                                    <div className="flex-1">
                                        <span className={`block text-xs font-bold mb-0.5 uppercase tracking-wider transition-colors ${textClass}`}>
                                            Option {option.id}
                                        </span>
                                        <span className={`block text-lg font-medium transition-colors ${valueClass}`}>
                                            {option.text}
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
                        
                        {!isChecked ? (
                             <Button
                                onClick={handleCheckAnswer}
                                className="bg-primary hover:bg-green-700 text-white font-bold py-6 px-8 rounded-xl shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5"
                            >
                                Check Answer
                            </Button>
                        ) : (
                                <Button
                                    onClick={() => {
                                        if (currentQuestionIndex < EXAM_DATA.questions.length - 1) {
                                            setCurrentQuestionIndex(prev => prev + 1);
                                        } else {
                                            setIsSubmitModalOpen(true);
                                        }
                                    }}
                                    className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-6 px-8 rounded-xl shadow-lg transition-all hover:-translate-y-0.5 flex gap-2"
                                >
                                    {currentQuestionIndex < EXAM_DATA.questions.length - 1 ? 'Next Question' : 'Finish Exam'} 
                                    <ArrowRight className="w-4 h-4" />
                                </Button>
                        )}
                    </div>
                </div>
            </section>

            {/* Right Sidebar: Explanation (Similar to provided HTML's right col) */}
            <aside className="lg:col-span-3 order-3 flex flex-col gap-4">
                {isChecked ? (
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
                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {currentQuestion.explanation.intro}
                                </p>
                                
                                {currentQuestion.explanation.formula && (
                                    <div className="bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-lg font-mono text-xs text-center border border-slate-200 dark:border-slate-700">
                                        {currentQuestion.explanation.formula}
                                    </div>
                                )}

                                <div className="space-y-1">
                                    {currentQuestion.explanation.steps.map((step, i) => (
                                        <p key={i} className="text-sm text-slate-600 dark:text-slate-300 font-mono text-xs opacity-90">
                                            {step}
                                        </p>
                                    ))}
                                </div>

                                <p className="text-sm font-bold text-primary border-t border-slate-100 dark:border-slate-800 pt-2 mt-2">
                                    {currentQuestion.explanation.final}
                                </p>
                            </div>

                            <div className="mt-8">
                                <p className="text-xs uppercase font-bold text-slate-400 tracking-wider mb-3">Related Micro-Lessons</p>
                                <div className="space-y-2">
                                    <a href="#" className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                                        <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                                            <PlayCircle className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h5 className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors">Calorimetry Basics</h5>
                                            <span className="text-xs text-slate-500">3 min video</span>
                                        </div>
                                    </a>
                                    <a href="#" className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group">
                                        <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h5 className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors">Formulas Sheet</h5>
                                            <span className="text-xs text-slate-500">PDF Guide</span>
                                        </div>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Placeholder when question is not checked yet */
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 h-full flex flex-col items-center justify-center p-8 text-center opacity-70">
                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-600 mb-4">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <h4 className="font-bold text-slate-500 dark:text-slate-400">No Feedback Yet</h4>
                        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Select an option and click "Check Answer" to see detailed explanations and AI insights.</p>
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
