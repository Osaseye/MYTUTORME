import * as dotenv from 'dotenv';
import * as path from 'path';
import * as React from 'react';
import { Resend } from 'resend';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import { WelcomeEmailTemplate } from '../emails/templates/WelcomeEmail';
import { PasswordResetEmail } from '../emails/templates/PasswordResetEmail';
import { CertificateAwardEmail } from '../emails/templates/CertificateAwardEmail';
import { CourseReceiptEmail } from '../emails/templates/CourseReceiptEmail';
import { TeacherApprovalEmail } from '../emails/templates/TeacherApprovalEmail';
import { TeacherRejectionEmail } from '../emails/templates/TeacherRejectionEmail';
import { CourseApprovalEmail } from '../emails/templates/CourseApprovalEmail';
import { CourseRejectionEmail } from '../emails/templates/CourseRejectionEmail';
import { PaymentFailedEmail } from '../emails/templates/PaymentFailedEmail';
import { SubscriptionSuccessEmail } from '../emails/templates/SubscriptionSuccessEmail';
import { SubscriptionCancelledEmail } from '../emails/templates/SubscriptionCancelledEmail';
import { StudentEnrollmentEmail } from '../emails/templates/StudentEnrollmentEmail';

const TEST_RECIPIENT = 'sadebowale092@gmail.com';
const FROM = 'MyTutorMe <hello@mytutorme.org>';

interface EmailTest {
  name: string;
  subject: string;
  element: React.ReactElement;
}

const emails: EmailTest[] = [
  {
    name: 'WelcomeEmail (Student)',
    subject: '[TEST] Welcome to MyTutorMe',
    element: React.createElement(WelcomeEmailTemplate, { name: 'Adewale', role: 'student' }),
  },
  {
    name: 'WelcomeEmail (Teacher)',
    subject: '[TEST] Welcome to MyTutorMe — Teacher Account',
    element: React.createElement(WelcomeEmailTemplate, { name: 'Mr. Bello', role: 'teacher' }),
  },
  {
    name: 'PasswordResetEmail',
    subject: '[TEST] Reset your MyTutorMe password',
    element: React.createElement(PasswordResetEmail, {
      name: 'Adewale',
      resetLink: 'https://mytutorme.org/reset-password?oobCode=test-oob-code-123',
    }),
  },
  {
    name: 'CertificateAwardEmail',
    subject: '[TEST] Your certificate is ready — Congratulations!',
    element: React.createElement(CertificateAwardEmail, {
      studentName: 'Adewale',
      courseTitle: 'Introduction to Data Science',
      certificateUrl: 'https://mytutorme.org/certificates/test-cert-id',
    }),
  },
  {
    name: 'CourseReceiptEmail',
    subject: '[TEST] Payment Receipt — MyTutorMe',
    element: React.createElement(CourseReceiptEmail, {
      studentName: 'Adewale',
      courseTitle: 'Advanced Mathematics for WAEC',
      amount: 15000,
      transactionId: 'TXN-2026-TEST-001',
      date: new Date().toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' }),
    }),
  },
  {
    name: 'TeacherApprovalEmail',
    subject: '[TEST] Your teacher application is approved!',
    element: React.createElement(TeacherApprovalEmail, {
      name: 'Mr. Bello',
      loginUrl: 'https://mytutorme.org/teacher/dashboard',
    }),
  },
  {
    name: 'TeacherRejectionEmail',
    subject: '[TEST] Update on your teacher application',
    element: React.createElement(TeacherRejectionEmail, {
      name: 'Mr. Bello',
      reason: 'Your profile is missing a valid academic credential. Please upload a verified degree certificate and re-apply.',
    }),
  },
  {
    name: 'CourseApprovalEmail',
    subject: '[TEST] Your course is now live on MyTutorMe!',
    element: React.createElement(CourseApprovalEmail, {
      teacherName: 'Mr. Bello',
      courseTitle: 'Introduction to Data Science',
      courseUrl: 'https://mytutorme.org/courses/test-course-id',
    }),
  },
  {
    name: 'CourseRejectionEmail',
    subject: '[TEST] Course review update — Action needed',
    element: React.createElement(CourseRejectionEmail, {
      teacherName: 'Mr. Bello',
      courseTitle: 'Introduction to Data Science',
      reason: 'Some module videos are below the minimum quality threshold. Please re-record lessons 3 and 5 with better audio clarity before resubmitting.',
    }),
  },
  {
    name: 'PaymentFailedEmail',
    subject: '[TEST] Action Required: Payment Failed',
    element: React.createElement(PaymentFailedEmail, { name: 'Adewale' }),
  },
  {
    name: 'SubscriptionSuccessEmail',
    subject: '[TEST] Subscription Confirmed — MyTutorMe Pro',
    element: React.createElement(SubscriptionSuccessEmail, {
      name: 'Adewale',
      planName: 'Student Premium Monthly',
      amount: 4500,
    }),
  },
  {
    name: 'SubscriptionCancelledEmail',
    subject: '[TEST] Your subscription has been cancelled',
    element: React.createElement(SubscriptionCancelledEmail, { name: 'Adewale' }),
  },
  {
    name: 'StudentEnrollmentEmail',
    subject: '[TEST] Enrollment Confirmed — Start Learning!',
    element: React.createElement(StudentEnrollmentEmail, {
      studentName: 'Adewale',
      courseTitle: 'Advanced Mathematics for WAEC',
      courseUrl: 'https://mytutorme.org/student/courses/test-course-id',
      teacherName: 'Mr. Bello',
    }),
  },
];

async function main() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('❌ RESEND_API_KEY is not set in functions/.env');
    process.exit(1);
  }

  const resend = new Resend(apiKey);

  console.log(`\n🚀  Sending ${emails.length} test emails to ${TEST_RECIPIENT}\n`);

  let passed = 0;
  let failed = 0;

  for (const email of emails) {
    process.stdout.write(`  ⟳  ${email.name.padEnd(32)}`);
    try {
      const { error } = await resend.emails.send({
        from: FROM,
        to: TEST_RECIPIENT,
        subject: email.subject,
        react: email.element,
      });

      if (error) {
        console.log(`✗  ${error.message}`);
        failed++;
      } else {
        console.log('✓');
        passed++;
      }
    } catch (err: any) {
      console.log(`✗  ${err.message}`);
      failed++;
    }
  }

  console.log(`\n${'─'.repeat(44)}`);
  console.log(`  ✓ ${passed} sent    ✗ ${failed} failed`);
  console.log(`${'─'.repeat(44)}\n`);

  if (failed > 0) process.exit(1);
}

main();
