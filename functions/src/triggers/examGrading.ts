import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { VertexAI } from '@google-cloud/vertexai';

const db = admin.firestore();

const getVertexAi = () =>
  new VertexAI({
    project: process.env.GCLOUD_PROJECT || admin.app().options.projectId!,
    location: 'us-central1',
  });

/**
 * Firestore trigger: fires when a new quiz_attempt document is created.
 * If the attempt has pending theory answers, grades them with Vertex AI
 * and writes results back into the same document.
 */
export const gradeTheoryAnswers = functions.firestore
  .document('quiz_attempts/{attemptId}')
  .onCreate(async (snap, context) => {
    const attempt = snap.data();
    const attemptId = context.params.attemptId;

    // Only run if there are pending theory answers
    if (
      !attempt.hasTheoryQuestions ||
      attempt.theoryGradingStatus !== 'pending' ||
      !attempt.theoryAnswers ||
      Object.keys(attempt.theoryAnswers).length === 0
    ) {
      return null;
    }

    try {
      // Fetch the parent quiz to get subject/topic context
      let examContext = '';
      if (attempt.quizId) {
        const quizSnap = await db.collection('quizzes').doc(attempt.quizId).get();
        if (quizSnap.exists) {
          const q = quizSnap.data()!;
          examContext = `Subject: ${q.subject || 'N/A'}, Topic: ${q.topic || 'N/A'}`;
        }
      }

      // Fetch the individual question documents for model answers
      const theoryAnswers: Record<string, string> = attempt.theoryAnswers;
      const questionIds = Object.keys(theoryAnswers);
      const qSnaps = await Promise.all(
        questionIds.map(id => db.collection('questions').doc(id).get())
      );

      const gradingResults: Record<
        string,
        { score: number; maxScore: number; feedback: string }
      > = {};

      const vertexai = getVertexAi();
      const model = vertexai.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
      });

      for (let i = 0; i < questionIds.length; i++) {
        const questionId = questionIds[i];
        const studentAnswer = theoryAnswers[questionId];
        const qSnap = qSnaps[i];

        if (!qSnap.exists) continue;
        const qData = qSnap.data()!;
        const questionText = qData.text || qData.question || '';
        const modelAnswer = qData.explanation || qData.correctAnswer || '';
        const maxMarks = qData.marks || 10;

        // Skip image uploads — they can't be auto-graded as text
        if (studentAnswer?.startsWith('[IMAGE_UPLOAD:')) {
          gradingResults[questionId] = {
            score: 0,
            maxScore: maxMarks,
            feedback:
              'Handwritten answer uploaded. Manual grading required by instructor.',
          };
          continue;
        }

        const prompt = `You are an expert academic examiner. Grade the following student theory answer.

${examContext}

Question: ${questionText}

Model Answer / Key Points: ${modelAnswer || 'Not provided — grade on general accuracy and depth.'}

Student's Answer: ${studentAnswer || '(No answer provided)'}

Maximum Marks: ${maxMarks}

Return ONLY a JSON object with exactly these fields:
{
  "score": <integer marks awarded, 0 to ${maxMarks}>,
  "feedback": "<2-3 sentence constructive feedback explaining the score and what to improve>"
}`;

        try {
          const result = await model.generateContent(prompt);
          const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
          const parsed = JSON.parse(text);
          gradingResults[questionId] = {
            score: Math.min(Math.max(Number(parsed.score) || 0, 0), maxMarks),
            maxScore: maxMarks,
            feedback: parsed.feedback || 'Grading complete.',
          };
        } catch (err) {
          console.error(`Failed to grade question ${questionId}:`, err);
          gradingResults[questionId] = {
            score: 0,
            maxScore: maxMarks,
            feedback: 'Auto-grading failed for this question. Manual review required.',
          };
        }
      }

      // Calculate total theory score
      const totalEarned = Object.values(gradingResults).reduce(
        (sum, r) => sum + r.score,
        0
      );
      const totalPossible = Object.values(gradingResults).reduce(
        (sum, r) => sum + r.maxScore,
        0
      );
      const theoryScorePercent =
        totalPossible > 0 ? (totalEarned / totalPossible) * 100 : 0;

      await snap.ref.update({
        theoryGradingStatus: 'graded',
        theoryGradingResults: gradingResults,
        theoryScore: theoryScorePercent,
        theoryGradedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(
        `Theory grading complete for attempt ${attemptId}: ${totalEarned}/${totalPossible}`
      );
      return null;
    } catch (error) {
      console.error(`Error grading theory answers for attempt ${attemptId}:`, error);
      await snap.ref.update({ theoryGradingStatus: 'error' });
      return null;
    }
  });
