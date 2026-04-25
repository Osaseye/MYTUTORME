import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
import { db, storage, functions } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft, Check, X, BookOpen, FileText,
  User, AlertCircle, Calendar, Pencil, Trash2,
  Plus, ChevronDown, ChevronUp, UploadCloud, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { uploadFilesToStorage } from '@/utils/storageUploadService';
import { QuestionEditorModal } from '../components/QuestionEditorModal';
import type { QuestionDraft } from '../components/QuestionEditorModal';
import { useAuth } from '@/features/auth/hooks/useAuth';

const generateCourseContent = httpsCallable(functions, 'generateCourseContent', { timeout: 300000 });

// ─── Types ────────────────────────────────────────────────────────────────────
interface Section {
  name: string;
  type: string;
  questions: QuestionDraft[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  hard: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

const parseSections = (mockExam: any): Section[] => {
  if (!mockExam?.sections) return [];
  return mockExam.sections.map((s: any) => ({
    name: s.name || 'Section',
    type: s.type || 'mcq',
    questions: (s.questions || []).map((q: any) => ({
      id: q.id,
      question: q.question || q.text || '',
      type: q.type === 'theory' || q.type === 'short-answer' ? 'theory' : 'mcq',
      options: Array.isArray(q.options) ? q.options : ['', '', '', ''],
      correctAnswer: q.correctAnswer ?? 0,
      explanation: q.explanation || '',
      marks: q.marks ?? 1,
      topicArea: q.topicArea || q.topic || '',
      difficulty: q.difficulty || 'medium',
    })),
  }));
};

// ─── Component ────────────────────────────────────────────────────────────────
export const AdminCourseDetailsPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Course data
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Basic editable fields
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editThumbnailUrl, setEditThumbnailUrl] = useState('');
  const [editStudyMaterial, setEditStudyMaterial] = useState('');

