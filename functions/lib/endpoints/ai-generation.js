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
exports.processAssignmentHelp = exports.generateCourseQuiz = exports.generateCourseCurriculum = exports.generateFlashcardDeck = exports.generateStudyPlan = exports.generateMockExam = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const vertexai_1 = require("@google-cloud/vertexai");
const db = admin.firestore();
const getVertexAi = () => new vertexai_1.VertexAI({
    project: process.env.GCLOUD_PROJECT || admin.app().options.projectId,
    location: "us-central1"
});
/**
 * Common security helper for rate-limiting AI requests securely
 * Uses a Firestore transaction to prevent burst abuse (race conditions).
 */
async function recordUsageTransaction(userId, isPremium, freeLimit, maxPremium = 150, fieldPrefix = 'aiQuery') {
    const userRef = db.collection("users").doc(userId);
    const today = new Date().toDateString();
    return await db.runTransaction(async (transaction) => {
        const userSnap = await transaction.get(userRef);
        const userData = userSnap.data() || {};
        const countField = `${fieldPrefix}Count`;
        const dateField = `${fieldPrefix}Date`;
        let queryCount = userData[countField] || 0;
        if (userData[dateField] !== today) {
            queryCount = 0;
        }
        const limit = isPremium ? maxPremium : freeLimit;
        if (queryCount >= limit) {
            const msg = isPremium
                ? `Daily Premium AI limit (${limit}/day) reached. Please try again tomorrow.`
                : `Free tier AI limit (${limit}/day) reached. Please upgrade for more access.`;
            throw new functions.https.HttpsError("resource-exhausted", msg);
        }
        transaction.set(userRef, {
            [countField]: queryCount + 1,
            [dateField]: today
        }, { merge: true });
        return true;
    });
}
exports.generateMockExam = functions.https.onCall({ timeoutSeconds: 540, memory: "1GiB", region: "us-central1" }, async (request) => {
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
    // Determine plan type and verify quotas right away securely
    const plan = userData === null || userData === void 0 ? void 0 : userData.plan;
    const isPremium = plan === 'pro_monthly' || plan === 'pro_yearly' || (userData === null || userData === void 0 ? void 0 : userData.teacherSubscriptionPlan) === 'premium_tools';
    try {
        const questionsRef = db.collection('questions');
        const qSnap = await questionsRef
            .where('subject', '==', subject)
            .where('topic', '==', topic)
            .where('difficulty', '==', difficulty)
            .get();
        const existingQuestions = qSnap.docs.map(d => (Object.assign({ id: d.id }, d.data())));
        let selectedQuestionIds = [];
        if (existingQuestions.length >= count && (!data.fileData || data.fileData.length === 0)) {
            // Cache Hit
            const shuffled = [...existingQuestions].sort(() => 0.5 - Math.random());
            selectedQuestionIds = shuffled.slice(0, count).map(q => q.id);
        }
        else {
            // Cache Miss - Generate shortfall
            await recordUsageTransaction(context.auth.uid, isPremium, maxQueries, 150, 'aiQuery');
            const shortfall = count - existingQuestions.length;
            const generationCount = shortfall < 5 ? 5 : shortfall;
            let prompt = `You are an expert exam creator.
            Generate exactly ${generationCount} multiple-choice questions for the subject "${subject}" specifically on the topic "${topic}" at a "${difficulty}" difficulty level.
            
            Return a strict JSON array. Each object MUST have this schema:
            {
                "text": "The question text",
                "type": "multiple-choice",
                "options": ["A", "B", "C", "D"],
                "correctAnswer": "The exact string of the correct option",
                "explanation": "A short, helpful explanation of why this answer is correct."
            }`;
            const model = getVertexAi().preview.getGenerativeModel({
                model: 'gemini-2.5-flash',
                generationConfig: {
                    temperature: 0.6,
                    responseMimeType: 'application/json'
                }
            });
            const parts = [{ text: prompt }];
            if (data.fileData && Array.isArray(data.fileData)) {
                for (const fObj of data.fileData) {
                    if (fObj.storagePath) {
                        try {
                            const [fileBuf] = await admin.storage().bucket().file(fObj.storagePath).download();
                            parts.push({
                                inlineData: {
                                    data: fileBuf.toString('base64'),
                                    mimeType: fObj.mimeType
                                }
                            });
                        }
                        catch (err) {
                            console.error('Error downloading file from storage:', err);
                        }
                    }
                    else if (fObj.data && fObj.mimeType) {
                        parts.push({
                            inlineData: {
                                data: fObj.data.split(',')[1] || fObj.data,
                                mimeType: fObj.mimeType
                            }
                        });
                    }
                }
            }
            const result = await model.generateContent({ contents: [{ role: 'user', parts }] });
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
    // Check Plan Limits securely via transaction
    const plan = userData === null || userData === void 0 ? void 0 : userData.plan;
    const isPremium = plan === 'pro_monthly' || plan === 'pro_yearly' || (userData === null || userData === void 0 ? void 0 : userData.teacherSubscriptionPlan) === 'premium_tools';
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
            await recordUsageTransaction(context.auth.uid, isPremium, maxQueries, 150, 'aiQuery');
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
            const model = getVertexAi().preview.getGenerativeModel({
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
exports.generateFlashcardDeck = functions.https.onCall({ timeoutSeconds: 540, memory: "1GiB", region: "us-central1" }, async (request) => {
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
        const isPremium = plan === 'pro_monthly' || plan === 'pro_yearly' || (userData === null || userData === void 0 ? void 0 : userData.teacherSubscriptionPlan) === 'premium_tools';
        const flashcardsRef = db.collection('flashcards');
        const fSnap = await flashcardsRef
            .where('subject', '==', subject)
            .where('topic', '==', topic)
            .where('difficulty', '==', difficulty)
            .get();
        const existingFlashcards = fSnap.docs.map(d => (Object.assign({ id: d.id }, d.data())));
        let selectedFlashcardIds = [];
        if (existingFlashcards.length >= count && (!data.fileData || data.fileData.length === 0)) {
            // Cache Hit
            const shuffled = [...existingFlashcards].sort(() => 0.5 - Math.random());
            selectedFlashcardIds = shuffled.slice(0, count).map(f => f.id);
        }
        else {
            // Cache Miss
            await recordUsageTransaction(context.auth.uid, isPremium, maxQueries, 150, 'aiQuery');
            const shortfall = count - existingFlashcards.length;
            const generationCount = shortfall < 5 ? 5 : shortfall;
            let prompt = `You are an expert tutor creating study flashcards.
            Generate exactly ${generationCount} flashcards for the subject "${subject}" strictly focused on the topic "${topic}" at a "${difficulty}" difficulty level.
            Return a strict JSON array. Each object MUST have this schema:
            {
                "front": "The question, concept, or term to study",
                "back": "The clear, concise answer, definition, or explanation",
                "hint": "A short optional hint to help the student remember (max 10 words)"
            }`;
            const model = getVertexAi().preview.getGenerativeModel({
                model: 'gemini-2.5-flash',
                generationConfig: {
                    temperature: 0.6,
                    responseMimeType: 'application/json'
                }
            });
            const parts = [{ text: prompt }];
            if (data.fileData && Array.isArray(data.fileData)) {
                for (const fObj of data.fileData) {
                    if (fObj.storagePath) {
                        try {
                            const [fileBuf] = await admin.storage().bucket().file(fObj.storagePath).download();
                            parts.push({
                                inlineData: {
                                    data: fileBuf.toString('base64'),
                                    mimeType: fObj.mimeType
                                }
                            });
                        }
                        catch (err) {
                            console.error('Error downloading file from storage:', err);
                        }
                    }
                    else if (fObj.data && fObj.mimeType) {
                        parts.push({
                            inlineData: {
                                data: fObj.data.split(',')[1] || fObj.data,
                                mimeType: fObj.mimeType
                            }
                        });
                    }
                }
            }
            const result = await model.generateContent({ contents: [{ role: 'user', parts }] });
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
exports.generateCourseCurriculum = functions.https.onCall(async (request) => {
    var _a, _b, _c, _d, _e;
    const data = request.data;
    const context = request;
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Must be logged in to generate curriculum.");
    }
    const { title, subject, level } = data;
    if (!title || !subject || !level) {
        throw new functions.https.HttpsError("invalid-argument", "Missing required parameters.");
    }
    const userRef = db.collection("users").doc(context.auth.uid);
    const userSnap = await userRef.get();
    const userData = userSnap.data();
    // Enforce Teacher Premium Plan and safety cap limit
    const isPremium = (userData === null || userData === void 0 ? void 0 : userData.teacherSubscriptionPlan) === 'premium_tools';
    if (!isPremium) {
        throw new functions.https.HttpsError("permission-denied", "Premium teacher plan required to use AI Curriculum Generation.");
    }
    await recordUsageTransaction(context.auth.uid, isPremium, 0, 150, 'aiTeacher');
    try {
        const prompt = `Generate a 4-module curriculum for a course titled "${title}" in the subject "${subject}" for ${level} level students. 
        Each module should have a title, an objective, and a list of 3-4 video topics. Return a valid JSON array of objects. Format strictly like this: 
        [
            { 
               "title": "Module 1 Title", 
               "objective": "Objective", 
               "videoTopics": ["Topic 1", "Topic 2"] 
            }
        ]`;
        const model = getVertexAi().preview.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: {
                temperature: 0.7,
                responseMimeType: 'application/json'
            }
        });
        const result = await model.generateContent(prompt);
        const rawText = ((_e = (_d = (_c = (_b = (_a = result.response.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.text) || "[]";
        const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const curriculum = JSON.parse(cleanText);
        return { success: true, curriculum };
    }
    catch (error) {
        console.error('Error generating curriculum:', error);
        throw new functions.https.HttpsError("internal", "Failed to generate curriculum.");
    }
});
exports.generateCourseQuiz = functions.https.onCall(async (request) => {
    var _a, _b, _c, _d, _e;
    const data = request.data;
    const context = request;
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Must be logged in to generate quizzes.");
    }
    // Using level and subject instead of just dumping out
    const { level, subject, moduleTitle } = data;
    if (!moduleTitle) {
        throw new functions.https.HttpsError("invalid-argument", "Missing required parameters.");
    }
    const userRef = db.collection("users").doc(context.auth.uid);
    const userSnap = await userRef.get();
    const userData = userSnap.data();
    // Enforce Teacher Premium Plan and safety cap limit
    const isPremium = (userData === null || userData === void 0 ? void 0 : userData.teacherSubscriptionPlan) === 'premium_tools';
    if (!isPremium) {
        throw new functions.https.HttpsError("permission-denied", "Premium teacher plan required to use AI Quiz Generation.");
    }
    await recordUsageTransaction(context.auth.uid, isPremium, 0, 150, 'aiTeacher');
    try {
        const prompt = `Generate a 3-question multiple choice quiz for a specific module in a ${level || 'general'} level ${subject || 'general'} course.
        The module is titled: "${moduleTitle}".
        Ensure questions directly relate to the concepts typically covered under this module title.
        Return STRICTLY in this JSON array format:
        [
          {
            "question": "Question text?",
            "options": ["A", "B", "C", "D"],
            "correctAnswer": 0
          }
        ]`;
        const model = getVertexAi().preview.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: {
                temperature: 0.7,
                responseMimeType: 'application/json'
            }
        });
        const result = await model.generateContent(prompt);
        const rawText = ((_e = (_d = (_c = (_b = (_a = result.response.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.text) || "[]";
        const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const quiz = JSON.parse(cleanText);
        return { success: true, quiz };
    }
    catch (error) {
        console.error('Error generating quiz:', error);
        throw new functions.https.HttpsError("internal", "Failed to generate quiz.");
    }
});
exports.processAssignmentHelp = functions.https.onCall(async (request) => {
    var _a, _b, _c, _d, _e;
    const data = request.data;
    const context = request;
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "Must be logged in to use Assignment Helper.");
    }
    const { question, fileData, mode } = data;
    if (!question && !fileData) {
        throw new functions.https.HttpsError("invalid-argument", "Must provide a question or file data.");
    }
    const maxQueries = 3;
    const userRef = db.collection("users").doc(context.auth.uid);
    const userSnap = await userRef.get();
    const userData = userSnap.data();
    // Check Plan Limits for student
    const plan = userData === null || userData === void 0 ? void 0 : userData.plan;
    const isPremium = plan === 'pro_monthly' || plan === 'pro_yearly' || (userData === null || userData === void 0 ? void 0 : userData.teacherSubscriptionPlan) === 'premium_tools';
    // Using a different field name so assignment help limit is tracked reliably
    await recordUsageTransaction(context.auth.uid, isPremium, maxQueries, 200, 'assignmentHelp');
    try {
        let SYSTEM_INSTRUCTION = `You are an expert AI Assignment Helper. Your goal is to guide students to the answer, rather than just giving it to them outright.
        - Break down the problem into smaller, understandable steps.
        - Explain the underlying concepts briefly.
        - Use clear formatting with valid markdown. Use tables where appropriate.
        - For math equations, use LaTeX wrapped in $ for inline and $$ for blocks.
        - Be concise and avoid over-explaining simple concepts. Focus on the core of the problem.
        - Ask questions at the end of sections to gauge understanding if appropriate.`;
        if (mode === 'plagiarism-safe') {
            SYSTEM_INSTRUCTION = `You are a Plagiarism-Safe AI Tutor. Your strict rule is to help students *think*, not cheat.
            - You MUST NOT write complete essays, code blocks solving the whole assignment, or full paragraphs of submission-ready text.
            - Return ONLY ideas, outlines, structures, concepts, and guiding hints.
            - Use bullet points and headers extensively.
            - Provide structured outlines with bullet points that the student can write from.
            - Actively refuse to "write my essay" or "do my homework directly", instead offering a structured breakdown of how they should approach it.
            - Output should be in valid markdown.`;
        }
        else if (mode === 'citations') {
            SYSTEM_INSTRUCTION = `You are an expert Citation Generator.
            - Extract the source URL, book title, or reference info from the user's prompt.
            - Instantly return the citation formatted perfectly in both APA and MLA formatting.
            - Format the response beautifully using Markdown with clear headers for "**APA Format**" and "**MLA Format**".
            - Give no extra conversational fluff, just the citations.`;
        }
        else if (mode === 'submission-check') {
            SYSTEM_INSTRUCTION = `You are an expert Assignment Submission Reviewer.
            - The student has pasted their assignment work and the question/brief.
            - Review their work and flag:
              1. Missing sections based on the question/brief (if provided).
              2. Weak arguments or unsupported claims.
              3. Formatting issues (no references, no introduction, lack of structure, etc.).
            - Output a bulleted "Checklist of what to fix before submitting".
            - Be concise, direct, and constructive. Use valid markdown.`;
        }
        const parts = [];
        if (question) {
            parts.push({ text: question });
        }
        if (fileData) {
            if (fileData.storagePath) {
                try {
                    const [fileBuf] = await admin.storage().bucket().file(fileData.storagePath).download();
                    parts.push({
                        inlineData: {
                            data: fileBuf.toString('base64'),
                            mimeType: fileData.mimeType
                        }
                    });
                }
                catch (err) {
                    console.error('Error downloading isolated file from storage:', err);
                }
            }
            else if (fileData.data && fileData.mimeType) {
                parts.push({
                    inlineData: {
                        data: fileData.data.split(',')[1] || fileData.data,
                        mimeType: fileData.mimeType
                    }
                });
            }
        }
        const model = getVertexAi().preview.getGenerativeModel({
            model: 'gemini-2.5-pro',
            systemInstruction: SYSTEM_INSTRUCTION,
            generationConfig: {
                temperature: 0.7
            }
        });
        const result = await model.generateContent({ contents: [{ role: 'user', parts }] });
        const text = ((_e = (_d = (_c = (_b = (_a = result.response.candidates) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.parts) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.text) || "";
        return { success: true, result: text };
    }
    catch (error) {
        console.error('Error generating assignment help:', error);
        throw new functions.https.HttpsError("internal", error.message);
    }
});
//# sourceMappingURL=ai-generation.js.map