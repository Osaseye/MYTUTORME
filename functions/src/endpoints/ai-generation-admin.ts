import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { VertexAI } from '@google-cloud/vertexai';
import * as mammoth from 'mammoth';
import * as XLSX from 'xlsx';

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

const textToBase64 = (text: string) => Buffer.from(text, 'utf8').toString('base64');

export const generateCourseContent = functions.https.onCall(
  { timeoutSeconds: 300, memory: '1GiB' },
  async (request) => {
  const { courseTitle, hasPastQuestions, notesData, pastQuestionsData, manualConfig } = request.data || request;

  try {
    const model = getVertexAi().preview.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    console.log('Generating content for:', courseTitle);
    
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
    } else {
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
    } else if (manualConfig) {
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
    const rawText = result.response.candidates && result.response.candidates[0].content.parts.length > 0 ? result.response.candidates[0].content.parts[0].text || "" : "";
    
    // Fallback: fix escaping in case of bad JSON formatting by LLM
    let cleanText = rawText.trim();
    if (cleanText.startsWith('```json')) cleanText = cleanText.substring(7);
    if (cleanText.endsWith('```')) cleanText = cleanText.substring(0, cleanText.length - 3);
    cleanText = cleanText.trim();

    // Try to parse, if it fails, throw a clear error showing we got malformed JSON
    let generatedExam;
    try {
       generatedExam = JSON.parse(cleanText);
    } catch (parseError: any) {
       console.error("JSON parsing failed on response:", cleanText.substring(0, 500) + '...');
       throw new Error("AI returned malformed JSON: " + parseError.message);
    }

    return generatedExam;
  } catch (error: any) {
    console.error('Error generating course content', error);
    throw new functions.https.HttpsError('internal', error.message || 'Error generating exam.');
  }
  }
);
