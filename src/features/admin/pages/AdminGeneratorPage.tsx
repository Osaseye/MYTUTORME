import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap, UploadCloud, FileText, X, Sparkles, Settings2, CheckCircle2, Wand2, ChevronRight } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions, db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { toast } from 'sonner';
import { BrandedCoursePDF } from '../components/BrandedCoursePDF';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { uploadFilesToStorage } from '@/utils/storageUploadService';

const generateCourseContent = httpsCallable(functions, 'generateCourseContent', { timeout: 300000 });

// ── Pipeline types ────────────────────────────────────────────────────────────
type PipelineStage =
  | 'idle' | 'uploading' | 'extracting' | 'batch_review'
  | 'all_extracted' | 'generating_study' | 'study_review'
  | 'generating_questions' | 'complete';
type FileRef = { name: string; mimeType: string; storagePath: string };
type BatchExtract = { batchIndex: number; fileNames: string[]; content: string; title: string };
const STAGE_ORDER: Record<PipelineStage, number> = {
  idle: 0, uploading: 1, extracting: 2, batch_review: 3, all_extracted: 3,
  generating_study: 4, study_review: 6, generating_questions: 7, complete: 8,
};

const MultiFileUploadZone = ({ files, setFiles, accept, label }: { files: File[]; setFiles: (files: File[]) => void; accept?: string; label?: string }) => {
  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {files.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {files.map((file, i) => (
            <div key={i} className="flex items-center justify-between p-3 border border-primary/30 bg-primary/5 rounded-xl transition-all">
              <div className="flex items-center gap-3 truncate">
                <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                  <FileText className="h-4 w-4 text-primary" />
                </div>
                <div className="truncate">
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">{file.name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={(e) => { e.preventDefault(); removeFile(i); }} className="text-slate-400 hover:text-red-500 shrink-0 h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
      
      <div className="relative flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-primary/50 transition-all rounded-xl cursor-pointer group group-hover:shadow-sm">
        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full group-hover:bg-primary/10 transition-colors mb-3">
          <UploadCloud className="h-6 w-6 text-slate-400 group-hover:text-primary transition-colors" />
        </div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{label || "Drag & drop or click to upload"}</p>
        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Supports PDF, PPTX, DOCX, XLSX, TXT, PNG, JPG (Max 10MB)</p>
        <input 
          type="file" 
          multiple
          accept={accept || ".pdf,.pptx,.txt,.png,.jpg,.jpeg,.doc,.docx,.xlsx,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain,image/png,image/jpeg,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
          onChange={e => {
            if (e.target.files?.length) {
              setFiles([...files, ...Array.from(e.target.files)]);
              e.target.value = ''; // reset so same file can be uploaded again if removed
            }
          }} 
        />
      </div>
    </div>
  );
};

export const AdminGeneratorPage = () => {
  const { user } = useAuth();
  const [courseId, setCourseId] = useState('');
  const [courseTitle, setCourseTitle] = useState('');
  const [notesFiles, setNotesFiles] = useState<File[]>([]);
  const [pastQuestionsFiles, setPastQuestionsFiles] = useState<File[]>([]);
  const [useUpload, setUseUpload] = useState(false);
  const [loading, setLoading] = useState(false);

  // ── Pipeline state ────────────────────────────────────────────────────────
  const BATCH_SIZE = 4;
  const [pipelineStage, setPipelineStage] = useState<PipelineStage>('idle');
  const [currentBatchIndex, setCurrentBatchIndex] = useState(0);
  const [fileBatches, setFileBatches] = useState<FileRef[][]>([]);
  const [pastQuestionsRefs, setPastQuestionsRefs] = useState<FileRef[] | null>(null);
  const [batchExtracts, setBatchExtracts] = useState<BatchExtract[]>([]);
  const [studyMaterial, setStudyMaterial] = useState<{ title: string; content: string } | null>(null);
  const [examSections, setExamSections] = useState<any[]>([]);

  // Manual config
  const [examFormat, setExamFormat] = useState('mcq');
  const [questionCount, setQuestionCount] = useState(20);
  const [timeAllowed, setTimeAllowed] = useState(30);
  const [difficulty, setDifficulty] = useState('medium');

  // Derived final exam (used for PDF + publish)
  const finalExamJson = studyMaterial && examSections.length > 0
    ? { title: `${courseTitle} - Mock Exam`, timeAllowed, studyMaterial, sections: examSections }
    : null;

  const textToBase64 = (text: string) => btoa(unescape(encodeURIComponent(text)));

  // ── Phase 1: Upload all files, split into batches, start batch 0 ──────────
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || notesFiles.length === 0 || !user) return;

    setPipelineStage('uploading');
    setLoading(true);
    setBatchExtracts([]);
    setStudyMaterial(null); 
    setExamSections([]);

    try {
      const notePaths = await uploadFilesToStorage(notesFiles, user.uid, 'admin-generator-notes');
      const allNoteRefs: FileRef[] = notesFiles.map((file, i) => ({
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        storagePath: notePaths[i],
      }));

      let pqRefs: FileRef[] | null = null;
      if (useUpload && pastQuestionsFiles.length > 0) {
        const pqPaths = await uploadFilesToStorage(pastQuestionsFiles, user.uid, 'admin-generator-past-questions');
        pqRefs = pastQuestionsFiles.map((file, i) => ({
          name: file.name,
          mimeType: file.type || 'application/octet-stream',
          storagePath: pqPaths[i],
        }));
      }

      const batches: FileRef[][] = [];
      for (let i = 0; i < allNoteRefs.length; i += BATCH_SIZE) {
        batches.push(allNoteRefs.slice(i, i + BATCH_SIZE));
      }

      setPastQuestionsRefs(pqRefs);
      setFileBatches(batches);
      setCurrentBatchIndex(0);
      await _extractBatch(0, batches, pqRefs, []);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Upload failed. Please try again.');
      setPipelineStage('idle');
    } finally {
      setLoading(false);
    }
  };

  // ── Extract key content from one batch (studyMaterialOnly = small output) ─
  const _extractBatch = async (
    batchIndex: number,
    batches: FileRef[][],
    _pqRefs: FileRef[] | null,
    previousExtracts: BatchExtract[],
  ) => {
    setLoading(true);
    setPipelineStage('extracting');
    try {
      const batch = batches[batchIndex];
      const result = await generateCourseContent({
        courseId,
        courseTitle,
        studyMaterialOnly: true,
        notesData: batch,
        hasPastQuestions: false,
      });

      const data = result.data as any;
      if (!data?.studyMaterial?.content) {
        // Log full response to help debug empty content
        console.error('Empty studyMaterial response. Full data:', JSON.stringify(data));
        throw new Error(`Batch ${batchIndex + 1} returned no content. Data received: ${JSON.stringify(data).substring(0, 200)}`);
      }

      const newExtract: BatchExtract = {
        batchIndex,
        fileNames: batch.map(f => f.name),
        content: data.studyMaterial.content,
        title: data.studyMaterial.title || `Batch ${batchIndex + 1} Notes`,
      };
      const updatedExtracts = [...previousExtracts, newExtract];
      setBatchExtracts(updatedExtracts);

      if (batchIndex === batches.length - 1) {
        setPipelineStage('all_extracted');
        toast.success(`All ${batches.length} batch${batches.length !== 1 ? 'es' : ''} analysed — ready to compile study material.`);
      } else {
        setCurrentBatchIndex(batchIndex + 1);
        setPipelineStage('batch_review');
        toast.success(`Batch ${batchIndex + 1} of ${batches.length} complete.`);
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Extraction failed. You can retry.');
      setCurrentBatchIndex(batchIndex);
      setPipelineStage(batchIndex === 0 && previousExtracts.length === 0 ? 'idle' : 'batch_review');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueExtraction = async () => {
    await _extractBatch(currentBatchIndex, fileBatches, pastQuestionsRefs, batchExtracts);
  };

  // ── Phase 2: Compile all extracts into one cohesive study material ─────────
  const handleGenerateStudyMaterial = async () => {
    setLoading(true);
    setPipelineStage('generating_study');
    try {
      const combinedContent = batchExtracts
        .map((ex, i) => `=== Part ${i + 1}: ${ex.title} ===\n\n${ex.content}`)
        .join('\n\n---\n\n');

      const result = await generateCourseContent({
        courseId,
        courseTitle,
        studyMaterialOnly: true,
        notesData: [{ data: textToBase64(combinedContent), mimeType: 'text/plain', name: 'compiled_notes.txt' }],
        hasPastQuestions: false,
      });

      const data = result.data as any;
      if (!data?.studyMaterial?.content) throw new Error('Study material generation failed. Please retry.');

      setStudyMaterial(data.studyMaterial);
      setPipelineStage('study_review');
      toast.success('Study material compiled! Review it then generate questions.');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Failed to compile study material.');
      setPipelineStage('all_extracted');
    } finally {
      setLoading(false);
    }
  };

  // ── Phase 3: Generate questions from the compiled study material ──────────
  const handleGenerateQuestions = async () => {
    if (!studyMaterial) return;
    setLoading(true);
    setPipelineStage('generating_questions');
    try {
      const result = await generateCourseContent({
        courseId,
        courseTitle,
        questionsOnly: true,
        notesData: [{ data: textToBase64(studyMaterial.content), mimeType: 'text/plain', name: 'study_material.txt' }],
        hasPastQuestions: useUpload && (pastQuestionsRefs?.length ?? 0) > 0,
        pastQuestionsData: pastQuestionsRefs,
        manualConfig: !useUpload ? { examFormat, questionCount, timeAllowed, difficulty } : undefined,
      });

      const data = result.data as any;
      if (!data || !Array.isArray(data.sections)) throw new Error('Question generation failed. Please retry.');

      setExamSections(data.sections);
      setPipelineStage('complete');
      toast.success('Exam questions generated! Your course pack is ready.');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Failed to generate questions.');
      setPipelineStage('study_review');
    } finally {
      setLoading(false);
    }
  };

  const publishToCourse = async () => {
    if (!finalExamJson || !courseId.trim()) return;
    try {
      const courseRef = doc(db, 'courses', courseId);
      await setDoc(courseRef, {
        title: courseTitle,
        description: `Admin-generated learning pack for ${courseTitle}.`,
        teacherName: 'MyTutorMe Admin',
        category: 'Admin Generated',
        subject: courseTitle,
        status: 'published',
        price: 'Free',
        generatedCourse: true,
        mockExam: finalExamJson,
        studyMaterial: finalExamJson.studyMaterial || null,
        updatedAt: serverTimestamp()
      }, { merge: true });
      toast.success('Published to course!');
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || 'Error publishing to course');
    }
  };


  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-1">Content & Exam Generator</h1>
          <p className="text-slate-500 dark:text-slate-400">Upload course materials to generate branded study notes and tailored mock exams.</p>
        </div>
      </div>

      <Card className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader className="border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl text-slate-900 dark:text-white">Generate AI Material</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-8">
          <form className="space-y-8 max-w-4xl" onSubmit={handleGenerate}>
            {/* Course Details Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold font-display flex items-center gap-2 text-slate-900 dark:text-slate-300">
                 <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">1</span>
                 Course Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-8">
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-400">Course ID</Label>
                  <Input 
                    value={courseId} 
                    onChange={e => setCourseId(e.target.value)} 
                    placeholder="e.g. SOS101"
                    className="focus-visible:ring-primary"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-700 dark:text-slate-400">Course Title</Label>
                  <Input 
                    value={courseTitle} 
                    onChange={e => setCourseTitle(e.target.value)} 
                    placeholder="e.g. Intro to Sociology"
                    className="focus-visible:ring-primary"
                    required 
                  />
                </div>
              </div>
            </div>

            {/* Upload Notes Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold font-display flex items-center gap-2 text-slate-900 dark:text-slate-300">
                 <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">2</span>
                 Source Material
              </h3>
              <div className="pl-8">
                <Label className="text-slate-700 dark:text-slate-400 block mb-2">Upload Course Notes/Slides</Label>
                <MultiFileUploadZone 
                   files={notesFiles} 
                   setFiles={setNotesFiles} 
                   label="Upload multiple documents or images" 
                />
              </div>
            </div>

            {/* Exam Settings Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold font-display flex items-center gap-2 text-slate-900 dark:text-slate-300">
                 <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">3</span>
                 Exam Configuration
              </h3>
              
              <div className="pl-8 space-y-4">
                <div 
                  className={`flex items-start space-x-3 p-4 border rounded-xl cursor-pointer transition-all ${
                    useUpload ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  onClick={() => setUseUpload(!useUpload)}
                >
                  <input 
                    type="checkbox" 
                    checked={useUpload} 
                    readOnly
                    className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary accent-primary cursor-pointer border-slate-300 dark:border-slate-600" 
                  />
                  <div>
                    <Label className="cursor-pointer font-medium text-slate-900 dark:text-slate-200">Mirror Past Exam Format</Label>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Upload a past question paper, and the AI will analyze it to format the mock exam exactly matching the structure, timing, and marks allocation.</p>
                  </div>
                </div>

                {useUpload ? (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label className="text-slate-700 dark:text-slate-400 block mb-2">Upload Past Questions</Label>
                    <MultiFileUploadZone
                      files={pastQuestionsFiles}
                      setFiles={setPastQuestionsFiles}
                      accept=".pdf,.pptx,.png,.jpg,.jpeg,.doc,.docx,application/pdf,application/vnd.openxmlformats-officedocument.presentationml.presentation,image/png,image/jpeg,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      label="Upload one or more past exam papers"
                    />
                  </div>
                ) : (
                  <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl animate-in fade-in space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
                      <div className="flex items-center gap-2">
                        <Settings2 className="h-5 w-5 text-primary" />
                        <h4 className="font-semibold text-slate-900 dark:text-slate-200">Manual Configuration</h4>
                      </div>
                      <p className="text-xs text-slate-500">Fine-tune the generated mock exam format</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <Label className="text-slate-700 dark:text-slate-400">Exam Format</Label>
                        <select 
                          className="w-full h-10 px-3 rounded-md bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-800 shadow-sm focus:ring-1 focus:ring-primary focus:outline-none sm:text-sm"
                          value={examFormat} 
                          onChange={e => setExamFormat(e.target.value)}
                        >
                          <option value="mcq">Multiple Choice Questions (MCQ)</option>
                          <option value="theory">Theory / Open-ended</option>
                          <option value="mixed">Mixed (MCQ + Theory)</option>
                        </select>
                      </div>
                      
                      <div className="space-y-3">
                        <Label className="text-slate-700 dark:text-slate-400">Difficulty Level</Label>
                        <select 
                          className="w-full h-10 px-3 rounded-md bg-white border border-slate-200 dark:bg-slate-950 dark:border-slate-800 shadow-sm focus:ring-1 focus:ring-primary focus:outline-none sm:text-sm"
                          value={difficulty} 
                          onChange={e => setDifficulty(e.target.value)}
                        >
                          <option value="easy">Easy (Concept check)</option>
                          <option value="medium">Medium (Standard level)</option>
                          <option value="hard">Hard (Advanced analytical)</option>
                          <option value="adaptive">Adaptive</option>
                        </select>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-slate-700 dark:text-slate-400">Number of Questions</Label>
                        <div className="flex items-center space-x-4">
                          <Input 
                            type="number" 
                            min={1} max={100}
                            value={questionCount} 
                            onChange={e => setQuestionCount(Number(e.target.value))} 
                            className="bg-white dark:bg-slate-950 focus-visible:ring-primary"
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-slate-700 dark:text-slate-400">Time Limit (minutes)</Label>
                        <div className="flex items-center space-x-4">
                          <Input 
                            type="number" 
                            min={5} max={180}
                            value={timeAllowed} 
                            onChange={e => setTimeAllowed(Number(e.target.value))} 
                            className="bg-white dark:bg-slate-950 focus-visible:ring-primary"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pl-8 pt-4">
              <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90 text-white font-medium text-base shadow-lg shadow-primary/20 w-fit px-8" disabled={loading || pipelineStage !== 'idle'}>
                {loading && pipelineStage === 'uploading' ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Uploading files...
                  </div>
                ) : pipelineStage !== 'idle' ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    Pipeline Active
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5" />
                    Start Generation Pipeline
                  </div>
                )}
              </Button>
            </div>
          </form>

          {/* ── Pipeline ──────────────────────────────────────────────────────── */}
          {pipelineStage !== 'idle' && (
            <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-bottom-3">

              {/* Step indicator */}
              <div className="flex items-start gap-0 max-w-sm">
                {([
                  { n: 1, label: 'File Analysis', lo: 1, hi: 3 },
                  { n: 2, label: 'Study Material', lo: 4, hi: 6 },
                  { n: 3, label: 'Exam Questions', lo: 7, hi: 8 },
                ] as const).map((step, idx) => {
                  const cur = STAGE_ORDER[pipelineStage];
                  const isDone = cur > step.hi;
                  const isActive = cur >= step.lo && cur <= step.hi;
                  return (
                    <React.Fragment key={step.n}>
                      {idx > 0 && (
                        <div className={`flex-1 h-0.5 mt-4 mx-2 transition-colors ${isDone ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'}`} />
                      )}
                      <div className="flex flex-col items-center gap-1 shrink-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                          isDone ? 'bg-primary border-primary text-white' :
                          isActive ? 'border-primary text-primary bg-primary/10' :
                          'border-slate-300 dark:border-slate-600 text-slate-400'
                        }`}>
                          {isDone ? '✓' : step.n}
                        </div>
                        <span className={`text-[10px] font-medium text-center w-20 ${
                          isActive ? 'text-primary' : isDone ? 'text-slate-600 dark:text-slate-400' : 'text-slate-400'
                        }`}>
                          {step.label}
                        </span>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>

              {/* Loading spinner */}
              {(pipelineStage === 'uploading' || pipelineStage === 'extracting' || pipelineStage === 'generating_study' || pipelineStage === 'generating_questions') && (
                <div className="flex items-center gap-3 p-5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {pipelineStage === 'uploading' && 'Uploading files to storage...'}
                      {pipelineStage === 'extracting' && `Analysing batch ${currentBatchIndex + 1} of ${fileBatches.length} — ${fileBatches[currentBatchIndex]?.length ?? 0} file(s)...`}
                      {pipelineStage === 'generating_study' && 'Compiling study material from all extracted notes...'}
                      {pipelineStage === 'generating_questions' && 'Generating exam questions from study material...'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">This may take up to a minute. Please wait.</p>
                  </div>
                </div>
              )}

              {/* batch_review — one batch done, ask to continue */}
              {pipelineStage === 'batch_review' && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    {batchExtracts.map((extract, i) => (
                      <div key={i} className={`border rounded-xl p-4 ${
                        i === batchExtracts.length - 1
                          ? 'border-primary/40 bg-primary/5 dark:bg-primary/10'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 opacity-60'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Batch {i + 1} / {fileBatches.length}
                          </p>
                          {i === batchExtracts.length - 1 && (
                            <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full">Just extracted</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mb-1">{extract.fileNames.join(', ')}</p>
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{extract.content.substring(0, 180)}…</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between p-4 border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 rounded-xl">
                    <div>
                      <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                        {fileBatches.length - currentBatchIndex} batch{fileBatches.length - currentBatchIndex !== 1 ? 'es' : ''} remaining
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5 max-w-xs truncate">
                        Next: {fileBatches[currentBatchIndex]?.map(f => f.name).join(', ')}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleContinueExtraction}
                      disabled={loading}
                      className="bg-amber-500 hover:bg-amber-600 text-white shrink-0 ml-4"
                    >
                      <ChevronRight className="h-4 w-4 mr-1" />
                      Continue to Batch {currentBatchIndex + 1}
                    </Button>
                  </div>
                </div>
              )}

              {/* all_extracted — all files done, compile study material */}
              {pipelineStage === 'all_extracted' && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    {batchExtracts.map((extract, i) => (
                      <div key={i} className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl p-4">
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Batch {i + 1} / {fileBatches.length} — {extract.fileNames.join(', ')}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{extract.content.substring(0, 180)}…</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between p-4 border border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/30 rounded-xl">
                    <div>
                      <p className="text-sm font-semibold text-green-900 dark:text-green-200">All {fileBatches.length} batches analysed!</p>
                      <p className="text-xs text-green-700 dark:text-green-400 mt-0.5">Ready to compile into one cohesive study material.</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleGenerateStudyMaterial}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700 text-white shrink-0 ml-4"
                    >
                      <Sparkles className="h-4 w-4 mr-1" />
                      Compile Study Material
                    </Button>
                  </div>
                </div>
              )}

              {/* study_review / complete — show compiled study material */}
              {(pipelineStage === 'study_review' || pipelineStage === 'complete') && studyMaterial && (
                <div className="space-y-4">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{studyMaterial.title || 'Study Material'}</h4>
                      <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">Compiled ✓</span>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto pr-1">
                      {studyMaterial.content.split('\n\n').filter(p => p.trim()).map((para, i) => (
                        <p key={i} className="text-sm leading-6 text-slate-700 dark:text-slate-300 whitespace-pre-wrap mb-3">{para}</p>
                      ))}
                    </div>
                  </div>
                  {pipelineStage === 'study_review' && (
                    <div className="flex items-center justify-between p-4 border border-primary/40 bg-primary/5 dark:bg-primary/10 rounded-xl">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Ready to generate exam questions?</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Questions are generated from the compiled study material above.</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={handleGenerateQuestions}
                        disabled={loading}
                        className="bg-primary hover:bg-primary/90 text-white shrink-0 ml-4"
                      >
                        <Wand2 className="h-4 w-4 mr-1" />
                        Generate Questions
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* complete — full results + publish / download */}
              {pipelineStage === 'complete' && finalExamJson && (
                <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <h3 className="text-xl font-display font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                      Generation Complete!
                    </h3>
                    <div className="flex gap-3">
                      <PDFDownloadLink
                        document={<BrandedCoursePDF courseTitle={courseTitle} courseCode={courseId} examData={finalExamJson} />}
                        fileName={`${courseTitle.replace(/\s+/g, '_')}_MyTutorMe_Exam.pdf`}
                      >
                        {({ loading: pdfLoading }) => (
                          <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/5" disabled={pdfLoading}>
                            <FileText className="h-4 w-4 mr-2" />
                            {pdfLoading ? 'Preparing PDF...' : 'Download PDF'}
                          </Button>
                        )}
                      </PDFDownloadLink>
                      <Button onClick={publishToCourse} className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
                        <GraduationCap className="h-4 w-4 mr-2" />
                        Publish to Course
                      </Button>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Exam Questions</h4>
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                        {finalExamJson.sections.reduce((acc: number, s: any) => acc + (s?.questions?.length || 0), 0)} Questions across {finalExamJson.sections.length} section{finalExamJson.sections.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="max-h-[520px] overflow-y-auto pr-1 space-y-4">
                      {finalExamJson.sections.map((section: any, sIdx: number) => (
                        <div key={sIdx} className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 bg-white dark:bg-slate-900">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                              Section {String.fromCharCode(65 + sIdx)}: {section?.name || `Section ${sIdx + 1}`}
                            </h5>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {String(section?.type || 'mixed').toUpperCase()}
                            </span>
                          </div>
                          <div className="space-y-3">
                            {(section?.questions || []).map((q: any, qIdx: number) => (
                              <div key={q?.id || `${sIdx}-${qIdx}`} className="rounded-md border border-slate-100 dark:border-slate-800 p-3">
                                <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">{qIdx + 1}. {q?.question || 'Untitled question'}</p>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{q?.difficulty || 'medium'} • {q?.marks || 0} mark{q?.marks === 1 ? '' : 's'}</p>
                                {q?.type === 'mcq' && Array.isArray(q?.options) && q.options.length > 0 && (
                                  <ul className="mt-2 space-y-1">
                                    {q.options.map((opt: string, i: number) => (
                                      <li key={i} className="text-xs text-slate-700 dark:text-slate-300">{String.fromCharCode(65 + i)}. {opt}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
