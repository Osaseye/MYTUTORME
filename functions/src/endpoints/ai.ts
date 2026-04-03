import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { VertexAI } from "@google-cloud/vertexai";
import { getAiTutorContext } from "../lib/ai-context";

const db = admin.firestore();

// Initialize the Vertex AI API seamlessly via Google Cloud Service Accounts
// No manual GEMINI_API_KEY required.
const getVertexAi = () => new VertexAI({
  project: process.env.GCLOUD_PROJECT || admin.app().options.projectId!,
  location: "us-central1" // Vertex AI endpoints are region-specific
});



export const askAiTutor = functions.https.onCall(async (request) => {
    const data = request.data;
    const context = request;
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Must be logged in to use AI Tutor.");
    }
    
    const uid = context.auth.uid;
    const { subject, topic, messageContent, images, existingSessionId } = data;

    if (!messageContent) {
        throw new functions.https.HttpsError("invalid-argument", "Message content is required.");
    }

    const maxQueries = 3;
    const userRef = db.collection("users").doc(uid);
    const userSnap = await userRef.get();
    const userData = userSnap.data();

    // Enforce limits
    const plan = userData?.plan;
    const isFree = plan === 'free' || !plan;
    const today = new Date().toDateString();

    if (isFree) {
        const aiQueryDate = userData?.aiQueryDate;
        let queryCount = userData?.aiQueryCount || 0;

        if (aiQueryDate !== today) {
            queryCount = 0; // Reset for new day
        }

        if (queryCount >= maxQueries) {
            throw new functions.https.HttpsError("resource-exhausted", `Free tier limit (${maxQueries} queries/day) reached.`);
        }
    }

    let sessionId = existingSessionId;
    let geminiHistory: any[] = [];
    let currentSubject = subject;
    let currentTopic = topic;

    if (sessionId) {
        const sessionRef = db.collection("ai_sessions").doc(sessionId);
        const sessionSnap = await sessionRef.get();
        if (sessionSnap.exists) {
            const sd = sessionSnap.data();
            currentSubject = sd?.subject || currentSubject;
            currentTopic = sd?.topic || currentTopic;
            const msgs = sd?.messages || [];
            
            geminiHistory = msgs.map((msg: any) => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [
                    ...(msg.images?.map((img: any) => ({ inlineData: { data: img.data, mimeType: img.mimeType } })) || []),
                    { text: msg.content }
                ]
            }));
        }
    } else {
        const newSessionRef = db.collection("ai_sessions").doc();
        sessionId = newSessionRef.id;
        await newSessionRef.set({
            studentId: uid,
            subject: currentSubject,
            topic: currentTopic || '',
            title: messageContent.substring(0, 50) + (messageContent.length > 50 ? '...' : ''),
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            lastMessageAt: admin.firestore.FieldValue.serverTimestamp(),
            messages: []
        });
    }

    // Build context
    const userContext = await getAiTutorContext(uid);
    let systemPrompt = `You are an expert ${currentSubject || 'academic'} tutor for Nigerian students.
    Adapt your teaching style to the subject.
    Connect concepts to relevant real-world examples.
    Confirm understanding after explanations.`;
    
    if (currentTopic) {
        systemPrompt += `\nThe student is currently focusing specifically on this topic/context: ${currentTopic}.`;
    }

    systemPrompt += `\n\nCRITICAL CONVERSATION RULES:
    1. If the user just greets you (e.g., "Hello", "Hi"), respond with a very simple, friendly greeting and ask how you can help.
    2. DO NOT spontaneously recite the user's profile details (university, CGPA, courses, goals) in your greeting. Only use their context when explicitly relevant to answering an academic question.
    3. Keep responses concise and focused on the user's immediate prompt.`;

    const fullSystemPrompt = `${userContext}\n\n${systemPrompt}`;

    const vertexAiClient = getVertexAi();
    const model = vertexAiClient.preview.getGenerativeModel({
        model: 'gemini-2.5-flash',
        systemInstruction: { role: 'system', parts: [{ text: fullSystemPrompt }] },
        generationConfig: {
            maxOutputTokens: 8192,
            temperature: 0.7,
        }
    });

    const chat = model.startChat({ history: geminiHistory });

    const parts: any[] = [];
    if (images && images.length > 0) {
        parts.push(...images.map((img: any) => ({ inlineData: { data: img.data, mimeType: img.mimeType } })));
    }
    parts.push({ text: messageContent });

    const userMessage: any = { role: 'user', content: messageContent, timestamp: Date.now() };
    if (images && images.length > 0) {
        userMessage.images = images;
    }

    // Generate response
    let finalResponse = "";
    try {
        const result = await chat.sendMessage(parts);
        if (result.response.candidates && result.response.candidates[0].content.parts.length > 0) {
            finalResponse = result.response.candidates[0].content.parts[0].text || "";
        }
    } catch (e: any) {
        console.error("Gemini AI API Error: ", e);
        throw new functions.https.HttpsError("internal", "AI Response generation failed.");
    }

    const assistantMessage = { 
        role: 'assistant', 
        content: finalResponse, 
        timestamp: Date.now() 
    };

    const sessionRef = db.collection("ai_sessions").doc(sessionId);
    
    const batch = db.batch();
    batch.update(sessionRef, {
        messages: admin.firestore.FieldValue.arrayUnion(userMessage, assistantMessage),
        lastMessageAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Increment limits securely
    if (isFree) {
        batch.update(userRef, {
            aiQueryCount: userData?.aiQueryDate === today ? admin.firestore.FieldValue.increment(1) : 1,
            aiQueryDate: today
        });
    }

    await batch.commit();

    return { 
        success: true, 
        sessionId,
        userMessage,
        assistantMessage
    };
});