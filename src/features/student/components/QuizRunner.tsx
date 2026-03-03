import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  ArrowRight,
  RotateCcw,
  Award
} from 'lucide-react';
import type { Quiz, QuizStats } from '../types/quiz';
import { cn } from '@/lib/utils';

interface QuizRunnerProps {
  quiz: Quiz;
  onComplete: (stats: QuizStats) => void;
  onExit: () => void;
}

import { toast } from 'sonner';

export const QuizRunner: React.FC<QuizRunnerProps> = ({ quiz, onComplete, onExit }) => {
  useEffect(() => {
    toast.message(`Quiz Started: ${quiz.title}`, {
        description: `You have ${quiz.timeLimit} minutes to complete ${quiz.questions.length} questions.`
    });
  }, []);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState((quiz.timeLimit || 20) * 60);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinishQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  const handleOptionSelect = (option: string) => {
    if (showExplanation) return;
    setSelectedAnswer(option);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer) {
      setAnswers(prev => ({ ...prev, [currentQuestion.id]: selectedAnswer }));
      setShowExplanation(false);
      setSelectedAnswer(null);

      if (currentQuestionIndex < quiz.questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        handleFinishQuiz();
      }
    }
  };

  const handleCheckAnswer = () => {
     setShowExplanation(true);
  };

  const handleFinishQuiz = () => {
    // Determine final answer for the last question if selected
    const finalAnswers = { ...answers };
    if (selectedAnswer && !finalAnswers[currentQuestion.id]) {
        finalAnswers[currentQuestion.id] = selectedAnswer;
    }

    let correctCount = 0;
    quiz.questions.forEach(q => {
        if (finalAnswers[q.id] === q.correctAnswer) {
            correctCount++;
        }
    });

    const score = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;
    
    onComplete({
        totalQuestions: quiz.questions.length,
        correctAnswers: correctCount,
        score,
        passed,
        timeTaken: ((quiz.timeLimit || 20) * 60) - timeLeft
    });

    toast.success('Quiz Completed!', {
       description: `You scored ${score}%. ${passed ? 'Great job!' : 'Keep practicing.'}`
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col h-full w-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gray-50 dark:bg-slate-800/50">
        <div>
           <h2 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1">{quiz.title}</h2>
           <div className="flex items-center gap-2 text-sm text-gray-500">
             <span className="font-medium text-primary">Question {currentQuestionIndex + 1}/{quiz.questions.length}</span>
           </div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-mono font-medium text-sm self-end sm:self-auto ${timeLeft < 60 ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
           <Clock className="w-4 h-4" />
           {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5">
        <div 
          className="bg-primary h-1.5 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Question Area */}
      <div className="p-6 md:p-8 flex-grow overflow-y-auto">
         <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-6 leading-relaxed">
           {currentQuestion.text}
         </h3>

         <div className="space-y-3">
            {currentQuestion.options?.map((option, idx) => {
               const isSelected = selectedAnswer === option;
               const isCorrect = option === currentQuestion.correctAnswer;
               const isWrong = isSelected && !isCorrect;
               
               let optionClass = "border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:bg-primary/5";
               
               if (isSelected) {
                   optionClass = "border-primary bg-primary/10 ring-1 ring-primary";
               }
               
               if (showExplanation) {
                   if (isCorrect) optionClass = "border-green-500 bg-green-50 dark:bg-green-900/20 ring-1 ring-green-500";
                   if (isWrong) optionClass = "border-red-500 bg-red-50 dark:bg-red-900/20 ring-1 ring-red-500";
               }

               return (
                 <button
                   key={idx}
                   onClick={() => handleOptionSelect(option)}
                   disabled={showExplanation}
                   className={cn(
                     "w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between group",
                     optionClass
                   )}
                 >
                   <span className="font-medium text-gray-700 dark:text-gray-200">{option}</span>
                   {showExplanation && isCorrect && <CheckCircle className="w-5 h-5 text-green-500" />}
                   {showExplanation && isWrong && <XCircle className="w-5 h-5 text-red-500" />}
                 </button>
               );
            })}
         </div>

         {showExplanation && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 animate-in fade-in slide-in-from-top-2">
               <h4 className="font-semibold text-blue-900 dark:text-blue-300 flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4" /> Explanation
               </h4>
               <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
                  {currentQuestion.explanation || "No explanation provided."}
               </p>
            </div>
         )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800/50 flex justify-between items-center">
         <button 
           onClick={onExit}
           className="text-gray-500 hover:text-gray-700 px-4 py-2 font-medium text-sm"
         >
           Quit Quiz
         </button>
         
         {!showExplanation ? (
             <button
               onClick={handleCheckAnswer}
               disabled={!selectedAnswer}
               className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
             >
               Check Answer
             </button>
         ) : (
             <button
               onClick={handleNextQuestion}
               className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 px-6 py-2.5 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2"
             >
               {currentQuestionIndex === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
               <ArrowRight className="w-4 h-4" />
             </button>
         )}
      </div>
    </div>
  );
};

interface QuizResultsProps {
    stats: QuizStats;
    onRetry: () => void;
    onContinue: () => void;
}

export const QuizResults: React.FC<QuizResultsProps> = ({ stats, onRetry, onContinue }) => {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center max-w-lg mx-auto">
            <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${stats.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {stats.passed ? <Award className="w-10 h-10" /> : <RotateCcw className="w-10 h-10" />}
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {stats.passed ? 'Quiz Completed!' : 'Keep Practicing!'}
            </h2>
            <p className="text-gray-500 mb-8">
                {stats.passed 
                    ? `Great job! You scored ${stats.score}% and passed the quiz.` 
                    : `You scored ${stats.score}%. You need ${70}% to pass. Don't give up!`}
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.score}%</div>
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Score</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats.correctAnswers}/{stats.totalQuestions}</div>
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Correct</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-lg">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{Math.floor(stats.timeTaken / 60)}m {stats.timeTaken % 60}s</div>
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Time</div>
                </div>
            </div>

            <div className="flex gap-3">
                <button 
                  onClick={onRetry}
                  className="flex-1 py-3 px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                >
                    Retry Quiz
                </button>
                <button 
                  onClick={onContinue}
                  className="flex-1 py-3 px-4 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                    Continue Course
                </button>
            </div>
        </div>
    );
};
