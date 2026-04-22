import admin from "firebase-admin";

const serviceAccount = {
  // Wait, I cannot use firebase-admin blindly without credentials.
  // Instead, I can just create a small debug effect inside CourseModerationPage.tsx directly and log the raw DB docs!
}
