import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { 
  BarChart,
  Map,
  Target,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  ArrowRight,
  Loader2,
  XCircle,
  BookOpen,
  Sparkles,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useParams } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { toast } from 'sonner';

export const ExamResultsPage = () => {
  const { attemptId } = useParams();
  const [attemptData, setAttemptData] = useState<any>(null);
  const [quizData, setQuizData] = useState<any>(null);
   const [questionDetails, setQuestionDetails] = useState<any[]>([]);
   const [isQuestionAnalysisLoading, setIsQuestionAnalysisLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const handleShare = () => {
    if (!attemptData?.quizId) {
      toast.error('Quiz ID not found');
      return;
    }
    const shareUrl = `${window.location.origin}/public/exam/${attemptData.quizId}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share link copied to clipboard!');
  };

  useEffect(() => {
    const fetchResults = async () => {
      if (!attemptId) return;
      try {
        const docRef = doc(db, 'quiz_attempts', attemptId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setAttemptData(data);

          if (data.quizId) {
            const quizRef = doc(db, 'quizzes', data.quizId);
            const quizSnap = await getDoc(quizRef);
            if (quizSnap.exists()) {
                        const quiz = quizSnap.data();
                        setQuizData(quiz);

                        const questionIds: string[] = Array.isArray(quiz.questionIds) ? quiz.questionIds : [];
                        if (questionIds.length > 0) {
                           const questionSnaps = await Promise.all(
                              questionIds.map((qId) => getDoc(doc(db, 'questions', qId)))
                           );

                           const loadedQuestions = questionSnaps
                              .filter((snap) => snap.exists())
                              .map((snap) => ({ id: snap.id, ...snap.data() }));

                           setQuestionDetails(loadedQuestions);
                        } else {
                           setQuestionDetails([]);
                        }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching results", error);
      } finally {
            setIsQuestionAnalysisLoading(false);
        setIsLoading(false);
      }
    };
    fetchResults();
  }, [attemptId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!attemptData) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center text-slate-500">Result not found.</div>
      </div>
    );
  }

  const scoreClass = attemptData.passed 
    ? "text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/40" 
    : "text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/40";

  const scoreIcon = attemptData.passed ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />;
  const strokeDashoffset = 440 - (440 * attemptData.score) / 100;

  // Process Topic Breakdown
  const breakdowns = Object.entries(attemptData.topicBreakdown || {}).map(([topic, stats]: [string, any]) => {
    const p = (stats.correct / stats.total) * 100;
    let color = 'bg-primary';
    let text = 'text-primary';
    if (p >= 80) { color = 'bg-green-500'; text = 'text-green-500'; }
    else if (p < 50) { color = 'bg-red-500'; text = 'text-red-500'; }
    
    return { topic, correct: stats.correct, total: stats.total, score: Math.round(p), color, text };
  });

  // Insights Logic
  const weakTopics = breakdowns.filter(b => b.score < 60);
  const strongTopics = breakdowns.filter(b => b.score >= 80);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-8 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-green-500/10 dark:from-primary/20 dark:to-green-500/20 z-0"></div>
          <div className="absolute top-0 right-0 p-8 opacity-20">
             <Target className="w-64 h-64 text-primary transform rotate-12" />
          </div>
          
          <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
             <div className="text-center md:text-left">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold mb-4 ${
                  attemptData.hasTheoryQuestions ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' : scoreClass
                }`}>
                  {attemptData.hasTheoryQuestions
                    ? <>&#x23F3; Partially Graded</>
                    : <>{scoreIcon} {attemptData.passed ? 'Exam Passed' : 'Exam Failed'}</>
                  }
                </div>
                <h1 className="text-3xl md:text-5xl font-display font-bold text-slate-900 dark:text-white mb-2">
                   Exam Finished
                </h1>
                <p className="text-slate-600 dark:text-slate-400 text-lg max-w-xl">
                   {attemptData.hasTheoryQuestions
                     ? "Your objective score is shown. Theory questions are pending AI grading."
                     : attemptData.passed 
                       ? "Great job! Keep practicing to maintain your score."
                       : "Don't worry, utilize the AI breakdown to understand your weak points."}
                </p>
                {attemptData.hasTheoryQuestions && (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 font-medium">
                    📝 Theory answers submitted for grading &bull; MCQ score shown below
                  </div>
                )}
             </div>

             <div className="flex items-center gap-6">
                <div className="relative w-40 h-40 flex items-center justify-center">
                   <svg className="w-full h-full transform -rotate-90">
                      <circle className="text-slate-200 dark:text-slate-700" cx="80" cy="80" fill="transparent" r="70" stroke="currentColor" strokeWidth="12"></circle>
                      <circle 
                          className={attemptData.passed ? "text-green-500" : "text-red-500"} 
                          cx="80" 
                          cy="80" 
                          fill="transparent" 
                          r="70" 
                          stroke="currentColor" 
                          strokeDasharray="440" 
                          strokeDashoffset={strokeDashoffset} 
                          strokeWidth="12"
                          style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
                      ></circle>
                   </svg>
                   <div className="absolute flex flex-col items-center">
                      <span className="text-4xl font-display font-bold text-slate-900 dark:text-white">{Math.round(attemptData.score)}%</span>
                      <span className="text-sm font-medium text-slate-500 uppercase">Score</span>
                   </div>
                </div>

                <div className="hidden sm:flex flex-col gap-2">
                   <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 w-32">
                      <p className="text-xs text-slate-500 uppercase font-bold">Passing Mark</p>
                      <p className="text-xl font-bold text-slate-500">70%</p>
                   </div>
                   <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 w-32">
                      <p className="text-xs text-slate-500 uppercase font-bold">Time Taken</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">
                        {Math.floor(attemptData.timeTaken / 60)}m {attemptData.timeTaken % 60}s
                      </p>
                   </div>
                </div>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* Detailed Breakdown */}
           <div className="lg:col-span-2 space-y-8">
             <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-lg border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-8">
                   <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                      <BarChart className="w-6 h-6 text-primary" />
                      Topic Breakdown
                   </h2>
                </div>

                <div className="space-y-6">
                   {(() => {
                       if (breakdowns.length === 0) {
                           return (
                               <div className="text-center text-slate-500 py-6">
                                   No topic breakdown available.
                               </div>
                           );
                       }
                       return breakdowns.map((item, idx) => (
                          <div key={idx}>
                             <div className="flex justify-between items-end mb-2">
                                <div>
                                   <h3 className="font-bold text-slate-900 dark:text-white">{item.topic}</h3>
                                   <p className="text-xs text-slate-500">{item.correct}/{item.total} Correct</p>
                                </div>
                                <span className={`text-lg font-bold ${item.text}`}>{item.score}%</span>
                             </div>
                             <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3">
                                <div className={`${item.color} h-3 rounded-full`} style={{ width: `${item.score}%` }}></div>
                             </div>
                          </div>
                       ));
                   })()}
                </div>
              </div>

              {/* Question Analysis */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-lg border border-slate-200 dark:border-slate-800">
                 <h3 className="text-xl font-bold font-display text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-primary" />
                    Question Analysis
                 </h3>
                 <div className="space-y-6">
                    {!isQuestionAnalysisLoading && questionDetails.length > 0 ? (
                       questionDetails.map((q: any, i: number) => {
                          const studentAnswer = attemptData.answers[q.id];
                          const isTheory = q?.type === 'theory' || q?.type === 'short-answer' || q?.questionType === 'theory' || (!q?.options || q?.options?.length === 0);
                          const isImageAnswer = typeof studentAnswer === 'string' && studentAnswer.startsWith('[IMAGE_UPLOAD:');
                          const imageUrl = isImageAnswer ? studentAnswer.replace('[IMAGE_UPLOAD:', '').replace(/\]$/, '') : null;
                          const isCorrect = !isTheory && studentAnswer === q.correctAnswer;
                          const theoryGradingStatus = attemptData.theoryGradingStatus;
                          
                          return (
                             <div key={i} className={`p-4 rounded-xl border ${
                               isTheory 
                                 ? 'border-purple-200 bg-purple-50/30 dark:border-purple-900/50 dark:bg-purple-900/10'
                                 : isCorrect ? 'border-green-100 bg-green-50/30' : 'border-red-100 bg-red-50/30'
                             } dark:border-slate-700`}>
                                <div className="flex gap-3">
                                   <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${
                                     isTheory ? 'bg-purple-100 text-purple-700' : isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                   }`}>
                                      {i + 1}
                                   </div>
                                   <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          {isTheory && (
                                            <span className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Theory</span>
                                          )}
                                          {isTheory && theoryGradingStatus === 'pending' && (
                                            <span className="text-xs font-medium bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">⏳ Pending Grading</span>
                                          )}
                                        </div>
                                        <div className="text-slate-900 dark:text-white font-medium mb-3 prose dark:prose-invert max-w-none text-sm">
                                          <ReactMarkdown>{q.text || q.question || 'Question'}</ReactMarkdown>
                                        </div>
                                      
                                      {/* Student's answer display */}
                                      {isTheory ? (
                                        <div className="space-y-2 mb-2">
                                          <p className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wide">Your Answer:</p>
                                          {isImageAnswer && imageUrl ? (
                                            <div className="rounded-lg border border-purple-200 overflow-hidden">
                                              <img src={imageUrl} alt="Handwritten answer" className="max-w-full max-h-48 object-contain bg-white" />
                                              <p className="text-xs text-slate-500 p-2 text-center">Handwritten answer uploaded</p>
                                            </div>
                                          ) : studentAnswer ? (
                                            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
                                              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{studentAnswer}</p>
                                            </div>
                                          ) : (
                                            <p className="text-sm text-slate-500 italic">Not answered</p>
                                          )}
                                        </div>
                                      ) : (
                                        <div className={`text-sm p-3 rounded-lg mb-2 ${isCorrect ? 'bg-green-100/50 text-green-800' : 'bg-red-100/50 text-red-800'}`}>
                                           <span className="font-bold mr-2">Your Answer:</span>
                                           {studentAnswer || "Not answered"}
                                           {isCorrect && <CheckCircle className="w-4 h-4 inline ml-2"/>}
                                        </div>
                                      )}

                                      {/* Correct answer / model answer */}
                                      {isTheory && (q.correctAnswer || q.explanation) ? (
                                        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3 mb-2">
                                          <p className="text-xs font-bold text-purple-700 dark:text-purple-300 mb-1 uppercase tracking-wide">Model Answer / Key Points</p>
                                          {q.correctAnswer && (
                                            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-2">{q.correctAnswer}</p>
                                          )}
                                          {q.explanation && typeof q.explanation === 'string' && (
                                            <div className="text-sm text-slate-600 dark:text-slate-400 prose prose-sm dark:prose-invert max-w-none mt-1">
                                              <ReactMarkdown>{q.explanation}</ReactMarkdown>
                                            </div>
                                          )}
                                        </div>
                                      ) : !isTheory && !isCorrect && (
                                         <div className="text-sm p-3 rounded-lg bg-green-100/50 text-green-800 border border-green-200 mb-2">
                                            <span className="font-bold mr-2">Correct Answer:</span>
                                            {q.correctAnswer}
                                            <CheckCircle className="w-4 h-4 inline ml-2"/>
                                         </div>
                                      )}

                                      {!isTheory && !isCorrect && q.explanation && (
                                           <div className="text-sm text-slate-600 dark:text-slate-400 italic prose prose-sm dark:prose-invert max-w-none">
                                              <span className="font-semibold not-italic text-slate-800 dark:text-slate-200 block mb-1">Explanation: </span>
                                              <ReactMarkdown>{q.explanation}</ReactMarkdown>
                                           </div>
                                      )}
                                      
                                      {(!isTheory && !isCorrect) && (
                                        <div className="mt-3">
                                            <Link to={`/student/ai-tutor?topic=${encodeURIComponent(q.topic || [quizData?.subject, quizData?.topic].filter(Boolean).join(' ') || 'General')}&question=${encodeURIComponent(q.text || q.question || '')}`}>
                                                <Button size="sm" variant="outline" className="bg-indigo-50 border-blue-200 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
                                                    <Sparkles className="w-4 h-4 mr-2" /> AI Deep Dive
                                                </Button>
                                            </Link>
                                        </div>
                                      )}
                                   </div>
                                </div>
                             </div>
                          );
                       })
                    ) : isQuestionAnalysisLoading ? (
                       <div className="text-center text-slate-500 py-4">
                          Loading detailed question data...
                       </div>
                    ) : (
                       <div className="text-center text-slate-500 py-4">
                          No detailed question analysis available for this attempt.
                       </div>
                    )}
                 </div>
              </div>
           </div>

           {/* Sidebar AI Insights */}
           <div className="space-y-8">
              <div className="bg-gradient-to-b from-blue-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-3xl p-6 shadow-lg border border-blue-100 dark:border-slate-700 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Map className="w-32 h-32" />
                 </div>
                 
                 <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                       <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-600 dark:text-blue-400">
                          <AlertCircle className="w-5 h-5" />
                       </div>
                       <h2 className="font-bold text-slate-900 dark:text-white">AI Coach Insights</h2>
                    </div>
                    
                    <div className="space-y-4">
                       {weakTopics.length > 0 ? (
                           <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20">
                             <h4 className="font-bold text-red-800 dark:text-red-300 mb-2 text-sm">Review Needed</h4>
                             <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-400 space-y-1">
                               {weakTopics.map(t => <li key={t.topic}>Focus on <b>{t.topic}</b></li>)}
                             </ul>
                           </div>
                       ) : null}

                       {strongTopics.length > 0 ? (
                           <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/20">
                             <h4 className="font-bold text-green-800 dark:text-green-300 mb-2 text-sm">Strong Areas</h4>
                             <ul className="list-disc list-inside text-sm text-green-700 dark:text-green-400 space-y-1">
                               {strongTopics.map(t => <li key={t.topic}>Mastered <b>{t.topic}</b></li>)}
                             </ul>
                           </div>
                       ) : null}

                       {weakTopics.length === 0 && strongTopics.length === 0 ? (
                            <div className="text-sm text-slate-500 text-center">
                                Consistent performance across all topics.
                            </div>
                       ) : null}
                    </div>
                 </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-lg border border-slate-200 dark:border-slate-800">
                 <h2 className="font-bold text-slate-900 dark:text-white mb-4">Recommended Review</h2>
                 <div className="space-y-3">
                    {weakTopics.length > 0 ? weakTopics.slice(0, 3).map((item, i) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group cursor-pointer border border-transparent hover:border-slate-200">
                           <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                              <PlayCircle className="w-5 h-5" />
                           </div>
                           <div>
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">Review {item.topic}</h4>
                              <p className="text-xs text-slate-500 mb-1">Recommended Lesson</p>
                           </div>
                        </div>
                    )) : (
                        <div className="text-center text-slate-500 py-4 text-sm">
                            No immediate reviews required. Great job!
                        </div>
                    )}
                 </div>
              </div>
           </div>

        </div>

        <div className="mt-8 flex flex-col md:flex-row justify-center gap-4">
           <Link to="/student/dashboard" className="w-full md:w-auto">
               <Button variant="secondary" className="px-6 py-6 rounded-[2rem] text-base w-full">
                  Back to Dashboard
               </Button>
           </Link>
           <Button 
             onClick={handleShare}
             variant="outline" 
             className="px-6 py-6 rounded-[2rem] text-base flex w-full md:w-auto items-center justify-center gap-2 border-primary/20 text-primary hover:bg-primary/5"
           >
             <Share2 className="w-5 h-5" /> Share Exam
           </Button>
           <Button className="px-6 py-6 rounded-[2rem] text-base w-full md:w-auto bg-primary hover:bg-green-700 flex items-center justify-center gap-2 shadow-lg shadow-primary/30">
               Start Next Topic <ArrowRight className="w-5 h-5" />
           </Button>
        </div>

      </div>
    </div>
  );
};
