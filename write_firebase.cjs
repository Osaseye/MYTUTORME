const fs = require('fs');

const content = `import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { getAI, VertexAIBackend } from 'firebase/ai';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

// App Check — must be initialized before any Firebase service is called
// In development, set debug token to skip reCAPTCHA
if (import.meta.env.DEV) {
  // @ts-ignore
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

export const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY || 'dummy_site_key'),
  isTokenAutoRefreshEnabled: true,
});

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Firebase AI Logic — uses Vertex AI backend (Blaze plan)
// No API key needed — uses Google Cloud project credentials automatically
export const ai = getAI(app, { backend: new VertexAIBackend() });

export default app;
`;

fs.writeFileSync('src/lib/firebase.ts', content);

const aiContent = `import { getGenerativeModel } from 'firebase/ai';
import { ai } from './firebase';

// Single model config — change model name here for the whole app
export const getModel = (config?: {
  systemInstruction?: string;
  jsonMode?: boolean;        // forces JSON output — no parse errors
  temperature?: number;
}) =>
  getGenerativeModel(ai, {
    model: 'gemini-2.0-flash',
    ...(config?.systemInstruction && {
      systemInstruction: config.systemInstruction,
    }),
    generationConfig: {
      maxOutputTokens: 2048,
      temperature: config?.temperature ?? 0.7,
      ...(config?.jsonMode && { responseMimeType: 'application/json' }),
    },
  });

// Subject-specific system prompts used across AiTutorPage and AssignmentHelperPage
export const SUBJECT_PROMPTS: Record<string, string> = {
  Mathematics: \`You are an expert mathematics tutor for Nigerian secondary and tertiary students.
    Break down every problem step by step using clear notation.
    Cover WAEC, NECO, JAMB, and university-level mathematics.
    Confirm understanding after each explanation before moving on.\`,

  Physics: \`You are a physics tutor aligned to Nigerian curricula.
    Connect concepts to real-world examples familiar to Nigerian students.
    Cover mechanics, thermodynamics, waves, optics, electricity, and modern physics.
    Use SI units throughout.\`,
};
`;

fs.writeFileSync('src/lib/ai.ts', aiContent);

const envContent = `VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
VITE_RECAPTCHA_SITE_KEY=
VITE_PAYSTACK_PUBLIC_KEY=
`;
fs.writeFileSync('.env', envContent, { flag: 'w' }); // overwrite or create

console.log('Firebase and AI config written.');
