import { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  Calculator,
  FlaskConical,
  Dna,
  History,
  Code2,
  Zap,
  Volume2,
  Copy,
  Image as ImageIcon,
  PlusCircle,
  Lightbulb,
  BookOpen,
  PlayCircle,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

// Types for our chat
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string; // We will treat this as HTML/Markdown for the demo
  timestamp: string;
}

export const AiTutorPage = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: `
                <div class="space-y-2">
                    <p class="mb-3 font-medium text-emerald-900 dark:text-emerald-100">Sure! The Product Rule is perfect for this. Let's break it down.</p>
                    <div class="bg-white dark:bg-gray-800 p-3 rounded-lg mb-4 border border-emerald-100 dark:border-gray-700 font-mono text-sm">
                        <p class="text-gray-500 dark:text-gray-400 mb-1">// The Formula</p>
                        <p class="font-semibold text-indigo-600 dark:text-indigo-400">d/dx [u(x) · v(x)] = u'(x)·v(x) + u(x)·v'(x)</p>
                    </div>
                    <ol class="list-decimal pl-5 space-y-2 mb-4 text-sm text-gray-700 dark:text-gray-300">
                        <li>Identify your two functions: <br/> <span class="font-mono bg-white dark:bg-gray-800 px-1 rounded text-primary">u = x²</span> and <span class="font-mono bg-white dark:bg-gray-800 px-1 rounded text-primary">v = sin(x)</span></li>
                        <li>Find the derivative of each: <br/> <span class="font-mono bg-white dark:bg-gray-800 px-1 rounded text-primary">u' = 2x</span> and <span class="font-mono bg-white dark:bg-gray-800 px-1 rounded text-primary">v' = cos(x)</span></li>
                        <li>Plug them into the formula: <br/> <span class="font-mono bg-white dark:bg-gray-800 px-1 rounded text-primary">(2x)·sin(x) + (x²)·cos(x)</span></li>
                    </ol>
                    <p class="text-sm">So, the final derivative is <span class="font-mono font-semibold">2xsin(x) + x²cos(x)</span>. Does that make sense?</p>
                </div>
            `,
            timestamp: '10:24 AM'
        }
    ]);
    const [inputValue, setInputValue] = useState('');

    return (
        <div className="flex h-[calc(100vh-8rem)] bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
            
            {/* Left Sidebar - Subjects */}
            <aside className="w-64 bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 hidden md:flex flex-col">
                <div className="p-4">
                    <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Subjects</h2>
                    <nav className="space-y-1">
                        {[
                            { name: 'Mathematics', icon: Calculator, active: true, color: 'text-primary' },
                            { name: 'Physics', icon: FlaskConical, active: false, color: 'text-slate-600 dark:text-slate-400' },
                            { name: 'Biology', icon: Dna, active: false, color: 'text-slate-600 dark:text-slate-400' },
                            { name: 'History', icon: History, active: false, color: 'text-slate-600 dark:text-slate-400' },
                            { name: 'Comp Sci', icon: Code2, active: false, color: 'text-slate-600 dark:text-slate-400' },
                        ].map((subject) => (
                            <a 
                                key={subject.name}
                                href="#" 
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                                    subject.active 
                                        ? "bg-green-100 dark:bg-green-900/20 text-primary font-medium" 
                                        : "hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
                                )}
                            >
                                <subject.icon className={cn("w-5 h-5", subject.active ? "text-primary" : "text-slate-500")} />
                                {subject.name}
                            </a>
                        ))}
                    </nav>
                </div>
                
                <div className="mt-auto p-4 border-t border-slate-200 dark:border-slate-800">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-4 text-white relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="font-bold text-sm mb-1">Upgrade Plan</h3>
                            <p className="text-xs opacity-90 mb-3">Get unlimited queries & advanced models.</p>
                            <button className="text-xs bg-white text-indigo-600 px-3 py-1.5 rounded-md font-semibold hover:bg-slate-50 transition-colors w-full">View Plans</button>
                        </div>
                        <Zap className="absolute -bottom-4 -right-4 w-24 h-24 text-white opacity-20 rotate-12" />
                    </div>
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col relative bg-white dark:bg-slate-900">
                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-hide">
                    <div className="flex justify-center">
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs px-3 py-1 rounded-full">Today, 10:23 AM</span>
                    </div>

                    {/* Hardcoded Initial User Message */}
                    <div className="flex justify-end gap-3">
                        <div className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 p-4 rounded-2xl rounded-tr-sm max-w-[80%] md:max-w-xl shadow-sm">
                            <p className="leading-relaxed">I'm struggling with this calculus problem: Find the derivative of <span className="font-mono bg-slate-200 dark:bg-slate-700 px-1 rounded">f(x) = x² * sin(x)</span>. Can you explain the product rule step-by-step?</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex-shrink-0 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-xs ring-1 ring-indigo-200 dark:ring-indigo-700">
                            JD
                        </div>
                    </div>

                    {/* AI Response */}
                    {messages.map((msg) => (
                        <div key={msg.id} className={cn("flex gap-3", msg.role === 'user' ? "justify-end" : "justify-start")}>
                             {msg.role === 'assistant' && (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex-shrink-0 flex items-center justify-center text-white shadow-md">
                                    <Bot className="w-5 h-5" />
                                </div>
                             )}
                             
                             <div className={cn("space-y-2 max-w-[90%] md:max-w-2xl", msg.role === 'user' ? "text-right" : "")}>
                                <div className={cn(
                                    "p-5 rounded-2xl shadow-sm",
                                    msg.role === 'assistant' 
                                        ? "bg-primary/10 dark:bg-primary/5 border border-primary/20 text-slate-800 dark:text-slate-100 rounded-tl-sm"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tr-sm"
                                )}>
                                    <div dangerouslySetInnerHTML={{ __html: msg.content }} />
                                </div>
                                
                                {msg.role === 'assistant' && (
                                    <div className="flex gap-2 pl-2">
                                        <button className="text-xs flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                                            <Volume2 className="w-3 h-3" /> Read aloud
                                        </button>
                                        <button className="text-xs flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                                            <Copy className="w-3 h-3" /> Copy
                                        </button>
                                    </div>
                                )}
                             </div>

                             {msg.role === 'user' && (
                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex-shrink-0 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-xs ring-1 ring-indigo-200 dark:ring-indigo-700">
                                    JD
                                </div>
                             )}
                        </div>
                    ))}

                     {/* Second User Message hardcoded for demo flow */}
                     <div className="flex justify-end gap-3">
                        <div className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 p-4 rounded-2xl rounded-tr-sm max-w-[80%] md:max-w-xl shadow-sm">
                            <p className="leading-relaxed">Yes, thank you! What if it was division instead?</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex-shrink-0 flex items-center justify-center text-indigo-600 dark:text-indigo-300 font-bold text-xs ring-1 ring-indigo-200 dark:ring-indigo-700">
                            JD
                        </div>
                    </div>

                    {/* AI Thinking Indicator */}
                    <div className="flex justify-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-700 flex-shrink-0 flex items-center justify-center text-white shadow-md">
                            <Bot className="w-5 h-5 animate-pulse" />
                        </div>
                        <div className="flex items-center gap-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                        </div>
                    </div>
                </div>

                {/* Input Area */}
                <div className="p-4 md:p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 z-10">
                    <div className="max-w-4xl mx-auto relative">
                        {/* Suggestions */}
                        <div className="absolute -top-12 left-0 flex gap-2 overflow-x-auto w-full pb-2 scrollbar-hide">
                            {["Explain the Quotient Rule", "Give me a practice problem", "Visualize the graph"].map((text) => (
                                <button key={text} className="whitespace-nowrap bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs px-3 py-1.5 rounded-full hover:border-primary hover:text-primary dark:hover:border-primary transition-all shadow-sm">
                                    {text}
                                </button>
                            ))}
                        </div>

                        {/* Input Box */}
                        <div className="relative flex items-end bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-2xl shadow-sm focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all">
                            <button className="p-3 text-slate-400 hover:text-primary transition-colors">
                                <PlusCircle className="w-6 h-6" />
                            </button>
                            <textarea 
                                className="w-full bg-transparent border-none focus:ring-0 p-3 pl-0 resize-none max-h-32 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none" 
                                placeholder="Ask a follow-up question or paste a problem..." 
                                rows={1}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                            />
                            <div className="flex items-center gap-1 p-2">
                                <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700" title="Upload Image">
                                    <ImageIcon className="w-5 h-5" />
                                </button>
                                <button className="p-2 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-md transition-colors flex items-center justify-center">
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <p className="text-center text-[10px] text-slate-400 mt-2">AI can make mistakes. Please verify important information.</p>
                    </div>
                </div>
            </main>

            {/* Right Sidebar - Resources */}
            <aside className="w-80 bg-slate-50 dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 hidden lg:flex flex-col p-6 overflow-y-auto">
                <div className="mb-8">
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
                        <Lightbulb className="w-5 h-5 text-primary" />
                        Suggested Follow-up
                    </h3>
                    <div className="space-y-3">
                        <div className="group p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary/50 cursor-pointer transition-all shadow-sm">
                            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium mb-1 group-hover:text-primary transition-colors">Chain Rule Application</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">How do I combine product rule with chain rule for complex functions?</p>
                        </div>
                        <div className="group p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-primary/50 cursor-pointer transition-all shadow-sm">
                            <p className="text-sm text-slate-700 dark:text-slate-300 font-medium mb-1 group-hover:text-primary transition-colors">Trig Identities</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">List common derivatives for tan(x), sec(x), and cot(x).</p>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
                        <BookOpen className="w-5 h-5 text-blue-500" />
                        Related Resources
                    </h3>
                    <div className="space-y-4">
                        <a href="#" className="flex gap-3 group">
                            <div className="w-12 h-12 rounded-lg bg-slate-200 dark:bg-slate-700 flex-shrink-0 overflow-hidden relative">
                                <img alt="Calculus Textbook" className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform" src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:underline">Calculus I: Chapter 3</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">PDF • 2.4 MB</p>
                            </div>
                        </a>
                        <a href="#" className="flex gap-3 group">
                            <div className="w-12 h-12 rounded-lg bg-red-100 dark:bg-red-900/30 flex-shrink-0 flex items-center justify-center text-red-500">
                                <PlayCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:underline">Product Rule Visualized</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Video • 5:20 min</p>
                            </div>
                        </a>
                        <a href="#" className="flex gap-3 group">
                            <div className="w-12 h-12 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex-shrink-0 flex items-center justify-center text-indigo-500">
                                <HelpCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:underline">Derivatives Quiz</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">10 Questions • Easy</p>
                            </div>
                        </a>
                    </div>
                </div>

                <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Daily Goal</span>
                        <span className="text-sm font-bold text-primary">85%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div className="bg-primary h-2 rounded-full w-[85%]"></div>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 text-center">Keep going! You're on a 3-day streak.</p>
                </div>
            </aside>
        </div>
    );
};
