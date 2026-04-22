import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, 
  Sparkles, 
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
  ChevronLeft,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { useAiTutor } from '@/features/ai-tutor/hooks/useAiTutor';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { usePlanGate } from '@/hooks/usePlanGate';
import { toast } from 'sonner';
import { useAuthStore } from '@/features/auth/hooks/useAuth';
import { uploadFilesToStorage } from '@/utils/storageUploadService';
import { FreePlanUsageCard } from '@/components/shared/FreePlanUsageCard';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '@/lib/firebase';

const StorageImagePreview = ({ img }: { img: any }) => {
    const [url, setUrl] = useState<string>('');
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!img.storagePath) return;
        getDownloadURL(ref(storage, img.storagePath))
            .then(setUrl)
            .catch((e) => {
                console.error("Link fetch error:", e);
                setError(true);
            });
    }, [img.storagePath]);

    if (error || !img.mimeType?.startsWith('image/')) {
        return (
            <div className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <FileText className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-500">{img.name || 'Document'}</span>
            </div>
        );
    }

    if (!url) {
        return <div className="w-[150px] h-[150px] animate-pulse bg-slate-200 dark:bg-slate-800 rounded-lg" />;
    }

    return (
        <img 
            src={url} 
            alt={img.name || "uploaded"} 
            className="max-w-[200px] max-h-[200px] rounded-lg object-cover shadow-sm" 
        />
    );
};

