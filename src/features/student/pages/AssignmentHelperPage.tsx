import { useState } from 'react';
import { toast } from 'sonner';
import { 
  FileEdit, 
  Sigma, 
  Image as ImageIcon, 
  Send, 
  CloudUpload, 
  Brain,
  Loader2
} from 'lucide-react';

export const AssignmentHelperPage = () => {
  const [question, setQuestion] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = () => {
    if (!question.trim()) {
        toast.error('Please enter a question first');
        return;
    }
    setIsAnalyzing(true);
    // Simulate API delay
    setTimeout(() => {
      setIsAnalyzing(false);
      toast.success('Assignment Analyzed Successfully!', {
        description: 'Ready for backend integration to display the results.',
      });
    }, 1500);
  };

  return (
    <div className="flex-grow flex flex-col w-full h-full gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Assignment Helper</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get instant, step-by-step guidance on your homework.</p>
        </div>
      </div>

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
                onClick={() => setQuestion('')}
                className="text-xs font-medium text-primary hover:text-green-700 dark:hover:text-green-400 transition-colors"
                disabled={isAnalyzing}
              >
                Clear all
              </button>
            </div>
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
                <button className="p-2 text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Add Image">
                  <ImageIcon className="w-5 h-5" />
                </button>
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
             onClick={() => {
                toast.success('Document Uploaded', {
                   description: 'Assignment file has been securely uploaded for processing.',
                });
             }}
          >
            <div className="h-12 w-12 bg-gray-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <CloudUpload className="w-6 h-6 text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors" />
            </div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Upload a document</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PDF, DOCX, or PNG up to 10MB</p>
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
            
            <div className="flex-grow flex items-center justify-center p-8 bg-slate-50/30 dark:bg-slate-900/30">
              {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center text-center max-w-sm">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Analyzing your question...</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Our AI is breaking down the problem into understandable steps.</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-center max-w-sm opacity-60">
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
    </div>
  );
};
