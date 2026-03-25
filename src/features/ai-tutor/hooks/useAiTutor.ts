import { useState, useRef, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { getModel, SUBJECT_PROMPTS } from '@/lib/ai';
import {
  doc, updateDoc, arrayUnion, getDoc, serverTimestamp,
  setDoc, collection, query, where, orderBy, limit, onSnapshot,
  increment
} from 'firebase/firestore';
import { useAuthStore } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';

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
  const chatRef = useRef<any>(null);
  const sessionIdRef = useRef<string | null>(null);

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
          return true;
        } else if ((data.aiQueryCount || 0) >= 5) {
          toast.error("Free tier limit (5 queries/day) reached. Please upgrade to Pro.");
          return false;
        }
      }
    }
    return true; // Pro users or under limit
  };

  const incrementRateLimit = async () => {
    if (!user) return;
    if (user.plan === 'free' || !user.plan) {
      const userRef = doc(db, 'users', user.uid);
      const today = new Date().toDateString();
      await updateDoc(userRef, { 
        aiQueryCount: increment(1),
        aiQueryDate: today
      });
    }
  };

  const initializeChat = async (existingSessionId?: string) => {
    if (!user) return;
    
    setMessages([]);
    chatRef.current = null;
    sessionIdRef.current = existingSessionId || null;
    
    let systemPrompt = SUBJECT_PROMPTS[subject] || `You are a helpful ${subject} tutor.`;
    if (topic) {
        systemPrompt += `\nThe student is currently focusing specifically on this topic/context: ${topic}.`;
    }
    const model = getModel({ systemInstruction: systemPrompt });

    let geminiHistory: any[] = [];

    if (existingSessionId) {
      // Load existing session messages
      const sessionRef = doc(db, 'ai_sessions', existingSessionId);
      const sessionSnap = await getDoc(sessionRef);
      
      if (sessionSnap.exists()) {
        const data = sessionSnap.data() as AiSessionDocument;
        setMessages(data.messages || []);

        geminiHistory = (data.messages || []).map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [
              ...(msg.images?.map(img => ({ inlineData: { data: img.data, mimeType: img.mimeType } })) || []),
              { text: msg.content }
          ]
        }));
      }
    }

    // Initialize the chat session with Gemini
    chatRef.current = model.startChat({ history: geminiHistory });
  };

  const sendMessage = async (content: string, images?: { data: string, mimeType: string }[]) => {
    if (!user || !chatRef.current || isStreaming) return;

    // Check limits before sending
    const canSend = await checkRateLimit();
    if (!canSend) return;

    // Create session if it doesn't exist
    if (!sessionIdRef.current) {
      const newSessionRef = doc(collection(db, 'ai_sessions'));
      sessionIdRef.current = newSessionRef.id;

      await setDoc(newSessionRef, {
        studentId: user.uid,
        subject,
        topic: topic || '',
        title: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
        createdAt: serverTimestamp(),
        lastMessageAt: serverTimestamp(),
        messages: []
      });
    }

    const userMessage: any = { role: 'user', content, timestamp: Date.now() };
    if (images && images.length > 0) {
      userMessage.images = images;
    }
    
    setMessages(prev => [...prev, userMessage as Message]);

    // Optimistically update firestore with user message
    const sessionRef = doc(db, 'ai_sessions', sessionIdRef.current);
    await updateDoc(sessionRef, {
      messages: arrayUnion(userMessage),
      lastMessageAt: serverTimestamp()
    });

    setIsStreaming(true);
    setStreamingContent('');

    try {
      // Send to Vertex AI
      const parts: any[] = [];
      if (images) {
          parts.push(...images.map(img => ({ inlineData: { data: img.data, mimeType: img.mimeType } })));
      }
      parts.push({ text: content });

      const result = await chatRef.current.sendMessageStream(parts);
      
      let fullResponse = '';
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;
        setStreamingContent(fullResponse);
      }

      const assistantMessage = { 
        role: 'assistant', 
        content: fullResponse || "", 
        timestamp: Date.now() 
      };

      setMessages(prev => [...prev, assistantMessage as any]);
      
      // Update firestore with assistant message
      await updateDoc(sessionRef, {
        messages: arrayUnion(assistantMessage),
        lastMessageAt: serverTimestamp()
      });

      // Update rate limits
      await incrementRateLimit();

    } catch (error) {
      console.error("AI Error:", error);
      toast.error("Failed to generate response. Please try again.");
    } finally {
      setIsStreaming(false);
      setStreamingContent('');
    }
  };

  useEffect(() => {
    initializeChat(specificSessionId || undefined);
    const unsubscribe = subscribeToHistory();
    return () => unsubscribe();
  }, [subject, topic, specificSessionId, user]);

  return {
    messages,
    sessionHistory,
    isStreaming,
    streamingContent,
    sendMessage,
    initializeChat,
    currentSessionId: sessionIdRef.current
  };
};
