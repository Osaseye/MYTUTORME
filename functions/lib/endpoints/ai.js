"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.askAiTutor = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const vertexai_1 = require("@google-cloud/vertexai");
const ai_context_1 = require("../lib/ai-context");
const db = admin.firestore();
// Initialize the Vertex AI API seamlessly via Google Cloud Service Accounts
// No manual GEMINI_API_KEY required.
const getVertexAi = () => new vertexai_1.VertexAI({
    project: process.env.GCLOUD_PROJECT || admin.app().options.projectId,
    location: "us-central1" // Vertex AI endpoints are region-specific
});
exports.askAiTutor = functions.https.onCall(async (request) => {
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
    const plan = userData === null || userData === void 0 ? void 0 : userData.plan;
    const isFree = plan === 'free' || !plan;
    const today = new Date().toDateString();
    if (isFree) {
        const aiQueryDate = userData === null || userData === void 0 ? void 0 : userData.aiQueryDate;
        let queryCount = (userData === null || userData === void 0 ? void 0 : userData.aiQueryCount) || 0;
        if (aiQueryDate !== today) {
            queryCount = 0; // Reset for new day
        }
        if (queryCount >= maxQueries) {
            throw new functions.https.HttpsError("resource-exhausted", `Free tier limit (${maxQueries} queries/day) reached.`);
        }
    }
    let sessionId = existingSessionId;
    let geminiHistory = [];
    let currentSubject = subject;
    let currentTopic = topic;
    if (sessionId) {
        const sessionRef = db.collection("ai_sessions").doc(sessionId);
        const sessionSnap = await sessionRef.get();
        if (sessionSnap.exists) {
            const sd = sessionSnap.data();
            currentSubject = (sd === null || sd === void 0 ? void 0 : sd.subject) || currentSubject;
            currentTopic = (sd === null || sd === void 0 ? void 0 : sd.topic) || currentTopic;
            const msgs = (sd === null || sd === void 0 ? void 0 : sd.messages) || [];
            geminiHistory = msgs.map((msg) => {
                var _a;
                return ({
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    parts: [
                        ...(((_a = msg.images) === null || _a === void 0 ? void 0 : _a.map((img) => ({ inlineData: { data: img.data, mimeType: img.mimeType } }))) || []),
                        { text: msg.content }
                    ]
                });
            });
        }
    }
    else {
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
    const userContext = await (0, ai_context_1.getAiTutorContext)(uid);
    let systemPrompt = `You are Nova, an expert AI tutor and  ${currentSubject || 'academic'} tutor for Nigerian students.
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
    const parts = [];
    if (images && images.length > 0) {
        parts.push(...images.map((img) => ({
            inlineData: {
                data: img.data.split(',')[1] || img.data,
                mimeType: img.mimeType
            }
        })));
    }
    parts.push({ text: messageContent });
    const userMessage = { role: 'user', content: messageContent, timestamp: Date.now() };
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
    }
    catch (e) {
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
            aiQueryCount: (userData === null || userData === void 0 ? void 0 : userData.aiQueryDate) === today ? admin.firestore.FieldValue.increment(1) : 1,
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
//# sourceMappingURL=ai.js.map