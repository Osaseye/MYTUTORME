# MyTutorMe — Firebase Backend Integration Plan
## Complete Implementation Reference for Copilot

> **Stack:** React 19 + TypeScript + Vite | Firebase v12 (Auth, Firestore, Storage, Functions, AI Logic) | Paystack | SendGrid  
> **AI Layer:** Firebase AI Logic SDK (`firebase/ai`) with Vertex AI backend — NO separate Anthropic key  
> **Billing:** Firebase Blaze (pay-as-you-go) on Google Cloud  
> **Target market:** Nigeria — all monetary values in ₦ (NGN)

---

## Table of Contents

1. [Project Overview & Architecture](#1-project-overview--architecture)
2. [Environment Setup](#2-environment-setup)
3. [Firebase Configuration](#3-firebase-configuration)
4. [Phase 1 — Authentication & User Management](#4-phase-1--authentication--user-management)
5. [Phase 2 — Course Infrastructure](#5-phase-2--course-infrastructure)
6. [Phase 3 — AI Features (Firebase AI Logic)](#6-phase-3--ai-features-firebase-ai-logic)
7. [Phase 4 — Student Academic Tools](#7-phase-4--student-academic-tools)
8. [Phase 4.5 — Feature Gating (Plan Enforcement)](#8-phase-45--feature-gating-plan-enforcement)
9. [Phase 5 — Teacher Tools & Analytics](#9-phase-5--teacher-tools--analytics)
10. [Phase 6 — Community & Real-time Features](#10-phase-6--community--real-time-features)
11. [Phase 6.5 — Subscription & Billing System](#11-phase-65--subscription--billing-system)
12. [Phase 6.6 — KPI Analytics Engine](#12-phase-66--kpi-analytics-engine)
13. [Phase 7 — Payments (Paystack)](#13-phase-7--payments-paystack)
14. [Phase 8 — Admin Panel](#14-phase-8--admin-panel)
15. [Phase 9 — Notifications](#15-phase-9--notifications)
16. [Phase 10 — Security Rules (Final)](#16-phase-10--security-rules-final)
17. [Pricing & Revenue Model](#17-pricing--revenue-model)
18. [Cloud Functions Index](#18-cloud-functions-index)
19. [Implementation Order](#19-implementation-order)

---

## 1. Project Overview & Architecture

### Core Principle
- **No AI secrets on the client.** Firebase AI Logic (Vertex AI) uses Google Cloud credentials automatically — zero API key management for the entire AI layer.
- **No sensitive financial operations from the client.** Paystack webhook, enrollment creation, certificate PDF generation, and email triggers all run inside Cloud Functions.
- **Everything else** (AI chat, AI question generation, Firestore reads/writes, Storage) can be called directly from the React client with Firebase Auth + App Check as the authorization layer.

### User Roles
| Role | Dashboard path | Access |
|------|---------------|--------|
| `student` | `/student/dashboard` | Courses, AI Tutor, GPA, Exam Prep, Community |
| `teacher` | `/teacher/dashboard` | Course creation, earnings, students, community |
| `admin` | `/admin/dashboard` | User management, moderation, financials, KPIs |

### Subscription Tiers (Students)
| Tier | Price | Key limits |
|------|-------|-----------|
| `free` | ₦0 | 5 AI queries/day, 2 courses max, basic GPA summary only |
| `pro_monthly` | ₦4,000/month | Unlimited AI, full library, GPA simulator, 1 guided assignment/month, offline 2 courses |
| `pro_yearly` | ₦40,000/year | Everything in Pro Monthly + priority support + 5 guided assignments/term |

### Add-ons (one-time purchases)
| Add-on | Price |
|--------|-------|
| Guided assignment pack | ₦2,000 each |
| Premium mock exam | ₦3,000 each |

### Teacher Commission (graduated)
| Lifetime earnings | Platform take-rate |
|------------------|-------------------|
| ₦0 – ₦200,000 | 15% |
| ₦200,000 – ₦1,000,000 | 12% |
| Above ₦1,000,000 | 10% |

### Teacher subscription
| Plan | Price | Features |
|------|-------|---------|
| Free | ₦0 | Basic dashboard, 15% commission |
| Premium Tools | ₦12,000/year | Advanced analytics, priority listing, content toolkit, marketing credits |

---

## 2. Environment Setup

### `.env` file (client)
```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=

# App Check — reCAPTCHA v3 (get from console.cloud.google.com/security/recaptcha)
VITE_RECAPTCHA_SITE_KEY=

# Paystack public key (safe to expose in client)
VITE_PAYSTACK_PUBLIC_KEY=
```

### Cloud Functions secrets (NEVER in .env — use Firebase secrets manager)
```bash
firebase functions:secrets:set PAYSTACK_SECRET_KEY
firebase functions:secrets:set SENDGRID_API_KEY
firebase functions:secrets:set APP_URL
```

### Firebase console setup checklist
- [ ] Enable Email/Password authentication
- [ ] Enable Google OAuth provider
- [ ] Enable Vertex AI in Build → AI Logic → Get started
- [ ] Set up App Check with reCAPTCHA v3
- [ ] Enforce App Check on Vertex AI (after testing)
- [ ] Create Firestore database in production mode
- [ ] Create Storage bucket
- [ ] Enable Cloud Functions (Blaze plan required)
- [ ] Create Paystack plans in Paystack dashboard:
  - `PLN_student_pro_monthly` → ₦4,000/month
  - `PLN_student_pro_yearly` → ₦40,000/year
  - `PLN_teacher_premium` → ₦12,000/year

---

## 3. Firebase Configuration

### `src/lib/firebase.ts` — REPLACE ENTIRE FILE
```typescript
import { initializeApp } from 'firebase/app';
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
  provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
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
```

### `src/lib/ai.ts` — NEW FILE (centralized AI model config)
```typescript
import { getGenerativeModel } from 'firebase/ai';
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
  Mathematics: `You are an expert mathematics tutor for Nigerian secondary and tertiary students.
    Break down every problem step by step using clear notation.
    Cover WAEC, NECO, JAMB, and university-level mathematics.
    Confirm understanding after each explanation before moving on.`,

  Physics: `You are a physics tutor aligned to Nigerian curricula.
    Connect concepts to real-world examples familiar to Nigerian students.
    Cover mechanics, thermodynamics, waves, optics, electricity, and modern physics.
    Use SI units throughout.`,

  Biology: `You are a biology tutor specializing in WAEC and JAMB biology syllabi.
    Explain biological processes sequentially with clear terminology.
    Use diagrams descriptions where helpful. Cover cell biology, genetics, ecology.`,

  History: `You are a history tutor focused on African and Nigerian history.
    Provide historical context and help students analyze events critically.
    Cover pre-colonial, colonial, and post-independence Nigerian and African history.`,

  'Comp Sci': `You are a computer science tutor.
    Explain algorithms and data structures with clear examples and pseudocode.
    Cover both theory (for WAEC/JAMB CS) and practical programming.`,

  Chemistry: `You are a chemistry tutor aligned to Nigerian secondary and tertiary syllabi.
    Balance equations clearly. Cover organic, inorganic, and physical chemistry.
    Relate concepts to everyday Nigerian examples where possible.`,
};
```

---

## 4. Phase 1 — Authentication & User Management

### Affected files
- `src/features/auth/api/auth.ts`
- `src/features/auth/components/LoginForm.tsx`
- `src/features/auth/components/RegisterForm.tsx`
- `src/features/auth/hooks/useAuth.ts`
- `src/app/routes/protected-route.tsx`
- `src/features/onboarding/components/StudentOnboarding.tsx`
- `src/features/onboarding/components/TeacherOnboarding.tsx`
- `src/features/admin/pages/AdminLoginPage.tsx`

### Firestore `users/{uid}` document schema (COMPLETE)
```typescript
interface UserDocument {
  // Core identity
  uid: string;
  email: string;
  displayName: string;
  role: 'student' | 'teacher' | 'admin';
  photoURL: string;
  createdAt: number;                        // Date.now() timestamp
  isOnboardingComplete: boolean;

  // Subscription (students)
  plan: 'free' | 'pro_monthly' | 'pro_yearly';
  subscriptionStatus: 'active' | 'cancelled' | 'past_due' | 'trialing' | null;
  subscriptionId: string | null;            // Paystack subscription code e.g. "SUB_xxxx"
  planStartDate: Timestamp | null;
  planRenewalDate: Timestamp | null;
  planCancelledAt: Timestamp | null;

  // Add-on balances (students)
  guidedAssignmentsRemaining: number;       // resets on each subscription charge
  premiumMockExamsRemaining: number;        // topped up by add-on purchases

  // AI query rate limiting (all users)
  aiQueryCount: number;
  aiQueryDate: string;                      // 'Mon Mar 10 2026' — resets daily

  // LTV & CAC tracking (students)
  totalAmountPaid: number;                  // cumulative ₦ — feeds LTV calculation
  firstPaymentDate: Timestamp | null;
  acquisitionSource: 'organic' | 'referral' | 'google_ads' | 'instagram' | 'school_partnership' | 'other';

  // Student-specific fields
  level?: 'secondary' | 'tertiary';
  gradingSystem?: '4.0' | '5.0';
  institution?: string;
  currentCGPA?: number;
  targetCGPA?: number;
  goals?: string[];
  studyStreak?: number;
  lastActiveDate?: string;

  // Teacher-specific fields
  headline?: string;
  bio?: string;
  subjects?: string[];
  verificationStatus?: 'pending' | 'approved' | 'rejected';
  verifiedAt?: Timestamp | null;
  teacherSubscriptionPlan?: 'free' | 'premium_tools';
  teacherSubscriptionRenewal?: Timestamp | null;
  lifetimeEarnings?: number;               // drives graduated commission tier
  currentCommissionRate?: number;          // 0.15 | 0.12 | 0.10

  // Admin-specific fields
  permissions?: string[];
}
```

### `src/features/auth/api/auth.ts` — REPLACE ENTIRE FILE
```typescript
import { auth, db } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import type { LoginCredentials, RegisterCredentials } from '../types';

export const loginUser = async ({ email, password }: LoginCredentials) => {
  return await signInWithEmailAndPassword(auth, email, password);
};

export const registerUser = async ({
  email,
  password,
  name,
  role,
}: RegisterCredentials) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  await updateProfile(user, { displayName: name });

  const userData = {
    uid: user.uid,
    email: user.email!,
    displayName: name,
    role,
    photoURL: '',
    createdAt: Date.now(),
    isOnboardingComplete: false,
    // Subscription defaults
    plan: 'free' as const,
    subscriptionStatus: null,
    subscriptionId: null,
    planStartDate: null,
    planRenewalDate: null,
    planCancelledAt: null,
    guidedAssignmentsRemaining: 0,
    premiumMockExamsRemaining: 0,
    aiQueryCount: 0,
    aiQueryDate: '',
    totalAmountPaid: 0,
    firstPaymentDate: null,
    acquisitionSource: 'organic' as const,
    // Role-specific defaults
    ...(role === 'student' && {
      level: 'secondary',
      gradingSystem: '5.0',
      studyStreak: 0,
    }),
    ...(role === 'teacher' && {
      subjects: [],
      verificationStatus: 'pending',
      lifetimeEarnings: 0,
      currentCommissionRate: 0.15,
      teacherSubscriptionPlan: 'free',
    }),
  };

  await setDoc(doc(db, 'users', user.uid), userData);
  return userCredential;
};

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  // Check if Firestore document exists (returning user vs new user)
  const userDoc = await getDoc(doc(db, 'users', user.uid));

  if (!userDoc.exists()) {
    // First Google login — create user document with student defaults
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName ?? '',
      role: 'student',
      photoURL: user.photoURL ?? '',
      createdAt: Date.now(),
      isOnboardingComplete: false,
      plan: 'free',
      subscriptionStatus: null,
      subscriptionId: null,
      planStartDate: null,
      planRenewalDate: null,
      planCancelledAt: null,
      guidedAssignmentsRemaining: 0,
      premiumMockExamsRemaining: 0,
      aiQueryCount: 0,
      aiQueryDate: '',
      totalAmountPaid: 0,
      firstPaymentDate: null,
      acquisitionSource: 'organic',
      level: 'secondary',
      gradingSystem: '5.0',
      studyStreak: 0,
    });
  }

  return result;
};
```

### `src/features/auth/hooks/useAuth.ts` — KEY CHANGES

The `checkAuth` function is already correctly written to read from Firestore. The only changes needed:

1. Remove all mock user references
2. Add `isOnboardingComplete` check

```typescript
// The checkAuth function inside the Zustand store handles the redirect logic.
// In ProtectedRoute, after confirming isAuthenticated, add:

if (!user.isOnboardingComplete) {
  if (user.role === 'student') return <Navigate to="/onboarding/student" replace />;
  if (user.role === 'teacher') return <Navigate to="/onboarding/teacher" replace />;
}
```

### `src/features/auth/components/LoginForm.tsx` — KEY CHANGES

Replace the mock `onSubmit` with real auth calls:

```typescript
const onSubmit = async (data: LoginCredentials) => {
  setIsLoading(true);
  try {
    await loginUser(data);
    // onAuthStateChanged fires automatically — no manual setUser needed
    // ProtectedRoute handles the redirect based on role from Firestore
    toast.success('Welcome back!');
  } catch (error: any) {
    const messages: Record<string, string> = {
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/too-many-requests': 'Too many attempts. Please try again later.',
    };
    toast.error(messages[error.code] ?? 'Login failed. Please try again.');
  } finally {
    setIsLoading(false);
  }
};
```

Wire the Google button:
```typescript
const handleGoogleLogin = async () => {
  try {
    await loginWithGoogle();
    // onAuthStateChanged handles the rest
  } catch (error) {
    toast.error('Google login failed.');
  }
};
```

### `src/features/auth/components/RegisterForm.tsx` — KEY CHANGES

Replace the mock `onSubmit`:

```typescript
const onSubmit = async (data: RegisterCredentials) => {
  setIsLoading(true);
  try {
    await registerUser(data);
    // onAuthStateChanged fires → Firestore read → isOnboardingComplete: false
    // → ProtectedRoute redirects to onboarding
    toast.success('Account created! Let\'s set up your profile.');
  } catch (error: any) {
    const messages: Record<string, string> = {
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password must be at least 6 characters.',
    };
    toast.error(messages[error.code] ?? 'Registration failed. Please try again.');
  } finally {
    setIsLoading(false);
  }
};
```

### Onboarding persistence — `StudentOnboarding.tsx` final step

On the "Go to Dashboard" button click in step 4:

```typescript
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/features/auth/hooks/useAuth';

// Inside step 4 handler:
const { user } = useAuth();

const handleComplete = async () => {
  if (!user) return;
  await updateDoc(doc(db, 'users', user.uid), {
    isOnboardingComplete: true,
    level: formData.level === '100 Level' || formData.level === '200 Level'
      ? 'tertiary' : 'tertiary',
    institution: formData.institution,
    currentCGPA: formData.cgpa ? parseFloat(formData.cgpa) : null,
    targetCGPA: formData.target_cgpa ? parseFloat(formData.target_cgpa) : null,
    goals: formData.goals,
  });
  navigate('/student/dashboard');
};
```

### `TeacherOnboarding.tsx` final step (submit for review)

```typescript
const handleComplete = async () => {
  if (!user) return;
  await updateDoc(doc(db, 'users', user.uid), {
    isOnboardingComplete: true,
    headline: formData.title,
    bio: formData.bio,
    subjects: formData.subjects.split(',').map((s: string) => s.trim()),
    verificationStatus: 'pending',
  });
  // Credential file upload to Storage (if file selected)
  if (formData.file) {
    const storageRef = ref(storage, `teacher_credentials/${user.uid}/${formData.file.name}`);
    await uploadBytes(storageRef, formData.file);
  }
  navigate('/teacher/dashboard');
};
```

### `StudentSidebar.tsx` — wire sign out button

```typescript
import { useAuth } from '@/features/auth/hooks/useAuth';

const { signOut } = useAuth();

// Replace the non-functional sign out button onClick:
onClick={() => signOut()}
```

---

## 5. Phase 2 — Course Infrastructure

### New Firestore collections

#### `courses/{courseId}`
```typescript
interface CourseDocument {
  title: string;
  description: string;
  teacherId: string;
  teacherName: string;
  teacherPhotoURL: string;
  subject: string;
  level: 'secondary' | 'tertiary';
  price: number;                        // in ₦, 0 = free
  currency: 'NGN';
  status: 'draft' | 'pending_review' | 'live' | 'archived' | 'rejected';
  thumbnailURL: string;
  previewVideoURL: string;
  enrollmentCount: number;
  rating: number;
  reviewCount: number;
  totalDurationMinutes: number;
  tags: string[];
  isFeatured: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt: Timestamp | null;
  rejectionReason: string | null;
}
```

#### `courses/{courseId}/modules/{moduleId}`
```typescript
interface ModuleDocument {
  title: string;
  order: number;                        // display order (1, 2, 3...)
  lessons: Lesson[];                    // embedded array — simpler than subcollection
  quizId: string | null;
}

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'pdf' | 'text';
  videoURL: string | null;              // Firebase Storage download URL
  pdfURL: string | null;
  content: string | null;              // for text lessons
  durationMinutes: number;
  isFreePreview: boolean;               // free tier can watch these
  order: number;
}
```

#### `enrollments/{studentId_courseId}` (composite ID)
```typescript
// Document ID = `${studentId}_${courseId}` for O(1) existence checks in security rules
interface EnrollmentDocument {
  studentId: string;
  courseId: string;
  enrolledAt: Timestamp;
  progressPercent: number;              // 0-100
  completedLessons: string[];           // lesson IDs
  lastAccessedAt: Timestamp;
  lastLessonId: string | null;
  certificateId: string | null;         // set when course completed
}
```

#### `reviews/{reviewId}`
```typescript
interface ReviewDocument {
  courseId: string;
  studentId: string;
  studentName: string;
  rating: number;                       // 1-5
  body: string;
  createdAt: Timestamp;
}
```

### Key queries

**Browse courses (MyCoursesPage):**
```typescript
import { collection, query, where, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';

// Basic — paginated, live courses only
const q = query(
  collection(db, 'courses'),
  where('status', '==', 'live'),
  orderBy('enrollmentCount', 'desc'),
  limit(12)
);

// With subject filter
const q = query(
  collection(db, 'courses'),
  where('status', '==', 'live'),
  where('subject', '==', selectedSubject),  // requires composite index
  orderBy('enrollmentCount', 'desc'),
  limit(12)
);

// Cursor pagination
const q = query(
  collection(db, 'courses'),
  where('status', '==', 'live'),
  orderBy('enrollmentCount', 'desc'),
  startAfter(lastVisibleDoc),
  limit(12)
);
```

> **IMPORTANT:** Multi-field queries require composite indexes. Create indexes in Firebase console for each filter + orderBy combination you support. Firebase will throw an error with a direct link to create the index — follow it.

**Check enrollment (CourseDetailsPage):**
```typescript
import { doc, getDoc } from 'firebase/firestore';

const enrollmentRef = doc(db, 'enrollments', `${uid}_${courseId}`);
const snap = await getDoc(enrollmentRef);
const isEnrolled = snap.exists();
```

**Track lesson completion:**
```typescript
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';

const markLessonComplete = async (lessonId: string, totalLessons: number) => {
  const enrollRef = doc(db, 'enrollments', `${uid}_${courseId}`);
  const snap = await getDoc(enrollRef);
  const completed = snap.data()?.completedLessons ?? [];

  if (!completed.includes(lessonId)) {
    const newCompleted = [...completed, lessonId];
    const progressPercent = Math.round((newCompleted.length / totalLessons) * 100);

    await updateDoc(enrollRef, {
      completedLessons: arrayUnion(lessonId),
      progressPercent,
      lastLessonId: lessonId,
      lastAccessedAt: serverTimestamp(),
      // If 100% complete, trigger certificate eligibility check
      ...(progressPercent === 100 && { completedAt: serverTimestamp() }),
    });
  }
};
```

**Teacher's course list (TeacherCoursesPage):**
```typescript
const q = query(
  collection(db, 'courses'),
  where('teacherId', '==', uid),
  orderBy('createdAt', 'desc')
);
```

### Course creation (CourseCreationPage)

```typescript
import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

// Step 1: Create draft (on first "Save Draft")
const createDraft = async (basicInfo: any) => {
  const docRef = await addDoc(collection(db, 'courses'), {
    ...basicInfo,
    teacherId: uid,
    teacherName: user.displayName,
    status: 'draft',
    enrollmentCount: 0,
    rating: 0,
    reviewCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id; // Store this ID in component state
};

// Step 2: Upload video with progress tracking
const uploadVideo = async (file: File, courseId: string, lessonId: string) => {
  const storageRef = ref(storage, `courses/${courseId}/lessons/${lessonId}.mp4`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise<string>((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress); // Update UI progress bar
      },
      reject,
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(url);
      }
    );
  });
};

// Step 3: Submit for review
const submitForReview = async (courseId: string) => {
  await updateDoc(doc(db, 'courses', courseId), {
    status: 'pending_review',
    updatedAt: serverTimestamp(),
  });
};
```

---

## 6. Phase 3 — AI Features (Firebase AI Logic)

> **No Cloud Function proxy needed for AI calls.** Firebase Auth + App Check validate every request. The `firebase/ai` SDK handles Vertex AI communication directly from the client.

### New Firestore collection: `ai_sessions/{sessionId}`
```typescript
interface AiSessionDocument {
  studentId: string;
  subject: string;
  title: string;                          // first 50 chars of first message
  createdAt: Timestamp;
  lastMessageAt: Timestamp;
  messages: AiMessage[];                  // embedded — max ~50 messages before splitting
}

interface AiMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}
```

### `src/features/student/hooks/useAiTutor.ts` — NEW FILE
```typescript
import { useState, useRef } from 'react';
import { getGenerativeModel } from 'firebase/ai';
import { ai, db } from '@/lib/firebase';
import {
  doc, updateDoc, arrayUnion, getDoc, serverTimestamp,
  setDoc, collection, query, where, orderBy, limit, onSnapshot,
  increment,
} from 'firebase/firestore';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';
import { SUBJECT_PROMPTS } from '@/lib/ai';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export const useAiTutor = (subject: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionHistory, setSessionHistory] = useState<any[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const chatRef = useRef<any>(null);
  const sessionIdRef = useRef<string | null>(null);

  // Subscribe to session history for the sidebar
  const subscribeToHistory = () => {
    if (!user) return;
    const q = query(
      collection(db, 'ai_sessions'),
      where('studentId', '==', user.uid),
      orderBy('lastMessageAt', 'desc'),
      limit(20)
    );
    return onSnapshot(q, (snap) => {
      setSessionHistory(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  };

  const checkRateLimit = async (): Promise<boolean> => {
    if (!user) return false;
    const snap = await getDoc(doc(db, 'users', user.uid));
    const data = snap.data();
    const today = new Date().toDateString();
    const count = data?.aiQueryDate === today ? (data?.aiQueryCount ?? 0) : 0;
    const limit = ['pro_monthly', 'pro_yearly'].includes(data?.plan) ? Infinity : 5;
    return count < limit;
  };

  const initializeChat = async (existingSessionId?: string) => {
    if (!user) return;

    const model = getGenerativeModel(ai, {
      model: 'gemini-2.0-flash',
      systemInstruction:
        SUBJECT_PROMPTS[subject] ?? SUBJECT_PROMPTS.Mathematics,
      generationConfig: { maxOutputTokens: 1024, temperature: 0.7 },
    });

    let geminiHistory: { role: string; parts: { text: string }[] }[] = [];

    if (existingSessionId) {
      sessionIdRef.current = existingSessionId;
      const snap = await getDoc(doc(db, 'ai_sessions', existingSessionId));
      if (snap.exists()) {
        const msgs: Message[] = snap.data().messages ?? [];
        setMessages(msgs);
        geminiHistory = msgs.map((m) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));
      }
    } else {
      const newRef = doc(collection(db, 'ai_sessions'));
      sessionIdRef.current = newRef.id;
      await setDoc(newRef, {
        studentId: user.uid,
        subject,
        title: 'New conversation',
        createdAt: serverTimestamp(),
        lastMessageAt: serverTimestamp(),
        messages: [],
      });
      setMessages([]);
    }

    chatRef.current = model.startChat({ history: geminiHistory });
  };

  const sendMessage = async (content: string) => {
    if (!user || !chatRef.current || !sessionIdRef.current || isStreaming) return;

    const withinLimit = await checkRateLimit();
    if (!withinLimit) {
      toast.error('Daily limit reached', {
        description: 'Upgrade to Pro for unlimited AI queries.',
        action: { label: 'Upgrade', onClick: () => window.location.href = '/student/settings?tab=subscription' },
      });
      return;
    }

    const userMessage: Message = { role: 'user', content, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMessage]);
    setIsStreaming(true);
    setStreamingContent('');

    try {
      const result = await chatRef.current.sendMessageStream(content);
      let fullResponse = '';

      for await (const chunk of result.stream) {
        fullResponse += chunk.text();
        setStreamingContent(fullResponse);
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: fullResponse,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setStreamingContent('');

      // Persist and update rate limit
      const sessionRef = doc(db, 'ai_sessions', sessionIdRef.current!);
      const userRef = doc(db, 'users', user.uid);
      const today = new Date().toDateString();
      const userSnap = await getDoc(userRef);
      const userData = userSnap.data();
      const currentCount =
        userData?.aiQueryDate === today ? (userData?.aiQueryCount ?? 0) : 0;

      await Promise.all([
        updateDoc(sessionRef, {
          messages: arrayUnion(userMessage, assistantMessage),
          lastMessageAt: serverTimestamp(),
          ...(messages.length === 0 && { title: content.slice(0, 50) }),
        }),
        updateDoc(userRef, {
          aiQueryCount: currentCount + 1,
          aiQueryDate: today,
        }),
      ]);
    } catch (error) {
      console.error('AI error:', error);
      setMessages((prev) => prev.filter((m) => m !== userMessage));
      toast.error('Failed to get a response. Please try again.');
    } finally {
      setIsStreaming(false);
    }
  };

  return {
    messages,
    sessionHistory,
    isStreaming,
    streamingContent,
    sendMessage,
    initializeChat,
    subscribeToHistory,
  };
};
```

### `AiTutorPage.tsx` — key changes
```typescript
// Replace useState for messages with useAiTutor hook
const {
  messages, sessionHistory, isStreaming, streamingContent,
  sendMessage, initializeChat, subscribeToHistory
} = useAiTutor(activeSubject.name);

// On mount and subject change
useEffect(() => {
  initializeChat();
  const unsubscribe = subscribeToHistory();
  return () => unsubscribe?.();
}, [activeSubject.name]);

// Wire send button
const handleSend = async () => {
  if (!inputValue.trim() || isStreaming) return;
  const msg = inputValue;
  setInputValue('');
  await sendMessage(msg);
};

// Show streaming indicator below confirmed messages
// While isStreaming && streamingContent, render a special "typing" bubble
```

### Assignment Helper — image/PDF analysis
```typescript
// src/features/student/hooks/useAssignmentHelper.ts
import { getGenerativeModel } from 'firebase/ai';
import { ai, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const useAssignmentHelper = () => {
  const { user } = useAuth();

  const analyzeAssignment = async (
    questionText: string,
    file?: File,
    subject: string = 'Mathematics'
  ) => {
    const model = getGenerativeModel(ai, {
      model: 'gemini-2.0-flash',
      systemInstruction: `You are an expert academic tutor specializing in ${subject}.
        Analyze the assignment and provide a clear step-by-step solution.
        In "Hint Mode": provide hints only, do NOT give the full answer.
        In "Full Explanation": provide the complete worked solution with explanation.`,
    });

    const parts: any[] = [];

    if (file) {
      // Store file in Firebase Storage for record-keeping
      const storageRef = ref(storage, `assignment_uploads/${user!.uid}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);

      // Convert to base64 for Gemini inline data
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      parts.push({ inlineData: { data: base64, mimeType: file.type as any } });
    }

    if (questionText) {
      parts.push({ text: questionText });
    }

    const result = await model.generateContentStream(parts);
    return result.stream;
  };

  return { analyzeAssignment };
};
```

---

## 7. Phase 4 — Student Academic Tools

### GPA Tracker — `gpa_records/{uid}`
```typescript
interface GpaRecord {
  userId: string;
  scale: '4.0' | '5.0';
  targetGPA: number;
  semesters: Semester[];
  updatedAt: Timestamp;
}
```

**Reading and writing GPA data:**
```typescript
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

// Load on page mount
const loadGpaRecord = async (uid: string) => {
  const snap = await getDoc(doc(db, 'gpa_records', uid));
  if (snap.exists()) return snap.data() as GpaRecord;
  return null; // No record yet — show empty state
};

// Save — debounce by 1500ms to avoid writes on every keystroke
const saveGpaRecord = useDebouncedCallback(async (data: GpaRecord) => {
  await setDoc(doc(db, 'gpa_records', user!.uid), {
    ...data,
    userId: user!.uid,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}, 1500);
```

### Quiz/Exam system — collections

#### `quizzes/{quizId}`
```typescript
interface QuizDocument {
  courseId: string | null;          // null for standalone exam prep
  title: string;
  subject: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'adaptive';
  timeLimit: number;                // minutes
  passingScore: number;             // percentage e.g. 70
  questionIds: string[];            // references to questions collection
  aiGenerated: boolean;
  createdAt: Timestamp;
}
```

#### `questions/{questionId}`
```typescript
interface QuestionDocument {
  quizId: string | null;
  text: string;
  type: 'multiple-choice' | 'true-false';
  options: string[];
  correctAnswer: string;
  explanation: string;
  subject: string;
  topic: string;
  difficulty: string;
  aiGenerated: boolean;
  generatedAt: Timestamp | null;
}
```

#### `quiz_attempts/{attemptId}`
```typescript
interface QuizAttemptDocument {
  studentId: string;
  quizId: string;
  courseId: string | null;
  startedAt: Timestamp;
  completedAt: Timestamp | null;
  score: number;
  passed: boolean;
  timeTaken: number;                // seconds
  answers: Record<string, string>;  // { questionId: selectedAnswer }
  topicBreakdown: Record<string, { correct: number; total: number }>;
}
```

### AI exam question generation
```typescript
// src/features/student/hooks/useExamGenerator.ts
import { getModel } from '@/lib/ai';
import { collection, writeBatch, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const generateExamQuestions = async ({
  subject, topics, difficulty, count, weakTopics,
}: {
  subject: string;
  topics: string[];
  difficulty: string;
  count: number;
  weakTopics: string[];
}) => {
  // JSON mode forces valid JSON output — no manual parsing needed
  const model = getModel({ jsonMode: true, temperature: 0.4 });

  const focus =
    weakTopics.length > 0
      ? `Focus heavily on these weak areas: ${weakTopics.join(', ')}`
      : `Cover these topics evenly: ${topics.join(', ')}`;

  const prompt = `Generate exactly ${count} ${difficulty} exam questions for ${subject}. ${focus}.
    Return a JSON array. Each object must have:
    {
      "text": "question text",
      "type": "multiple-choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "exact text of correct option",
      "explanation": "detailed explanation of why this is correct",
      "topic": "specific sub-topic this tests"
    }`;

  const result = await model.generateContent(prompt);
  const questions = JSON.parse(result.response.text());

  const batch = writeBatch(db);
  const questionIds: string[] = [];

  questions.forEach((q: any) => {
    const ref = doc(collection(db, 'questions'));
    batch.set(ref, {
      ...q,
      subject,
      difficulty,
      aiGenerated: true,
      generatedAt: serverTimestamp(),
    });
    questionIds.push(ref.id);
  });

  await batch.commit();
  return questionIds;
};
```

### Certificate generation — `certificates/{certId}`
```typescript
interface CertificateDocument {
  studentId: string;
  courseId: string;
  studentName: string;
  courseName: string;
  instructorName: string;
  issueDate: Timestamp;
  verificationCode: string;         // UUID for verify.mytutorme.com/verify
  grade: string;                    // e.g. "A (98%)"
  pdfURL: string;                   // Firebase Storage URL — generated by Cloud Function
}
```

Certificate creation is triggered by a Cloud Function `onDocumentUpdated` watching `enrollments` for `progressPercent === 100`. The function uses a PDF generation library to render the certificate HTML, uploads the PDF to Storage, and creates the Firestore document.

---

## 8. Phase 4.5 — Feature Gating (Plan Enforcement)

### `src/hooks/usePlanGate.ts` — NEW FILE
```typescript
import React from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export type GatedFeature =
  | 'full_course_library'
  | 'gpa_simulator'
  | 'unlimited_ai'
  | 'offline_downloads'
  | 'guided_assignments'
  | 'premium_mock_exams'
  | 'priority_support';

const PLAN_FEATURES: Record<GatedFeature, string[]> = {
  full_course_library:  ['pro_monthly', 'pro_yearly'],
  gpa_simulator:        ['pro_monthly', 'pro_yearly'],
  unlimited_ai:         ['pro_monthly', 'pro_yearly'],
  offline_downloads:    ['pro_monthly', 'pro_yearly'],
  guided_assignments:   ['pro_monthly', 'pro_yearly'],
  premium_mock_exams:   ['pro_monthly', 'pro_yearly'],
  priority_support:     ['pro_yearly'],
};

const FEATURE_LABELS: Record<GatedFeature, string> = {
  full_course_library:  'Full course library',
  gpa_simulator:        'GPA Simulator',
  unlimited_ai:         'Unlimited AI queries',
  offline_downloads:    'Offline downloads',
  guided_assignments:   'Guided assignments',
  premium_mock_exams:   'Premium mock exams',
  priority_support:     'Priority support',
};

export const UpgradePrompt = ({ feature }: { feature: GatedFeature }) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl text-center">
      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
        <span className="text-primary text-xl">✦</span>
      </div>
      <h3 className="font-bold text-slate-900 dark:text-white mb-2">
        {FEATURE_LABELS[feature]} is a Pro feature
      </h3>
      <p className="text-slate-500 text-sm mb-6 max-w-xs">
        Upgrade to Pro Monthly (₦4,000/month) or Pro Yearly (₦40,000/year) to unlock this.
      </p>
      <Button
        onClick={() => navigate('/student/settings?tab=subscription')}
        className="bg-primary hover:bg-primary/90 text-white"
      >
        Upgrade to Pro
      </Button>
    </div>
  );
};

export const usePlanGate = (feature: GatedFeature) => {
  const { user } = useAuth();
  const plan = user?.plan ?? 'free';
  const hasAccess = PLAN_FEATURES[feature].includes(plan);

  const gate = (
    content: React.ReactNode,
    fallback?: React.ReactNode
  ): React.ReactNode =>
    hasAccess ? content : (fallback ?? <UpgradePrompt feature={feature} />);

  return {
    hasAccess,
    plan,
    isFreeTier: plan === 'free',
    isPro: plan === 'pro_monthly' || plan === 'pro_yearly',
    isProYearly: plan === 'pro_yearly',
    gate,
  };
};
```

### Applying gates in existing pages

**`GpaTrackerPage.tsx`** — wrap the "What If" simulator section:
```typescript
const { gate } = usePlanGate('gpa_simulator');
// ...
{gate(<WhatIfSimulatorSection />)}
```

**`AiTutorPage.tsx`** — the rate limit is enforced inside `useAiTutor` hook already. Show a badge for free users:
```typescript
const { isFreeTier } = usePlanGate('unlimited_ai');
// In the sidebar:
{isFreeTier && <p className="text-xs text-slate-400">5 queries/day on free plan</p>}
```

**`ExamPrepPage.tsx`** — gate premium mock exams:
```typescript
const { gate } = usePlanGate('premium_mock_exams');
// Wrap the premium exam cards:
{gate(<PremiumExamCard />, <LockedExamCard />)}
```

---

## 9. Phase 5 — Teacher Tools & Analytics

### `analytics/teachers/{teacherId}` document (auto-maintained by Cloud Functions)
```typescript
interface TeacherAnalyticsDocument {
  teacherId: string;
  totalRevenue: number;
  totalStudents: number;
  totalEnrollments: number;
  averageRating: number;
  dailyRevenue: Record<string, number>;    // { '2026-03-10': 4500 }
  courseStats: Record<string, {
    enrollments: number;
    completionRate: number;
    averageRating: number;
    revenue: number;
  }>;
  updatedAt: Timestamp;
}
```

### Teacher dashboard reads
```typescript
// TeacherDashboard.tsx
const snap = await getDoc(doc(db, 'analytics', 'teachers', uid));
const analytics = snap.data() as TeacherAnalyticsDocument;
// Use analytics.dailyRevenue for the bar chart
// Use analytics.totalStudents for the stat card
// Use analytics.averageRating for the rating card
```

### Students page query
```typescript
// StudentsPage.tsx
// Get teacher's course IDs first
const coursesSnap = await getDocs(
  query(collection(db, 'courses'), where('teacherId', '==', uid))
);
const courseIds = coursesSnap.docs.map(d => d.id);

// Firestore 'in' supports max 10 values — chunk if needed
const chunkArray = <T>(arr: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );

const enrollmentPromises = chunkArray(courseIds, 10).map((chunk) =>
  getDocs(
    query(
      collection(db, 'enrollments'),
      where('courseId', 'in', chunk),
      orderBy('enrolledAt', 'desc')
    )
  )
);
const results = await Promise.all(enrollmentPromises);
```

### Graduated commission utility (used inside Cloud Functions)
```typescript
// functions/src/utils/commission.ts
export const getCommissionRate = (lifetimeEarnings: number): number => {
  if (lifetimeEarnings >= 1_000_000) return 0.10;
  if (lifetimeEarnings >= 200_000)   return 0.12;
  return 0.15;
};
```

---

## 10. Phase 6 — Community & Real-time Features

### `community_posts/{postId}`
```typescript
interface CommunityPostDocument {
  authorId: string;
  authorName: string;
  authorPhotoURL: string;
  authorRole: 'student' | 'teacher';
  category: string;
  title: string;
  body: string;
  isPinned: boolean;
  likeCount: number;
  commentCount: number;
  createdAt: Timestamp;
  tags: string[];
  isDeleted: boolean;
}
```

### `community_posts/{postId}/comments/{commentId}`
```typescript
interface CommentDocument {
  authorId: string;
  authorName: string;
  authorPhotoURL: string;
  body: string;
  likeCount: number;
  createdAt: Timestamp;
  parentCommentId: string | null;
}
```

### Real-time feed
```typescript
// CommunityPage.tsx
useEffect(() => {
  const q = query(
    collection(db, 'community_posts'),
    where('category', '==', activeCategory),
    where('isDeleted', '==', false),
    orderBy('createdAt', 'desc'),
    limit(15)
  );

  const unsubscribe = onSnapshot(q, (snap) => {
    setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });

  return () => unsubscribe();
}, [activeCategory]);
```

### Like with duplicate prevention
```typescript
// Like document ID = `${postId}_${uid}` for uniqueness
const toggleLike = async (postId: string) => {
  const likeRef = doc(db, 'community_post_likes', `${postId}_${uid}`);
  const likeSnap = await getDoc(likeRef);
  const postRef = doc(db, 'community_posts', postId);

  if (likeSnap.exists()) {
    // Unlike
    await Promise.all([
      deleteDoc(likeRef),
      updateDoc(postRef, { likeCount: increment(-1) })
    ]);
  } else {
    // Like
    await Promise.all([
      setDoc(likeRef, { postId, userId: uid, createdAt: serverTimestamp() }),
      updateDoc(postRef, { likeCount: increment(1) })
    ]);
  }
};
```

---

## 11. Phase 6.5 — Subscription & Billing System

### Paystack plan codes (create in Paystack dashboard)
```
PLN_student_pro_monthly  → interval: monthly,  amount: 400000 (kobo)
PLN_student_pro_yearly   → interval: annually, amount: 4000000 (kobo)
PLN_teacher_premium      → interval: annually, amount: 1200000 (kobo)
```

### Cloud Function: `createSubscription` (callable)
```typescript
// functions/src/subscriptions.ts
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { getFirestore } from 'firebase-admin/firestore';

const PAYSTACK_SECRET = defineSecret('PAYSTACK_SECRET_KEY');

export const createSubscription = onCall(
  { secrets: [PAYSTACK_SECRET] },
  async (request) => {
    const { planCode } = request.data;
    const uid = request.auth?.uid;
    if (!uid) throw new HttpsError('unauthenticated', 'Must be logged in');

    const db = getFirestore();
    const userSnap = await db.collection('users').doc(uid).get();
    const email = userSnap.data()!.email;

    const response = await fetch('https://api.paystack.co/subscription', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET.value()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        customer: email,
        plan: planCode,
        metadata: { studentId: uid },
      }),
    });

    const data = await response.json();
    if (!data.status) throw new HttpsError('internal', data.message);

    return { authorizationUrl: data.data.authorization_url };
  }
);
```

### Cloud Function: `paystackWebhook` (HTTPS trigger)
```typescript
import { onRequest } from 'firebase-functions/v2/https';
import * as crypto from 'crypto';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

export const paystackWebhook = onRequest(
  { secrets: [PAYSTACK_SECRET] },
  async (req, res) => {
    // 1. Verify signature
    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET.value())
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== req.headers['x-paystack-signature']) {
      res.status(400).send('Invalid signature');
      return;
    }

    const { event, data } = req.body;
    const db = getFirestore();
    const uid = data.metadata?.studentId;

    const PLAN_MAP: Record<string, string> = {
      PLN_student_pro_monthly: 'pro_monthly',
      PLN_student_pro_yearly: 'pro_yearly',
      PLN_teacher_premium: 'premium_tools',
    };

    switch (event) {

      case 'charge.success': {
        const planCode = data.plan?.plan_code;
        const newPlan = PLAN_MAP[planCode] ?? 'free';
        const amount = data.amount / 100; // kobo to naira

        const renewalDate = new Date();
        renewalDate.setMonth(
          renewalDate.getMonth() + (newPlan === 'pro_yearly' ? 12 : 1)
        );

        // Determine guided assignment allowance
        const assignmentsReset =
          newPlan === 'pro_yearly' ? 5 : newPlan === 'pro_monthly' ? 1 : 0;

        const userRef = db.collection('users').doc(uid);
        const userSnap = await userRef.get();
        const userData = userSnap.data()!;

        // Check if first payment
        const isFirstPayment = !userData.firstPaymentDate;

        await userRef.update({
          plan: newPlan,
          subscriptionStatus: 'active',
          subscriptionId: data.subscription_code,
          planStartDate: FieldValue.serverTimestamp(),
          planRenewalDate: Timestamp.fromDate(renewalDate),
          guidedAssignmentsRemaining: assignmentsReset,
          totalAmountPaid: FieldValue.increment(amount),
          ...(isFirstPayment && { firstPaymentDate: FieldValue.serverTimestamp() }),
        });

        // Record transaction
        await db.collection('transactions').add({
          type: 'subscription_charge',
          studentId: uid,
          amount,
          plan: newPlan,
          paystackReference: data.reference,
          paystackSubscriptionCode: data.subscription_code,
          status: 'completed',
          createdAt: FieldValue.serverTimestamp(),
        });
        break;
      }

      case 'subscription.disable': {
        const userRef = db.collection('users').doc(uid);
        const userSnap = await userRef.get();
        const prevPlan = userSnap.data()?.plan ?? 'free';

        await userRef.update({
          subscriptionStatus: 'cancelled',
          planCancelledAt: FieldValue.serverTimestamp(),
          // Downgrade plan ONLY at next renewal date — user keeps access for paid period
          // A scheduled function checks planRenewalDate and downgrades then
        });

        // Record churn event
        await db.collection('churn_events').add({
          studentId: uid,
          plan: prevPlan,
          churnedAt: FieldValue.serverTimestamp(),
          reason: data.cancellation_details?.reason ?? 'unknown',
          totalPaid: userSnap.data()?.totalAmountPaid ?? 0,
        });
        break;
      }

      case 'invoice.payment_failed': {
        await db.collection('users').doc(uid).update({
          subscriptionStatus: 'past_due',
        });
        // Notify user to update payment method
        await db.collection('notifications').add({
          userId: uid,
          type: 'payment_failed',
          title: 'Payment failed',
          body: 'Please update your payment method to continue your Pro subscription.',
          isRead: false,
          actionUrl: '/student/settings?tab=subscription',
          createdAt: FieldValue.serverTimestamp(),
        });
        break;
      }

      case 'charge.success': {
        // Handle one-time add-on purchases (identified by metadata.type)
        if (data.metadata?.type === 'addon') {
          const { addonType, quantity } = data.metadata;
          const fieldMap: Record<string, string> = {
            guided_assignment: 'guidedAssignmentsRemaining',
            premium_mock_exam: 'premiumMockExamsRemaining',
          };
          const field = fieldMap[addonType];
          if (field) {
            await db.collection('users').doc(uid).update({
              [field]: FieldValue.increment(quantity),
            });
            await db.collection('addon_purchases').add({
              studentId: uid,
              type: addonType,
              quantity,
              amountPaid: data.amount / 100,
              paystackReference: data.reference,
              createdAt: FieldValue.serverTimestamp(),
            });
          }
        }
        break;
      }
    }

    res.sendStatus(200);
  }
);
```

### Downgrade scheduled function
```typescript
// Runs daily at 00:01 — downgrades users whose subscription was cancelled
// and whose planRenewalDate has passed
export const processDowngrades = onSchedule('1 0 * * *', async () => {
  const db = getFirestore();
  const now = new Date();

  const snap = await db.collection('users')
    .where('subscriptionStatus', '==', 'cancelled')
    .where('planRenewalDate', '<=', Timestamp.fromDate(now))
    .get();

  const batch = db.batch();
  snap.forEach((doc) => {
    batch.update(doc.ref, {
      plan: 'free',
      subscriptionStatus: null,
      guidedAssignmentsRemaining: 0,
    });
  });

  await batch.commit();
});
```

---

## 12. Phase 6.6 — KPI Analytics Engine

### New collections needed

#### `marketing_spend/{YYYY-MM}` (manually entered by admin)
```typescript
interface MarketingSpendDocument {
  totalSpend: number;              // total ₦ spent on marketing
  breakdown: {
    google_ads: number;
    instagram: number;
    referral_rewards: number;
    school_partnerships: number;
    other: number;
  };
  enteredBy: string;               // admin uid
  updatedAt: Timestamp;
}
```

#### `churn_events/{eventId}` (written automatically by webhook)
```typescript
interface ChurnEventDocument {
  studentId: string;
  plan: string;
  churnedAt: Timestamp;
  reason: string;
  totalPaid: number;               // lifetime value at time of churn
}
```

#### `kpi_snapshots/{YYYY-MM}` (written by monthly scheduled function)
```typescript
interface KpiSnapshot {
  month: string;                   // e.g. '2026-03'
  totalActiveSubscribers: number;
  newPaidUsers: number;
  churnedUsers: number;
  churnRate: number;               // percentage e.g. 3.2
  avgCAC: number;                  // ₦ per new paid user
  avgLTV: number;                  // estimated ₦ lifetime value
  ARPU: number;                    // average revenue per user
  grossRevenue: number;            // total ₦ collected
  teacherPayouts: number;          // total ₦ paid to teachers
  platformFees: number;            // grossRevenue - teacherPayouts
  grossMargin: number;             // percentage
  computedAt: Timestamp;
}
```

### Cloud Function: `computeMonthlyKPIs` (scheduled)
```typescript
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore, Timestamp, FieldValue } from 'firebase-admin/firestore';

export const computeMonthlyKPIs = onSchedule('0 0 1 * *', async () => {
  const db = getFirestore();
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const prevStart = Timestamp.fromDate(prevMonthStart);
  const currStart = Timestamp.fromDate(monthStart);

  // 1. Total active subscribers
  const activeSnap = await db.collection('users')
    .where('plan', 'in', ['pro_monthly', 'pro_yearly'])
    .where('subscriptionStatus', '==', 'active')
    .count()
    .get();
  const totalActiveSubscribers = activeSnap.data().count;

  // 2. New paid users last month
  const newPaidSnap = await db.collection('users')
    .where('firstPaymentDate', '>=', prevStart)
    .where('firstPaymentDate', '<', currStart)
    .count()
    .get();
  const newPaidUsers = newPaidSnap.data().count;

  // 3. Churned users last month
  const churnSnap = await db.collection('churn_events')
    .where('churnedAt', '>=', prevStart)
    .where('churnedAt', '<', currStart)
    .count()
    .get();
  const churnedUsers = churnSnap.data().count;
  const churnRate = totalActiveSubscribers > 0
    ? Number(((churnedUsers / totalActiveSubscribers) * 100).toFixed(2))
    : 0;

  // 4. Revenue from transactions last month
  const transSnap = await db.collection('transactions')
    .where('createdAt', '>=', prevStart)
    .where('createdAt', '<', currStart)
    .where('status', '==', 'completed')
    .get();

  let grossRevenue = 0;
  let teacherPayouts = 0;
  transSnap.forEach((doc) => {
    const t = doc.data();
    grossRevenue += t.amount ?? 0;
    teacherPayouts += t.teacherEarning ?? 0;
  });

  const platformFees = grossRevenue - teacherPayouts;
  const grossMargin = grossRevenue > 0
    ? Number(((platformFees / grossRevenue) * 100).toFixed(2))
    : 0;

  // 5. CAC from manually entered marketing spend
  const spendSnap = await db.collection('marketing_spend')
    .doc(`${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`)
    .get();
  const totalMarketingSpend = spendSnap.exists() ? spendSnap.data()!.totalSpend : 0;
  const avgCAC = newPaidUsers > 0
    ? Number((totalMarketingSpend / newPaidUsers).toFixed(0))
    : 0;

  // 6. LTV = ARPU × (1 / churnRate) — standard formula
  const ARPU = totalActiveSubscribers > 0
    ? Number((grossRevenue / totalActiveSubscribers).toFixed(0))
    : 0;
  const monthlyChurnDecimal = churnRate / 100;
  const avgLTV = monthlyChurnDecimal > 0
    ? Number((ARPU / monthlyChurnDecimal).toFixed(0))
    : 0;

  // Write snapshot
  await db.collection('kpi_snapshots').doc(monthKey).set({
    month: monthKey,
    totalActiveSubscribers,
    newPaidUsers,
    churnedUsers,
    churnRate,
    avgCAC,
    avgLTV,
    ARPU,
    grossRevenue,
    teacherPayouts,
    platformFees,
    grossMargin,
    computedAt: FieldValue.serverTimestamp(),
  });

  // Also update the platform-level analytics document for real-time admin dashboard
  await db.collection('analytics').doc('platform').update({
    totalRevenue: FieldValue.increment(grossRevenue),
    pendingVerifications: (await db.collection('users')
      .where('verificationStatus', '==', 'pending').count().get()).data().count,
    updatedAt: FieldValue.serverTimestamp(),
  });
});
```

### Admin panel: entering marketing spend
Add a simple form in `AdminDashboard.tsx` or `FinancialsPage.tsx`:

```typescript
const saveMarketingSpend = async (spend: any) => {
  const monthKey = format(new Date(), 'yyyy-MM'); // using date-fns already in deps
  await setDoc(doc(db, 'marketing_spend', monthKey), {
    ...spend,
    enteredBy: user!.uid,
    updatedAt: serverTimestamp(),
  }, { merge: true });
  toast.success('Marketing spend updated');
};
```

---

## 13. Phase 7 — Payments (Paystack)

### Course purchase (one-time, not subscription)
```typescript
// Cloud Function: initializeCoursePayment (callable)
export const initializeCoursePayment = onCall(
  { secrets: [PAYSTACK_SECRET] },
  async (request) => {
    const { courseId } = request.data;
    const uid = request.auth?.uid;
    if (!uid) throw new HttpsError('unauthenticated', 'Must be logged in');

    const db = getFirestore();
    const [courseSnap, userSnap] = await Promise.all([
      db.collection('courses').doc(courseId).get(),
      db.collection('users').doc(uid).get(),
    ]);

    const course = courseSnap.data()!;
    const user = userSnap.data()!;

    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET.value()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        amount: course.price * 100, // kobo
        metadata: {
          studentId: uid,
          courseId,
          teacherId: course.teacherId,
          type: 'course_purchase',
        },
      }),
    });

    const data = await response.json();
    if (!data.status) throw new HttpsError('internal', data.message);
    return { authorizationUrl: data.data.authorization_url };
  }
);
```

The webhook's `charge.success` handler creates the enrollment document when `metadata.type === 'course_purchase'`:

```typescript
case 'charge.success': {
  if (data.metadata?.type === 'course_purchase') {
    const { courseId, studentId, teacherId } = data.metadata;
    const amount = data.amount / 100;

    const courseSnap = await db.collection('courses').doc(courseId).get();
    const teacherSnap = await db.collection('users').doc(teacherId).get();
    const lifetimeEarnings = teacherSnap.data()?.lifetimeEarnings ?? 0;
    const commissionRate = getCommissionRate(lifetimeEarnings);
    const teacherEarning = amount * (1 - commissionRate);
    const platformFee = amount * commissionRate;

    const batch = db.batch();

    // Create enrollment
    batch.set(db.collection('enrollments').doc(`${studentId}_${courseId}`), {
      studentId, courseId,
      enrolledAt: FieldValue.serverTimestamp(),
      progressPercent: 0,
      completedLessons: [],
      lastAccessedAt: FieldValue.serverTimestamp(),
      lastLessonId: null,
      certificateId: null,
    });

    // Record transaction
    batch.set(db.collection('transactions').doc(), {
      type: 'course_sale',
      studentId, courseId, teacherId,
      amount, platformFee, teacherEarning,
      commissionRate,                    // audit trail of rate applied
      paystackReference: data.reference,
      status: 'completed',
      createdAt: FieldValue.serverTimestamp(),
    });

    // Update course enrollment count
    batch.update(db.collection('courses').doc(courseId), {
      enrollmentCount: FieldValue.increment(1),
    });

    // Update teacher lifetime earnings and commission rate
    const newLifetimeEarnings = lifetimeEarnings + teacherEarning;
    batch.update(db.collection('users').doc(teacherId), {
      lifetimeEarnings: FieldValue.increment(teacherEarning),
      currentCommissionRate: getCommissionRate(newLifetimeEarnings),
    });

    // Update teacher analytics
    const monthKey = format(new Date(), 'yyyy-MM');
    batch.set(
      db.collection('analytics').doc('teachers').collection(teacherId).doc('stats'),
      {
        totalRevenue: FieldValue.increment(teacherEarning),
        totalEnrollments: FieldValue.increment(1),
        [`dailyRevenue.${format(new Date(), 'yyyy-MM-dd')}`]: FieldValue.increment(teacherEarning),
      },
      { merge: true }
    );

    await batch.commit();

    // Notify student
    await db.collection('notifications').add({
      userId: studentId,
      type: 'enrollment',
      title: 'Enrollment successful',
      body: `You now have full access to "${courseSnap.data()?.title}".`,
      isRead: false,
      actionUrl: `/student/courses/${courseId}`,
      createdAt: FieldValue.serverTimestamp(),
    });
  }
  break;
}
```

---

## 14. Phase 8 — Admin Panel

### `analytics/platform` document (real-time aggregated)
```typescript
interface PlatformAnalyticsDocument {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalRevenue: number;
  pendingVerifications: number;
  pendingCourseReviews: number;
  dailyActiveUsers: Record<string, number>;
  usersByRegion: Record<string, number>;     // { Lagos: 1240, Abuja: 850, ... }
  updatedAt: Timestamp;
}
```

### `AdminDashboard.tsx` data loading
```typescript
// Replace all hardcoded stat values with real reads
const [platformStats, setPlatformStats] = useState<PlatformAnalyticsDocument | null>(null);
const [recentKpis, setRecentKpis] = useState<KpiSnapshot[]>([]);

useEffect(() => {
  // Platform stats — real-time listener
  const unsubStats = onSnapshot(
    doc(db, 'analytics', 'platform'),
    (snap) => setPlatformStats(snap.data() as PlatformAnalyticsDocument)
  );

  // Last 6 months KPI snapshots for charts
  const fetchKpis = async () => {
    const snap = await getDocs(
      query(
        collection(db, 'kpi_snapshots'),
        orderBy('month', 'desc'),
        limit(6)
      )
    );
    setRecentKpis(snap.docs.map(d => d.data() as KpiSnapshot).reverse());
  };

  fetchKpis();
  return () => unsubStats();
}, []);
```

### Course moderation actions
```typescript
// CourseModerationPage.tsx

const approveCourse = async (courseId: string) => {
  await updateDoc(doc(db, 'courses', courseId), {
    status: 'live',
    publishedAt: serverTimestamp(),
    rejectionReason: null,
  });
  // Cloud Function trigger sends email to teacher
};

const rejectCourse = async (courseId: string, reason: string) => {
  await updateDoc(doc(db, 'courses', courseId), {
    status: 'rejected',
    rejectionReason: reason,
  });
};
```

### Teacher verification actions
```typescript
// UserManagementPage.tsx

const approveTeacher = async (teacherId: string) => {
  await updateDoc(doc(db, 'users', teacherId), {
    verificationStatus: 'approved',
    verifiedAt: serverTimestamp(),
    verifiedBy: adminUid,
  });
  // Cloud Function trigger sends approval email
};
```

---

## 15. Phase 9 — Notifications

### `notifications/{notificationId}`
```typescript
interface NotificationDocument {
  userId: string;
  type:
    | 'enrollment'
    | 'course_approved'
    | 'course_rejected'
    | 'teacher_approved'
    | 'new_message'
    | 'quiz_passed'
    | 'certificate_ready'
    | 'subscription_renewed'
    | 'payment_failed'
    | 'payout_processed'
    | 'new_review';
  title: string;
  body: string;
  isRead: boolean;
  actionUrl: string;
  createdAt: Timestamp;
}
```

### Bell icon unread count
```typescript
// In StudentLayout.tsx and TeacherLayout.tsx header:
const [unreadCount, setUnreadCount] = useState(0);

useEffect(() => {
  if (!user) return;
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', user.uid),
    where('isRead', '==', false)
  );
  return onSnapshot(q, (snap) => setUnreadCount(snap.size));
}, [user]);
```

### Mark as read
```typescript
const markAllRead = async () => {
  const q = query(
    collection(db, 'notifications'),
    where('userId', '==', user!.uid),
    where('isRead', '==', false)
  );
  const snap = await getDocs(q);
  const batch = writeBatch(db);
  snap.forEach(doc => batch.update(doc.ref, { isRead: true }));
  await batch.commit();
};
```

---

## 16. Phase 10 — Security Rules (Final)

### `firestore.rules` — REPLACE ENTIRE FILE
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ─── Helper functions ───────────────────────────────────────────
    function isSignedIn() {
      return request.auth != null;
    }
    function uid() {
      return request.auth.uid;
    }
    function userDoc() {
      return get(/databases/$(database)/documents/users/$(uid())).data;
    }
    function isAdmin() {
      return isSignedIn() && userDoc().role == 'admin';
    }
    function isTeacher() {
      return isSignedIn() && userDoc().role == 'teacher';
    }
    function isStudent() {
      return isSignedIn() && userDoc().role == 'student';
    }
    function isEnrolled(courseId) {
      return exists(
        /databases/$(database)/documents/enrollments/$(uid() + '_' + courseId)
      );
    }
    function isPro() {
      return userDoc().plan in ['pro_monthly', 'pro_yearly'];
    }

    // ─── Users ──────────────────────────────────────────────────────
    match /users/{userId} {
      allow read: if uid() == userId || isAdmin();
      allow create: if uid() == userId;
      allow update: if uid() == userId
        // Prevent client from self-promoting to admin
        && (!request.resource.data.keys().hasAll(['role'])
            || request.resource.data.role == resource.data.role)
        // Prevent client from modifying subscription fields directly
        && !request.resource.data.keys().hasAny([
             'subscriptionId', 'subscriptionStatus', 'plan',
             'totalAmountPaid', 'lifetimeEarnings', 'currentCommissionRate'
           ]);
      allow delete: if isAdmin();
    }

    // ─── Courses ────────────────────────────────────────────────────
    match /courses/{courseId} {
      allow read: if resource.data.status == 'live'
                  || resource.data.teacherId == uid()
                  || isAdmin();
      allow create: if isTeacher()
                    && request.resource.data.teacherId == uid()
                    && request.resource.data.status == 'draft';
      allow update: if (resource.data.teacherId == uid()
                       // Teacher cannot self-approve
                       && request.resource.data.status != 'live')
                    || isAdmin();
      allow delete: if isAdmin();

      match /modules/{moduleId} {
        allow read: if get(/databases/$(database)/documents/courses/$(courseId)).data.teacherId == uid()
                    || isEnrolled(courseId)
                    || resource.data.lessons[0].isFreePreview == true
                    || isAdmin();
        allow write: if get(/databases/$(database)/documents/courses/$(courseId)).data.teacherId == uid();
      }
    }

    // ─── Enrollments — NO client writes ─────────────────────────────
    match /enrollments/{enrollId} {
      // enrollId format: studentId_courseId
      allow read: if enrollId.split('_')[0] == uid()
                  || isAdmin();
      // Only Cloud Functions write enrollments (via Admin SDK)
      allow write: if false;
    }

    // ─── Reviews ────────────────────────────────────────────────────
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if isEnrolled(request.resource.data.courseId)
                    && request.resource.data.studentId == uid();
      allow update, delete: if resource.data.studentId == uid() || isAdmin();
    }

    // ─── AI sessions ────────────────────────────────────────────────
    match /ai_sessions/{sessionId} {
      allow read, write: if isSignedIn()
                         && resource.data.studentId == uid();
      allow create: if isSignedIn()
                    && request.resource.data.studentId == uid();
    }

    // ─── GPA records ────────────────────────────────────────────────
    match /gpa_records/{userId} {
      allow read, write: if uid() == userId;
    }

    // ─── Quizzes & questions ─────────────────────────────────────────
    match /quizzes/{quizId} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }
    match /questions/{questionId} {
      allow read: if isSignedIn();
      allow write: if isAdmin();
    }
    match /quiz_attempts/{attemptId} {
      allow read: if resource.data.studentId == uid() || isAdmin();
      allow create: if request.resource.data.studentId == uid();
      allow update: if resource.data.studentId == uid();
    }

    // ─── Certificates — NO client writes ─────────────────────────────
    match /certificates/{certId} {
      allow read: if resource.data.studentId == uid() || isAdmin();
      allow write: if false;   // Cloud Functions only
    }

    // ─── Community ──────────────────────────────────────────────────
    match /community_posts/{postId} {
      allow read: if isSignedIn() && resource.data.isDeleted == false;
      allow create: if isSignedIn()
                    && request.resource.data.authorId == uid();
      allow update: if resource.data.authorId == uid() || isAdmin();
      allow delete: if resource.data.authorId == uid() || isAdmin();

      match /comments/{commentId} {
        allow read: if isSignedIn();
        allow create: if isSignedIn()
                      && request.resource.data.authorId == uid();
        allow update, delete: if resource.data.authorId == uid() || isAdmin();
      }
    }
    match /community_post_likes/{likeId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn()
                    && request.resource.data.userId == uid()
                    // Prevent duplicates — doc ID must be postId_uid
                    && likeId == request.resource.data.postId + '_' + uid();
      allow delete: if resource.data.userId == uid();
    }

    // ─── Transactions — NO client writes ─────────────────────────────
    match /transactions/{txId} {
      allow read: if resource.data.studentId == uid()
                  || resource.data.teacherId == uid()
                  || isAdmin();
      allow write: if false;   // Cloud Functions only
    }

    // ─── Notifications ──────────────────────────────────────────────
    match /notifications/{notifId} {
      allow read: if resource.data.userId == uid();
      allow update: if resource.data.userId == uid()
                    && request.resource.data.diff(resource.data).affectedKeys()
                                         .hasOnly(['isRead']);
      allow write: if false;   // Cloud Functions only create notifications
    }

    // ─── Analytics — admin read only ─────────────────────────────────
    match /analytics/{docId=**} {
      allow read: if isAdmin();
      allow write: if false;   // Cloud Functions only
    }
    match /kpi_snapshots/{snapshotId} {
      allow read: if isAdmin();
      allow write: if false;
    }
    match /marketing_spend/{monthId} {
      allow read, write: if isAdmin();
    }
    match /churn_events/{eventId} {
      allow read: if isAdmin();
      allow write: if false;
    }
    match /addon_purchases/{purchaseId} {
      allow read: if resource.data.studentId == uid() || isAdmin();
      allow write: if false;
    }
  }
}
```

---

## 17. Pricing & Revenue Model

> Reference: `Tutor_e_Pricing_Strategy_Final.docx`

### Student pricing
| Tier | Monthly | Yearly | Key limits |
|------|---------|--------|-----------|
| Free | ₦0 | ₦0 | 5 AI queries/day, 2 courses, basic GPA |
| Pro Monthly | ₦4,000 | — | Full library, unlimited AI, GPA simulator, 1 assignment/month |
| Pro Yearly | — | ₦40,000 (~₦3,333/month) | Pro Monthly + 5 assignments/term, priority support |

### Add-ons
| Item | Price |
|------|-------|
| Guided assignment | ₦2,000/each |
| Premium mock exam | ₦3,000/each |

### Teacher pricing
| Commission bracket | Rate |
|--------------------|------|
| ₦0 – ₦200,000 lifetime earnings | 15% |
| ₦200,000 – ₦1,000,000 | 12% |
| Above ₦1,000,000 | 10% |
| Premium teacher tools | ₦12,000/year |

### Revenue projections (from document)
| Year | Active students | Paying % | Avg monthly price | Annual student revenue |
|------|----------------|----------|------------------|----------------------|
| Year 1 | 1,000 | 10% | ₦4,000 | ₦4,800,000 |
| Year 2 | 3,000 | 20% | ₦4,250 | ₦30,600,000 |
| Year 3 | 5,000 | 30% | ₦4,500 | ₦81,000,000 |

### KPI targets
| Metric | Target |
|--------|--------|
| Monthly churn | < 4% after PMF |
| CAC break-even | Within 6–9 months |
| LTV > CAC | Required for sustainable growth |
| Gross margin | (Revenue – teacher payouts – ops) / Revenue |

---

## 18. Cloud Functions Index

All functions live in `functions/src/`. Deploy with `firebase deploy --only functions`.

| Function name | Type | Trigger | Purpose |
|--------------|------|---------|---------|
| `paystackWebhook` | HTTPS | POST `/paystackWebhook` | Handles all Paystack events |
| `createSubscription` | Callable | Client call | Initialize Paystack subscription |
| `initializeCoursePayment` | Callable | Client call | One-time course payment |
| `generateCertificate` | Firestore trigger | `enrollments` updated, `progressPercent == 100` | PDF certificate generation |
| `notifyTeacherOnEnrollment` | Firestore trigger | `enrollments` created | Email teacher about new student |
| `notifyTeacherOnReview` | Firestore trigger | `reviews` created | Email teacher about new review |
| `notifyCourseDecision` | Firestore trigger | `courses` status updated | Email teacher approve/reject |
| `notifyTeacherVerification` | Firestore trigger | `users` verificationStatus updated | Email teacher about verification |
| `computeMonthlyKPIs` | Scheduled | 1st of every month, 00:00 | Write KPI snapshot |
| `processDowngrades` | Scheduled | Daily, 00:01 | Downgrade cancelled subscriptions past renewal date |
| `updatePlatformAnalytics` | Firestore trigger | `transactions` created | Increment platform stats |
| `updateTeacherAnalytics` | Firestore trigger | `transactions` created | Increment teacher stats |

---

## 19. Implementation Order

Complete phases in this exact order — each builds on the previous.

```
Phase 1    Auth + User document schema + Onboarding persistence
           ↓
Phase 2    Course read path (browse, search, enrollment check)
           ↓
Phase 3    Firebase AI Logic setup, useAiTutor hook, AiTutorPage wiring
           ↓
Phase 4    GPA Tracker persistence, Quiz system, Exam question generation
           ↓
Phase 4.5  usePlanGate hook — apply gates across all feature pages
           ↓
Phase 6.5  Paystack subscription plans, createSubscription function,
           webhook subscription lifecycle events, add-on purchases
           ↓
Phase 7    Course purchase payment flow, enrollment creation in webhook,
           graduated commission logic
           ↓
Phase 5    Teacher analytics, StudentsPage queries
           ↓
Phase 6    Community real-time feed, likes, comments
           ↓
Phase 6.6  marketing_spend collection, computeMonthlyKPIs function,
           admin marketing spend form
           ↓
Phase 8    Admin panel real data: platform stats, KPI charts,
           course moderation actions, teacher verification actions
           ↓
Phase 9    Notifications — bell icon count, mark as read,
           all Cloud Function notification side-effects
           ↓
Phase 10   Final security rules audit — enforce write: false on
           all sensitive collections, test all role boundaries
```

### Quick-start checklist for Copilot

- [ ] Replace `src/lib/firebase.ts` with the version in Phase 3 of this document
- [ ] Create `src/lib/ai.ts` with the centralized model config
- [ ] Replace `src/features/auth/api/auth.ts` with the real implementation
- [ ] Remove all `mockUser` objects and fake `setTimeout` delays from auth forms
- [ ] Create `src/hooks/usePlanGate.ts`
- [ ] Create `src/features/student/hooks/useAiTutor.ts`
- [ ] Create `src/features/student/hooks/useAssignmentHelper.ts`
- [ ] Create `src/features/student/hooks/useExamGenerator.ts`
- [ ] Initialize `functions/` directory: `firebase init functions`
- [ ] Install Cloud Functions deps: `npm install firebase-admin firebase-functions`
- [ ] Set secrets: `firebase functions:secrets:set PAYSTACK_SECRET_KEY`
- [ ] Create Paystack subscription plans in dashboard
- [ ] Register Paystack webhook URL: `https://{region}-{projectId}.cloudfunctions.net/paystackWebhook`
- [ ] Enable Vertex AI in Firebase console → Build → AI Logic
- [ ] Create `firestore.rules` from Phase 10 of this document
- [ ] Create Firestore composite indexes for multi-field queries

---

*Document version: 1.0 — March 2026*  
*Platform: MyTutorMe | Stack: Firebase v12 + React 19 + TypeScript*  
*AI layer: Firebase AI Logic (Vertex AI / Gemini 2.0 Flash) — no external AI API keys*