import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GraduationCap, UploadCloud, FileText, X, Sparkles, Settings2, CheckCircle2, Wand2 } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions, db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { toast } from 'sonner';
import { BrandedCoursePDF } from '../components/BrandedCoursePDF';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { uploadFilesToStorage } from '@/utils/storageUploadService';

const generateCourseContent = httpsCallable(functions, 'generateCourseContent', { timeout: 300000 });

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
        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Supports PDF, DOCX, XLSX, TXT, PNG, JPG (Max 10MB)</p>
        <input 
          type="file" 
          multiple
          accept={accept || ".pdf,.txt,.png,.jpg,.jpeg,.doc,.docx,.xlsx,application/pdf,text/plain,image/png,image/jpeg,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}
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
  const [examJson, setExamJson] = useState<any>(null);

  // Manual generation config state
  const [examFormat, setExamFormat] = useState('mcq');
  const [questionCount, setQuestionCount] = useState(20);
  const [timeAllowed, setTimeAllowed] = useState(30);
  const [difficulty, setDifficulty] = useState('medium');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || notesFiles.length === 0) return;
    if (!user) {
      toast.error('Please sign in to generate content.');
      return;
    }

    setLoading(true);
    try {
      const notePaths = await uploadFilesToStorage(notesFiles, user.uid, 'admin-generator-notes');
      const notesData = notesFiles.map((file, index) => ({
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        storagePath: notePaths[index]
      }));
      
      let pastQuestionsData: Array<{ name: string; mimeType: string; storagePath: string }> | null = null;
      if (useUpload && pastQuestionsFiles.length > 0) {
        const pastQuestionPaths = await uploadFilesToStorage(pastQuestionsFiles, user.uid, 'admin-generator-past-questions');
        pastQuestionsData = pastQuestionsFiles.map((file, index) => ({
          name: file.name,
          mimeType: file.type || 'application/octet-stream',
          storagePath: pastQuestionPaths[index]
        }));
      }

      const result = await generateCourseContent({
        courseId,
        courseTitle,
        hasPastQuestions: useUpload && pastQuestionsFiles.length > 0,
        notesData,
        pastQuestionsData,
        manualConfig: !useUpload ? {
          examFormat,
          questionCount,
          timeAllowed,
          difficulty
        } : undefined
      });

      const generatedData = result.data as any;
      if (!generatedData || !Array.isArray(generatedData.sections)) {
        throw new Error('Generated content is incomplete. Please try again.');
      }

      setExamJson(generatedData);
      toast.success('Exam generated successfully!');
    } catch (e: any) {
      console.error(e);
      const errorMessage = e?.message || 'Error generating exam';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const publishToCourse = async () => {
     if (!examJson || !courseId.trim()) return;
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
        mockExam: examJson,
        studyMaterial: examJson.studyMaterial || null,
        updatedAt: serverTimestamp()
       }, { merge: true });
       toast.success('Published to course!');
    } catch(e: any) {
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
                      accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,application/pdf,image/png,image/jpeg,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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
              <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90 text-white font-medium text-base shadow-lg shadow-primary/20 w-fit px-8" disabled={loading}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    Generating Content & Exam...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5" />
                    Process & Generate
                  </div>
                )}
              </Button>
            </div>
          </form>

          {/* Generated Results Preview */}
          {examJson && (
            <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 space-y-6 animate-in fade-in slide-in-from-bottom-4">
               <div className="flex items-center justify-between">
                 <h3 className="text-xl font-display font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                   <CheckCircle2 className="h-6 w-6 text-primary" />
                   Generation Complete!
                 </h3>
                 <div className="flex gap-3">
                   <PDFDownloadLink
                     document={<BrandedCoursePDF courseTitle={courseTitle} courseCode={courseId} examData={examJson} />}
                      fileName={`${courseTitle.replace(/\s+/g, '_')}_MyTutorMe_Exam.pdf`}
                   >
                      {({ loading }) => (
                        <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/5" disabled={loading}>
                          <FileText className="h-4 w-4 mr-2" />
                          {loading ? 'Preparing PDF...' : 'Download Branded PDF'}
                        </Button>
                      )}
                   </PDFDownloadLink>
                   
                   <Button onClick={publishToCourse} className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
                     <GraduationCap className="h-4 w-4 mr-2" />
                     Publish to Course
                   </Button>
                 </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                 <div className="lg:col-span-2 space-y-4">
                   <div className="bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                     <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">Study Material</h4>
                     <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">This is what will be included in the branded PDF for student revision.</p>
                     <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 bg-white dark:bg-slate-900">
                       <p className="text-sm font-medium text-slate-800 dark:text-slate-100 mb-2">
                         {examJson.studyMaterial?.title || 'Study Guide'}
                       </p>
                       <div className="max-h-[420px] overflow-y-auto pr-1 space-y-3">
                         {(examJson.studyMaterial?.content || 'No study material generated yet.')
                           .split('\n\n')
                           .filter((p: string) => p.trim().length > 0)
                           .map((paragraph: string, idx: number) => (
                             <p key={idx} className="text-sm leading-6 text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                               {paragraph}
                             </p>
                           ))}
                       </div>
                     </div>
                   </div>
                 </div>

                 <div className="lg:col-span-3 bg-slate-50 dark:bg-[#0D1117] border border-slate-200 dark:border-slate-800 rounded-xl p-4">
                   <div className="flex items-center justify-between mb-3">
                     <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Exam Review</h4>
                     <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">{examJson.sections?.length || 0} Sections</span>
                   </div>
                   <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Review generated questions before downloading or publishing.</p>

                   <div className="max-h-[520px] overflow-y-auto pr-1 space-y-4">
                     {(examJson.sections || []).map((section: any, sIdx: number) => (
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
                               <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">
                                 {qIdx + 1}. {q?.question || 'Untitled question'}
                               </p>
                               <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                 {q?.difficulty || 'medium'} • {q?.marks || 0} mark{q?.marks === 1 ? '' : 's'}
                               </p>

                               {q?.type === 'mcq' && Array.isArray(q?.options) && q.options.length > 0 && (
                                 <ul className="mt-2 space-y-1">
                                   {q.options.map((opt: string, i: number) => (
                                     <li key={i} className="text-xs text-slate-700 dark:text-slate-300">
                                       {String.fromCharCode(65 + i)}. {opt}
                                     </li>
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
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
