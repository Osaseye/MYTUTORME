import { Resend } from 'resend';
import * as React from 'react';
import { WelcomeEmailTemplate } from '../src/emails/templates/WelcomeEmail';
import { SubscriptionSuccessEmail } from '../src/emails/templates/SubscriptionSuccessEmail';
import { PaymentFailedEmail } from '../src/emails/templates/PaymentFailedEmail';
import { SubscriptionCancelledEmail } from '../src/emails/templates/SubscriptionCancelledEmail';
import { StudentEnrollmentEmail } from '../src/emails/templates/StudentEnrollmentEmail';

const resend = new Resend('re_E4wQwb4N_L5uYhF3qZJYpPd2RbweYJpq5');

async function testAllEmails() {
  const testEmail = 'sadebowale092@gmail.com';
  // Using verified root domain
  const fromEmail = 'MyTutorMe <hello@mytutorme.org>'; 

  console.log(`Sending test emails to ${testEmail}...`);

  try {
    const welcome = await resend.emails.send({
      from: fromEmail,
      to: testEmail,
      subject: '[Test] Welcome to MyTutorMe!',
      react: React.createElement(WelcomeEmailTemplate, { name: 'Sade', role: 'student' }) as React.ReactElement,
    });
    if (welcome.error) console.error('❌ Welcome Email Failed:', welcome.error);
    else console.log('✅ Welcome Email sent:', welcome.data?.id);

    const subSuccess = await resend.emails.send({
      from: fromEmail,
      to: testEmail,
      subject: '[Test] Subscription Success',
      react: React.createElement(SubscriptionSuccessEmail, { name: 'Sade', planName: 'Pro Monthly', amount: 400000 }) as React.ReactElement,
    });
    if (subSuccess.error) console.error('❌ Subscription Success Email Failed:', subSuccess.error);
    else console.log('✅ Subscription Success Email sent:', subSuccess.data?.id);

    const paymentFailed = await resend.emails.send({
      from: fromEmail,
      to: testEmail,
      subject: '[Test] Payment Failed',
      react: React.createElement(PaymentFailedEmail, { name: 'Sade' }) as React.ReactElement,
    });
    if (paymentFailed.error) console.error('❌ Payment Failed Email Failed:', paymentFailed.error);
    else console.log('✅ Payment Failed Email sent:', paymentFailed.data?.id);

    const subCancelled = await resend.emails.send({
      from: fromEmail,
      to: testEmail,
      subject: '[Test] Subscription Cancelled',
      react: React.createElement(SubscriptionCancelledEmail, { name: 'Sade' }) as React.ReactElement,
    });
    if (subCancelled.error) console.error('❌ Subscription Cancelled Email Failed:', subCancelled.error);
    else console.log('✅ Subscription Cancelled Email sent:', subCancelled.data?.id);

    const enrollment = await resend.emails.send({
      from: fromEmail,
      to: testEmail,
      subject: '[Test] Course Enrollment Confirm',
      react: React.createElement(StudentEnrollmentEmail, { 
        studentName: 'Sade', 
        courseTitle: 'React Masterclass', 
        courseUrl: 'https://mytutorme.com/courses/123', 
        teacherName: 'John Doe' 
      }) as React.ReactElement,
    });
    if (enrollment.error) console.error('❌ Student Enrollment Email Failed:', enrollment.error);
    else console.log('✅ Student Enrollment Email sent:', enrollment.data?.id);

    console.log('🎉 All test emails dispatched successfully!');
  } catch (error) {
    console.error('❌ Error sending test emails:', error);
  }
}

testAllEmails();
