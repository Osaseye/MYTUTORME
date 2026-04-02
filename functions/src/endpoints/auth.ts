import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import React from 'react';
import { sendEmail } from '../lib/email';
import { PasswordResetEmail } from '../emails/templates/PasswordResetEmail';

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

    const resetLink = await admin.auth().generatePasswordResetLink(email);

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
