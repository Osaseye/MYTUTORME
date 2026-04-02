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
exports.generateFlashcardDeck = exports.generateStudyPlan = exports.generateMockExam = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const vertexai_1 = require("@google-cloud/vertexai");
const db = admin.firestore();
const vertexAi = new vertexai_1.VertexAI({
    project: process.env.GCLOUD_PROJECT || admin.app().options.projectId,
    location: "us-central1"
});
exports.generateMockExam = functions.https.onCall(async (request) => {
    const data = request.data;
    const context = request;
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Must be logged in to generate exams.");
    }
    const { subject, topic, difficulty, count, mode } = data;
    if (!subject || !topic || !difficulty || !count || !mode) {
        throw new functions.https.HttpsError("invalid-argument", "Missing required exam parameters.");
    }
    const maxQueries = 5;
    const userRef = db.collection("users").doc(context.auth.uid);
    const userSnap = await userRef.get();
    const userData = userSnap.data();
    // Check Plan Limits
    const plan = userData === null || userData === void 0 ? void 0 : userData.plan;
    const isFree = plan === 'free' || !plan;
    const today = new Date().toDateString();
    if (isFree) {
        let queryCount = (userData === null || userData === void 0 ? void 0 : userData.aiQueryCount) || 0;
        if ((userData === null || userData === void 0 ? void 0 : userData.aiQueryDate) !== today) {
            queryCount = 0;
        }
        if (queryCount >= maxQueries) {
            throw new functions.https.HttpsError("resource-exhausted", `Free tier AI limit (${maxQueries}/day) reached.`);
        }
    }
    try {
        const questionsRef = db.collection('questions');
        const qSnap = await questionsRef
            .where('subject', '==', subject)
            .where('topic', '==', topic)
            .where('difficulty', '==', difficulty)
            .get();
        const existingQuestions = qSnap.docs.map(d => (Object.assign({ id: d.id }, d.data())));
        let selectedQuestionIds = [];
        if (existingQuestions.length >= count) {
            // Cache Hit
            const shuffled = [...existingQuestions].sort(() => 0.5 - Math.random());
            selectedQuestionIds = shuffled.slice(0, count).map(q => q.id);
        }
        else {
            // Cache Miss - Generate shortfall
            const shortfall = count - existingQuestions.length;
            const generationCount = shortfall < 5 ? 5 : shortfall;
            const prompt = `You are an expert exam creator.
            Generate exactly ${generationCount} multiple-choice questions for the subject "${subject}" specifically on the topic "${topic}" at a "${difficulty}" difficulty level.
            
            Return a strict JSON array. Each object MUST have this schema:
            {
                "text": "The question text",
                "type": "multiple-choice",
                "options": ["A", "B", "C", "D"],
                "correctAnswer": "The exact string of the correct option",
                "explanation": "A short, helpful explanation of why this answer is correct."
            }`;
            const model = vertexAi.preview.getGenerativeModel({
                model: 'gemini-2.5-flash',
                generationConfig: {
                    temperature: 0.6,
                    responseMimeType: 'application/json'
                }
            });
            const result = await model.generateContent(prompt);
            const rawText = result.response.candidates && result.response.candidates[0].content.parts.length > 0 ? result.response.candidates[0].content.parts[0].text || "" : "";
            const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            const aiQuestions = JSON.parse(cleanText);
            if (!Array.isArray(aiQuestions))
                throw new Error("Generated content is not an array");
            const batch = db.batch();
            const newQuestionIds = [];
            aiQuestions.forEach((qObj) => {
                const newDocRef = questionsRef.doc();
                batch.set(newDocRef, Object.assign(Object.assign({}, qObj), { subject,
                    topic,
                    difficulty, aiGenerated: true, createdAt: admin.firestore.FieldValue.serverTimestamp() }));
                newQuestionIds.push(newDocRef.id);
            });
            // Increment usage securely for generation usage
            if (isFree) {
                batch.update(userRef, {
                    aiQueryCount: (userData === null || userData === void 0 ? void 0 : userData.aiQueryDate) === today ? admin.firestore.FieldValue.increment(1) : 1,
                    aiQueryDate: today
                });
            }
            await batch.commit();
            const allAvailableIds = [...existingQuestions.map(q => q.id), ...newQuestionIds];
            const shuffled = allAvailableIds.sort(() => 0.5 - Math.random());
            selectedQuestionIds = shuffled.slice(0, count);
        }
        const quizDocRef = db.collection('quizzes').doc();
        await quizDocRef.set({
            title: `${subject} - ${topic} ${mode === 'standard' ? 'Exam' : 'Practice'}`,
            subject,
            difficulty,
            topic,
            mode,
            timeLimit: count * 1.5,
            passingScore: 70,
            questionIds: selectedQuestionIds,
            aiGenerated: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        // Also save mock_exams document as required by previous context
        const mockExamRef = db.collection('mock_exams').doc();
        await mockExamRef.set({
            userId: context.auth.uid,
            quizId: quizDocRef.id,
            subject,
            topic,
            difficulty,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            score: null // not taken yet
        });
        return { success: true, quizId: quizDocRef.id, mockExamId: mockExamRef.id };
    }
    catch (error) {
        console.error('Error generating exam:', error);
        throw new functions.https.HttpsError("internal", error.message);
    }
});
exports.generateStudyPlan = functions.https.onCall(async (request) => {
    const data = request.data;
    const context = request;
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Must be logged in to generate study plans.");
    }
    const { subject, targetExam, durationWeeks, proficiency } = data;
    if (!subject || !targetExam || !durationWeeks || !proficiency) {
        throw new functions.https.HttpsError("invalid-argument", "Missing parameters.");
    }
    const maxQueries = 5;
    const userRef = db.collection("users").doc(context.auth.uid);
    const userSnap = await userRef.get();
    const userData = userSnap.data();
    // Check Plan Limits
    const plan = userData === null || userData === void 0 ? void 0 : userData.plan;
    const isFree = plan === 'free' || !plan;
    const today = new Date().toDateString();
    if (isFree) {
        let queryCount = (userData === null || userData === void 0 ? void 0 : userData.aiQueryCount) || 0;
        if ((userData === null || userData === void 0 ? void 0 : userData.aiQueryDate) !== today) {
            queryCount = 0;
        }
        if (queryCount >= maxQueries) {
            throw new functions.https.HttpsError("resource-exhausted", `Free tier AI limit (${maxQueries}/day) reached.`);
        }
    }
    try {
        const templatesRef = db.collection('study_plan_templates');
        const tSnap = await templatesRef
            .where('subject', '==', subject.toLowerCase())
            .where('targetExam', '==', targetExam.toLowerCase())
            .where('durationWeeks', '==', durationWeeks)
            .get();
        let planData = null;
        if (!tSnap.empty) {
            planData = tSnap.docs[0].data().plan;
        }
        else {
            const prompt = `You are an expert academic tutor. Create a strict JSON study plan for a student preparing for "${targetExam}" in the subject of "${subject}".
            The student has ${durationWeeks} weeks to prepare, and currently identifies as having a "${proficiency}" proficiency level.
            IMPORTANT: Do not create more than 5 tasks per week to keep the plan achievable and ensure the JSON completion.

            Generate a structured timeline. Return a strict JSON object with this exact schema:
            {
              "title": "A short engaging title for the plan",
              "overview": "A brief 2-sentence summary of the strategy",
              "weeks": [
                {
                  "weekNumber": 1,
                  "focus": "The main theme of this week",
                  "tasks": [
                    { "task": "Study chapter X", "completed": false },
                    { "task": "Practice 50 questions on Y", "completed": false }
                  ]
                }
              ]
            }`;
            const model = vertexAi.preview.getGenerativeModel({
                model: 'gemini-2.5-flash',
                generationConfig: {
                    temperature: 0.5,
                    responseMimeType: 'application/json'
                }
            });
            const result = await model.generateContent(prompt);
            const rawText = result.response.candidates && result.response.candidates[0].content.parts.length > 0 ? result.response.candidates[0].content.parts[0].text || "" : "";
            const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            planData = JSON.parse(cleanText);
            if (!planData.weeks || !Array.isArray(planData.weeks)) {
                throw new Error("Invalid schema");
            }
            const batch = db.batch();
            // Save to global pool
            const newTemplateRef = templatesRef.doc();
            batch.set(newTemplateRef, {
                subject: subject.toLowerCase(),
                targetExam: targetExam.toLowerCase(),
                durationWeeks,
                proficiency,
                plan: planData,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
            if (isFree) {
                batch.update(userRef, {
                    aiQueryCount: (userData === null || userData === void 0 ? void 0 : userData.aiQueryDate) === today ? admin.firestore.FieldValue.increment(1) : 1,
                    aiQueryDate: today
                });
            }
            await batch.commit();
        }
        const newPlanRef = db.collection('study_plans').doc();
        await newPlanRef.set({
            userId: context.auth.uid,
            subject,
            targetExam,
            durationWeeks,
            proficiency,
            title: planData.title,
            overview: planData.overview,
            weeks: planData.weeks,
            progress: 0,
            aiGenerated: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return { success: true, planId: newPlanRef.id };
    }
    catch (error) {
        console.error('Error generating study plan:', error);
        throw new functions.https.HttpsError("internal", error.message);
    }
});
exports.generateFlashcardDeck = functions.https.onCall(async (request) => {
    const data = request.data;
    const context = request;
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Must be logged in to generate flashcards.");
    }
    const { subject, topic, difficulty, count } = data;
    if (!subject || !topic || !difficulty || !count) {
        throw new functions.https.HttpsError("invalid-argument", "Missing required flashcard parameters.");
    }
    try {
        const existingDecksSnap = await db.collection("flashcard_decks")
            .where("userId", "==", context.auth.uid)
            .where("subject", "==", subject)
            .where("topic", "==", topic)
            .get();
        if (!existingDecksSnap.empty) {
            return { success: true, deckId: existingDecksSnap.docs[0].id };
        }
        const maxQueries = 5;
        const userRef = db.collection("users").doc(context.auth.uid);
        const userSnap = await userRef.get();
        const userData = userSnap.data();
        // Check Plan Limits
        const plan = userData === null || userData === void 0 ? void 0 : userData.plan;
        const isFree = plan === 'free' || !plan;
        const today = new Date().toDateString();
        if (isFree) {
            let queryCount = (userData === null || userData === void 0 ? void 0 : userData.aiQueryCount) || 0;
            if ((userData === null || userData === void 0 ? void 0 : userData.aiQueryDate) !== today) {
                queryCount = 0;
            }
            if (queryCount >= maxQueries) {
                throw new functions.https.HttpsError("resource-exhausted", `Free tier AI limit (${maxQueries}/day) reached.`);
            }
        }
        const flashcardsRef = db.collection('flashcards');
        const fSnap = await flashcardsRef
            .where('subject', '==', subject)
            .where('topic', '==', topic)
            .where('difficulty', '==', difficulty)
            .get();
        const existingFlashcards = fSnap.docs.map(d => (Object.assign({ id: d.id }, d.data())));
        let selectedFlashcardIds = [];
        if (existingFlashcards.length >= count) {
            // Cache Hit
            const shuffled = [...existingFlashcards].sort(() => 0.5 - Math.random());
            selectedFlashcardIds = shuffled.slice(0, count).map(f => f.id);
        }
        else {
            // Cache Miss
            const shortfall = count - existingFlashcards.length;
            const generationCount = shortfall < 5 ? 5 : shortfall;
            const prompt = `You are an expert tutor creating study flashcards.
            Generate exactly ${generationCount} flashcards for the subject "${subject}" strictly focused on the topic "${topic}" at a "${difficulty}" difficulty level.
            Return a strict JSON array. Each object MUST have this schema:
            {
                "front": "The question, concept, or term to study",
                "back": "The clear, concise answer, definition, or explanation",
                "hint": "A short optional hint to help the student remember (max 10 words)"
            }`;
            const model = vertexAi.preview.getGenerativeModel({
                model: 'gemini-2.5-flash',
                generationConfig: {
                    temperature: 0.6,
                    responseMimeType: 'application/json'
                }
            });
            const result = await model.generateContent(prompt);
            const rawText = result.response.candidates && result.response.candidates[0].content.parts.length > 0 ? result.response.candidates[0].content.parts[0].text || "" : "";
            const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
            const aiFlashcards = JSON.parse(cleanText);
            if (!Array.isArray(aiFlashcards))
                throw new Error("Generated content is not an array");
            const batch = db.batch();
            const newFlashcardIds = [];
            aiFlashcards.forEach((fObj) => {
                const newDocRef = flashcardsRef.doc();
                batch.set(newDocRef, Object.assign(Object.assign({}, fObj), { subject,
                    topic,
                    difficulty, aiGenerated: true, createdAt: admin.firestore.FieldValue.serverTimestamp() }));
                newFlashcardIds.push(newDocRef.id);
            });
            if (isFree) {
                batch.update(userRef, {
                    aiQueryCount: (userData === null || userData === void 0 ? void 0 : userData.aiQueryDate) === today ? admin.firestore.FieldValue.increment(1) : 1,
                    aiQueryDate: today
                });
            }
            await batch.commit();
            const allAvailableIds = [...existingFlashcards.map(f => f.id), ...newFlashcardIds];
            const shuffled = allAvailableIds.sort(() => 0.5 - Math.random());
            selectedFlashcardIds = shuffled.slice(0, count);
        }
        const deckDocRef = db.collection('flashcard_decks').doc();
        await deckDocRef.set({
            title: `${subject} - ${topic} Flashcards`,
            subject,
            topic,
            difficulty,
            flashcardIds: selectedFlashcardIds,
            userId: context.auth.uid,
            aiGenerated: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return { success: true, deckId: deckDocRef.id };
    }
    catch (error) {
        console.error('Error generating flashcards:', error);
        throw new functions.https.HttpsError("internal", error.message);
    }
});
//# sourceMappingURL=ai-generation.js.map