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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCourseContent = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const vertexai_1 = require("@google-cloud/vertexai");
const mammoth = __importStar(require("mammoth"));
const XLSX = __importStar(require("xlsx"));
const officeparser_1 = __importDefault(require("officeparser"));
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
const isPptxMime = (mimeType, fileName) => {
    return mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
        (fileName === null || fileName === void 0 ? void 0 : fileName.toLowerCase().endsWith('.pptx')) ||
        false;
};
const isPdfMime = (mimeType, fileName) => {
    return mimeType === 'application/pdf' ||
        (fileName === null || fileName === void 0 ? void 0 : fileName.toLowerCase().endsWith('.pdf')) ||
        false;
};
const textToBase64 = (text) => Buffer.from(text, 'utf8').toString('base64');
/**
 * Repair common JSON issues from AI output — specifically unescaped control characters
 * inside string values (newlines, carriage returns, tabs, and bare quotes).
 */
function repairJsonString(raw) {
    let result = '';
    let inString = false;
    let escape = false;
    for (let i = 0; i < raw.length; i++) {
        const ch = raw[i];
        if (escape) {
            result += ch;
            escape = false;
            continue;
        }
        if (ch === '\\') {
            result += ch;
            escape = true;
            continue;
        }
        if (ch === '"') {
            inString = !inString;
            result += ch;
            continue;
        }
        if (inString) {
            if (ch === '\n') {
                result += '\\n';
                continue;
            }
            if (ch === '\r') {
                result += '\\r';
                continue;
            }
            if (ch === '\t') {
                result += '\\t';
                continue;
            }
        }
        result += ch;
    }
    return result;
}
const COURSE_CONTENT_SCHEMA = {
    type: vertexai_1.SchemaType.OBJECT,
    properties: {
        title: { type: vertexai_1.SchemaType.STRING },
        timeAllowed: { type: vertexai_1.SchemaType.NUMBER },
        studyMaterial: {
            type: vertexai_1.SchemaType.OBJECT,
            properties: {
                title: { type: vertexai_1.SchemaType.STRING },
                content: { type: vertexai_1.SchemaType.STRING }
            }
        },
        sections: {
            type: vertexai_1.SchemaType.ARRAY,
            items: {
                type: vertexai_1.SchemaType.OBJECT,
                properties: {
                    name: { type: vertexai_1.SchemaType.STRING },
                    type: { type: vertexai_1.SchemaType.STRING },
                    questions: {
                        type: vertexai_1.SchemaType.ARRAY,
                        items: {
                            type: vertexai_1.SchemaType.OBJECT,
                            properties: {
                                id: { type: vertexai_1.SchemaType.STRING },
                                question: { type: vertexai_1.SchemaType.STRING },
                                type: { type: vertexai_1.SchemaType.STRING },
                                options: { type: vertexai_1.SchemaType.ARRAY, items: { type: vertexai_1.SchemaType.STRING } },
                                correctAnswer: { type: vertexai_1.SchemaType.STRING },
                                marks: { type: vertexai_1.SchemaType.NUMBER },
                                difficulty: { type: vertexai_1.SchemaType.STRING },
                                topicArea: { type: vertexai_1.SchemaType.STRING },
                                explanation: { type: vertexai_1.SchemaType.STRING }
                            }
                        }
                    }
                }
            }
        }
    }
};
const STUDY_MATERIAL_ONLY_SCHEMA = {
    type: vertexai_1.SchemaType.OBJECT,
    required: ['studyMaterial'],
    properties: {
        studyMaterial: {
            type: vertexai_1.SchemaType.OBJECT,
            required: ['title', 'content'],
            properties: {
                title: {
                    type: vertexai_1.SchemaType.STRING,
                    description: 'A short formal title for the study guide. Maximum 10 words. Do NOT put course content here.'
                },
                content: {
                    type: vertexai_1.SchemaType.STRING,
                    description: 'A comprehensive, exhaustive markdown study guide covering ALL topics from the source material. No word limit — write as much detail as needed. Use headings, bullet lists, tables, and code blocks. Do NOT summarise or truncate any topic.'
                }
            }
        }
    }
};
const QUESTIONS_ONLY_SCHEMA = {
    type: vertexai_1.SchemaType.OBJECT,
    required: ['sections'],
    properties: {
        sections: {
            type: vertexai_1.SchemaType.ARRAY,
            items: {
                type: vertexai_1.SchemaType.OBJECT,
                required: ['name', 'type', 'questions'],
                properties: {
                    name: { type: vertexai_1.SchemaType.STRING, description: 'Section name, e.g. "Section A: Multiple Choice"' },
                    type: { type: vertexai_1.SchemaType.STRING, description: '"mcq" or "theory"' },
                    questions: {
                        type: vertexai_1.SchemaType.ARRAY,
                        items: {
                            type: vertexai_1.SchemaType.OBJECT,
                            required: ['id', 'question', 'type', 'marks', 'difficulty', 'topicArea'],
                            properties: {
                                id: { type: vertexai_1.SchemaType.STRING },
                                question: { type: vertexai_1.SchemaType.STRING, description: 'The question text. Keep concise.' },
                                type: { type: vertexai_1.SchemaType.STRING, description: '"mcq" or "theory"' },
                                options: { type: vertexai_1.SchemaType.ARRAY, items: { type: vertexai_1.SchemaType.STRING }, description: 'Array of 4 answer choices. Only include for MCQ questions.' },
                                correctAnswer: { type: vertexai_1.SchemaType.STRING, description: 'The correct answer text. Only include for MCQ questions.' },
                                marks: { type: vertexai_1.SchemaType.NUMBER },
                                difficulty: { type: vertexai_1.SchemaType.STRING, description: '"easy", "medium", or "hard"' },
                                topicArea: { type: vertexai_1.SchemaType.STRING }
                            }
                        }
                    }
                }
            }
        }
    }
};
exports.generateCourseContent = functions.https.onCall({ timeoutSeconds: 300, memory: '1GiB' }, async (request) => {
    var _a, _b, _c, _d, _e, _f;
    const { courseTitle, hasPastQuestions, notesData, pastQuestionsData, manualConfig, studyMaterialOnly, questionsOnly } = request.data || request;
    try {
        const schema = studyMaterialOnly ? STUDY_MATERIAL_ONLY_SCHEMA : questionsOnly ? QUESTIONS_ONLY_SCHEMA : COURSE_CONTENT_SCHEMA;
        const maxOutputTokens = 65536; // Always use maximum — thinking tokens count against this budget
        const model = getVertexAi().preview.getGenerativeModel({
            model: "gemini-2.5-flash",
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: schema,
                maxOutputTokens,
                // Disable thinking — thinking tokens eat into the output budget for all generation modes.
                // Cast to any because thinkingConfig is a preview API not yet in the typedefs.
                thinkingConfig: { thinkingBudget: 0 }
            }
        });
        console.log('Generating content for:', courseTitle);
        // Truncate extracted text to prevent hitting Gemini input/output limits.
        // For study-material-only mode we raise the cap significantly so large decks
        // (e.g. 100+ slide PowerPoints) are not silently cut short.
        const MAX_TEXT_CHARS = studyMaterialOnly ? 150000 : questionsOnly ? 80000 : 40000;
        const truncateText = (text) => text.length > MAX_TEXT_CHARS
            ? text.substring(0, MAX_TEXT_CHARS) + '\n\n[Content truncated for processing]'
            : text;
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
                            data: textToBase64(truncateText(extracted.value || '')),
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
                            data: textToBase64(truncateText(text)),
                            mimeType: 'text/plain'
                        }
                    };
                }
                if (isPptxMime(incomingMimeType, incomingName)) {
                    const parsed = await officeparser_1.default.parseOffice(fileBuf);
                    const parsedText = typeof parsed === 'string' ? parsed : String(parsed !== null && parsed !== void 0 ? parsed : '');
                    return {
                        inlineData: {
                            data: textToBase64(truncateText(parsedText)),
                            mimeType: 'text/plain'
                        }
                    };
                }
                if (isPdfMime(incomingMimeType, incomingName)) {
                    try {
                        // Lazy-load to avoid Cloud Function initialization timeout (pdf-parse reads test files on require)
                        // eslint-disable-next-line @typescript-eslint/no-var-requires
                        const pdfParse = require('pdf-parse');
                        const pdfData = await pdfParse(fileBuf);
                        const extractedText = pdfData.text || '';
                        return {
                            inlineData: {
                                data: textToBase64(truncateText(extractedText)),
                                mimeType: 'text/plain'
                            }
                        };
                    }
                    catch (pdfErr) {
                        console.warn('pdf-parse failed, sending raw PDF bytes:', pdfErr);
                        // Fall through to raw binary fallback
                    }
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
            const noteParts = await Promise.all(notesData.map((note) => resolveInlinePart(note)));
            for (const inlinePart of noteParts) {
                if (inlinePart)
                    promptParts.push(inlinePart);
            }
        }
        else {
            throw new Error("No course notes provided.");
        }
        let examInstructions = "";
        if (hasPastQuestions && pastQuestionsData) {
            const pastQuestionFiles = Array.isArray(pastQuestionsData) ? pastQuestionsData : [pastQuestionsData];
            const pastParts = await Promise.all(pastQuestionFiles.map((fileObj) => resolveInlinePart(fileObj)));
            for (const pastQuestionInlinePart of pastParts) {
                if (pastQuestionInlinePart)
                    promptParts.push(pastQuestionInlinePart);
            }
            examInstructions = `
Analyze the uploaded PAST EXAM PAPER(S). Replicate their structure and style as closely as possible (sections, number of questions, question types like MCQ/Theory, marks allocation, phrasing style, and expected depth).
Generate ALL NEW questions based strictly on the uploaded COURSE NOTES. Do not reuse questions from past papers.`;
        }
        else if (manualConfig) {
            const formatInstructions = manualConfig.examFormat === 'mcq'
                ? 'ALL questions MUST be type "mcq" with 4 options and a correctAnswer. Do NOT generate any theory questions.'
                : manualConfig.examFormat === 'theory'
                    ? 'ALL questions MUST be type "theory". Do NOT generate any mcq questions. Do not include options or correctAnswer fields.'
                    : 'Mix mcq and theory questions roughly 50/50.';
            examInstructions = `
Generate an exam based strictly on the provided study material following this manual configuration:
- QUESTION TYPE: ${formatInstructions}
- Number of Questions: ${manualConfig.questionCount}
- Time Allowed: ${manualConfig.timeAllowed} minutes
- Difficulty Level: ${manualConfig.difficulty}`;
        }
        const textualPrompt = studyMaterialOnly
            ? `You are an expert academic AI. Process the uploaded course notes for "${courseTitle}".

STEP 1 — BEFORE WRITING ANYTHING: Scan the entire document and mentally list every module, chapter, section, and major topic present. Count them. This is your coverage checklist — you must cover ALL of them.

STEP 2 — BUDGET YOUR DEPTH: Divide your output budget evenly across all identified topics. Do NOT spend excessive words on early sections at the expense of later ones. Every topic deserves roughly equal treatment. If the document has 5 modules, give each module roughly 1/5 of your total output.

STEP 3 — WRITE THE STUDY GUIDE covering every topic you identified in Step 1. For each topic include:
- Full explanation of the concept
- All key definitions and terminology
- How it works (step by step where applicable)
- Important properties, types, or classifications
- Any tables, formulas, numerical values, or acronym expansions from the source
- Concrete examples where relevant

Formatting: Use ## for modules/chapters, ### for subsections. Use bullet lists and markdown tables where appropriate.
For ANY ASCII art, block diagrams, circuit diagrams, architecture diagrams, or text-based visual representations: wrap them in \`\`\`diagram ... \`\`\` fences (NOT plain \`\`\` or \`\`\`code fences). Use \`\`\`assembly or \`\`\`python etc. ONLY for real executable code.

CRITICAL RULES:
- You MUST reach and cover the LAST topic in the document. Do not stop early.
- Do not say "see notes" or use placeholder phrases like "and more" or "etc."
- Keep per-topic depth consistent — if you covered the first topic in 300 words, cover subsequent topics in roughly 300 words too.
- It is better to cover all topics at moderate depth than to cover half the topics exhaustively.

Your response MUST be valid JSON:
{
  "studyMaterial": {
    "title": "string",
    "content": "string"
  }
}`
            : questionsOnly
                ? `You are an expert academic AI. Generate exam questions for "${courseTitle}" from the provided study material.

${examInstructions}

IMPORTANT: Strictly follow the question type instructions above. Do not mix types unless explicitly told to.

Generate ONLY the "sections" array. Each question must contain:
- id: unique string (e.g. "q1")
- question: The question text
- type: "mcq" or "theory"
- options: array of 4 strings (MCQ only, otherwise omit)
- correctAnswer: correct answer text (MCQ only, otherwise omit)
- marks: number
- difficulty: "easy", "medium", or "hard"
- topicArea: string

Be concise. Do NOT include explanations. Your response MUST be valid JSON:
{
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
          "topicArea": "string"
        }
      ]
    }
  ]
}`
                : `You are an expert academic AI. Process the course notes for "${courseTitle}".

${examInstructions}

First, generate a "studyMaterial" object containing:
- "title": A formal title for the study guide.
- "content": A concise but thorough markdown summary of core concepts (aim for under 1500 words). Cover all key topics from the notes.
  Use headings, bullet lists, tables for comparisons, and code blocks only where genuinely needed.
  For ASCII art, block diagrams, or any text-based visual representation use \`\`\`diagram ... \`\`\` fences.
  Use language-specific fences (\`\`\`python, \`\`\`assembly, etc.) ONLY for real executable code.

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
        const candidate = (_a = result.response.candidates) === null || _a === void 0 ? void 0 : _a[0];
        const finishReason = candidate === null || candidate === void 0 ? void 0 : candidate.finishReason;
        console.log('Finish reason:', finishReason);
        console.log('Candidate parts count:', (_d = (_c = (_b = candidate === null || candidate === void 0 ? void 0 : candidate.content) === null || _b === void 0 ? void 0 : _b.parts) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0);
        if (finishReason === 'MAX_TOKENS') {
            throw new Error('The AI response was too long and was cut off. Try uploading shorter notes or reducing the number of questions requested.');
        }
        const rawText = candidate && ((_f = (_e = candidate.content) === null || _e === void 0 ? void 0 : _e.parts) === null || _f === void 0 ? void 0 : _f.length) > 0 ? candidate.content.parts[0].text || "" : "";
        console.log('Raw text length:', rawText.length, '| First 200 chars:', rawText.substring(0, 200));
        // Fallback: fix escaping in case of bad JSON formatting by LLM
        let cleanText = rawText.trim();
        if (cleanText.startsWith('```json'))
            cleanText = cleanText.substring(7);
        if (cleanText.endsWith('```'))
            cleanText = cleanText.substring(0, cleanText.length - 3);
        cleanText = cleanText.trim();
        // Try to parse — on failure attempt to repair common AI JSON issues
        let generatedExam;
        try {
            generatedExam = JSON.parse(cleanText);
        }
        catch (_g) {
            try {
                generatedExam = JSON.parse(repairJsonString(cleanText));
            }
            catch (parseError) {
                console.error("JSON parsing failed on response:", cleanText.substring(0, 500) + '...');
                throw new Error("AI returned malformed JSON: " + parseError.message);
            }
        }
        return generatedExam;
    }
    catch (error) {
        console.error('Error generating course content', error);
        throw new functions.https.HttpsError('internal', error.message || 'Error generating exam.');
    }
});
//# sourceMappingURL=ai-generation-admin.js.map