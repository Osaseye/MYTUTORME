import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { 
  FileEdit, 
  Sigma, 
  Image as ImageIcon, 
  Send, 
  CloudUpload, 
  Brain,
  Loader2,
  X,
  History,
  Clock,
  Trash2
} from 'lucide-react';
import { getGenerativeModel } from 'firebase/ai';
import { ai } from '@/lib/firebase';
import ReactMarkdown from 'react-markdown';import { usePlanGate } from '@/hooks/usePlanGate';
// Create a GenerativeModel instance with gemini-2.5-pro for reasoning tasks
const model = getGenerativeModel(ai, { model: 'gemini-2.5-pro' });

interface SelectedFile {
  name: string;
  data: string;
  mimeType: string;
}

interface HistoryItem {
  id: string;
  question: string;
  result: string;
  date: string;
}

export const AssignmentHelperPage = () => {
  const { hasAccess } = usePlanGate('guided_assignments');
  const [question, setQuestion] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('assignmentHistory');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse history');
      }
    }
  }, []);

  const saveToHistory = (q: string, res: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      question: q.substring(0, 150) + (q.length > 150 ? '...' : ''), // Save question summary
      result: res,
      date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    // We update local state
    setHistory(prev => {
      const updated = [newItem, ...prev].slice(0, 20); // keep last 20
      localStorage.setItem('assignmentHistory', JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('assignmentHistory');
    toast.success('History cleared');
  };

  const loadFromHistory = (item: HistoryItem) => {
    setQuestion(item.question);
    setResult(item.result);
    setSelectedFile(null);
    setShowHistory(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      setSelectedFile({
        name: file.name,
        data: base64Data,
        mimeType: file.type || 'application/octet-stream'
      });
      toast.success('Document attached successfully');
    };
    reader.onerror = () => toast.error('Failed to read file');
    reader.readAsDataURL(file);
    
    // Reset input so the same file can be selected again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (!question.trim() && !selectedFile) {
        toast.error('Please enter a question or upload a document first');
        return;
    }
    
    if (!hasAccess && history.length >= 3) {
      toast.error('Free tier limits reached. Please upgrade your plan in Settings to analyze more assignments.');
      return;
    }

    setIsAnalyzing(true);

    try {
      const parts: any[] = [];
      
      if (question.trim()) {
        parts.push(question);
      }
      
      if (selectedFile) {
        parts.push({
          inlineData: {
             data: selectedFile.data.split(',')[1],
             mimeType: selectedFile.mimeType
          }
        });
      }

      // Stream the response for a better user experience
      const responseStream = await model.generateContentStream(parts);
      
      let fullResponse = '';
      for await (const chunk of responseStream.stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;
        setResult(fullResponse);
      }

      // Save to history once fully streamed
      if (fullResponse) {
         saveToHistory(question || (selectedFile?.name || 'File Upload'), fullResponse);
      }
      
      toast.success('Analysis Complete!');
    } catch (error: any) {
      console.error("AI Generation Error:", error);
      toast.error('Failed to analyze assignment', {
        description: error.message || 'Something went wrong.'
      });
      setResult(null); // Clear broken stream on error
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClearAll = () => {
    setQuestion('');
    setSelectedFile(null);
    setResult(null);
  };

  return (
    <div className="flex-grow flex flex-col w-full h-full gap-8">
      {!hasAccess && (
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-500 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6" />
            <div>
              <p className="font-bold">Free Plan Limit: 3 assignments.</p>
              <p className="text-sm opacity-90">You have analyzed {Math.min(history.length, 3)} out of 3 assignments.</p>
            </div>
          </div>
          <a href="/student/settings" className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors">
            Upgrade Plan
          </a>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Assignment Helper</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get instant, step-by-step guidance on your homework.</p>
        </div>
        <button 
          onClick={() => setShowHistory(!showHistory)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
            showHistory 
              ? 'bg-primary text-white shadow-md' 
              : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700'
          }`}
        >
          <History className="w-4 h-4" />
          {showHistory ? 'Back to Helper' : 'View History'}
        </button>
      </div>

      {showHistory ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Recent Questions
            </h2>
            {history.length > 0 && (
              <button 
                onClick={clearHistory}
                className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1 font-medium bg-red-50 dark:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear History
              </button>
            )}
          </div>

          {history.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {history.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => loadFromHistory(item)}
                  className="p-5 border border-gray-100 dark:border-gray-800 rounded-xl hover:border-primary/50 dark:hover:border-primary/50 cursor-pointer bg-slate-50/50 dark:bg-slate-800/20 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-2 line-clamp-2 leading-relaxed">
                    {item.question || "Uploaded document"}
                  </p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-900 px-2 py-1 rounded-md border border-gray-100 dark:border-gray-800">
                      {item.date}
                    </span>
                    <span className="text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      Load Question <Send className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <History className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No history yet</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Your past questions and assignments will appear here.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 lg:h-[calc(100vh-16rem)] h-auto">
        {/* Left Column: Input */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4 h-full">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex-grow flex flex-col relative overflow-hidden group min-h-[400px] lg:min-h-0">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-green-400"></div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FileEdit className="w-5 h-5 text-primary" />
                Your Question
              </h2>
              <button 
                onClick={handleClearAll}
                className="text-xs font-medium text-primary hover:text-green-700 dark:hover:text-green-400 transition-colors"
                disabled={isAnalyzing}
              >
                Clear all
              </button>
            </div>
            
            {/* File Attachment Indicator */}
            {selectedFile && (
              <div className="mb-3 flex items-center justify-between bg-primary/10 border border-primary/20 rounded-lg py-2 px-3">
                 <div className="flex items-center gap-2 truncate">
                    <ImageIcon className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm text-slate-700 dark:text-slate-300 truncate">{selectedFile.name}</span>
                 </div>
                 <button 
                   onClick={() => setSelectedFile(null)} 
                   className="text-slate-400 hover:text-red-500 transition-colors ml-2 shrink-0"
                   disabled={isAnalyzing}
                 >
                    <X className="w-4 h-4" />
                 </button>
              </div>
            )}

            <textarea 
              className="flex-grow w-full bg-gray-50 dark:bg-slate-800/50 border-0 rounded-xl p-4 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:ring-2 focus:ring-primary/50 resize-none text-base leading-relaxed outline-none" 
              placeholder="Type your question here, paste text, or describe the problem you're trying to solve..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={isAnalyzing}
            />
            <div className="mt-4 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
              <div className="flex items-center gap-1">
                <button className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Insert Equation">
                  <Sigma className="w-5 h-5" />
                </button>
                <button 
                  className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors" 
                  title="Add Image"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isAnalyzing}
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleFileChange} 
                />
              </div>
              <button 
                disabled={isAnalyzing}
                className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl font-medium shadow-sm transition-all hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                onClick={handleAnalyze}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>Analyze</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
          
          <div 
             className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border-2 border-dashed border-gray-300 dark:border-gray-600 p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary dark:hover:border-primary transition-colors group"
             onClick={() => fileInputRef.current?.click()}
          >
            <div className="h-12 w-12 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <CloudUpload className="w-6 h-6 text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Upload a document</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PDF, DOCX, or Images up to 10MB</p>
          </div>
        </div>  

        {/* Right Column: Output / Empty State */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-slate-800/50">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                Step-by-Step Guidance
              </h2>
            </div>
            
            <div className="flex-grow flex p-6 bg-slate-50/30 dark:bg-slate-900/30 overflow-y-auto">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center text-center max-w-sm m-auto">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Analyzing your question...</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Our AI is breaking down the problem into understandable steps.</p>
                </div>
              ) : result ? (
                <div className="prose dark:prose-invert prose-slate prose-sm sm:prose-base max-w-none w-full">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center max-w-sm opacity-60 m-auto">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                    <Brain className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No active assignment</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Type your question or upload a document on the left to receive step-by-step guidance.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