const FilePreview = ({ file, onRemove }: { file: File, onRemove: () => void }) => {
  const [url, setUrl] = useState<string>('');
  useEffect(() => {
    if (file.type && file.type.startsWith('image/')) {
      const u = URL.createObjectURL(file);
      setUrl(u);
      return () => URL.revokeObjectURL(u);
    }
  }, [file]);
  return (
    <div className="relative w-16 h-16 flex-shrink-0 group rounded-xl overflow-visible flex items-center justify-center">
        <div className="w-full h-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
            {file.type && file.type.startsWith('image/') && url ? (
                <img src={url} alt="preview" className="w-full h-full object-cover" />
            ) : (
                <div className="flex flex-col items-center p-1 text-center">
                    <FileText className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-[10px] text-slate-600 dark:text-slate-400 line-clamp-2 break-all">{file.name || 'File'}</span>
                </div>
            )}
        </div>
        <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove(); }} className="absolute -top-2 -right-2 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-20 hover:bg-black"><X className="w-3 h-3" /></button>
    </div>
  );
};
export const AiTutorPage = () => {
    const navigate = useNavigate();
    const [showHistory, setShowHistory] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [inputValue, setInputValue] = useState('');
    const [activeSubject, setActiveSubject] = useState(''); // E.g., Mathematics
    const [activeTopic, setActiveTopic] = useState('');
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [isUploadingImages, setIsUploadingImages] = useState(false);
    
    const { user } = useAuthStore();
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

        setSelectedImages(prev => {
            const newFiles = [...prev, ...Array.from(files)];
            if (newFiles.length > 5) {
                toast.error('You can only upload a maximum of 5 files per message.');
                return newFiles.slice(0, 5);
            }
            return newFiles;
        });
        
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSend = async () => {
        if ((!inputValue.trim() && selectedImages.length === 0) || isStreaming || isUploadingImages) return;

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
        
        let finalImages: { storagePath?: string, mimeType: string, name: string }[] | undefined = undefined;
        
        if (imgs.length > 0) {
            if (!user) {
                toast.error('You must be logged in to upload images');
                return;
            }
            setIsUploadingImages(true);
            try {
                const storagePaths = await uploadFilesToStorage(imgs, user.uid, 'ai-tutor-images');
                finalImages = storagePaths.map((path, idx) => ({
                    storagePath: path,
                    mimeType: imgs[idx].type || 'image/jpeg',
                    name: imgs[idx].name
                }));
            } catch (err: any) {
                toast.error('Failed to upload images: ' + err.message);
                setIsUploadingImages(false);
                return;
            }
        }
        
        setIsUploadingImages(false);
        setSelectedImages([]);
        await sendMessage(msg, finalImages);
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
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto px-4 w-full flex-1 mb-[20vh] transition-all duration-700 animate-in fade-in zoom-in-95 mt-8 md:mt-16">
                            {!hasAccess && (
                                <FreePlanUsageCard 
                                    currentUsage={queriesUsed} 
                                    maxLimit={3} 
                                    variant="default" 
                                    description="Your AI queries are limited per session. Unlock the full power of Nova with unlimited access." 
                                />
                            )}
                            <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
                               <img src="/nova.png" alt="Nova AI" className="w-[50px] h-[50px] md:w-[60px] md:h-[60px] object-contain drop-shadow-[0_0_15px_rgba(34,197,94,0.3)] animate-pulse" />
                               <h1 className="text-3xl md:text-[2.75rem] text-slate-800 dark:text-slate-200 font-[400] font-serif tracking-tight leading-none">
                                  Happy {new Date().toLocaleDateString('en-US', { weekday: 'long' })}, {user?.displayName?.split(' ')[0] || 'there'}
                               </h1>
                            </div>
                        </div>
          ) : (
                        <div className="max-w-4xl mx-auto w-full space-y-8">
                            {!hasAccess && (
                                <div className="mb-4">
                                    <FreePlanUsageCard 
                                        currentUsage={queriesUsed} 
                                        maxLimit={3} 
                                        variant="compact" 
                                    />
                                </div>
                            )}
                            {messages.map((msg, index) => (
                                <div key={msg.timestamp || index} className={cn("flex gap-4 group", msg.role === 'user' ? "flex-row-reverse" : "")}>
                                    {msg.role === 'assistant' && (
                                        <div className="w-8 h-8 rounded-full bg-emerald-50 max-h-8 max-w-8 flex-shrink-0 flex items-center justify-center text-white shadow-sm mt-1 ring-1 ring-emerald-200">
                                            <img src="/nova.png" alt="Nova AI" className="w-5 h-5 object-contain" />
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
                                                        img.data ? (
                                                            <img key={i} src={`data:${img.mimeType};base64,${img.data}`} alt="uploaded" className="max-w-[200px] max-h-[200px] rounded-lg object-cover" />                                                          ) : img.storagePath ? (
                                                              <StorageImagePreview key={i} img={img} />                                                        ) : (
                                                            <div key={i} className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                                                <ImageIcon className="w-4 h-4 text-slate-400" />
                                                              <span className="text-xs text-slate-500">{(img as any).name || 'Attached Image'}</span>
                                                            </div>
                                                        )
                                                    ))}
                                                </div>
                                            )}
                                            {/* AI Markdown formatting rules */}
                                                                                        <ReactMarkdown
                                                                                            remarkPlugins={[remarkGfm]}
                                                                                            rehypePlugins={[rehypeHighlight]}
                                                                                            components={{
                                                                                                code({ inline, className, children, ...props }: any) {
                                                  return inline ? (
                                                    <code className="inline-code bg-slate-200 dark:bg-slate-800 text-primary px-1 rounded" {...props}>{children}</code>
                                                  ) : (
                                                    <div className="code-block relative group/code mt-2 mb-2">
                                                      <button 
                                                        onClick={() => navigator.clipboard.writeText(String(children))}
                                                        className="absolute right-2 top-2 p-1.5 bg-slate-700/50 hover:bg-slate-700 text-white rounded opacity-0 group-hover/code:opacity-100 transition-opacity"
                                                      >
                                                        Copy
                                                      </button>
                                                      <code className={cn(className, "block p-4 bg-slate-900 rounded-lg text-sm overflow-x-auto")} {...props}>{children}</code>
                                                    </div>
                                                  );
                                                },
                                                table: ({ children }) => (
                                                  <div className="table-wrapper overflow-x-auto bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg my-4">
                                                    <table className="w-full text-left border-collapse">{children}</table>
                                                  </div>
                                                ),
                                                th: ({ children }) => <th className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-semibold">{children}</th>,
                                                td: ({ children }) => <td className="p-3 border-b border-slate-100 dark:border-slate-800">{children}</td>
                                              }}
                                            >
                                              {msg.content}
                                            </ReactMarkdown>
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

                            {isStreaming && !streamingContent && (
                                <div className="flex gap-4 group">
                                    <div className="w-8 h-8 max-w-8 max-h-8 rounded-full bg-emerald-50 flex-shrink-0 flex items-center justify-center text-white shadow-sm mt-1 ring-1 ring-emerald-200">
                                        <img src="/nova.png" alt="Nova AI" className="w-5 h-5 object-contain animate-pulse" />
                                    </div>
                                    <div className="max-w-[85%] md:max-w-3xl">
                                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-800 rounded-tl-sm shadow-sm flex items-center">
                                            <div className="flex items-center justify-center gap-[5px] h-6 px-1">
                                                <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 animate-bounce [animation-delay:-0.3s]" />
                                                <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 animate-bounce [animation-delay:-0.15s]" />
                                                <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 animate-bounce" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className={cn(
                  "p-4 md:px-6 md:pb-6 md:pt-4 bg-transparent z-10 max-w-4xl mx-auto w-full sticky bottom-0 transition-all duration-700",
                  messages.length === 0 ? "md:-translate-y-32" : ""
                )}>
                    <div className="relative flex flex-col bg-white dark:bg-[#202020] border border-slate-200 dark:border-white/10 rounded-3xl shadow-sm focus-within:ring-2 focus-within:ring-slate-300 dark:focus-within:ring-slate-700 focus-within:border-transparent transition-all overflow-hidden min-h-[60px]">
                        
                        {/* Selected Images Preview */}
                        {selectedImages.length > 0 && (
                            <div className="flex gap-2 p-4 pb-0 overflow-x-auto scrollbar-hide">
                                {selectedImages.map((img, idx) => (<FilePreview key={idx} file={img} onRemove={() => removeImage(idx)} />))}
                            </div>
                        )}

                        <div className="flex items-end">
                            <button onClick={() => fileInputRef.current?.click()} className="p-3 m-1.5 ml-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors rounded-full hover:bg-slate-200 dark:hover:bg-[#333] flex-shrink-0" title="Add File">
                                <PlusCircle className="w-6 h-6 stroke-[1.5]" />
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                className="hidden" 
                                accept="image/*, .pdf, .doc, .docx, .txt"
                                multiple
                                onChange={handleFileChange}
                            />
                            <textarea 
                                ref={textareaRef}
                                className="w-full bg-transparent border-none focus:ring-0 p-4 pl-1 resize-none text-[15px] font-medium leading-relaxed max-h-[40vh] overflow-y-auto text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none" 
                                placeholder="How can I help you today?" 
                                rows={1}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isStreaming || isUploadingImages}
                                style={{ minHeight: '24px' }}
                            />
                            <div className="flex items-center gap-2 p-2 pr-3 mb-1 flex-shrink-0">
                                {messages.length === 0 && (
                                    <button type="button" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#333] text-xs font-medium text-slate-500 dark:text-slate-400 transition-colors mr-1">
                                        Nova 4.6 Adaptive <ChevronLeft className="w-3 h-3 -rotate-90" />
                                    </button>
                                )}
                                <button 
                                    onClick={handleSend}
                                    disabled={isStreaming || (!inputValue.trim() && selectedImages.length === 0)}
                                    className={cn(
                                    "p-2 rounded-full transition-all flex items-center justify-center shadow-sm",
                                    (inputValue.trim() || selectedImages.length > 0) && !isStreaming
                                        ? "bg-slate-800 dark:bg-white text-white dark:text-black hover:scale-105"
                                        : "bg-slate-100 dark:bg-[#333] text-slate-400 dark:text-slate-500"
                                )}>
                                    {isStreaming ? <Loader2 className="w-4 h-4 animate-spin text-slate-800 dark:text-white" /> : <Send className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {messages.length === 0 && (
                        <div className="flex flex-wrap items-center justify-center gap-2 mt-6 max-w-3xl mx-auto opacity-100 animate-in fade-in duration-500">
                            <button onClick={() => { setInputValue("Help me write an essay on: "); textareaRef.current?.focus(); }} className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 dark:border-[#333] bg-white dark:bg-[#1a1a1a] hover:bg-slate-50 dark:hover:bg-[#222] text-[13px] font-medium text-slate-600 dark:text-slate-300 transition-all shadow-sm hover:shadow-md">
                                <FileText className="w-4 h-4 text-emerald-500" />
                                Write
                            </button>
                            <button onClick={() => { setInputValue("Explain this concept to me simply: "); textareaRef.current?.focus(); }} className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 dark:border-[#333] bg-white dark:bg-[#1a1a1a] hover:bg-slate-50 dark:hover:bg-[#222] text-[13px] font-medium text-slate-600 dark:text-slate-300 transition-all shadow-sm hover:shadow-md">
                                <Zap className="w-4 h-4 text-orange-500" />
                                Learn
                            </button>
                            <button onClick={() => { setInputValue("Help me debug this code snippet: \n\n```\n\n```"); textareaRef.current?.focus(); }} className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 dark:border-[#333] bg-white dark:bg-[#1a1a1a] hover:bg-slate-50 dark:hover:bg-[#222] text-[13px] font-medium text-slate-600 dark:text-slate-300 transition-all shadow-sm hover:shadow-md">
                                <span className="text-blue-400 font-mono text-sm">&lt;/&gt;</span>
                                Code
                            </button>
                            <button onClick={() => { setInputValue("Give me general advice on: "); textareaRef.current?.focus(); }} className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 dark:border-[#333] bg-white dark:bg-[#1a1a1a] hover:bg-slate-50 dark:hover:bg-[#222] text-[13px] font-medium text-slate-600 dark:text-slate-300 transition-all shadow-sm hover:shadow-md">
                                <Sparkles className="w-4 h-4 text-purple-400" />
                                Life stuff
                            </button>
                            <button onClick={() => { setInputValue("Teach me something amazing!"); }} className="flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/20 bg-emerald-50 dark:bg-emerald-900/20 hover:scale-105 transition-all text-emerald-700 dark:text-emerald-400 text-[13px] font-semibold">
                                <img src="/nova.png" alt="Nova" className="w-4 h-4 object-contain" />
                                Nova's choice
                            </button>
                        </div>
                    )}

                    <div className="flex justify-center items-center mt-3">
                      <p className="text-center text-xs text-slate-400 hidden sm:block">AI can make mistakes. Consider verifying important information.</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AiTutorPage;

