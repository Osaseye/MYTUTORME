# MyTutorMe MVP Launch Checklist

## Phase 0: Final Feature Completion & Clean-up
- [ ] **Payments & Flutterwave Integration:**
  - [ ] Switch Flutterwave from Test Mode to Live Mode.
  - [ ] Finalize end-to-end student payment flows for courses.
  - [ ] Finalize and test Teacher Premium Subscription payments.
  - [ ] Structure and implement Teacher Payout logic (how earnings are distributed).
- [ ] **Data Clean-up:**
  - [ ] Remove all dummy/mock courses, users, and transactions from the production database.
- [ ] **Teacher Portal Features:**
  - [ ] Finalize AI processing logic in the teacher portal (course generation/content processing).
  - [ ] Review and complete any other pending Teacher Portal features.

## Phase 1: Pre-Deployment & Infrastructure Setup
- [ ] **Environment Variables:**
  - [ ] Set up `.env.production` for the React frontend (Vite environment variables).
  - [ ] Configure environment variables/secrets for Firebase Functions.
  - [ ] Add Vercel/Firebase hosting environment secrets.
- [ ] **Billing & Third-Party APIs:**
  - [ ] Ensure Firebase project is on the "Blaze" (Pay-as-you-go) plan for Cloud Functions.
  - [ ] Verify Stripe/Payments API webhooks are pointed to production URLs.
  - [ ] Verify OpenAI/AI API keys and usage limits in production.
- [ ] **Domain & SSL:**
  - [ ] Purchase/Configure the production domain name.
  - [ ] Set up DNS records for frontend hosting and custom backend endpoints.

## Phase 2: Firebase Backend & Database Deployment
- [ ] **Firestore & Security Rules:**
  - [ ] Deploy finalized `firestore.rules`.
  - [ ] Deploy finalized `storage.rules`.
  - [ ] Run any initial database seed scripts if required.
  - [ ] Configure Firestore indexes for complex queries.
- [ ] **Firebase Authentication:**
  - [ ] Configure allowed auth providers (Email/Password, Google, etc.).
  - [ ] Add the production domain to Authorized Domains in Firebase Auth settings.
- [ ] **Cloud Functions:**
  - [ ] Compile and deploy all Firebase Functions (`firebase deploy --only functions`).
  - [ ] Verify scheduled functions/triggers are active.

## Phase 3: Frontend Deployment (Vercel/Firebase Hosting)
- [ ] **Build Optimization:**
  - [ ] Run `npm run build` locally to ensure no TypeScript/ESLint errors block deployment.
  - [ ] Confirm asset sizes and chunks are optimized.
- [ ] **Hosting Setup:**
  - [ ] Connect the GitHub repository to Vercel (or Firebase Hosting).
  - [ ] Set build command to `npm run build` and output directory to `dist/`.
- [ ] **Deployment:**
  - [ ] Trigger the first production build.
  - [ ] Assign the custom domain to the deployed frontend.

## Phase 4: Post-Deployment Testing & Verification
- [ ] **End-to-End User Flow:**
  - [ ] Create a new verified user account.
  - [ ] Test the Core MVP Flow (Enroll in a course, access AI Tutor, take a mock exam).
  - [ ] Verify the payment gateway (if applicable) processed successfully (use live/test cards depending on environment).
- [ ] **Certificates & Assets:**
  - [ ] Test certificate generation & verification page to ensure no mock data leaks.
  - [ ] Test file uploads/downloads (Cloud Storage bucket permissions).
- [ ] **Analytics & Logging:**
  - [ ] Verify application errors are logging to Firebase Crashlytics / monitoring tools.
  - [ ] Ensure frontend analytics (e.g., Google Analytics) are firing correctly.

## Phase 5: MVP Launch Readiness
- [ ] Update README with production links and status.
- [ ] Disable/Remove any testing-only features and console logs.
- [ ] Define support and feedback collection processes (e.g. Zendesk, Discord, support email).
- [ ] **Go Live!** 🎉
