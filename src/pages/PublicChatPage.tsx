// @ts-nocheck
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';
import { Loader2, Sparkles, ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const PublicChatPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      if (!sessionId) return;
      try {
        const snap = await getDoc(doc(db, 'ai_sessions', sessionId));
        if (!snap.exists() || !snap.data()?.isPublic) {
          setNotFound(true);
          return;
        }
        setSession({ id: snap.id, ...snap.data() });
      } catch (e) {
        console.error('Failed to load shared chat:', e);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, [sessionId]);

  // Inject OG / Twitter meta tags for link previews
  useEffect(() => {
    if (!session) return;

    const title = session.title || 'Shared Nova AI Conversation';
    const sharedBy = (session as any).sharedBy as string | undefined;
    const subject = [session.subject, session.topic].filter(Boolean).join(' · ');
    const ogTitle = sharedBy ? `${sharedBy} shared: "${title}"` : title;
    const description = sharedBy
      ? `${sharedBy} shared a Nova AI tutoring session "${title}"${subject ? ` on ${subject}` : ''} with you — via MyTutorMe.`
      : subject
      ? `A Nova AI tutoring session on ${subject} — shared via MyTutorMe.`
      : 'A Nova AI tutoring session shared via MyTutorMe.';
    const url = window.location.href;
    const image = `${window.location.origin}/icon.png`;

    document.title = `${title} · Nova AI`;

    const setMeta = (property: string, content: string, attr = 'property') => {
      let el = document.querySelector(`meta[${attr}="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Open Graph
    setMeta('og:type', 'article');
    setMeta('og:title', ogTitle);
    setMeta('og:description', description);
    setMeta('og:url', url);
    setMeta('og:image', image);
    setMeta('og:site_name', 'MyTutorMe');

    // Twitter Card
    setMeta('twitter:card', 'summary', 'name');
    setMeta('twitter:title', ogTitle, 'name');
    setMeta('twitter:description', description, 'name');
    setMeta('twitter:image', image, 'name');

    return () => {
      document.title = 'MyTutorMe - AI Learning Platform';
    };
  }, [session]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <BookOpen className="w-8 h-8 text-slate-400" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Chat not found</h1>
        <p className="text-slate-500 mb-6">This conversation may have been made private or the link is invalid.</p>
        <Link to="/login">
          <Button className="rounded-full">Get started with Nova</Button>
        </Link>
      </div>
    );
  }

  const messages: any[] = session?.messages || [];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/nova.png" alt="Nova AI" className="w-7 h-7 object-contain drop-shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                {session?.title || 'Shared Conversation'}
              </p>
              {(session as any)?.sharedBy && (
                <p className="text-xs text-slate-500">Shared by {(session as any).sharedBy}</p>
              )}
              {!(session as any)?.sharedBy && (session?.subject || session?.topic) && (
                <p className="text-xs text-slate-500">
                  {[session.subject, session.topic].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden sm:inline">Powered by</span>
            <span className="text-xs font-semibold text-primary hidden sm:inline">MyTutorMe Nova</span>
            <Link to="/register">
              <Button size="sm" className="rounded-full h-8 text-xs gap-1.5">
                Try Nova <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6 pb-24">
        {messages.filter(m => m.role === 'user' || m.role === 'assistant').map((msg, index) => (
          <div
            key={msg.timestamp || index}
            className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : '')}
          >
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex-shrink-0 flex items-center justify-center shadow-sm mt-1 ring-1 ring-emerald-200">
                <img src="/nova.png" alt="Nova" className="w-5 h-5 object-contain" />
              </div>
            )}
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xs shadow-sm mt-1">
                Q
              </div>
            )}
            <div className={cn('max-w-[85%]', msg.role === 'user' ? 'text-right' : '')}>
              <div
                className={cn(
                  'p-4 rounded-2xl prose prose-sm dark:prose-invert max-w-none',
                  msg.role === 'assistant'
                    ? 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-tl-sm shadow-sm text-slate-800 dark:text-slate-100'
                    : 'bg-primary text-white rounded-tr-sm shadow-md text-left'
                )}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    code({ inline, className, children, ...props }: any) {
                      return inline ? (
                        <code className="bg-slate-200 dark:bg-slate-800 text-primary px-1 rounded" {...props}>{children}</code>
                      ) : (
                        <code className={cn(className, 'block p-4 bg-slate-900 text-slate-100 rounded-lg text-sm overflow-x-auto')} {...props}>{children}</code>
                      );
                    },
                    table: ({ children }) => (
                      <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg my-4">
                        <table className="w-full text-left border-collapse">{children}</table>
                      </div>
                    ),
                    th: ({ children }) => <th className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 font-semibold">{children}</th>,
                    td: ({ children }) => <td className="p-3 border-b border-slate-100 dark:border-slate-800">{children}</td>,
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
      </main>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 inset-x-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200/70 dark:border-slate-800/70 py-4 px-4">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center ring-1 ring-emerald-200">
              <img src="/nova.png" alt="Nova" className="w-5 h-5 object-contain" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Chat with Nova AI</p>
              <p className="text-xs text-slate-500">Your personalised AI tutor — free to get started</p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Link to="/login" className="flex-1 sm:flex-none">
              <Button variant="outline" className="w-full rounded-full text-sm">Log in</Button>
            </Link>
            <Link to="/register" className="flex-1 sm:flex-none">
              <Button className="w-full rounded-full text-sm gap-1.5">
                <Sparkles className="w-4 h-4" /> Try Nova free
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
