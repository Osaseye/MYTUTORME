import { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  History,
  Zap,
  Volume2,
  Copy,
  Image as ImageIcon,
  PlusCircle,
  X,
  MessageSquarePlus,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollToTop } from '@/components/ui/scroll-to-top';

// Types for our chat
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const AiTutorPage = () => {
    const [messages] = useState<Message[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [inputValue, setInputValue] = useState('');
    
    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'; 
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [inputValue]);

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] gap-0 relative bg-white dark:bg-slate-950">
            
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 absolute top-0 left-0 right-0 z-20">
                <button 
                    onClick={() => setShowHistory(!showHistory)}
                    className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                    <History className="w-5 h-5 text-primary" />
                    <span>History</span>
                </button>
                <button className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700">
                    <MessageSquarePlus className="w-5 h-5" />
                </button>
            </div>

            {/* Mobile History Drawer */}
            {showHistory && (
                <div className="absolute inset-0 z-30 bg-white dark:bg-slate-900 p-4 animate-in slide-in-from-top-10 md:hidden flex flex-col">
                    <div className="flex items-center justify-between mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                        <h2 className="font-bold text-lg">Chat History</h2>
                        <button onClick={() => setShowHistory(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2">
                        <button className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-all mb-4">
                            <PlusCircle className="w-5 h-5" /> New Chat
                        </button>
                        
                        {messages.length === 0 ? (
                            <p className="text-sm text-center text-slate-500 py-10">No recent history.</p>
                        ) : null}
                    </div>
                </div>
            )}
            
            {/* Left Sidebar (Desktop) */}
            <aside className={cn(
                "hidden md:flex flex-col border-r border-slate-200/50 dark:border-slate-800/50 transition-all duration-300 bg-slate-50/50 dark:bg-slate-900/20",
                isSidebarOpen ? "w-64" : "w-0 opacity-0 overflow-hidden"
            )}>
                <div className="p-4 flex-1 flex flex-col min-h-0">
                    <button className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-all mb-6 shadow-sm">
                        <PlusCircle className="w-5 h-5" /> New Chat
                    </button>

                    <div className="flex-1 overflow-y-auto pr-2">
                        <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-1">Recent History</h2>
                        <div className="space-y-1">
                            {messages.length === 0 ? (
                                <p className="text-sm text-center text-slate-500 py-4">No recent history.</p>
                            ) : null}
                        </div>
                    </div>
                </div>
                
                <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50">
                    <div className="bg-gradient-to-br from-primary to-indigo-600 rounded-xl p-4 text-white relative overflow-hidden group cursor-pointer hover:shadow-md transition-all">
                        <div className="relative z-10">
                            <h3 className="font-bold text-sm mb-1 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-300" />
                                Upgrade Plan
                            </h3>
                            <p className="text-xs opacity-90">Unlock advanced AI models</p>
                        </div>
                        <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/20 rounded-full group-hover:scale-150 transition-transform duration-500" />
                    </div>
                </div>
            </aside>

            {/* Main Chat Area */}
            <main className="flex-1 flex flex-col relative h-full bg-white dark:bg-slate-950">
                {/* Desktop Toggle Sidebar Button */}
                <div className="hidden md:flex absolute top-4 left-4 z-10">
                    <button 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white shadow-sm transition-colors"
                    >
                        {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
                    </button>
                </div>

                <ScrollToTop scrollableRef={scrollRef} className="bottom-24 right-4 md:bottom-28 md:right-8 lg:right-auto lg:left-1/2" />

                {/* Messages Area */}
                <div 
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 pt-20 md:pt-16 pb-32 md:pb-8 flex flex-col"
                >
                    {messages.length === 0 ? (
                        <div className="my-auto flex flex-col items-center justify-center text-center max-w-2xl mx-auto px-4 w-full">
                            <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-8 shadow-sm">
                                <Bot className="w-10 h-10" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 font-display">How can I help you today?</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-10 text-lg">I'm your personal AI Tutor. Ask me anything, or try an example below.</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                <button onClick={() => setInputValue("Explain calculus limits to me like I'm 5.")} className="text-left p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 hover:border-primary/50 hover:shadow-md transition-all text-sm text-slate-600 dark:text-slate-400">
                                    <span className="block font-semibold text-slate-800 dark:text-slate-200 mb-2">Concept Explanation</span>
                                    "Explain calculus limits to me like I'm 5."
                                </button>
                                <button onClick={() => setInputValue("Give me 3 practice problems for mitosis.")} className="text-left p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 hover:border-primary/50 hover:shadow-md transition-all text-sm text-slate-600 dark:text-slate-400">
                                    <span className="block font-semibold text-slate-800 dark:text-slate-200 mb-2">Practice Problems</span>
                                    "Give me 3 practice problems for mitosis."
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto w-full space-y-8">
                            {messages.map((msg) => (
                                <div key={msg.id} className={cn("flex gap-4 group", msg.role === 'user' ? "flex-row-reverse" : "")}>
                                    {msg.role === 'assistant' && (
                                        <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white shadow-sm mt-1">
                                            <Bot className="w-5 h-5" />
                                        </div>
                                    )}
                                    {msg.role === 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xs shadow-sm mt-1">
                                            Me
                                        </div>
                                    )}
                                    
                                    <div className={cn(
                                        "max-w-[85%] md:max-w-3xl", 
                                        msg.role === 'user' ? "text-right" : ""
                                    )}>
                                        <div className={cn(
                                            "p-4 rounded-2xl",
                                            msg.role === 'assistant' 
                                                ? "bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-800 rounded-tl-sm shadow-sm"
                                                : "bg-primary text-white rounded-tr-sm shadow-md text-left"
                                        )}>
                                            <div dangerouslySetInnerHTML={{ __html: msg.content }} />
                                        </div>
                                        
                                        {msg.role === 'assistant' && (
                                            <div className="flex gap-2 pl-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                                                    <Volume2 className="w-4 h-4" />
                                                </button>
                                                <button className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 md:p-6 bg-transparent z-10 max-w-4xl mx-auto w-full sticky bottom-0">
                    <div className="relative flex items-end bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary transition-all">
                        <button className="p-4 text-slate-400 hover:text-primary transition-colors flex-shrink-0">
                            <PlusCircle className="w-6 h-6" />
                        </button>
                        <textarea 
                            ref={textareaRef}
                            className="w-full bg-transparent border-none focus:ring-0 p-4 pl-0 resize-none min-h-[56px] max-h-[200px] text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none" 
                            placeholder="Message AI Tutor..." 
                            rows={1}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            style={{ height: 'auto', minHeight: '56px' }}
                        />
                        <div className="flex items-center gap-2 p-3 flex-shrink-0">
                            <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-xl hover:bg-slate-100 dark:bg-slate-800 md:block hidden" title="Upload Image">
                                <ImageIcon className="w-5 h-5" />
                            </button>
                            <button className={cn(
                                "p-2 rounded-xl transition-all flex items-center justify-center",
                                inputValue.trim() 
                                    ? "bg-primary hover:bg-primary-dark text-white shadow-md"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                            )}>
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <p className="text-center text-xs text-slate-400 mt-3 hidden md:block">AI can make mistakes. Consider verifying important information.</p>
                </div>
            </main>
        </div>
    );
};
