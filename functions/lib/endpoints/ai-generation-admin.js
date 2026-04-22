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
exports.generateCourseContent = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const vertexai_1 = require("@google-cloud/vertexai");
const mammoth = __importStar(require("mammoth"));
const XLSX = __importStar(require("xlsx"));
if (!admin.apps.length) {
    admin.initializeApp();
}
const getVertexAi = () => new vertexai_1.VertexAI({
    project: process.env.GCLOUD_PROJECT || admin.app().options.projectId,
    location: "us-central1"
});
const isDocxMime = (mimeType, fileName) => {
    return mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        (fileName === null || fileName === void 0 ? void 0 : fileName.toLowerCase().endsWith('.docx')) ||
        false;
};
const isXlsxMime = (mimeType, fileName) => {
    return mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        (fileName === null || fileName === void 0 ? void 0 : fileName.toLowerCase().endsWith('.xlsx')) ||
        false;
};
const textToBase64 = (text) => Buffer.from(text, 'utf8').toString('base64');
exports.generateCourseContent = functions.https.onCall({ timeoutSeconds: 300, memory: '1GiB' }, async (request) => {
    const { courseTitle, hasPastQuestions, notesData, pastQuestionsData, manualConfig } = request.data || request;
    try {
        const model = getVertexAi().preview.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: { responseMimeType: "application/json" }
        });
        console.log('Generating content for:', courseTitle);
        // Build prompt
        const promptParts = [];
        const resolveInlinePart = async (fileObj) => {
            if (!fileObj)
                return null;
            if (fileObj.storagePath) {
                const [fileBuf] = await admin.storage().bucket().file(fileObj.storagePath).download();
                const incomingMimeType = fileObj.mimeType || fileObj.type || 'application/octet-stream';
                const incomingName = fileObj.name || fileObj.fileName || fileObj.storagePath;
                if (isDocxMime(incomingMimeType, incomingName)) {
                    const extracted = await mammoth.extractRawText({ buffer: fileBuf });
                    return {
                        inlineData: {
                            data: textToBase64(extracted.value || ''),
                            mimeType: 'text/plain'
                        }
                    };
                }
                if (isXlsxMime(incomingMimeType, incomingName)) {
                    const workbook = XLSX.read(fileBuf, { type: 'buffer' });
                    let text = '';
                    for (const sheetName of workbook.SheetNames) {
                        const sheet = workbook.Sheets[sheetName];
                        text += `Sheet: ${sheetName}\n`;
                        text += XLSX.utils.sheet_to_csv(sheet);
                        text += '\n\n';
                    }
                    return {
                        inlineData: {
                            data: textToBase64(text),
                            mimeType: 'text/plain'
                        }
                    };
                }
                return {
                    inlineData: {
                        data: fileBuf.toString('base64'),
                        mimeType: incomingMimeType
                    }
                };
            }
            if (fileObj.data) {
                return {
                    inlineData: {
                        data: fileObj.data,
                        mimeType: fileObj.type || fileObj.mimeType || 'application/octet-stream'
                    }
                };
            }
            return null;
        };
        if (notesData && Array.isArray(notesData)) {
            for (const note of notesData) {
                const inlinePart = await resolveInlinePart(note);
                if (inlinePart) {
                    promptParts.push(inlinePart);
                }
            }
        }
        else {
            throw new Error("No course notes provided.");
        }
        let examInstructions = "";
        if (hasPastQuestions && pastQuestionsData) {
            const pastQuestionInlinePart = await resolveInlinePart(pastQuestionsData);
            if (pastQuestionInlinePart) {
                promptParts.push(pastQuestionInlinePart);
            }
            examInstructions = `
Analyze the uploaded PAST EXAM PAPER. Replicate its exact structure (sections, number of questions, types of questions like MCQ/Theory, marks allocation, and overall style). 
Generate ALL NEW questions based strictly on the uploaded COURSE NOTES. Do not reuse questions from the past paper.`;
        }
        else if (manualConfig) {
            examInstructions = `
Generate an exam based strictly on the uploaded COURSE NOTES following this manual configuration:
- Format: ${manualConfig.examFormat} (mcq, theory, or mixed)
- Number of Questions: ${manualConfig.questionCount}
- Time Allowed: ${manualConfig.timeAllowed} minutes
- Difficulty Level: ${manualConfig.difficulty}`;
        }
        const textualPrompt = `You are an expert academic AI. Process the course notes for "${courseTitle}".

${examInstructions}

First, generate a "studyMaterial" object containing:
- "title": A formal title for the study guide.
- "content": A detailed string (using \\n\\n for paragraphs) summarizing the core concepts from the notes so the student is prepared for the exam.

Second, generate the "sections" array for the exam.
Each question must contain:
- id: unique string
- question: The question text
- type: "mcq" or "theory"
- options: array of 4 strings (only if MCQ, otherwise null)
- correctAnswer: The correct answer text (only if MCQ, otherwise null)
- marks: number
- difficulty: string ("easy", "medium", "hard")
- topicArea: string
- explanation: brief explanation

Your response MUST be valid JSON fitting this exact structure:
{
  "title": "${courseTitle} - Mock Exam",
  "timeAllowed": ${(manualConfig === null || manualConfig === void 0 ? void 0 : manualConfig.timeAllowed) || 30},
  "studyMaterial": {
     "title": "string",
     "content": "string"
  },
  "sections": [
    {
      "name": "string",
      "type": "string",
      "questions": [
        {
          "id": "string",
          "question": "string",
          "type": "string",
          "options": ["string"],
          "correctAnswer": "string",
          "marks": 0,
          "difficulty": "string",
          "topicArea": "string",
          "explanation": "string"
        }
      ]
    }
  ]
}`;
        promptParts.push({ text: textualPrompt });
        const result = await model.generateContent({ contents: [{ role: 'user', parts: promptParts }] });
        const rawText = result.response.candidates && result.response.candidates[0].content.parts.length > 0 ? result.response.candidates[0].content.parts[0].text || "" : "";
        // Fallback: fix escaping in case of bad JSON formatting by LLM
        let cleanText = rawText.trim();
        if (cleanText.startsWith('```json'))
            cleanText = cleanText.substring(7);
        if (cleanText.endsWith('```'))
            cleanText = cleanText.substring(0, cleanText.length - 3);
        cleanText = cleanText.trim();
        // Try to parse, if it fails, throw a clear error showing we got malformed JSON
        let generatedExam;
        try {
            generatedExam = JSON.parse(cleanText);
        }
        catch (parseError) {
            console.error("JSON parsing failed on response:", cleanText.substring(0, 500) + '...');
            throw new Error("AI returned malformed JSON: " + parseError.message);
        }
        return generatedExam;
    }
    catch (error) {
        console.error('Error generating course content', error);
        throw new functions.https.HttpsError('internal', error.message || 'Error generating exam.');
    }
});
//# sourceMappingURL=ai-generation-admin.js.map