  // Thumbnail upload
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);

  // New study material upload
  const [newMaterialFiles, setNewMaterialFiles] = useState<File[]>([]);
  const [isProcessingMaterial, setIsProcessingMaterial] = useState(false);

  // Question editor
  const [sections, setSections] = useState<Section[]>([]);
  const [collapsedSections, setCollapsedSections] = useState<Record<number, boolean>>({});
  const [editingQuestion, setEditingQuestion] = useState<{
    sectionIdx: number;
    questionIdx: number | null;
    data: QuestionDraft | null;
  } | null>(null);
  const [deletingQuestion, setDeletingQuestion] = useState<{ sectionIdx: number; questionIdx: number } | null>(null);

  // Modal / action state
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // ── Load course ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      try {
        const docSnap = await getDoc(doc(db, 'courses', courseId));
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() } as any;
          setCourse(data);
          setEditTitle(data.title || '');
          setEditDescription(data.description || '');
          setEditThumbnailUrl(data.thumbnailUrl || data.thumbnail || data.image || '');
          setEditStudyMaterial(
            data.studyMaterial?.content || data.mockExam?.studyMaterial?.content || ''
          );
          setSections(parseSections(data.mockExam));
        } else {
          toast.error('Course not found');
          navigate('/admin/moderation');
        }
      } catch (e) {
        console.error(e);
        toast.error('Failed to load course details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourse();
  }, [courseId, navigate]);

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const buildMockExam = () => {
    const base = course?.mockExam || {};
    const studyMat = editStudyMaterial.trim()
      ? { ...(base.studyMaterial || {}), content: editStudyMaterial.trim() }
      : base.studyMaterial || null;

    return {
      ...base,
      studyMaterial: studyMat,
      sections: sections.map(s => ({
        name: s.name,
        type: s.type,
        questions: s.questions.map(q => ({ ...q })),
      })),
    };
  };

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!courseId || !course) return;
    setActionLoading(true);
    try {
      const mockExam = buildMockExam();
      const studyMaterial = mockExam.studyMaterial;

      await updateDoc(doc(db, 'courses', courseId), {
        title: editTitle.trim() || course.title,
        description: editDescription,
        thumbnailUrl: editThumbnailUrl.trim() || null,
        thumbnail: editThumbnailUrl.trim() || null,
        image: editThumbnailUrl.trim() || null,
        studyMaterial,
        mockExam,
        updatedAt: serverTimestamp(),
      });

      setCourse((prev: any) => prev ? { ...prev, title: editTitle, description: editDescription, studyMaterial, mockExam } : prev);
      toast.success('Course updated successfully');
    } catch (e) {
      console.error(e);
      toast.error('Failed to save changes');
    } finally {
      setActionLoading(false);
    }
  };

  // ── Approve / Reject / Delete ────────────────────────────────────────────────
  const handleApprove = async () => {
    if (!courseId) return;
    setActionLoading(true);
    try {
      await updateDoc(doc(db, 'courses', courseId), { status: 'published', rejectionReason: null });
      setCourse((p: any) => ({ ...p, status: 'published' }));
      toast.success('Course approved and published');
    } catch { toast.error('Failed to approve course'); }
    finally { setActionLoading(false); }
  };

  const handleReject = async () => {
    if (!courseId || !rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    setActionLoading(true);
    try {
      await updateDoc(doc(db, 'courses', courseId), { status: 'rejected', rejectionReason: rejectReason });
      setCourse((p: any) => ({ ...p, status: 'rejected', rejectionReason: rejectReason }));
      setIsRejectModalOpen(false);
      toast.success('Course rejected');
    } catch { toast.error('Failed to reject course'); }
    finally { setActionLoading(false); }
  };

  const handleDelete = async () => {
    if (!courseId) return;
    if (!window.confirm('Delete this course permanently? This cannot be undone.')) return;
    setActionLoading(true);
    try {
      await deleteDoc(doc(db, 'courses', courseId));
      toast.success('Course deleted');
      navigate('/admin/moderation');
    } catch { toast.error('Failed to delete course'); }
    finally { setActionLoading(false); }
  };

  // ── Thumbnail ────────────────────────────────────────────────────────────────
  const handleThumbnailSelect = (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Please upload an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be less than 5MB'); return; }
    setThumbnailFile(file);
    const reader = new FileReader();
    reader.onload = e => setThumbnailPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const uploadThumbnail = async () => {
    if (!thumbnailFile || !courseId) return;
    setIsUploadingThumbnail(true);
    try {
      const path = `course-thumbnails/${courseId}/${Date.now()}-${thumbnailFile.name}`;
      const fileRef = ref(storage, path);
      await uploadBytes(fileRef, thumbnailFile);
      const url = await getDownloadURL(fileRef);
      setEditThumbnailUrl(url);
      setThumbnailFile(null);
      setThumbnailPreview('');
      toast.success('Thumbnail uploaded — click Save to persist');
    } catch (e) {
      toast.error(`Upload failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  // ── New study material upload ─────────────────────────────────────────────────
  const handleProcessMaterial = async () => {
    if (!newMaterialFiles.length || !user || !courseId) return;
    setIsProcessingMaterial(true);
    try {
      const paths = await uploadFilesToStorage(newMaterialFiles, user.uid, 'admin-generator-notes');
      const notesData = newMaterialFiles.map((f, i) => ({
        name: f.name,
        mimeType: f.type || 'application/octet-stream',
        storagePath: paths[i],
      }));

      const result = await generateCourseContent({
        courseId,
        courseTitle: course?.title || editTitle,
        hasPastQuestions: false,
        notesData,
        pastQuestionsData: null,
      }) as any;

      const newContent: string = result?.data?.studyMaterial?.content || result?.data?.examData?.studyMaterial?.content || '';
      if (!newContent) {
        toast.error('Could not extract content from the uploaded files. Try a different file format.');
        return;
      }

      setEditStudyMaterial(prev =>
        prev.trim() ? `${prev.trim()}\n\n---\n\n${newContent.trim()}` : newContent.trim()
      );
      setNewMaterialFiles([]);
      toast.success('Content extracted and appended to study material. Click Save to persist.');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Failed to process files');
    } finally {
      setIsProcessingMaterial(false);
    }
  };

  const removeMaterialFile = (i: number) =>
    setNewMaterialFiles(prev => prev.filter((_, idx) => idx !== i));

  // ── Section helpers ──────────────────────────────────────────────────────────
  const toggleSection = (i: number) =>
    setCollapsedSections(prev => ({ ...prev, [i]: !prev[i] }));

  const updateSectionName = (sIdx: number, name: string) =>
    setSections(prev => prev.map((s, i) => i === sIdx ? { ...s, name } : s));

  const addSection = () =>
    setSections(prev => [...prev, { name: `Section ${prev.length + 1}`, type: 'mcq', questions: [] }]);

  const deleteSection = (sIdx: number) => {
    if (!window.confirm('Remove this entire section and all its questions?')) return;
    setSections(prev => prev.filter((_, i) => i !== sIdx));
  };

  // ── Question helpers ─────────────────────────────────────────────────────────
  const openAddQuestion = (sectionIdx: number) =>
    setEditingQuestion({ sectionIdx, questionIdx: null, data: null });

  const openEditQuestion = (sectionIdx: number, questionIdx: number) =>
    setEditingQuestion({ sectionIdx, questionIdx, data: sections[sectionIdx].questions[questionIdx] });

  const handleQuestionSave = (q: QuestionDraft) => {
    if (!editingQuestion) return;
    const { sectionIdx, questionIdx } = editingQuestion;
    setSections(prev => {
      const next = prev.map(s => ({ ...s, questions: [...s.questions] }));
      if (questionIdx === null) {
        next[sectionIdx].questions.push(q);
      } else {
        next[sectionIdx].questions[questionIdx] = q;
      }
      return next;
    });
    setEditingQuestion(null);
  };

  const confirmDeleteQuestion = (sectionIdx: number, questionIdx: number) =>
    setDeletingQuestion({ sectionIdx, questionIdx });

  const executeDeleteQuestion = () => {
    if (!deletingQuestion) return;
    const { sectionIdx, questionIdx } = deletingQuestion;
    setSections(prev =>
      prev.map((s, i) =>
        i === sectionIdx
          ? { ...s, questions: s.questions.filter((_, qi) => qi !== questionIdx) }
          : s
      )
    );
    setDeletingQuestion(null);
  };

  // ── Drag events (thumbnail) ──────────────────────────────────────────────────
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]) handleThumbnailSelect(e.dataTransfer.files[0]);
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!course) return null;

  const isGeneratedCourse = Boolean(course.generatedCourse || course.mockExam || course.studyMaterial);
  const isPending = course.status === 'pending' || course.status === 'pending_review';

  return (
    <div className="space-y-8 max-w-[1400px] mx-auto pb-12">

      {/* ── Sticky header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 -mx-4 -mt-4 md:-mx-6 md:-mt-6 p-4 md:p-6 md:px-10 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="shrink-0 rounded-full h-10 w-10" onClick={() => navigate('/admin/moderation')}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">{course.title}</h1>
              <Badge className={
                course.status === 'published' ? 'bg-emerald-500 text-white' :
                isPending ? 'bg-amber-500 text-white' :
                course.status === 'rejected' ? 'bg-rose-500 text-white' :
                'bg-slate-500 text-white'
              }>
                {course.status === 'published' ? 'Live' : isPending ? 'Pending Review' :
                 course.status === 'rejected' ? 'Rejected' : course.status === 'flagged' ? 'Flagged' : 'Draft'}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5"><User className="h-4 w-4" />{course.teacherName || 'Unknown Teacher'}</span>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {course.createdAt ? new Date(course.createdAt.seconds ? course.createdAt.toMillis() : course.createdAt).toLocaleDateString() : 'Recent'}
              </span>
            </div>
          </div>
        </div>
        {isPending && (
          <div className="flex items-center gap-3 shrink-0">
            <Button variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50" onClick={() => setIsRejectModalOpen(true)} disabled={actionLoading}>
              <X className="h-4 w-4 mr-2" />Reject
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleApprove} disabled={actionLoading}>
              <Check className="h-4 w-4 mr-2" />Approve & Publish
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-8">

        {/* ── Generated course editor ── */}
        {isGeneratedCourse && (
          <section className="bg-gradient-to-br from-emerald-50 via-white to-slate-50 dark:from-emerald-950/25 dark:via-slate-900 dark:to-slate-950 border border-emerald-200/70 dark:border-emerald-900/40 rounded-3xl p-6 md:p-8 shadow-sm space-y-8">

            {/* Section header */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div>
                <Badge className="bg-emerald-600 text-white border-0 shadow-sm mb-3">Admin Generated Course</Badge>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Course Content</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">Update study material, upload new documents, and manage exam questions without rebuilding from scratch.</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Button variant="outline" className="border-rose-200 text-rose-600 hover:bg-rose-50" onClick={handleDelete} disabled={actionLoading}>
                  <X className="h-4 w-4 mr-2" />Delete Course
                </Button>
                <Button onClick={handleSave} disabled={actionLoading} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20">
                  {actionLoading ? 'Saving…' : 'Save All Changes'}
                </Button>
              </div>
            </div>

            {/* ── Basic fields ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Course Title</label>
                <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} className="bg-white dark:bg-slate-900" />
              </div>

              {/* Thumbnail */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Thumbnail Image</label>
                <div
                  onDragOver={onDragOver}
                  onDrop={onDrop}
                  className="border-2 border-dashed border-emerald-300 dark:border-emerald-800 rounded-xl p-6 text-center cursor-pointer hover:bg-emerald-50/50 dark:hover:bg-emerald-950/10 transition-colors relative"
                >
                  <input type="file" accept="image/*" onChange={e => e.target.files && handleThumbnailSelect(e.target.files[0])}
                    className={`absolute inset-0 opacity-0 cursor-pointer ${thumbnailPreview ? 'pointer-events-none' : ''}`} />
                  {thumbnailPreview ? (
                    <div className="space-y-3">
                      <img src={thumbnailPreview} alt="Preview" className="w-full h-40 object-cover rounded-lg" />
                      <Button size="sm" onClick={uploadThumbnail} disabled={isUploadingThumbnail} className="w-full bg-emerald-600 hover:bg-emerald-700" type="button">
                        {isUploadingThumbnail ? 'Uploading…' : 'Upload to Firebase'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => { setThumbnailFile(null); setThumbnailPreview(''); }} disabled={isUploadingThumbnail} type="button">
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-2xl">📸</div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Drag & drop or click to browse</p>
                      <p className="text-xs text-slate-500">Max 5MB</p>
                      {editThumbnailUrl && <p className="text-xs text-emerald-600 dark:text-emerald-400">✓ Thumbnail uploaded</p>}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 lg:col-span-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Course Description</label>
                <Textarea value={editDescription} onChange={e => setEditDescription(e.target.value)} className="min-h-[100px] bg-white dark:bg-slate-900" placeholder="Describe the learning pack…" />
              </div>
            </div>

            {/* ── Study Material ── */}
            <div className="space-y-4 border-t border-emerald-200/60 dark:border-emerald-900/40 pt-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Study Material</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Edit the markdown content directly, or upload a new document to append AI-extracted content.</p>
              </div>

              {/* Upload new material */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">Upload Additional Document</span>
                  <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">AI extracts & appends</span>
                </div>

                {/* File list */}
                {newMaterialFiles.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {newMaterialFiles.map((f, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg shrink-0">
                            <FileText className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">{f.name}</p>
                            <p className="text-[10px] text-slate-500">{(f.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeMaterialFile(i)} className="h-7 w-7 text-slate-400 hover:text-red-500 shrink-0">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Drop zone */}
                <div
                  className="relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-emerald-400 transition-all rounded-xl cursor-pointer group"
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    if (e.dataTransfer.files?.length) {
                      const dropped = Array.from(e.dataTransfer.files).filter(f =>
                        /\.(pdf|txt|docx|pptx)$/i.test(f.name)
                      );
                      if (dropped.length) setNewMaterialFiles(prev => [...prev, ...dropped]);
                    }
                  }}
                >
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors mb-3">
                    <UploadCloud className="h-5 w-5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                  </div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Drag & drop or click to upload</p>
                  <p className="text-xs text-slate-500 mt-1">PDF, DOCX, PPTX, TXT (max 10MB each)</p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.txt,.docx,.pptx,application/pdf,text/plain"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={e => {
                      if (e.target.files?.length) {
                        const selected = Array.from(e.target.files);
                        e.target.value = '';
                        setNewMaterialFiles(prev => [...prev, ...selected]);
                      }
                    }}
                  />
                </div>

                {newMaterialFiles.length > 0 && (
                  <Button
                    onClick={handleProcessMaterial}
                    disabled={isProcessingMaterial}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    {isProcessingMaterial
                      ? <><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2 inline-block" />AI is extracting content…</>
                      : <><Sparkles className="h-4 w-4 mr-2" />Process & Append to Study Material</>}
                  </Button>
                )}
              </div>

              {/* Manual edit textarea */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Study Material Content <span className="text-slate-400 font-normal">(Markdown)</span></label>
                <Textarea
                  value={editStudyMaterial}
                  onChange={e => setEditStudyMaterial(e.target.value)}
                  className="min-h-[200px] bg-white dark:bg-slate-900 font-mono text-sm"
                  placeholder="Paste or edit study notes here… supports ## headers, - bullets, ```code```, > callouts"
                />
              </div>
            </div>

            {/* ── Question Editor ── */}
            <div className="space-y-4 border-t border-emerald-200/60 dark:border-emerald-900/40 pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Exam Questions</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    {sections.reduce((n, s) => n + s.questions.length, 0)} questions across {sections.length} section{sections.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={addSection} className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400">
                  <Plus className="h-4 w-4 mr-1.5" />Add Section
                </Button>
              </div>

              {sections.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400">
                  <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p className="font-medium">No exam sections yet</p>
                  <p className="text-sm mt-1">Click "Add Section" to get started</p>
                </div>
              )}

              <div className="space-y-4">
                {sections.map((section, sIdx) => (
                  <div key={sIdx} className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                    {/* Section header */}
                    <div className="flex items-center gap-3 px-5 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                      <input
                        value={section.name}
                        onChange={e => updateSectionName(sIdx, e.target.value)}
                        className="flex-1 bg-transparent font-semibold text-slate-900 dark:text-white text-sm outline-none focus:ring-1 focus:ring-emerald-400 rounded px-1 -mx-1"
                      />
                      <span className="text-xs text-slate-500 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded-full shrink-0">
                        {section.questions.length} Q
                      </span>
                      <button onClick={() => toggleSection(sIdx)} className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                        {collapsedSections[sIdx] ? <ChevronDown className="h-4 w-4 text-slate-500" /> : <ChevronUp className="h-4 w-4 text-slate-500" />}
                      </button>
                      <button onClick={() => deleteSection(sIdx)} className="p-1 rounded hover:bg-rose-100 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-600 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {!collapsedSections[sIdx] && (
                      <div className="p-4 space-y-2">
                        {section.questions.length === 0 && (
                          <p className="text-sm text-slate-400 text-center py-4 italic">No questions in this section yet.</p>
                        )}

                        {section.questions.map((q, qIdx) => (
                          <div key={qIdx} className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-colors group">
                            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xs font-bold">
                              {qIdx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed">
                                {q.question || <em className="text-slate-400">Empty question</em>}
                              </p>
                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${q.type === 'mcq' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'}`}>
                                  {q.type === 'mcq' ? 'MCQ' : 'Theory'}
                                </span>
                                {q.difficulty && (
                                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${DIFFICULTY_COLORS[q.difficulty] || ''}`}>
                                    {q.difficulty}
                                  </span>
                                )}
                                <span className="text-[10px] text-slate-500">{q.marks} mark{q.marks !== 1 ? 's' : ''}</span>
                                {q.topicArea && <span className="text-[10px] text-slate-500 truncate">· {q.topicArea}</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => openEditQuestion(sIdx, qIdx)}
                                className="p-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-slate-400 hover:text-emerald-600 transition-colors"
                                title="Edit question"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => confirmDeleteQuestion(sIdx, qIdx)}
                                className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-600 transition-colors"
                                title="Delete question"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openAddQuestion(sIdx)}
                          className="w-full mt-1 border border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 text-slate-500 hover:text-emerald-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />Add Question
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </section>
        )}

        {/* ── Thumbnail hero ── */}
        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative shadow-sm border border-slate-200 dark:border-slate-800">
          {(course.thumbnailUrl || course.image || course.thumbnail) ? (
            <img src={editThumbnailUrl || course.thumbnailUrl || course.image || course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
              <BookOpen className="h-16 w-16 mb-4 opacity-20" />
              <p className="font-medium text-lg">No cover image</p>
            </div>
          )}
        </div>

        {/* ── Description block ── */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-indigo-500" />Course Description
          </h2>
          <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 text-[15px]">
            {course.description
              ? <p className="whitespace-pre-line">{course.description}</p>
              : <div className="flex items-center gap-2 text-slate-400 italic"><AlertCircle className="h-4 w-4" />No description provided.</div>
            }
          </div>
        </section>

      </div>

      {/* ── Reject modal ── */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full p-7 space-y-6 border border-slate-200 dark:border-slate-800">
            <div className="text-center flex flex-col items-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mb-2">
                <AlertCircle className="h-6 w-6 text-rose-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Reject Course</h2>
              <p className="text-sm text-slate-500 px-4">Provide a reason — the teacher will see this feedback.</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">Rejection Reason</label>
              <Input value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="e.g. Incomplete curriculum, missing content…" />
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setIsRejectModalOpen(false)} disabled={actionLoading}>Cancel</Button>
              <Button className="flex-1 bg-rose-600 hover:bg-rose-700 text-white" onClick={handleReject} disabled={actionLoading}>
                {actionLoading ? 'Rejecting…' : 'Confirm Reject'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete question confirm ── */}
      {deletingQuestion && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-5 border border-slate-200 dark:border-slate-800">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mx-auto mb-3">
                <Trash2 className="h-6 w-6 text-rose-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Delete Question?</h2>
              <p className="text-sm text-slate-500 mt-1">This removes the question from the section. Click Save All Changes to persist.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDeletingQuestion(null)}>Cancel</Button>
              <Button className="flex-1 bg-rose-600 hover:bg-rose-700 text-white" onClick={executeDeleteQuestion}>Delete</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Question editor modal ── */}
      {editingQuestion && (
        <QuestionEditorModal
          initial={editingQuestion.data}
          isNew={editingQuestion.questionIdx === null}
          onSave={handleQuestionSave}
          onClose={() => setEditingQuestion(null)}
        />
      )}

    </div>
  );
};
