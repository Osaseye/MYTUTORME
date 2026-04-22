import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '@/lib/firebase';
import { storage } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, Check, X, BookOpen, FileText,
  User, AlertCircle, Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export const AdminCourseDetailsPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editThumbnailUrl, setEditThumbnailUrl] = useState('');
  const [editStudyMaterial, setEditStudyMaterial] = useState('');
  const [editMockExamJson, setEditMockExamJson] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;

      try {
        const docRef = doc(db, 'courses', courseId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const courseData = { id: docSnap.id, ...docSnap.data() } as any;
          setCourse(courseData);
          setEditTitle(courseData.title || '');
          setEditDescription(courseData.description || '');
          setEditThumbnailUrl(courseData.thumbnailUrl || courseData.thumbnail || courseData.image || '');
          setEditStudyMaterial(courseData.studyMaterial?.content || courseData.mockExam?.studyMaterial?.content || '');
          setEditMockExamJson(courseData.mockExam ? JSON.stringify(courseData.mockExam, null, 2) : '');
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

  const handleSaveGeneratedCourse = async () => {
    if (!courseId || !course) return;

    setActionLoading(true);
    try {
      let parsedMockExam = course.mockExam || null;
      if (editMockExamJson.trim()) {
        parsedMockExam = JSON.parse(editMockExamJson);
      }

      const nextStudyMaterial = editStudyMaterial.trim()
        ? {
            ...(course.studyMaterial || course.mockExam?.studyMaterial || {}),
            content: editStudyMaterial.trim()
          }
        : (course.studyMaterial || course.mockExam?.studyMaterial || null);

      const updateData = {
        title: editTitle.trim() || course.title,
        description: editDescription,
        thumbnailUrl: editThumbnailUrl.trim() || null,
        thumbnail: editThumbnailUrl.trim() || null,
        image: editThumbnailUrl.trim() || null,
        studyMaterial: nextStudyMaterial,
        mockExam: parsedMockExam,
        updatedAt: serverTimestamp()
      };

      console.log('Saving course update:', {
        courseId,
        thumbnailUrl: editThumbnailUrl,
        updateData: { ...updateData, updatedAt: 'serverTimestamp()' }
      });

      await updateDoc(doc(db, 'courses', courseId), updateData);
      console.log('Course updated successfully in Firestore');

      setCourse((prev: any) => prev ? {
        ...prev,
        title: editTitle.trim() || prev.title,
        description: editDescription,
        thumbnailUrl: editThumbnailUrl.trim() || null,
        thumbnail: editThumbnailUrl.trim() || null,
        image: editThumbnailUrl.trim() || null,
        studyMaterial: nextStudyMaterial,
        mockExam: parsedMockExam,
      } : prev);
      toast.success('Generated course updated successfully');
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error('Failed to update generated course content. Check the mock exam JSON and try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCourse = async () => {
    if (!courseId) return;
    if (!window.confirm('Delete this course permanently? This cannot be undone.')) return;

    setActionLoading(true);
    try {
      await deleteDoc(doc(db, 'courses', courseId));
      toast.success('Course deleted from the platform');
      navigate('/admin/moderation');
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete course');
    } finally {
      setActionLoading(false);
    }
  };

  const handleThumbnailFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setThumbnailFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setThumbnailPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadThumbnailToFirebase = async () => {
    if (!thumbnailFile || !courseId) {
      console.error('Missing file or courseId:', { thumbnailFile, courseId });
      toast.error('No file selected or course ID missing');
      return;
    }

    setIsUploadingThumbnail(true);
    console.log('Starting upload for file:', thumbnailFile.name);
    
    try {
      const fileName = `course-thumbnails/${courseId}/${Date.now()}-${thumbnailFile.name}`;
      console.log('Upload path:', fileName);
      
      const fileRef = ref(storage, fileName);
      console.log('Uploading to Firebase Storage...');
      
      await uploadBytes(fileRef, thumbnailFile);
      console.log('File uploaded successfully, getting download URL...');
      
      const downloadUrl = await getDownloadURL(fileRef);
      console.log('Download URL obtained:', downloadUrl);
      
      setEditThumbnailUrl(downloadUrl);
      setThumbnailFile(null);
      setThumbnailPreview('');
      toast.success('Thumbnail uploaded successfully! Click "Save Content Changes" to persist.');
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(`Failed to upload thumbnail: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-emerald-50', 'dark:bg-emerald-950/20');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-emerald-50', 'dark:bg-emerald-950/20');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-emerald-50', 'dark:bg-emerald-950/20');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleThumbnailFileSelect(files[0]);
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

  const isGeneratedCourse = Boolean(course.generatedCourse || course.mockExam || course.studyMaterial);

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
        {isGeneratedCourse && (
          <section className="xl:col-span-12 bg-gradient-to-br from-emerald-50 via-white to-slate-50 dark:from-emerald-950/25 dark:via-slate-900 dark:to-slate-950 border border-emerald-200/70 dark:border-emerald-900/40 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div>
                <Badge className="bg-emerald-600 text-white border-0 shadow-sm mb-3">Admin Generated Course</Badge>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Edit content and thumbnail together</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">Use this editor to update the learning pack, replace the thumbnail, and publish new material without rebuilding the course from scratch.</p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" className="border-rose-200 text-rose-600 hover:bg-rose-50" onClick={handleDeleteCourse} disabled={actionLoading}>
                  <X className="h-4 w-4 mr-2" /> Delete Course
                </Button>
                <Button onClick={handleSaveGeneratedCourse} disabled={actionLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  {actionLoading ? 'Saving...' : 'Save Content Changes'}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Course Title</label>
                <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="bg-white dark:bg-slate-900" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Thumbnail Image</label>
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className="border-2 border-dashed border-emerald-300 dark:border-emerald-800 rounded-xl p-6 text-center cursor-pointer hover:bg-emerald-50/50 dark:hover:bg-emerald-950/10 transition-colors relative"
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files && handleThumbnailFileSelect(e.target.files[0])}
                    className={`absolute inset-0 opacity-0 cursor-pointer ${thumbnailPreview ? 'pointer-events-none' : ''}`}
                  />
                  {thumbnailPreview ? (
                    <div className="space-y-3">
                      <img src={thumbnailPreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                      <Button 
                        size="sm" 
                        onClick={uploadThumbnailToFirebase} 
                        disabled={isUploadingThumbnail}
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                        type="button"
                      >
                        {isUploadingThumbnail ? 'Uploading...' : 'Upload to Firebase'}
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setThumbnailFile(null);
                          setThumbnailPreview('');
                        }}
                        disabled={isUploadingThumbnail}
                        type="button"
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-2xl">📸</div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Drag and drop your thumbnail here</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">or click to browse (max 5MB)</p>
                      {editThumbnailUrl && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">✓ Current: Uploaded</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2 lg:col-span-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Course Description</label>
                <Textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} className="min-h-[120px] bg-white dark:bg-slate-900" placeholder="Describe the learning pack..." />
              </div>
              <div className="space-y-2 lg:col-span-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Study Material Content</label>
                <Textarea value={editStudyMaterial} onChange={(e) => setEditStudyMaterial(e.target.value)} className="min-h-[160px] bg-white dark:bg-slate-900 font-mono text-sm" placeholder="Paste updated study notes here..." />
              </div>
              <div className="space-y-2 lg:col-span-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Mock Exam JSON</label>
                <Textarea value={editMockExamJson} onChange={(e) => setEditMockExamJson(e.target.value)} className="min-h-[220px] bg-white dark:bg-slate-900 font-mono text-sm" placeholder='{"title":"...","sections":[]}' />
              </div>
            </div>
          </section>
        )}
        
        {/* Main Left Content */}
        <div className="xl:col-span-12 flex flex-col gap-8">
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

