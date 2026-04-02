import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  PanelLeftClose,
  PanelLeftOpen,
  Loader2,
  ChevronLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { useAiTutor } from '@/features/ai-tutor/hooks/useAiTutor';
import ReactMarkdown from 'react-markdown';
import { usePlanGate } from '@/hooks/usePlanGate';
import { toast } from 'sonner';









export const AiTutorPage = () => {
    const navigate = useNavigate();
    const [showHistory, setShowHistory] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [inputValue, setInputValue] = useState('');
    const [activeSubject, setActiveSubject] = useState(''); // E.g., Mathematics
    const [activeTopic, setActiveTopic] = useState('');
    const [selectedImages, setSelectedImages] = useState<{data: string, mimeType: string}[]>([]);
    
    const { hasAccess } = usePlanGate('unlimited_ai');

    // Connect to AI useAiTutor Hook
    const {
        messages,
        sessionHistory,
        isStreaming,
        streamingContent,
        sendMessage,
        initializeChat,
        currentSessionId,
        queriesUsed,
        maxQueries,
    } = useAiTutor(activeSubject, activeTopic);

    const scrollRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, streamingContent]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    const base64String = (event.target.result as string).split(',')[1];
                    setSelectedImages(prev => [...prev, { data: base64String, mimeType: file.type }]);
                }
            };
            reader.readAsDataURL(file);
        });
        
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSend = async () => {
        if ((!inputValue.trim() && selectedImages.length === 0) || isStreaming) return;

        // Soft limit for free users: restrict to a certain number of messages per session
        if (!hasAccess && messages.length >= 6) {
            toast.info('Free tier AI limit reached for this session.', {
              description: 'Please upgrade your plan in Settings to unlock unlimited AI queries.',
              action: {
                label: 'Upgrade',
                onClick: () => navigate('/student/settings'),
              },
            });
            return;
        }

        const msg = inputValue;
        const imgs = [...selectedImages];
        setInputValue('');
        setSelectedImages([]);
        await sendMessage(msg, imgs.length > 0 ? imgs : undefined);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'; 
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [inputValue]);

    return (
        <div className="flex flex-col md:flex-row h-full w-full bg-slate-50 dark:bg-slate-900 overflow-hidden">
            {/* Mobile Header */}
            <div className="md:hidden flex flex-col p-4 gap-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 flex-shrink-0 z-50 shadow-sm">
                {/* Top Row: Back Button, Title, History */}
                <div className="flex items-center justify-between">
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900"
                    >
                        <ChevronLeft className="w-5 h-5 mr-1" />
                        Back
                    </button>
                    <span className="font-bold text-slate-900 dark:text-white">AI Tutor</span>
                    <button 
                        onClick={() => setShowHistory(!showHistory)}
                        className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                    >
                        <History className="w-5 h-5" />
                    </button>
                </div>
                
                {/* Bottom Row: Subject & Topic Inputs */}
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Subject..."
                        value={activeSubject}
                        onChange={(e) => setActiveSubject(e.target.value)}
                        className="w-1/2 p-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-primary shadow-sm"
                    />
                    <input 
                        type="text"
                        placeholder="Topic..."
                        value={activeTopic}
                        onChange={(e) => setActiveTopic(e.target.value)}
                        className="w-1/2 p-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:border-primary shadow-sm"
                    />
                </div>
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
                        <button 
                            onClick={async () => {
                                const info = await initializeChat();
                                if (info) {
                                    setActiveSubject(info.subject || '');
                                    setActiveTopic(info.topic || '');
                                }
                                setShowHistory(false);
                            }}
                            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-all mb-4"
                        >
                            <PlusCircle className="w-5 h-5" /> New Chat
                        </button>
                        
                        {sessionHistory.length === 0 ? (
                            <p className="text-sm text-center text-slate-500 py-10">No recent history.</p>
                        ) : (
                                sessionHistory.map((session) => (
                                    <button 
                                        key={session.id}
                                        onClick={async () => {
                                            const info = await initializeChat(session.id);
                                            if (info) {
                                                setActiveSubject(info.subject || '');
                                                setActiveTopic(info.topic || '');
                                            }
                                            setShowHistory(false);
                                        }}
                                        className={cn(
                                            "w-full text-left p-3 rounded-lg text-sm truncate transition-colors border",
                                            currentSessionId === session.id 
                                                ? "bg-primary/10 text-primary border-primary/20 font-medium" 
                                                : "bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300"
                                        )}
                                    >
                                        {session.title || 'Conversation'}
                                    </button>
                                ))
                        )}
                    </div>
                </div>
            )}
            
            {/* Left Sidebar (Desktop) */}
            <aside className={cn(
                "hidden md:flex flex-col border-r border-slate-200/50 dark:border-slate-800/50 transition-all duration-300 bg-slate-50/50 dark:bg-slate-900/20",
                isSidebarOpen ? "w-64" : "w-0 opacity-0 overflow-hidden"
            )}>
                <div className="p-4 flex-1 flex flex-col min-h-0">
                    <button 
                        onClick={async () => {
                            const info = await initializeChat();
                            if (info) {
                                setActiveSubject(info.subject || '');
                                setActiveTopic(info.topic || '');
                            }
                        }}
                        className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-primary text-white font-medium hover:bg-primary/90 transition-all mb-6 shadow-sm"
                    >
                        <PlusCircle className="w-5 h-5" /> New Chat
                    </button>

                    <div className="flex-1 overflow-y-auto pr-2">
                        <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 px-1">Recent History</h2>
                        <div className="space-y-1">
                            {sessionHistory.length === 0 ? (
                                <p className="text-sm text-center text-slate-500 py-4">No recent history.</p>
                            ) : (
                                sessionHistory.map((session) => (
                                    <button 
                                        key={session.id}
                                        onClick={async () => {
                                            const info = await initializeChat(session.id);
                                            if (info) {
                                                setActiveSubject(info.subject || '');
                                                setActiveTopic(info.topic || '');
                                            }
                                        }}
                                        className={cn(
                                            "w-full text-left p-2 rounded-lg text-sm truncate transition-colors",
                                            currentSessionId === session.id 
                                                ? "bg-primary/10 text-primary font-medium" 
                                                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                        )}
                                    >
                                        {session.title || 'Conversation'}
                                    </button>
                                ))
                            )}
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
            <main className="flex-1 flex flex-col relative bg-white dark:bg-slate-950 min-h-0 w-full overflow-hidden">
                {/* Desktop Toggle Sidebar Button */}
                <div className="hidden md:flex flex-col absolute top-4 left-4 z-10 gap-1">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white shadow-sm transition-colors"
                        >
                            {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
                        </button>
                        
                        <input
                            type="text"
                            placeholder="Subject (e.g. Math)"
                            value={activeSubject}
                            onChange={(e) => setActiveSubject(e.target.value)}
                            className="p-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm focus:outline-none focus:border-primary w-48"
                        />

                        <input 
                            type="text"
                            placeholder="Topic (e.g. Calculus)"
                            value={activeTopic}
                            onChange={(e) => setActiveTopic(e.target.value)}
                            className="p-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm focus:outline-none focus:border-primary w-64"
                        />
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 ml-[3.25rem]">
                        Tip: Provide Subject and Topic for better AI accuracy.
                    </span>
                </div>

                <ScrollToTop scrollableRef={scrollRef} className="bottom-24 right-4 md:bottom-28 md:right-8 lg:right-auto lg:left-1/2" />

                {/* Messages Area */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 pt-4 md:pt-20 pb-20 md:pb-4 flex flex-col"
                >
                    {!hasAccess && (
                        <div className="w-full bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-500 p-3 rounded-lg text-sm flex items-center justify-center gap-2 mt-4 md:mt-0">
                            <Zap className="w-4 h-4" />
                            <span>You are on the Free Plan. AI queries are limited to 3 per session. <a href="/student/settings" className="font-bold underline">Upgrade Plan</a> to unlock unlimited AI.</span>
                        </div>
                    )}
                    {messages.length === 0 ? (
                        <div className="my-auto flex flex-col items-center justify-center text-center max-w-2xl mx-auto px-4 w-full">
                            <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-8 shadow-sm">
                                <Bot className="w-10 h-10" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 font-display">How can I help you today?</h2>
                            <p className="text-slate-500 dark:text-slate-400 mb-10 text-lg">I'm your personal AI Tutor. Ask me anything, or try an example below.</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                                <button onClick={() => sendMessage("Explain calculus limits to me like I'm 5.")} className="text-left p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 hover:border-primary/50 hover:shadow-md transition-all text-sm text-slate-600 dark:text-slate-400">
                                    <span className="block font-semibold text-slate-800 dark:text-slate-200 mb-2">Concept Explanation</span>
                                    "Explain calculus limits to me like I'm 5."
                                </button>
                                <button onClick={() => sendMessage("Give me 3 practice problems for mitosis.")} className="text-left p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900 hover:border-primary/50 hover:shadow-md transition-all text-sm text-slate-600 dark:text-slate-400">
                                    <span className="block font-semibold text-slate-800 dark:text-slate-200 mb-2">Practice Problems</span>
                                    "Give me 3 practice problems for mitosis."
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto w-full space-y-8">
                            {messages.map((msg, index) => (
                                <div key={msg.timestamp || index} className={cn("flex gap-4 group", msg.role === 'user' ? "flex-row-reverse" : "")}>
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
                                            "p-4 rounded-2xl md:prose-lg prose-sm prose dark:prose-invert max-w-none flex flex-col gap-3",
                                            msg.role === 'assistant'
                                                ? "bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-800 rounded-tl-sm shadow-sm"
                                                : "bg-primary text-white rounded-tr-sm shadow-md text-left"
                                        )}>
                                            {/* Render images if any */}
                                            {msg.images && msg.images.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {msg.images.map((img, i) => (
                                                        <img key={i} src={`data:${img.mimeType};base64,${img.data}`} alt="uploaded" className="max-w-[200px] max-h-[200px] rounded-lg object-cover" />
                                                    ))}
                                                </div>
                                            )}
                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        </div>

                                        {msg.role === 'assistant' && (
                                            <div className="flex gap-2 pl-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                                                    <Volume2 className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => navigator.clipboard.writeText(msg.content)} className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {isStreaming && (
                                <div className="flex gap-4 group">
                                    <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white shadow-sm mt-1">
                                        <Bot className="w-5 h-5 animate-pulse" />
                                    </div>
                                    <div className="max-w-[85%] md:max-w-3xl">
                                        <div className="p-4 rounded-2xl bg-slate-50 da              rk:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-800 rounded-tl-sm shadow-sm md:prose-lg prose-sm prose dark:prose-invert max-w-none">
                                            {streamingContent ? (
                                                <ReactMarkdown>{streamingContent}</ReactMarkdown>
                                            ) : (
                                                <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 md:px-6 md:pb-2 md:pt-4 bg-transparent z-10 max-w-4xl mx-auto w-full sticky bottom-0">
                    <div className="relative flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary transition-all">
                        
                        {/* Selected Images Preview */}
                        {selectedImages.length > 0 && (
                            <div className="flex gap-2 p-4 pb-0 overflow-x-auto">
                                {selectedImages.map((img, idx) => (
                                    <div key={idx} className="relative w-20 h-20 flex-shrink-0 group">
                                        <img src={`data:${img.mimeType};base64,${img.data}`} alt="preview" className="w-full h-full object-cover rounded-lg border border-slate-200" />
                                        <button 
                                            onClick={() => removeImage(idx)}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex items-end">
                            <button onClick={() => fileInputRef.current?.click()} className="p-4 text-slate-400 hover:text-primary transition-colors flex-shrink-0">
                                <PlusCircle className="w-6 h-6" />
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                className="hidden" 
                                accept="image/*"
                                multiple
                                onChange={handleFileChange}
                            />
                            <textarea 
                                ref={textareaRef}
                                className="w-full bg-transparent border-none focus:ring-0 p-4 pl-0 resize-none min-h-[56px] max-h-[200px] text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none" 
                                placeholder="Message AI Tutor..." 
                                rows={1}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                style={{ height: 'auto', minHeight: '56px' }}
                            />
                            <div className="flex items-center gap-2 p-3 flex-shrink-0">
                                <button onClick={() => fileInputRef.current?.click()} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors rounded-xl hover:bg-slate-100 dark:bg-slate-800 md:block hidden" title="Upload Image">
                                    <ImageIcon className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={handleSend}
                                    disabled={isStreaming || (!inputValue.trim() && selectedImages.length === 0)}
                                    className={cn(
                                    "p-2 rounded-xl transition-all flex items-center justify-center",
                                    (inputValue.trim() || selectedImages.length > 0) && !isStreaming
                                        ? "bg-primary hover:bg-primary-dark text-white shadow-md"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                                )}>
                                    {isStreaming ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-center text-xs text-slate-400 mt-1.5 hidden md:block">AI can make mistakes. Consider verifying important information.</p>
                      {!hasAccess && (
                        <p className="text-center text-xs text-slate-400 mt-1.5 hidden md:block">
                          Queries used today: {queriesUsed}/{maxQueries}
                        </p>
                      )}
                    </div>
                </div>
            </main>
        </div>
    );
};
