import * as functions from 'firebase-functions/v1';
import React from 'react';
import { sendEmail } from '../lib/email';
import { WelcomeEmailTemplate } from '../emails/templates/WelcomeEmail';
import { TeacherApprovalEmail } from '../emails/templates/TeacherApprovalEmail';
import { TeacherRejectionEmail } from '../emails/templates/TeacherRejectionEmail';

export const onUserCreated = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snap, context) => {
    const userData = snap.data();
    const email = userData.email;
    const name = userData.displayName || 'Learner';

    if (!email) {
      console.log('No email found for new user, skipping welcome email.');
      return null;
    }

    try {
      await sendEmail({
        to: email,
        subject: 'Welcome to MyTutorMe!',
        react: React.createElement(WelcomeEmailTemplate, {
          name,
          role: userData.role || 'student',
        }),
      });
      console.log(`Welcome email successfully sent to ${email}`);
    } catch (error) {
      console.error(`Failed to send welcome email to ${email}:`, error);
    }

    return null;
  });

export const onUserUpdated = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const email = after.email;
    const name = after.displayName || 'Teacher';

    if (!email || after.role !== 'teacher') return null;

    // Check for approval status change
    if (before.isApproved !== true && after.isApproved === true) {
      try {
        await sendEmail({
          to: email,
          subject: 'Your Teacher Profile is Approved!',
          react: React.createElement(TeacherApprovalEmail, {
            name,
            loginUrl: 'https://mytutorme.com/login',
          }),
        });
        console.log(`Teacher approval email sent to ${email}`);
      } catch (e) {
        console.error('Error sending approval email', e);
      }
    }

    // Check for rejection status
    if (before.status !== 'rejected' && after.status === 'rejected') {
      try {
        await sendEmail({
          to: email,
          subject: 'Update on Your Teacher Application',
          react: React.createElement(TeacherRejectionEmail, {
            name,
            reason: after.rejectionReason || 'Does not meet our current guidelines.',
          }),
        });
        console.log(`Teacher rejection email sent to ${email}`);
      } catch (e) {
        console.error('Error sending rejection email', e);
      }
    }

    return null;
  });
