import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { 
  PlayCircle, 
  CheckCircle, 
  Clock, 
  FileText, 
  Monitor, 
  Award, 
  Star, 
  Users, 
  Calendar, 
  ChevronDown, 
  Share2, 
  ArrowRight,
  School,
  Lock,
  Play
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { QuizRunner, QuizResults } from '../components/QuizRunner';
import type { Quiz, QuizStats } from '../types/quiz';

const MOCK_QUIZ: Quiz = {
  id: 'quiz-1',
  title: 'Derivatives & Applications Checkpoint',
  description: 'Test your knowledge on basic derivative rules and their real-world applications.',
  courseId: 'course-1',
  passingScore: 70,
  timeLimit: 15,
  questions: [
    {
      id: 'q1',
      text: 'What is the derivative of f(x) = 3x² + 2x?',
      type: 'multiple-choice',
      options: ['6x + 2', '3x + 2', '6x', 'x³ + x²'],
      correctAnswer: '6x + 2',
      explanation: 'Using the power rule: d/dx(3x²) = 6x and d/dx(2x) = 2.',
      points: 10
    },
    {
      id: 'q2',
      text: 'The derivative of a constant is always 1.',
      type: 'true-false',
      options: ['True', 'False'],
      correctAnswer: 'False',
      explanation: 'The derivative of a constant is always 0, because a constant value does not change.',
      points: 10
    },
    {
      id: 'q3',
      text: 'Which rule is used to find the derivative of a product of two functions?',
      type: 'multiple-choice',
      options: ['Chain Rule', 'Quotient Rule', 'Product Rule', 'Power Rule'],
      correctAnswer: 'Product Rule',
      explanation: 'The Product Rule is used for f(x)g(x).',
      points: 10
    }
  ]
};

export const CourseDetailsPage = () => {
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'quizzes' | 'certificate'>('overview');
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [quizStats, setQuizStats] = useState<QuizStats | null>(null);

  const handleEnroll = () => {
    setIsEnrolled(true);
    setActiveTab('curriculum');
  };

  const startQuiz = () => {
    setActiveQuiz(MOCK_QUIZ);
    setQuizStats(null);
  };

  const handleQuizComplete = (stats: QuizStats) => {
    setQuizStats(stats);
    setActiveQuiz(null);
  };

  if (activeQuiz) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 h-screen">
         <QuizRunner 
            quiz={activeQuiz} 
            onComplete={handleQuizComplete} 
            onExit={() => setActiveQuiz(null)} 
         />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex mb-8 text-sm text-slate-500 dark:text-slate-400">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link to="/student/dashboard" className="hover:text-primary transition-colors">Home</Link>
          </li>
          <li><span className="mx-2">/</span></li>
          <li className="inline-flex items-center">
            <Link to="/student/courses" className="hover:text-primary transition-colors">My Courses</Link>
          </li>
          <li><span className="mx-2">/</span></li>
          <li className="font-medium text-slate-900 dark:text-white">Advanced Calculus & Linear Algebra</li>
        </ol>
      </nav>

      {/* Quiz Results Modal / Overlay */}
      {quizStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
           <QuizResults 
              stats={quizStats} 
              onRetry={() => { setQuizStats(null); startQuiz(); }} 
              onContinue={() => setQuizStats(null)} 
           />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Header Section */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 cursor-pointer" onClick={() => {
                toast.info("Certification Available", { description: "Complete all modules to earn your verified certificate." });
              }}>
                <CheckCircle className="w-3 h-3 mr-1" /> CERTIFIED COURSE
              </Badge>
              <Badge variant="outline" className="text-slate-600 dark:text-slate-300">
                Mathematics
              </Badge>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-display font-bold text-slate-900 dark:text-white leading-tight">
              Advanced Calculus & Linear Algebra
            </h1>
            
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Master derivatives, integrals, and vector spaces with AI assistance. Designed for university students aiming for top grades.
            </p>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <div className="flex text-yellow-400">
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current" />
                  <Star className="w-4 h-4 fill-current opacity-50" />
                </div>
                <span className="font-bold text-slate-900 dark:text-white ml-1">4.8</span>
                <span>(1,240 ratings)</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>8,500+ Students</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Last updated May 2025</span>
              </div>
            </div>
          </div>

          {/* Enrolled Tabs */}
          {isEnrolled ? (
             <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden min-h-[500px]">
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                   <button 
                      onClick={() => setActiveTab('overview')}
                      className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                   >
                      Overview
                   </button>
                   <button 
                      onClick={() => setActiveTab('curriculum')}
                      className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'curriculum' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                   >
                      Curriculum
                   </button>
                   <button 
                      onClick={() => setActiveTab('quizzes')}
                      className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'quizzes' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                   >
                      Practice & Quizzes
                   </button>
                   <button 
                      onClick={() => setActiveTab('certificate')}
                      className={`flex-1 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'certificate' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                   >
                      Certificate
                   </button>
                </div>

                <div className="p-6">
                   {activeTab === 'curriculum' && (
                      <div className="space-y-6">
                         {/* Module 1 */}
                         <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                            <div className="bg-gray-50 dark:bg-slate-800 p-4 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                               <span>Module 1: Foundations of Limits</span>
                               <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Completed</span>
                            </div>
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                               <div className="p-4 flex gap-3 items-center hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer">
                                  <CheckCircle className="w-5 h-5 text-green-500" />
                                  <span className="text-gray-700 dark:text-gray-300 text-sm">Introduction to Limits</span>
                                  <span className="ml-auto text-xs text-gray-400">10:45</span>
                               </div>
                               <div className="p-4 flex gap-3 items-center hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer">
                                  <CheckCircle className="w-5 h-5 text-green-500" />
                                  <span className="text-gray-700 dark:text-gray-300 text-sm">Evaluating Limits Algebraically</span>
                                  <span className="ml-auto text-xs text-gray-400">15:20</span>
                               </div>
                            </div>
                         </div>
                         
                         {/* Module 2 */}
                         <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                            <div className="bg-gray-50 dark:bg-slate-800 p-4 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                               <span>Module 2: Derivatives</span>
                               <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">In Progress</span>
                            </div>
                            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                               <div 
                                  className="p-4 flex gap-3 items-center hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer bg-primary/5"
                                  onClick={() => {
                                     toast.success("Resuming Lecture", {
                                        description: "Module 2: Power Rule & Chain Rule" 
                                     });
                                  }}
                               >
                                  <PlayCircle className="w-5 h-5 text-primary" />
                                  <span className="text-gray-900 dark:text-white font-medium text-sm">Power Rule & Chain Rule</span>
                                  <span className="ml-auto text-xs text-gray-500">22:15</span>
                               </div>
                               <div className="p-4 flex gap-3 items-center hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer opacity-70">
                                  <Lock className="w-4 h-4 text-gray-400" />
                                  <span className="text-gray-500 text-sm">Derivatives of Trig Functions</span>
                                  <span className="ml-auto text-xs text-gray-400">18:30</span>
                               </div>
                            </div>
                         </div>
                      </div>
                   )}

                   {activeTab === 'quizzes' && (
                      <div className="space-y-4">
                         <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 flex items-center justify-between hover:border-primary transition-colors bg-white dark:bg-slate-800 shadow-sm">
                            <div className="flex gap-4 items-center">
                               <div className="h-12 w-12 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                                   <FileText className="w-6 h-6" />
                               </div>
                               <div>
                                  <h3 className="font-semibold text-gray-900 dark:text-white">Module 1 Review</h3>
                                  <p className="text-sm text-gray-500">10 Questions • 15 Minutes</p>
                               </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                               <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Score: 90%</Badge>
                               <span className="text-xs text-gray-400">Passed on May 10</span>
                            </div>
                         </div>

                         <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 flex items-center justify-between hover:border-primary transition-colors bg-white dark:bg-slate-800 shadow-sm">
                            <div className="flex gap-4 items-center">
                               <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                                   <Play className="w-6 h-6 ml-1" />
                               </div>
                               <div>
                                  <h3 className="font-semibold text-gray-900 dark:text-white">Derivatives Checkpoint</h3>
                                  <p className="text-sm text-gray-500">Practice your knowledge of basic rules.</p>
                               </div>
                            </div>
                            <Button onClick={startQuiz}>Start Quiz</Button>
                         </div>
                      </div>
                   )}

                   {activeTab === 'certificate' && (
                      <div className="text-center py-12 px-4">
                         <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <Lock className="w-8 h-8" />
                         </div>
                         <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">My Certificate</h3>
                         <p className="text-slate-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                            Your certificate will be available here once you complete 100% of the course content and pass all quizzes.
                         </p>
                         
                         <div className="w-full max-w-xs mx-auto bg-gray-200 h-2 rounded-full overflow-hidden mb-2">
                             <div className="bg-primary h-full w-[45%]"></div>
                         </div>
                         <p className="text-xs text-slate-500 mb-8">45% Complete</p>
                         
                         <Link to="/student/certificates/cert-123">
                            <Button variant="outline">Preview Certificate (Demo)</Button>
                         </Link>
                      </div>
                   )}
                </div>
             </div>
          ) : (
            <>
            {/* Video/Image Preview Area */}
            <div className="rounded-2xl overflow-hidden shadow-2xl ring-1 ring-slate-900/5 dark:ring-white/10 relative group aspect-video bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              {/* Using placeholder icon as requested */}
              <div className="relative w-full h-full flex items-center justify-center bg-slate-900">
                  <img 
                    src="/icon.png" 
                    alt="Course Preview" 
                    className="w-32 h-32 object-contain opacity-80"
                    onError={(e) => {
                      // Fallback if icon.png doesn't exist or load
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement?.classList.add('bg-gradient-to-br', 'from-slate-800', 'to-slate-900');
                    }}
                  />
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/30 transition-colors cursor-pointer">
                    <button onClick={handleEnroll} className="w-20 h-20 bg-primary hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
                      <PlayCircle className="w-10 h-10 ml-1" />
                    </button>
                  </div>
              </div>
            </div>
            </>
          )}


          {/* About Course */}
          {(!isEnrolled || activeTab === 'overview') && (
            <section>
            <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-4">About this course</h2>
            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 space-y-4">
              <p>
                This comprehensive course bridges the gap between introductory calculus and advanced mathematical analysis. You will dive deep into multivariable calculus, differential equations, and the core concepts of linear algebra that are essential for physics, engineering, and data science in the Nigerian and global tech ecosystem.
              </p>
              <p>
                Our AI-powered platform provides real-time feedback on your problem sets, ensuring you understand the "why" behind every "how", tailored for students from UNILAG, OAU, UNN, and other top institutions.
              </p>
              
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-6 mb-3">What you'll learn</h3>
              <ul className="grid md:grid-cols-2 gap-4">
                {[
                  "Master partial derivatives and multiple integrals",
                  "Solve complex linear systems using matrices",
                  "Understand vector spaces and eigenvalues",
                  "Apply mathematical concepts to real-world models"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
          )}

          {/* Course Curriculum */}
          {(!isEnrolled || activeTab === 'overview') && (
          <section>
            <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-6">Course Curriculum</h2>
            <div className="space-y-4">
              {/* Box 1 - Expanded */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <button className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                    <span className="font-semibold text-slate-900 dark:text-white">Section 1: Introduction to Vectors</span>
                  </div>
                  <span className="text-sm text-slate-500">5 lectures • 45m</span>
                </button>
                <div className="p-4 bg-white dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800">
                  <ul className="space-y-3">
                    <li className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-3">
                        <PlayCircle className="w-4 h-4" />
                        <span>Vectors in Rn Space</span>
                      </div>
                      <span className="text-primary text-xs font-bold border border-primary/20 bg-primary/5 px-2 py-0.5 rounded">Preview</span>
                    </li>
                    <li className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-3">
                        <PlayCircle className="w-4 h-4" />
                        <span>Dot Product & Projections</span>
                      </div>
                      <span>10:30</span>
                    </li>
                    <li className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-3">
                        <PlayCircle className="w-4 h-4" />
                        <span>Cross Product</span>
                      </div>
                      <span>12:15</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Box 2 - Collapsed */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <button className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <ChevronDown className="w-5 h-5 text-slate-400 -rotate-90" />
                    <span className="font-semibold text-slate-900 dark:text-white">Section 2: Matrices & Linear Transformations</span>
                  </div>
                  <span className="text-sm text-slate-500">8 lectures • 1h 20m</span>
                </button>
              </div>

              {/* Box 3 - Collapsed */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <button className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <ChevronDown className="w-5 h-5 text-slate-400 -rotate-90" />
                    <span className="font-semibold text-slate-900 dark:text-white">Section 3: Limits & Continuity</span>
                  </div>
                  <span className="text-sm text-slate-500">6 lectures • 55m</span>
                </button>
              </div>
            </div>
          </section>
          )}

          {/* Instructor */}
          <section>
            <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-6">Instructor</h2>
            <div className="flex flex-col md:flex-row gap-6 items-start p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <img 
                alt="Dr. Adebayo" 
                className="w-24 h-24 rounded-full object-cover border-2 border-primary/20" 
                src="https://images.unsplash.com/photo-1531384441138-2736e62e0919?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
              />
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Dr. Funke Adebayo</h3>
                <p className="text-primary text-sm font-medium mb-3">Professor of Mathematics, University of Lagos</p>
                <div className="flex items-center gap-4 mb-4 text-sm text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    <span>4.9 Rating</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <School className="w-4 h-4 text-slate-500" />
                    <span>12 Courses</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>45k Students</span>
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Dr. Adebayo is a renowned mathematician with over 15 years of teaching experience. She specializes in making complex abstract concepts accessible and visual. Her research focuses on applied linear algebra in machine learning algorithms within the African fintech space.
                </p>
              </div>
            </div>
          </section>

          {/* Reviews */}
          <section>
            <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-6">Student Reviews</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">CO</div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">Chinedu Okeke</p>
                      <p className="text-xs text-slate-500">2 weeks ago</p>
                    </div>
                  </div>
                  <div className="flex text-yellow-400">
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm italic">
                  "The AI tutor feature is a game changer. I was stuck on eigenvectors for days, but the personalized breakdown helped me visualize it instantly."
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">ZA</div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white text-sm">Zainab Ahmed</p>
                      <p className="text-xs text-slate-500">1 month ago</p>
                    </div>
                  </div>
                  <div className="flex text-yellow-400">
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current" />
                    <Star className="w-4 h-4 fill-current opacity-50" />
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm italic">
                  "Excellent course structure. Dr. Adebayo explains things very clearly. I wish there were a few more practice problems on integrals, but otherwise perfect."
                </p>
              </div>
            </div>
            <div className="mt-6 text-center">
              <Button variant="link" className="text-primary font-semibold">View all reviews</Button>
            </div>
          </section>

        </div>

        {/* Sidebar/Sticky Column */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            
            {/* Pricing Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-end gap-3 mb-6">
                <span className="text-4xl font-display font-bold text-slate-900 dark:text-white">₦49,000</span>
                <span className="text-lg text-slate-400 line-through mb-1">₦199,000</span>
                <Badge className="mb-2 bg-primary/10 text-primary hover:bg-primary/20">75% OFF</Badge>
              </div>
              
              <div className="space-y-3 mb-6">
                <Button className="w-full h-12 text-base font-bold bg-primary hover:bg-green-700 shadow-lg shadow-primary/30">
                  Enroll Now <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <Button variant="outline" className="w-full h-12 text-base font-bold border-2">
                  Add to Cart
                </Button>
              </div>
              
              <p className="text-center text-xs text-slate-500 mb-6">30-Day Money-Back Guarantee</p>
              
              <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-700">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wide mb-2">This course includes:</h4>
                {[
                  { icon: Clock, text: "24 hours on-demand video" },
                  { icon: Monitor, text: "Unlimited AI Tutor Access" },
                  { icon: FileText, text: "15 Downloadable resources" },
                  { icon: Share2, text: "Access on mobile and TV" },
                  { icon: Award, text: "Certificate of completion" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <item.icon className="w-5 h-5 text-slate-400" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Business Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
              <h3 className="font-bold text-lg mb-2 relative z-10">Training 5 or more people?</h3>
              <p className="text-slate-300 text-sm mb-4 relative z-10">Get your team access to TutorMe's top 5,000+ courses anytime, anywhere.</p>
              <Button variant="outline" className="w-full bg-white/10 hover:bg-white/20 border-white/20 text-white border-transparent relative z-10">
                Get TutorMe Business
              </Button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
