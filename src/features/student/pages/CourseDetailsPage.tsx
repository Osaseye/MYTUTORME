import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { 
  PlayCircle, CheckCircle, FileText, Monitor, Star, Users, 
  ChevronDown, ArrowRight, School, Lock, Play
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { QuizRunner, QuizResults } from '../components/QuizRunner';
import { PurchaseCourseModal } from '../components/PurchaseCourseModal';
import { LessonPlayer } from '../components/LessonPlayer';
import type { Quiz, QuizStats } from '../types/quiz';

import { doc, getDoc, collection, query, where, getDocs, updateDoc, arrayUnion, writeBatch, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthStore } from '@/features/auth/hooks/useAuth';

const MOCK_QUIZ: Quiz = {
  id: 'quiz-1',
  title: 'Derivatives & Applications Checkpoint',
  description: 'Test your knowledge on basic derivative rules and their real-world applications.',
  courseId: 'course-1',
  passingScore: 70,
  timeLimit: 15,
  questions: [
    { id: 'q1', text: 'What is the derivative of f(x) = 3x² + 2x?', type: 'multiple-choice', options: ['6x + 2', '3x + 2', '6x', 'x³ + x²'], correctAnswer: '6x + 2', explanation: 'Power rule: d/dx(3x²) = 6x and d/dx(2x) = 2.', points: 10 },
    { id: 'q2', text: 'The derivative of a constant is always 1.', type: 'true-false', options: ['True', 'False'], correctAnswer: 'False', explanation: 'The derivative of a constant is always 0.', points: 10 }
  ]
};

// Types
interface ModuleItem {
  id: string;
  title: string;
  type: string;
  fileUrl?: string;
  questions?: any[];
  durationMinutes?: number;
}
interface Module {
  id: string;
  title: string;
  order?: number;
  items?: ModuleItem[];
  lessons?: any[];
}
interface Course {
  id: string;
  title: string;
  description: string;
  teacherName: string;
  teacherId?: string;
  price: number | 'Free';
  thumbnailUrl?: string;
  rating?: number;
  enrollmentCount?: number;
  totalDurationMinutes?: number;
  subject?: string;
}

export const CourseDetailsPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuthStore();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'quizzes' | 'certificate'>('overview');
  
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [activeLesson, setActiveLesson] = useState<{id: string, title: string, contentUrl?: string, contentType?: string} | null>(null);
  const [quizStats, setQuizStats] = useState<QuizStats | null>(null);

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;
      try {
        setLoading(true);
        // 1. Fetch Course
        const courseRef = doc(db, 'courses', courseId);
        const courseSnap = await getDoc(courseRef);
        if (courseSnap.exists()) {
          const courseData = courseSnap.data();
          
          // Fetch real enrollment count
          const allEnrQ = query(collection(db, 'enrollments'), where('courseId', '==', courseId));
          const allEnrSnap = await getDocs(allEnrQ);
          const realEnrollmentCount = allEnrSnap.size;
          
          setCourse({ id: courseSnap.id, ...courseData, enrollmentCount: realEnrollmentCount } as Course);
          setModules(courseData.modules || []);
        } else {
          setCourse(null);
          setModules([]);
        }

        // 3. Fetch Enrollment status
        if (user) {
          const enrQ = query(collection(db, 'enrollments'), where('courseId', '==', courseId), where('studentId', '==', user.uid));
          const enrSnap = await getDocs(enrQ);
          if (!enrSnap.empty) {
            const enrDoc = enrSnap.docs[0];
            setEnrollmentId(enrDoc.id);
            setIsEnrolled(true);
            setActiveTab('curriculum');
            setCompletedLessons(enrDoc.data().completedModules || []);
          }
        }
      } catch (err) {
        console.error("Failed to load course details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [courseId, user]);

  const handleEnrollSuccess = async () => {
    if (!user || !course) return;
    try {
        const batch = writeBatch(db);

        // 1. Create enrollment
        const enrollmentsRef = collection(db, 'enrollments');
        const newEnrollmentRef = doc(enrollmentsRef);
        batch.set(newEnrollmentRef, {
            courseId: course.id,
            studentId: user.uid,
            enrolledAt: new Date(),
            progress: 0,
            completedModules: []
        });

        // 2. Create transaction
        const transactionsRef = collection(db, 'transactions');
        const newTransactionRef = doc(transactionsRef);
        batch.set(newTransactionRef, {
            amount: course.price === 'Free' ? 0 : course.price,
            courseId: course.id,
            studentId: user.uid,
            teacherId: course.teacherId || course.teacherName, // Fallback to name if ID not present
            createdAt: new Date(),
            status: 'completed',
            type: 'purchase'
        });

        // 3. Increment enrollmentCount
        const courseRef = doc(db, 'courses', course.id);
        batch.update(courseRef, {
            enrollmentCount: increment(1)
        });

        // 4. Create notification
        const notificationsRef = collection(db, 'notifications');
        const newNotificationRef = doc(notificationsRef);
        batch.set(newNotificationRef, {
            teacherId: course.teacherId || course.teacherName,
            message: `A new student enrolled in your course: ${course.title}`,
            read: false,
            createdAt: new Date()
        });

        await batch.commit();

        setEnrollmentId(newEnrollmentRef.id);
        setIsEnrolled(true);
        setIsPurchaseModalOpen(false);
        setActiveTab('curriculum');
        toast.success("Welcome aboard!", { description: "You are now enrolled in this course." });
    } catch(err) {
        console.error(err);
        toast.error("Enrollment failed. Please try again.");
    }
  };

  const handleLessonComplete = async () => {
    if (!activeLesson) return;
    try {
        // Update local state and backend
        setCompletedLessons(prev => [...new Set([...prev, activeLesson.id])]);
        toast.success("Lesson Completed!");

        if (enrollmentId) {
            const enrRef = doc(db, 'enrollments', enrollmentId);
            // We just add lesson ID to completedModules. In reality we could compute total progress %.
            await updateDoc(enrRef, {
                completedModules: arrayUnion(activeLesson.id),
                progress: 15 // Mock hardcoded progress calculation for now
            });
        }
    } catch (e) {
        console.error(e);
    } finally {
        setActiveLesson(null);
    }
  };

  const handleQuizComplete = (stats: QuizStats) => {
    setQuizStats(stats);
    setActiveQuiz(null);
  };

  if (loading) {
      return <div className="h-screen flex items-center justify-center"><div className="animate-spin w-10 h-10 border-b-2 border-primary rounded-full"></div></div>;
  }
  
  if (!course) {
      return <div className="p-20 text-center">Course not found.</div>;
  }

  if (activeQuiz) {
    return <div className="max-w-4xl mx-auto py-8 px-4 h-screen"><QuizRunner quiz={activeQuiz} onComplete={handleQuizComplete} onExit={() => setActiveQuiz(null)} /></div>;
  }

  if (activeLesson) {
    return <LessonPlayer 
       lessonTitle={activeLesson.title} 
       contentUrl={activeLesson.contentUrl} 
       contentType={activeLesson.contentType || 'video'}
       onExit={() => setActiveLesson(null)} 
       onComplete={handleLessonComplete} 
    />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 pb-20">
      <nav className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900/50 px-4 py-3">
        <ol className="flex items-center text-sm text-gray-500 dark:text-gray-400 container mx-auto max-w-7xl">
          <li><Link to="/student" className="hover:text-primary transition-colors">Home</Link></li>
          <li><span className="mx-2">/</span></li>
          <li><Link to="/student/courses" className="hover:text-primary transition-colors">My Courses</Link></li>
          <li><span className="mx-2">/</span></li>
          <li className="font-medium text-slate-900 dark:text-white line-clamp-1">{course.title}</li>
        </ol>
      </nav>

      {quizStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
           <QuizResults stats={quizStats} onRetry={() => { setQuizStats(null); setActiveQuiz(MOCK_QUIZ); }} onContinue={() => setQuizStats(null)} />
        </div>
      )}

      <PurchaseCourseModal 
         isOpen={isPurchaseModalOpen}
         onClose={() => setIsPurchaseModalOpen(false)}
         courseTitle={course.title}
         price={course.price === 'Free' || course.price === 0 ? "Free" : `₦${Number(course.price).toLocaleString()}`}
         onSuccess={handleEnrollSuccess}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 container mx-auto max-w-7xl px-4 py-8">
        <div className="lg:col-span-2 space-y-8">
          
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20"><CheckCircle className="w-3 h-3 mr-1" /> CERTIFIED COURSE</Badge>
              {course.subject && <Badge variant="outline" className="text-slate-600 dark:text-slate-300">{course.subject}</Badge>}
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-bold text-slate-900 dark:text-white leading-tight">{course.title}</h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">{course.description || "Learn and master key concepts tailored for your success."}</p>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-current text-yellow-500" />
                <span className="font-bold text-slate-900 dark:text-white ml-1">{course.rating || '5.0'}</span>
              </div>
              <div className="flex items-center gap-1"><Users className="w-4 h-4" /> <span>{course.enrollmentCount || 0} Students</span></div>
            </div>
          </div>

          {isEnrolled ? (
             <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden min-h-[500px]">
                <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto scrollbar-hide bg-slate-50 dark:bg-slate-900">
                   {['overview', 'curriculum', 'quizzes', 'certificate'].map((t: any) => (
                        <button key={t} onClick={() => setActiveTab(t)} className={`whitespace-nowrap px-6 py-4 text-sm font-medium border-b-2 transition-colors flex-shrink-0 capitalize ${activeTab === t ? 'border-primary text-primary bg-white dark:bg-slate-800' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                            {t}
                        </button>
                   ))}
                </div>

                <div className="p-6">
                   {activeTab === 'curriculum' && (
                      <div className="space-y-6">
                         {modules.map((mod, idx) => {
                             const modItems = mod.items || mod.lessons || [];
                             const isModCompleted = modItems.length > 0 && modItems.every(l => completedLessons.includes(l.id || l.title));
                             return (
                             <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                                <div className="bg-gray-50 dark:bg-slate-800 p-4 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                   <span>{mod.title}</span>
                                   {isModCompleted ? 
                                       <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded font-normal">Completed</span> : 
                                       <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded font-normal">In Progress</span>
                                   }
                                </div>
                                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                    {modItems.map((item: any, iIdx: number) => {
                                        const itemId = item.id || `${mod.title}-${iIdx}`;
                                        const isCompleted = completedLessons.includes(itemId);
                                        return (
                                            <div 
                                                key={itemId}
                                                onClick={() => {
                                                    if (item.type === 'quiz') return; // Handled in quizzes tab for now, or could launch here
                                                    else if (item.type === 'video') setActiveLesson({ id: itemId, title: item.title || 'Video Lesson', contentUrl: item.fileUrl || item.videoUrl, contentType: 'video' });
                                                    else if (item.type === 'pdf') setActiveLesson({ id: itemId, title: item.title || 'PDF Document', contentUrl: item.fileUrl || item.documentUrl, contentType: 'pdf' });
                                                }}
                                                className={`p-4 flex gap-3 items-center hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer ${isCompleted ? '' : 'bg-primary/5'}`}
                                            >
                                                {isCompleted ? <CheckCircle className="w-5 h-5 text-green-500" /> : 
                     (item.type === 'video' ? <PlayCircle className="w-5 h-5 text-primary" /> : 
                      item.type === 'pdf' ? <FileText className="w-5 h-5 text-rose-500" /> : 
                      <Monitor className="w-5 h-5 text-emerald-500" />)}
                                                <span className={`${isCompleted ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white font-medium'} text-sm`}>{item.title || `${item.type === 'pdf' ? 'PDF' : 'Video'} Material`}</span>
                                                <span className="ml-auto text-xs text-gray-500">{item.durationMinutes ? `${item.durationMinutes}:00` : item.type === 'pdf' ? 'PDF' : item.type === 'quiz' ? 'Quiz' : ''}</span>
                                            </div>
                                        )
                                    })}
                                </div>
                             </div>
                         )})}
                      </div>
                   )}

                   {activeTab === 'quizzes' && (
                      <div className="space-y-4">
                         {(() => {
                             const allQuizzes = modules.flatMap(mod => (mod.items || mod.lessons || []).filter(item => item.type === 'quiz').map(q => ({...q, moduleTitle: mod.title})));
                             if (allQuizzes.length === 0) {
                                 return <div className="text-center p-8 text-gray-500">No quizzes available for this course yet.</div>;
                             }
                             return allQuizzes.map((quiz, qIdx) => (
                                 <div key={qIdx} className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-primary transition-colors bg-white dark:bg-slate-800 shadow-sm">
                                    <div className="flex gap-4 items-center">
                                       <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0"><Play className="w-6 h-6 ml-1" /></div>
                                       <div>
                                           <h3 className="font-semibold text-gray-900 dark:text-white">{quiz.title || 'Course Checkpoint'}</h3>
                                           <p className="text-sm text-gray-500">{quiz.moduleTitle} • {quiz.questions?.length || 0} Questions</p>
                                       </div>
                                    </div>
                                    <Button onClick={() => {
                                        // Try to match the Quiz type
                                        const mappedQuiz: Quiz = {
                                            id: quiz.id || `quiz-${qIdx}`,
                                            title: quiz.title || 'Course Checkpoint',
                                            description: `Test your knowledge on ${quiz.moduleTitle}`,
                                            courseId: course.id,
                                            passingScore: 70,
                                            timeLimit: (quiz.questions?.length || 10) * 2, // 2 mins per question
                                            questions: quiz.questions || []
                                        };
                                        setActiveQuiz(mappedQuiz);
                                    }} className="w-full sm:w-auto">Start Quiz</Button>
                                 </div>
                             ));
                         })()}
                      </div>
                   )}

                   {activeTab === 'certificate' && (
                      <div className="text-center py-12 px-4 border border-slate-200 dark:border-slate-800 rounded-xl">
                         <div className="w-20 h-20 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400"><Lock className="w-8 h-8" /></div>
                         <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">My Certificate</h3>
                         <p className="text-slate-500 dark:text-gray-400 max-w-md mx-auto mb-6">Your certificate will be available here once you complete 100% of the course content.</p>
                         <Link to="/student/certificates/cert-123">
                            <Button variant="outline">Preview Certificate</Button>
                         </Link>
                      </div>
                   )}
                   
                   {activeTab === 'overview' && (
                       <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 space-y-4">
                          <p>{course.description}</p>
                       </div>
                   )}
                </div>
             </div>
          ) : (
            <div className="rounded-2xl overflow-hidden shadow-xl relative aspect-video bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                 {course.thumbnailUrl ? (
                     <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
                 ) : (
                     <div className="text-slate-400"><School className="w-16 h-16 opacity-50" /></div>
                 )}
                 <div className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer transition-colors hover:bg-black/30" onClick={() => setIsPurchaseModalOpen(true)}>
                    <button className="w-20 h-20 bg-primary hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"><PlayCircle className="w-10 h-10 ml-1" /></button>
                 </div>
            </div>
          )}

          {(!isEnrolled) && (
            <section className="pt-8">
               <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-6">Course Curriculum Preview</h2>
               <div className="space-y-4">
                   {modules.map((mod) => (
                      <div key={mod.id} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                          <button className="w-full flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 text-left"><span className="font-semibold text-slate-900 dark:text-white">{mod.title}</span><span className="text-sm text-slate-500">{mod.lessons ? mod.lessons.length : 0} lessons</span></button>
                      </div>
                   ))}
               </div>
            </section>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-end gap-3 mb-6">
                <span className="text-4xl font-display font-bold text-slate-900 dark:text-white">{course.price === 'Free' || course.price === 0 ? "Free" : `₦${Number(course.price).toLocaleString()}`}</span>
              </div>
              <div className="space-y-3 mb-6">
                 {isEnrolled ? (
                   <Button className="w-full h-12 text-base font-bold bg-green-600 hover:bg-green-700" onClick={() => setActiveTab('curriculum')}>Continue Learning <PlayCircle className="w-5 h-5 ml-2" /></Button>
                 ) : (
                   <Button className="w-full h-12 text-base font-bold bg-primary hover:bg-green-700" onClick={() => setIsPurchaseModalOpen(true)}>Enroll Now <ArrowRight className="w-5 h-5 ml-2" /></Button>
                 )}
              </div>
              <p className="text-center text-xs text-slate-500 mb-6">Instructor: {course.teacherName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
