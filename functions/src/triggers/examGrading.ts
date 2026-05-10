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

      // === COMPUTE COMBINED FINAL SCORE ===
      // Re-fetch all questions to compute a marks-weighted overall score
      // and update the topicBreakdown with theory results.
      let finalScore: number = theoryScorePercent;
      let finalPassed: boolean = theoryScorePercent >= 50;
      const updatedTopicBreakdown: Record<string, { correct: number; total: number }> = {
        ...(attempt.topicBreakdown || {}),
      };

      try {
        const quizRef = db.collection('quizzes').doc(attempt.quizId);
        const quizSnap2 = await quizRef.get();
        const allQuestionIds: string[] = quizSnap2.exists
          ? (quizSnap2.data()!.questionIds || [])
          : [];
        const passingMark: number = quizSnap2.exists
          ? Number(quizSnap2.data()!.passingScore) || 50
          : 50;

        if (allQuestionIds.length > 0) {
          const allQSnaps = await Promise.all(
            allQuestionIds.map((id) => db.collection('questions').doc(id).get())
          );

          let combinedEarned = 0;
          let combinedPossible = 0;

          for (const qSnap of allQSnaps) {
            if (!qSnap.exists) continue;
            const qData = qSnap.data()!;
            const qId = qSnap.id;
            const marks = Number(qData.marks) || 1;
            const topic: string = qData.topicArea || qData.topic || 'General';
            const isTheory =
              qData.type === 'theory' ||
              qData.type === 'short-answer' ||
              (!qData.options || (qData.options as any[]).length === 0);

            combinedPossible += marks;

            if (!updatedTopicBreakdown[topic]) {
              updatedTopicBreakdown[topic] = { correct: 0, total: 0 };
            }

            if (isTheory) {
              const result = gradingResults[qId];
              if (result) {
                combinedEarned += result.score;
                // Count as "correct" if >= 50% of marks awarded
                if (result.score >= marks * 0.5) {
                  updatedTopicBreakdown[topic].correct =
                    (updatedTopicBreakdown[topic].correct || 0) + 1;
                }
              }
            } else {
              // MCQ — re-evaluate from stored answers
              const studentAnswer = attempt.answers?.[qId];
              const correctAnswer = qData.correctAnswer || qData.answer;
              if (studentAnswer !== undefined && studentAnswer === correctAnswer) {
                combinedEarned += marks;
                updatedTopicBreakdown[topic].correct =
                  (updatedTopicBreakdown[topic].correct || 0) + 1;
              }
            }
          }

          if (combinedPossible > 0) {
            finalScore = (combinedEarned / combinedPossible) * 100;
          }
        }

        finalPassed = finalScore >= passingMark;
      } catch (combineErr) {
        console.error('Error computing combined score, falling back:', combineErr);
        // Fallback: if all-theory, use theory percent; for mixed use rough average
        if (attempt.score === null || attempt.score === undefined) {
          finalScore = theoryScorePercent;
        } else {
          finalScore = (Number(attempt.score) + theoryScorePercent) / 2;
        }
        finalPassed = finalScore >= 50;
      }

      await snap.ref.update({
        theoryGradingStatus: 'graded',
        theoryGradingResults: gradingResults,
        theoryScore: theoryScorePercent,
        score: finalScore,
        passed: finalPassed,
        topicBreakdown: updatedTopicBreakdown,
        theoryGradedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(
        `Theory grading complete for attempt ${attemptId}: ${totalEarned}/${totalPossible} theory, final score ${finalScore.toFixed(1)}%`
      );
      return null;
    } catch (error) {
      console.error(`Error grading theory answers for attempt ${attemptId}:`, error);
      await snap.ref.update({ theoryGradingStatus: 'error' });
      return null;
    }
  });
