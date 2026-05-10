import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { VertexAI, SchemaType } from '@google-cloud/vertexai';
import * as mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import officeParser from 'officeparser';

if (!admin.apps.length) {
  admin.initializeApp();
}

const getVertexAi = () => new VertexAI({
  project: process.env.GCLOUD_PROJECT || admin.app().options.projectId!,
  location: "us-central1"
});

const isDocxMime = (mimeType: string, fileName?: string) => {
  return mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName?.toLowerCase().endsWith('.docx') ||
    false;
};

const isXlsxMime = (mimeType: string, fileName?: string) => {
  return mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
    fileName?.toLowerCase().endsWith('.xlsx') ||
    false;
};

const isPptxMime = (mimeType: string, fileName?: string) => {
  return mimeType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
    fileName?.toLowerCase().endsWith('.pptx') ||
    false;
};

const isPdfMime = (mimeType: string, fileName?: string) => {
  return mimeType === 'application/pdf' ||
    fileName?.toLowerCase().endsWith('.pdf') ||
    false;
};

const textToBase64 = (text: string) => Buffer.from(text, 'utf8').toString('base64');

/**
 * Repair common JSON issues from AI output — specifically unescaped control characters
 * inside string values (newlines, carriage returns, tabs, and bare quotes).
 */
function repairJsonString(raw: string): string {
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
      if (ch === '\n') { result += '\\n'; continue; }
      if (ch === '\r') { result += '\\r'; continue; }
      if (ch === '\t') { result += '\\t'; continue; }
    }
    result += ch;
  }
  return result;
}

const COURSE_CONTENT_SCHEMA = {
  type: SchemaType.OBJECT,
  properties: {
    title: { type: SchemaType.STRING },
    timeAllowed: { type: SchemaType.NUMBER },
    studyMaterial: {
      type: SchemaType.OBJECT,
      properties: {
        title: { type: SchemaType.STRING },
        content: { type: SchemaType.STRING }
      }
    },
    sections: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          name: { type: SchemaType.STRING },
          type: { type: SchemaType.STRING },
          questions: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                id: { type: SchemaType.STRING },
                question: { type: SchemaType.STRING },
                type: { type: SchemaType.STRING },
                options: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
                correctAnswer: { type: SchemaType.STRING },
                marks: { type: SchemaType.NUMBER },
                difficulty: { type: SchemaType.STRING },
                topicArea: { type: SchemaType.STRING },
                explanation: { type: SchemaType.STRING }
              }
            }
          }
        }
      }
    }
  }
};

const STUDY_MATERIAL_ONLY_SCHEMA = {
  type: SchemaType.OBJECT,
  required: ['studyMaterial'],
  properties: {
    studyMaterial: {
      type: SchemaType.OBJECT,
      required: ['title', 'content'],
      properties: {
        title: {
          type: SchemaType.STRING,
          description: 'A short formal title for the study guide. Maximum 10 words. Do NOT put course content here.'
        },
        content: {
          type: SchemaType.STRING,
          description: 'A comprehensive, exhaustive markdown study guide covering ALL topics from the source material. No word limit — write as much detail as needed. Use headings, bullet lists, tables, and code blocks. Do NOT summarise or truncate any topic.'
        }
      }
    }
  }
};

const QUESTIONS_ONLY_SCHEMA = {
  type: SchemaType.OBJECT,
  required: ['sections'],
  properties: {
    sections: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        required: ['name', 'type', 'questions'],
        properties: {
          name: { type: SchemaType.STRING, description: 'Section name, e.g. "Section A: Multiple Choice"' },
          type: { type: SchemaType.STRING, description: '"mcq" or "theory"' },
          questions: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              required: ['id', 'question', 'type', 'marks', 'difficulty', 'topicArea'],
              properties: {
                id: { type: SchemaType.STRING },
                question: { type: SchemaType.STRING, description: 'The question text. Keep concise.' },
                type: { type: SchemaType.STRING, description: '"mcq" or "theory"' },
                options: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, description: 'Array of 4 answer choices. Only include for MCQ questions.' },
                correctAnswer: { type: SchemaType.STRING, description: 'The correct answer text. Only include for MCQ questions.' },
                marks: { type: SchemaType.NUMBER },
                difficulty: { type: SchemaType.STRING, description: '"easy", "medium", or "hard"' },
                topicArea: { type: SchemaType.STRING }
              }
            }
          }
        }
      }
    }
  }
};

