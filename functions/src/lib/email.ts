import { Resend } from 'resend';
import * as dotenv from 'dotenv';
import * as functions from 'firebase-functions';
import * as React from 'react';

dotenv.config();

const resendApiKey = process.env.RESEND_API_KEY || '';
if (!resendApiKey) {
  functions.logger.warn('RESEND_API_KEY is not set in environment variables');
}

export const resend = new Resend(resendApiKey);

// A standard sender address that matches your verified domain
export const DEFAULT_SENDER = 'MyTutorMe <hello@mytutorme.org>';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  react: React.ReactElement | React.ReactNode;
  replyTo?: string | string[];
}

export const sendEmail = async ({ to, subject, react, replyTo }: EmailOptions) => {
  if (!resendApiKey) {
    functions.logger.warn('Attempted to send email without RESEND_API_KEY. Aborting.');
    return null;
  }

  try {
    const data = await resend.emails.send({
      from: DEFAULT_SENDER,
      to,
      subject,
      react,
      replyTo: replyTo as any,
    });
    
    functions.logger.info(`Email sent successfully to ${to}. ID: ${data.data?.id}`);
    return data;
  } catch (error) {
    functions.logger.error('Error sending email via Resend:', error);
    throw error;
  }
};
