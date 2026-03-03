import { toast } from 'sonner';
import { 
  FileEdit, 
  Sigma, 
  Image as ImageIcon, 
  Send, 
  CloudUpload, 
  Brain, 
  Lightbulb, 
  ChevronDown, 
  ThumbsUp, 
  ThumbsDown, 
  Library, 
  Calculator, 
  ArrowRight 
} from 'lucide-react';

export const AssignmentHelperPage = () => {
  return (
    <div className="flex-grow flex flex-col w-full h-full gap-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-white">Assignment Helper</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get instant, step-by-step guidance on your homework.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Subject:</span>
          <select className="form-select block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md dark:bg-slate-800 dark:border-gray-600 dark:text-white">
            <option>Mathematics</option>
            <option>Physics</option>
            <option>Chemistry</option>
            <option>Computer Science</option>
          </select>
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
              <button className="text-xs font-medium text-primary hover:text-green-700 dark:hover:text-green-400 transition-colors">Clear all</button>
            </div>
            <textarea 
              className="flex-grow w-full bg-gray-50 dark:bg-slate-800 border-0 rounded-xl p-4 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary resize-none text-lg leading-relaxed outline-none" 
              placeholder="Type your question here, paste text, or describe the problem you're trying to solve..."
            ></textarea>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Insert Equation">
                  <Sigma className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-primary hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors" title="Add Image">
                  <ImageIcon className="w-5 h-5" />
                </button>
              </div>
              <button 
                className="bg-primary hover:bg-green-700 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-primary/30 transition-all hover:scale-105 flex items-center gap-2"
                onClick={() => {
                   toast.success('Assignment Analyzed Successfully!', {
                     description: 'AI has generated a step-by-step solution for your query.',
                   });
                }}
              >
                <span>Analyze</span>
                <Send className="w-4 h-4" />
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

        {/* Right Column: Output */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800/50 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-green-500" />
                Step-by-Step Guidance
              </h2>
              <div className="bg-gray-200 dark:bg-slate-700 p-1 rounded-lg flex items-center text-xs font-medium">
                <button className="px-3 py-1.5 rounded-md bg-white dark:bg-slate-600 text-primary shadow-sm transition-all">Hint Mode</button>
                <button className="px-3 py-1.5 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-all">Full Explanation</button>
              </div>
            </div>
            
            <div className="flex-grow p-6 overflow-y-auto space-y-6 custom-scrollbar">
              <div className="relative pl-8 border-l-2 border-primary/30 dark:border-primary/20 pb-2">
                <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-primary border-4 border-white dark:border-slate-900"></div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Identify the core concept</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  The problem asks for the derivative of the function <span className="font-mono bg-gray-100 dark:bg-slate-800 px-1 py-0.5 rounded text-primary">f(x) = x² * sin(x)</span>. This requires using the <strong className="text-primary">Product Rule</strong> because we have two functions multiplied together.
                </p>
                <div className="mt-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 flex-shrink-0" />
                    <span><strong>Hint:</strong> The product rule states that (uv)' = u'v + uv'.</span>
                  </p>
                </div>
              </div>

              <div className="relative pl-8 border-l-2 border-primary/30 dark:border-primary/20 pb-2">
                <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-gray-300 dark:bg-gray-600 border-4 border-white dark:border-slate-900"></div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Differentiate each term</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Let <span className="font-mono bg-gray-100 dark:bg-slate-800 px-1 py-0.5 rounded">u = x²</span> and <span className="font-mono bg-gray-100 dark:bg-slate-800 px-1 py-0.5 rounded">v = sin(x)</span>.
                  <br/>Find <span className="font-mono">u'</span> and <span className="font-mono">v'</span>.
                </p>
                <button className="mt-3 text-xs text-primary font-medium hover:underline flex items-center gap-1">
                  <span>Reveal Answer</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              <div className="relative pl-8 border-l-2 border-transparent pb-2 opacity-50">
                <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-gray-200 dark:bg-slate-700 border-4 border-white dark:border-slate-900"></div>
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">Combine using the formula</h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  Substitute the values back into the product rule equation.
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800/50 flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-gray-400">Is this explanation helpful?</span>
              <div className="flex gap-2">
                <button className="p-1.5 hover:bg-white dark:hover:bg-slate-600 rounded-full text-gray-400 hover:text-green-500 transition-colors">
                  <ThumbsUp className="w-5 h-5" />
                </button>
                <button className="p-1.5 hover:bg-white dark:hover:bg-slate-600 rounded-full text-gray-400 hover:text-red-500 transition-colors">
                  <ThumbsDown className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="mt-8 mb-12">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Library className="w-6 h-6 text-primary" />
          Related Learning Modules
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Module 1 */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md hover:border-primary/50 dark:hover:border-primary/50 transition-all cursor-pointer group">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 relative">
              <img alt="Calculus Pattern" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" />
              <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/80 px-2 py-1 rounded text-xs font-bold text-gray-800 dark:text-gray-200 backdrop-blur-sm">
                15 mins
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Calculus</span>
                <span className="h-1 w-1 bg-gray-300 rounded-full"></span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Intermediate</span>
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">Mastering the Product Rule</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">Learn when and how to apply the product rule in differentiation with practical examples.</p>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div className="flex -space-x-2">
                    <div className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-gray-200"></div>
                  <div className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-gray-300"></div>
                  <div className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-[10px] text-gray-500">+12</div>
                </div>
                <span className="text-xs font-medium text-primary flex items-center">
                  Start Now <ArrowRight className="w-3 h-3 ml-1" />
                </span>
              </div>
            </div>
          </div>

          {/* Module 2 */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md hover:border-primary/50 dark:hover:border-primary/50 transition-all cursor-pointer group">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 relative">
              <img alt="Trigonometry" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" src="https://images.unsplash.com/photo-1596495578065-6e0763fa1178?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" />
              <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/80 px-2 py-1 rounded text-xs font-bold text-gray-800 dark:text-gray-200 backdrop-blur-sm">
                20 mins
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-green-500 uppercase tracking-wider">Trigonometry</span>
                <span className="h-1 w-1 bg-gray-300 rounded-full"></span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Beginner</span>
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">Derivatives of Trig Functions</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">A comprehensive guide to remembering and applying derivatives of sin, cos, and tan.</p>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-gray-200"></div>
                </div>
                <span className="text-xs font-medium text-primary flex items-center">
                  Start Now <ArrowRight className="w-3 h-3 ml-1" />
                </span>
              </div>
            </div>
          </div>

          {/* Module 3 */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md hover:border-primary/50 dark:hover:border-primary/50 transition-all cursor-pointer group">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 relative">
              <div className="w-full h-full bg-gradient-to-tr from-blue-400 to-indigo-500 opacity-80 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Calculator className="w-10 h-10 text-white opacity-50" />
              </div>
              <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/80 px-2 py-1 rounded text-xs font-bold text-gray-800 dark:text-gray-200 backdrop-blur-sm">
                10 mins
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">Algebra</span>
                <span className="h-1 w-1 bg-gray-300 rounded-full"></span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Basic</span>
              </div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">Chain Rule Basics</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">Understand the composition of functions and how to differentiate them effectively.</p>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-gray-200"></div>
                  <div className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-[10px] text-gray-500">+45</div>
                </div>
                <span className="text-xs font-medium text-primary flex items-center">
                  Start Now <ArrowRight className="w-3 h-3 ml-1" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
