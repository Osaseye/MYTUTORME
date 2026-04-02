import { useState, useRef, useEffect } from 'react';
import { db } from '@/lib/firebase';
import {
  doc, updateDoc, getDoc,
  collection, query, where, orderBy, limit, onSnapshot
} from 'firebase/firestore';
import { useAuthStore } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  images?: { data: string, mimeType: string }[];
  timestamp: number;
}

export interface AiSessionDocument {
  id?: string;
  studentId: string;
  subject: string;
  topic?: string;
  title: string;
  createdAt: any;
  lastMessageAt: any;
  messages: Message[];
}

export const useAiTutor = (subject: string, topic?: string, specificSessionId?: string | null) => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionHistory, setSessionHistory] = useState<AiSessionDocument[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const [queriesUsed, setQueriesUsed] = useState(0);
  const maxQueries = 5;
  const sessionIdRef = useRef<string | null>(null);

  // Sync queriesUsed with user doc
  useEffect(() => {
    if (user && (user.plan === 'free' || !user.plan)) {
      const today = new Date().toDateString();
      if (user.aiQueryDate !== today) {
        setQueriesUsed(0);
      } else {
        setQueriesUsed(user.aiQueryCount || 0);
      }
    }
  }, [user]);

  // Load history of sessions for this user & subject
  const subscribeToHistory = () => {
    if (!user) return () => {};
    
    const q = query(
      collection(db, 'ai_sessions'),
      where('studentId', '==', user.uid),
      where('subject', '==', subject),
      orderBy('lastMessageAt', 'desc'),
      limit(20)
    );

    return onSnapshot(q, (snapshot) => {
      const sessions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AiSessionDocument[];
      setSessionHistory(sessions);
    });
  };

  const checkRateLimit = async (): Promise<boolean> => {
    if (!user) return false;
    
    // Free tier logic
    if (user.plan === 'free' || !user.plan) {
      const today = new Date().toDateString();
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        if (data.aiQueryDate !== today) {
          // Reset for new day
          await updateDoc(userRef, { aiQueryDate: today, aiQueryCount: 0 });
          setQueriesUsed(0);
          return true;
        } else if ((data.aiQueryCount || 0) >= maxQueries) {
          toast.error(`Free tier limit (${maxQueries} queries/day) reached. Please upgrade to Pro.`);
          return false;
        }
      }
    }
    return true; // Pro users or under limit
  };

  const initializeChat = async (existingSessionId?: string) => {
    if (!user) return;
    
    setMessages([]);
    sessionIdRef.current = existingSessionId || null;
    
    let currentSubject = subject;
    let currentTopic = topic;

    if (existingSessionId) {
      // Load existing session messages
      const sessionRef = doc(db, 'ai_sessions', existingSessionId);
      const sessionSnap = await getDoc(sessionRef);
      
      if (sessionSnap.exists()) {
        const data = sessionSnap.data() as AiSessionDocument;
        setMessages(data.messages || []);
        
        currentSubject = data.subject || currentSubject;
        currentTopic = data.topic || currentTopic;
      }
    }
    
    return { subject: currentSubject, topic: currentTopic };
  };

  const sendMessage = async (content: string, images?: { data: string, mimeType: string }[]) => {
    if (!user || isStreaming) return;

    // Check limits before sending
    const canSend = await checkRateLimit();
    if (!canSend) return;

    if (messages.length === 0 && !sessionIdRef.current) {
        await initializeChat();
    }

    const userMessage: any = { role: 'user', content, timestamp: Date.now() };
    if (images && images.length > 0) {
      userMessage.images = images;
    }
    
    setMessages(prev => [...prev, userMessage as Message]);

    setIsStreaming(true);
    setStreamingContent('Thinking...');

    try {
      const askAi = httpsCallable<any, any>(functions, 'askAiTutor');
      const response = await askAi({
          subject,
          topic,
          messageContent: content,
          images,
          existingSessionId: sessionIdRef.current,
      });

      const data = response.data;
      sessionIdRef.current = data.sessionId;

      if (data.assistantMessage) {
          setStreamingContent(''); // Clear loading text
          setMessages(prev => [...prev, data.assistantMessage as Message]);
      }

      // Update rate limits locally
      if (user.plan === 'free' || !user.plan) {
        setQueriesUsed(prev => prev + 1);
      }

    } catch (error) {
      console.error("AI Error:", error);
      toast.error("Failed to generate response. Please try again.");
      setMessages(prev => prev.filter(msg => msg !== userMessage)); // rollback
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
    }
  };

  useEffect(() => {
    initializeChat(specificSessionId || undefined);
  }, [specificSessionId, user]);

  useEffect(() => {
    let unsubscribe: () => void;
    const timeout = setTimeout(() => {
      unsubscribe = subscribeToHistory();
    }, 300);

    return () => {
      clearTimeout(timeout);
      if (unsubscribe) unsubscribe();
    };
  }, [subject, user]);

  return {
    messages,
    sessionHistory,
    isStreaming,
    streamingContent,
    sendMessage,
    initializeChat,
    currentSessionId: sessionIdRef.current,
    queriesUsed,
    maxQueries,
  };
};
