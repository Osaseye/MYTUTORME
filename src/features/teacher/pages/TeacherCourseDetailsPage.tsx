import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Edit, FileText, Video, FileQuestion, Users, Star } from 'lucide-react';
import { toast } from 'sonner';

export const TeacherCourseDetailsPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId || !user) return;
      
      try {
        const docRef = doc(db, 'courses', courseId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const courseData = docSnap.data();
          if (courseData.teacherId !== user.uid) {
             toast.error("You don't have permission to view this course.");
             navigate('/teacher/courses');
             return;
          }
          setCourse({ id: docSnap.id, ...courseData });
        } else {
          toast.error("Course not found");
          navigate('/teacher/courses');
        }
      } catch (error) {
        console.error("Error fetching course:", error);
        toast.error("Failed to load course details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, user, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/teacher/courses')} className="rounded-full bg-slate-100 dark:bg-slate-800">
            <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white flex items-center gap-3">
              {course.title}
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium uppercase tracking-wider ${
                  course.status === 'published' ? 'bg-green-100 text-green-700' :
                  course.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                  'bg-slate-100 text-slate-700'
              }`}>
                {course.status || 'Draft'}
              </span>
            </h1>
            <p className="text-slate-500 mt-1 capitalize">{course.level} • {course.subject}</p>
          </div>
        </div>
        <Button variant="outline" className="gap-2" onClick={() => toast.info('Edit mode coming soon!')}>
           <Edit className="w-4 h-4" /> Edit Course
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Cover & Description */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
             {course.thumbnailUrl ? (
                <div className="w-full h-64 bg-slate-100 dark:bg-slate-800 relative">
                  <img src={course.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                </div>
             ) : (
                <div className="w-full h-40 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex flex-col items-center justify-center text-slate-400">
                   <Video className="w-8 h-8 mb-2 opacity-50" />
                   <p className="text-sm font-medium">No Thumbnail Provided</p>
                </div>
             )}
             
             <div className="p-6">
                <h3 className="font-bold text-lg mb-2 dark:text-white">Description</h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {course.description || 'No description provided.'}
                </p>
             </div>
          </div>

          {/* Curriculum */}
          <div>
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-xl font-bold font-display dark:text-white flex items-center gap-2">
                 Curriculum Overview
               </h2>
               <span className="text-sm text-slate-500 font-medium">{course.modules?.length || 0} Modules</span>
            </div>
            
            {(!course.modules || course.modules.length === 0) ? (
               <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center text-slate-500">
                  <p>No modules created yet.</p>
               </div>
            ) : (
               <div className="space-y-4">
                  {course.modules.map((module: any, idx: number) => (
                    <div key={idx} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 border-b border-slate-200 dark:border-slate-700 font-bold dark:text-white">
                           {idx + 1}. {module.title}
                        </div>
                        <div className="p-2 space-y-1">
                           {module.items?.map((item: any, iIdx: number) => (
                             <div key={iIdx} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-slate-800/20 rounded-lg transition-colors group">
                                <div className="flex items-center gap-3">
                                  {item.type === 'video' && <Video className="w-5 h-5 text-blue-500" />}
                                  {item.type === 'pdf' && <FileText className="w-5 h-5 text-rose-500" />}
                                  {item.type === 'quiz' && <FileQuestion className="w-5 h-5 text-emerald-500" />}
                                  <span className="font-medium text-sm text-slate-700 dark:text-slate-300">
                                    {item.title || `${module.title} ${item.type === 'pdf' ? 'PDF' : item.type.charAt(0).toUpperCase() + item.type.slice(1)}`}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs">
                                   {item.fileUrl && (
                                     <a href={item.fileUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline hidden group-hover:block">View File</a>
                                   )}
                                   {item.type === 'quiz' && item.questions && (
                                     <span className="text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">{item.questions.length} Qs</span>
                                   )}
                                </div>
                             </div>
                           )) || <p className="text-sm text-slate-400 p-4 text-center">Empty module</p>}
                        </div>
                    </div>
                  ))}
               </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
             <h3 className="font-bold text-slate-900 dark:text-white mb-4">Course Stats</h3>
             <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                         <Users className="w-5 h-5" />
                      </div>
                      <div>
                         <p className="text-xs text-slate-500 font-medium uppercase">Enrollments</p>
                         <p className="font-bold text-slate-900 dark:text-white">{course.enrollmentCount || 0}</p>
                      </div>
                   </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                   <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                         <Star className="w-5 h-5" />
                      </div>
                      <div>
                         <p className="text-xs text-slate-500 font-medium uppercase">Rating</p>
                         <p className="font-bold text-slate-900 dark:text-white">{course.rating || 'N/A'}</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
             <h3 className="font-bold text-slate-900 dark:text-white mb-4">Pricing Setting</h3>
             <div className="text-center p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/30">
                <span className="text-3xl font-bold font-display text-primary">
                  {course.price ? `₦${course.price.toLocaleString()}` : 'Free'}
                </span>
             </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};