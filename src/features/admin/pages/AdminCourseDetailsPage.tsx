import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, Check, X, BookOpen, PlayCircle, FileText,
  Tag, Banknote, User, GraduationCap, BarChart3, AlertCircle, Calendar 
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export const AdminCourseDetailsPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;

      try {
        const docRef = doc(db, 'courses', courseId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setCourse({ id: docSnap.id, ...docSnap.data() });
        } else {
          toast.error('Course not found');
          navigate('/admin/moderation');
        }
      } catch (error) {
        console.error('Error fetching course:', error);
        toast.error('Failed to load course details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, navigate]);

  const handleApproveCourse = async () => {
    if (!courseId) return;
    setActionLoading(true);
    try {
      await updateDoc(doc(db, 'courses', courseId), {
        status: 'published',
        rejectionReason: null
      });
      toast.success('Course approved and published successfully');
      setCourse({ ...course, status: 'published' });
    } catch (error) {
      toast.error('Failed to approve course');
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectCourse = async () => {
    if (!courseId) return;
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    setActionLoading(true);
    try {
      await updateDoc(doc(db, 'courses', courseId), {
        status: 'rejected',
        rejectionReason: rejectReason
      });
      toast.success('Course rejected');
      setIsRejectModalOpen(false);
      setCourse({ ...course, status: 'rejected', rejectionReason: rejectReason });
    } catch (error) {
      console.error(error);
      toast.error('Failed to reject course');
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-12">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 -mx-6 -mt-6 p-6 md:px-10 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="shrink-0 rounded-full h-10 w-10 hover:bg-slate-100 dark:hover:bg-slate-800" onClick={() => navigate('/admin/moderation')}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">{course.title}</h1>
              <Badge className={
                course.status === 'published' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' :
                (course.status === 'pending_review' || course.status === 'pending') ? 'bg-amber-500 hover:bg-amber-600 text-white' :
                course.status === 'rejected' ? 'bg-rose-500 hover:bg-rose-600 text-white' :
                'bg-slate-500 hover:bg-slate-600 text-white'
              }>{
                course.status === 'published' ? 'Live' :
                (course.status === 'pending_review' || course.status === 'pending') ? 'Pending Review' :
                course.status === 'rejected' ? 'Rejected' :
                course.status === 'flagged' ? 'Flagged' : 'Draft'
              }</Badge>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5"><User className="h-4 w-4" /> {course.teacherName || 'Unknown Teacher'}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {course.createdAt ? new Date(course.createdAt.seconds ? course.createdAt.toMillis() : course.createdAt).toLocaleDateString() : 'Recent'}</span>
            </div>
          </div>
        </div>

        {(course.status === 'pending' || course.status === 'pending_review') && (
          <div className="flex items-center gap-3 shrink-0">
            <Button 
              variant="outline" 
              className="text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900/50 dark:hover:bg-rose-900/20"
              onClick={() => setIsRejectModalOpen(true)}
              disabled={actionLoading}
            >
              <X className="h-4 w-4 mr-2" /> Reject Course
            </Button>
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20"
              onClick={handleApproveCourse}
              disabled={actionLoading}
            >
              <Check className="h-4 w-4 mr-2" /> Approve & Publish
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 px-6 md:px-10">
        
        {/* Main Left Content */}
        <div className="xl:col-span-8 flex flex-col gap-8">
          {/* Thumbnail Hero */}
          <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative shadow-sm border border-slate-200 dark:border-slate-800">
            {(course.thumbnailUrl || course.image || course.thumbnail) ? (
              <img src={course.thumbnailUrl || course.image || course.thumbnail} alt={course.title} className="w-full h-full object-cover transition-transform hover:scale-[1.02] duration-500" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                <BookOpen className="h-16 w-16 mb-4 opacity-20" />
                <p className="font-medium text-lg">No cover image provided</p>
                <p className="text-sm opacity-60">This course might look incomplete to students.</p>
              </div>
            )}
          </div>

          {/* Description Block */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-500" /> Course Description
            </h2>
            <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 leading-relaxed text-[15px]">
              {course.description ? (
                <p className="whitespace-pre-line">{course.description}</p>
              ) : (
                <div className="flex items-center gap-2 text-slate-400 italic">
                  <AlertCircle className="h-4 w-4" /> No description provided.
                </div>
              )}
            </div>
          </section>

          {/* Curriculum Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-emerald-500" /> Curriculum & Content
              </h2>
            </div>
            
            <div className="space-y-5">
              {(() => {
                const modules = course.modules || course.curriculum || course.sections || [];
                if (Array.isArray(modules) && modules.length > 0) {
                  return modules.map((mod: any, i: number) => {
                    const modItems = mod.items || mod.lessons || [];
                    return (
                      <div key={i} className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <h3 className="text-[17px] font-semibold text-slate-900 dark:text-white flex items-center gap-3">
                              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-bold">
                                {i + 1}
                              </span>
                              {mod.title || 'Untitled Module'}
                            </h3>
                          </div>
                          <Badge variant="outline" className="bg-white dark:bg-slate-900 self-start sm:self-auto py-1 px-3 shadow-sm">
                            {modItems.length} {modItems.length === 1 ? 'Item' : 'Items'}
                          </Badge>
                        </div>
                        
                        <div className="p-4 sm:p-6 space-y-3">
                          {modItems.length > 0 ? (
                            modItems.map((item: any, j: number) => (
                              <div key={j} className="flex items-center gap-4 p-4 lg:p-5 bg-slate-50 hover:bg-slate-100/80 dark:bg-slate-950 dark:hover:bg-slate-900 rounded-xl text-sm border border-slate-100 dark:border-slate-800/80 transition-all cursor-default group">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700 group-hover:scale-105 transition-transform">
                                  {item.type === 'video' ? <PlayCircle className="h-5 w-5 text-indigo-500" /> : <FileText className="h-5 w-5 text-emerald-500" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-slate-800 dark:text-slate-200 truncate text-[15px]">
                                    {item.title || item.name || 'Untitled Lesson'}
                                  </p>
                                  <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-medium">
                                    {item.type || 'Document'}
                                  </p>
                                </div>
                                {item.duration && (
                                  <span className="flex-shrink-0 px-3 py-1 bg-white dark:bg-slate-800 rounded-full text-xs font-semibold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 whitespace-nowrap">
                                    {item.duration}
                                  </span>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="py-8 px-4 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                              <BookOpen className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                              <p className="text-sm text-slate-500 font-medium">No lessons added to this module yet.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  });
                }
                return (
                  <div className="py-20 px-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/50 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                      <BookOpen className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Curriculum is Empty</h3>
                    <p className="text-slate-500 max-w-sm mx-auto">This course doesn't have any learning material uploaded yet. It is highly recommended to reject incomplete courses.</p>
                  </div>
                );
              })()}
            </div>
          </section>
        </div>

        {/* Sidebar / Stats Grid */}
        <div className="xl:col-span-4 space-y-6">
          <Card className="shadow-sm border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden sticky top-32">
            <CardHeader className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 py-5">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-indigo-500" /> Course Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {/* Detail Item */}
                <div className="flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <Banknote className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <span className="text-sm font-medium">Pricing</span>
                  </div>
                  <span className="text-[15px] font-bold text-slate-900 dark:text-white">
                    {typeof course.price === 'number' && course.price > 0 ? `₦${course.price.toLocaleString()}` : course.price || 'Free'}
                  </span>
                </div>

                {/* Detail Item */}
                <div className="flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Tag className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-medium">Subject</span>
                  </div>
                  <span className="text-[15px] font-semibold text-slate-900 dark:text-white text-right break-words ml-4">
                    {course.subject || course.category || 'Uncategorized'}
                  </span>
                </div>

                {/* Detail Item */}
                <div className="flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <GraduationCap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-sm font-medium">Level</span>
                  </div>
                  <span className="text-[15px] font-semibold text-slate-900 dark:text-white capitalize">
                    {course.level || 'All Levels'}
                  </span>
                </div>

                {/* Extra Stats Derived from Curriculum */}
                {(() => {
                  const modules = course.modules || course.curriculum || course.sections || [];
                  let totalItems = 0;
                  if (Array.isArray(modules)) {
                    totalItems = modules.reduce((acc, mod) => acc + (mod.items?.length || mod.lessons?.length || 0), 0);
                  }
                  
                  return (
                    <div className="flex items-center justify-between p-5 bg-slate-50/50 dark:bg-slate-800/10">
                      <div className="flex flex-col">
                        <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{modules.length}</span>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Modules</span>
                      </div>
                      <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
                      <div className="flex flex-col text-right">
                        <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{totalItems}</span>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Lessons</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {isRejectModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-900/20 max-w-md w-full p-7 space-y-6 border border-slate-200 dark:border-slate-800">
            <div className="space-y-2 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-2">
                <AlertCircle className="h-6 w-6 text-rose-600 dark:text-rose-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Reject Course</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 px-4">Provide a reason for rejecting this course. The teacher will see this feedback.</p>
            </div>
            
            <div className="py-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Rejection Reason</label>
              <Input
                placeholder="e.g., Incomplete curriculum, missing video content..."
                className="w-full text-[15px]"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setIsRejectModalOpen(false)} disabled={actionLoading}>Cancel</Button>
              <Button  className="flex-1 bg-rose-600 hover:bg-rose-700" onClick={handleRejectCourse} disabled={actionLoading}>
                {actionLoading ? 'Rejecting...' : 'Confirm Reject'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

