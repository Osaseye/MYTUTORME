import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import React from 'react';
import { sendEmail } from '../lib/email';
import { PasswordResetEmail } from '../emails/templates/PasswordResetEmail';

// Update this to your production domain when you go live
const APP_URL = process.env.APP_URL || 'https://app.mytutorme.org';

export const requestPasswordReset = functions.https.onCall(async (request: any) => {
  const data = request.data || request;
  const { email } = data;

  if (!email) {
    throw new functions.https.HttpsError('invalid-argument', 'Email is required');
  }

  try {
    const userRecord = await admin.auth().getUserByEmail(email);

    // Attempt to grab display name from Firestore if possible
    let name = userRecord.displayName || 'User';
    const qs = await admin.firestore().collection('users').where('email', '==', email).limit(1).get();
    if (!qs.empty) {
      name = qs.docs[0].data().displayName || name;
    }

    // Firebase generates a link pointing to its own hosted page.
    // We extract just the oobCode and build a link to our custom reset page instead.
    const firebaseLink = await admin.auth().generatePasswordResetLink(email);
    const oobCode = new URL(firebaseLink).searchParams.get('oobCode');
    const resetLink = `${APP_URL}/reset-password?oobCode=${oobCode}`;

    await sendEmail({
      to: email,
      subject: 'Reset your MyTutorMe password',
      react: React.createElement(PasswordResetEmail, {
        name,
        resetLink,
      }),
    });

    return { success: true, message: 'Password reset email sent' };
  } catch (error: any) {
    console.error('Error generating/sending password reset:', error);
    // Don't leak whether the email exists
    return { success: true, message: 'If the email exists, a reset link has been sent.' };
  }
});