export const generateCourseContent = functions.https.onCall(
  { timeoutSeconds: 300, memory: '1GiB' },
  async (request) => {
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
      } as any
    });

    console.log('Generating content for:', courseTitle);

    // Truncate extracted text to prevent hitting Gemini input/output limits.
    // For study-material-only mode we raise the cap significantly so large decks
    // (e.g. 100+ slide PowerPoints) are not silently cut short.
    const MAX_TEXT_CHARS = studyMaterialOnly ? 150000 : questionsOnly ? 80000 : 40000;
    const truncateText = (text: string) =>
      text.length > MAX_TEXT_CHARS
        ? text.substring(0, MAX_TEXT_CHARS) + '\n\n[Content truncated for processing]'
        : text;

    // Build prompt
    const promptParts: any[] = [];

    const resolveInlinePart = async (fileObj: any) => {
      if (!fileObj) return null;

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
          const parsed = await officeParser.parseOffice(fileBuf);
          const parsedText = typeof parsed === 'string' ? parsed : String(parsed ?? '');
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
          } catch (pdfErr) {
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
      const noteParts = await Promise.all(notesData.map((note: any) => resolveInlinePart(note)));
      for (const inlinePart of noteParts) {
        if (inlinePart) promptParts.push(inlinePart);
      }
    } else {
        throw new Error("No course notes provided.");
    }

    let examInstructions = "";
    if (hasPastQuestions && pastQuestionsData) {
       const pastQuestionFiles = Array.isArray(pastQuestionsData) ? pastQuestionsData : [pastQuestionsData];
       const pastParts = await Promise.all(pastQuestionFiles.map((fileObj: any) => resolveInlinePart(fileObj)));
       for (const pastQuestionInlinePart of pastParts) {
         if (pastQuestionInlinePart) promptParts.push(pastQuestionInlinePart);
       }
       examInstructions = `
Analyze the uploaded PAST EXAM PAPER(S). Replicate their structure and style as closely as possible (sections, number of questions, question types like MCQ/Theory, marks allocation, phrasing style, and expected depth).
Generate ALL NEW questions based strictly on the uploaded COURSE NOTES. Do not reuse questions from past papers.`;
    } else if (manualConfig) {
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
  "timeAllowed": ${manualConfig?.timeAllowed || 30},
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
    const candidate = result.response.candidates?.[0];
    const finishReason = candidate?.finishReason;
    console.log('Finish reason:', finishReason);
    console.log('Candidate parts count:', candidate?.content?.parts?.length ?? 0);
    if (finishReason === 'MAX_TOKENS') {
      throw new Error('The AI response was too long and was cut off. Try uploading shorter notes or reducing the number of questions requested.');
    }
    const rawText = candidate && candidate.content?.parts?.length > 0 ? candidate.content.parts[0].text || "" : "";
    console.log('Raw text length:', rawText.length, '| First 200 chars:', rawText.substring(0, 200));
    
    // Fallback: fix escaping in case of bad JSON formatting by LLM
    let cleanText = rawText.trim();
    if (cleanText.startsWith('```json')) cleanText = cleanText.substring(7);
    if (cleanText.endsWith('```')) cleanText = cleanText.substring(0, cleanText.length - 3);
    cleanText = cleanText.trim();

    // Try to parse — on failure attempt to repair common AI JSON issues
    let generatedExam;
    try {
      generatedExam = JSON.parse(cleanText);
    } catch {
      try {
        generatedExam = JSON.parse(repairJsonString(cleanText));
      } catch (parseError: any) {
        console.error("JSON parsing failed on response:", cleanText.substring(0, 500) + '...');
        throw new Error("AI returned malformed JSON: " + parseError.message);
      }
    }

    return generatedExam;
  } catch (error: any) {
    console.error('Error generating course content', error);
    throw new functions.https.HttpsError('internal', error.message || 'Error generating exam.');
  }
  }
);
