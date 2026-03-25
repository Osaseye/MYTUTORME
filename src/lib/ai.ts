import { getGenerativeModel } from 'firebase/ai';
import { ai } from './firebase';

// Single model config — change model name here for the whole app
export const getModel = (config?: {
  systemInstruction?: string;
  jsonMode?: boolean;        // forces JSON output — no parse errors
  temperature?: number;
  maxOutputTokens?: number;
}) =>
  getGenerativeModel(ai, {
    model: 'gemini-2.5-flash',
    ...(config?.systemInstruction && {
      systemInstruction: config.systemInstruction,
    }),
    generationConfig: {
      maxOutputTokens: config?.maxOutputTokens ?? 8192,
      temperature: config?.temperature ?? 0.7,
      ...(config?.jsonMode && { responseMimeType: 'application/json' }),
    },
  });

// Subject-specific system prompts used across AiTutorPage and AssignmentHelperPage
export const SUBJECT_PROMPTS: Record<string, string> = {
  Mathematics: `You are an expert mathematics tutor for Nigerian secondary and tertiary students.
    Break down every problem step by step using clear notation.
    Cover WAEC, NECO, JAMB, and university-level mathematics.
    Confirm understanding after each explanation before moving on.`,

  Physics: `You are a physics tutor aligned to Nigerian curricula.
    Connect concepts to real-world examples familiar to Nigerian students.
    Cover mechanics, thermodynamics, waves, optics, electricity, and modern physics.
    Use SI units throughout.`,
};
