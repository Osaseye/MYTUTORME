import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

const LAST_UPDATED = 'May 10, 2026';

interface Section {
  id: string;
  heading: string;
  body: (string | { list: string[] })[];
}

const SECTIONS: Section[] = [
  {
    id: 'acceptance',
    heading: '1. Acceptance of Terms',
    body: [
      'By creating an account, accessing, or using MyTutorMe (the "Platform"), you confirm that you have read, understood, and agree to be bound by these Terms and Conditions ("Terms") and our Privacy Policy.',
      'If you are using MyTutorMe on behalf of an organisation, you represent that you have the authority to bind that organisation to these Terms.',
      'If you do not agree with any part of these Terms, you must not use the Platform.',
    ],
  },
  {
    id: 'eligibility',
    heading: '2. Eligibility',
    body: [
      'You must be at least 13 years old to use MyTutorMe. If you are under 18, you represent that your parent or legal guardian has reviewed and agreed to these Terms on your behalf.',
      'The Platform is available worldwide. By accessing it you are responsible for compliance with local laws applicable to your use.',
    ],
  },
  {
    id: 'accounts',
    heading: '3. User Accounts',
    body: [
      'You are responsible for maintaining the confidentiality of your account credentials. You agree to:',
      {
        list: [
          'Provide accurate and complete registration information.',
          'Keep your password secure and not share it with others.',
          'Notify us immediately at support@mytutorme.org of any unauthorised use of your account.',
          'Accept responsibility for all activity that occurs under your account.',
        ],
      },
      'We reserve the right to terminate or suspend your account if we believe these Terms have been violated.',
    ],
  },
  {
    id: 'roles',
    heading: '4. User Roles',
    body: [
      'MyTutorMe operates with two primary user roles:',
      {
        list: [
          'Students — can enrol in courses, take AI-generated exams, use the AI Tutor, track GPA, earn certificates, and access all student features according to their subscription plan.',
          'Teachers — can create and publish courses, manage enrolled students, track earnings, and access teacher-facing tools. Teacher accounts require approval before publication.',
        ],
      },
      'Role-specific features and permissions are subject to the applicable subscription plan and our approval process.',
    ],
  },
  {
    id: 'subscriptions',
    heading: '5. Subscriptions & Payments',
    body: [
      'MyTutorMe offers both free and paid subscription plans. Paid plans are billed on a recurring basis (monthly or annually) at the rates displayed at the time of purchase.',
      {
        list: [
          'All payments are processed securely via our third-party payment provider. By providing payment details you authorise us to charge the applicable fees.',
          'Subscription fees are non-refundable except as required by applicable law or as expressly stated in our Refund Policy.',
          'We reserve the right to change pricing with at least 30 days\' notice. Continued use after a price change constitutes acceptance of the new price.',
          'If a payment fails, your access may be downgraded to the free plan until payment is resolved.',
          'Teachers receive 70% of course revenue unless otherwise agreed in a separate partnership agreement.',
        ],
      },
    ],
  },
  {
    id: 'ai-features',
    heading: '6. AI-Generated Content',
    body: [
      'MyTutorMe uses artificial intelligence to generate courses, exam questions, flashcards, study plans, and tutor responses from content you upload or from general knowledge.',
      'Important limitations you must acknowledge:',
      {
        list: [
          'AI-generated content may contain inaccuracies, errors, or omissions. It is provided as a learning aid, not as professional academic, medical, legal, or financial advice.',
          'You are responsible for verifying the accuracy of AI-generated content against authoritative sources.',
          'We do not guarantee that AI content will be suitable for any specific examination, course, or curriculum.',
          'AI Tutor responses are generated automatically and do not constitute advice from a qualified professional.',
        ],
      },
    ],
  },
  {
    id: 'content',
    heading: '7. User Content & Uploads',
    body: [
      'You may upload documents, notes, PDFs, and other materials to the Platform to enable AI course generation ("User Content").',
      'By uploading User Content you grant MyTutorMe a limited, non-exclusive, royalty-free licence to process, store, and use that content solely for the purpose of providing the Platform\'s features to you.',
      'You represent and warrant that:',
      {
        list: [
          'You own or have the necessary rights to upload the content.',
          'Your content does not infringe any intellectual property rights of third parties.',
          'Your content does not violate any applicable law or these Terms.',
        ],
      },
      'We reserve the right to remove any User Content that violates these Terms.',
    ],
  },
  {
    id: 'prohibited',
    heading: '8. Prohibited Conduct',
    body: [
      'You agree not to:',
      {
        list: [
          'Use the Platform for any unlawful purpose or in violation of these Terms.',
          'Upload content that is defamatory, obscene, hateful, or infringes third-party rights.',
          'Attempt to gain unauthorised access to any part of the Platform or its infrastructure.',
          'Reverse engineer, decompile, or attempt to extract the source code of the Platform.',
          'Use the Platform to distribute malware, spam, or any harmful software.',
          'Misrepresent your identity, impersonate another person, or create false accounts.',
          'Use automated bots, scrapers, or scripts to access or collect data from the Platform without our written consent.',
          'Share, resell, or redistribute Platform content or features without authorisation.',
          'Circumvent any access controls or use features beyond your subscription entitlements.',
        ],
      },
    ],
  },
  {
    id: 'ip',
    heading: '9. Intellectual Property',
    body: [
      'All content on the Platform — including the software, design, text, graphics, logos, AI models, and course templates created by MyTutorMe — is the exclusive property of MyTutorMe Inc. and is protected by copyright, trademark, and other intellectual property laws.',
      'Your subscription grants you a limited, non-transferable, revocable licence to access and use the Platform for personal, non-commercial educational purposes only.',
      'You may not reproduce, distribute, publicly display, or create derivative works from our content without express written permission.',
    ],
  },
  {
    id: 'certificates',
    heading: '10. Certificates',
    body: [
      'MyTutorMe issues digital completion certificates for courses where a certificate has been enabled. These certificates are:',
      {
        list: [
          'Provided as evidence of course completion on the MyTutorMe Platform only.',
          'Not accredited by any academic institution or professional body unless explicitly stated.',
          'Verifiable via our public certificate verification tool at mytutorme.org/verify.',
        ],
      },
      'We reserve the right to revoke certificates if fraudulent activity or a violation of these Terms is detected.',
    ],
  },
  {
    id: 'disclaimers',
    heading: '11. Disclaimers',
    body: [
      'THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.',
      'We do not warrant that the Platform will be uninterrupted, error-free, or free of viruses or other harmful components. We do not warrant the accuracy, completeness, or usefulness of any content on the Platform.',
    ],
  },
  {
    id: 'liability',
    heading: '12. Limitation of Liability',
    body: [
      'TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, MYTUTORME INC. SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES — INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, OR GOODWILL — ARISING OUT OF OR RELATED TO YOUR USE OF OR INABILITY TO USE THE PLATFORM.',
      'Our total liability to you for any claims arising under these Terms shall not exceed the amount you paid to MyTutorMe in the twelve (12) months preceding the claim.',
    ],
  },
  {
    id: 'termination',
    heading: '13. Termination',
    body: [
      'You may stop using the Platform at any time and delete your account from the Settings page.',
      'We may suspend or terminate your access immediately and without notice if:',
      {
        list: [
          'You breach any provision of these Terms.',
          'We are required to do so by law.',
          'We reasonably believe your use poses a security risk or harms other users.',
        ],
      },
      'Upon termination, your right to use the Platform ceases immediately. Provisions that by their nature should survive termination (including intellectual property, disclaimers, and limitation of liability) will remain in effect.',
    ],
  },
  {
    id: 'governing-law',
    heading: '14. Governing Law & Disputes',
    body: [
      'These Terms are governed by and construed in accordance with applicable law. Any disputes arising under these Terms shall first be attempted to be resolved through good-faith negotiation.',
      'If a dispute cannot be resolved informally, both parties agree to submit to binding arbitration, except that either party may seek injunctive relief in a court of competent jurisdiction to protect intellectual property rights.',
    ],
  },
  {
    id: 'changes',
    heading: '15. Changes to These Terms',
    body: [
      'We may revise these Terms at any time. We will notify you of material changes by posting the updated Terms on this page and updating the "Last Updated" date. For significant changes, we will also send an in-app notification.',
      'Your continued use of the Platform after changes become effective constitutes your acceptance of the revised Terms.',
    ],
  },
  {
    id: 'contact',
    heading: '16. Contact Us',
    body: [
      'If you have questions about these Terms, please contact us:',
      {
        list: [
          'Email: legal@mytutorme.org',
          'Support: mytutorme.org/support',
        ],
      },
    ],
  },
];

export const TermsPage = () => (
  <div className="min-h-screen bg-background-light dark:bg-background-dark font-body text-slate-800 dark:text-slate-100 transition-colors duration-300">
    <Navbar />

    <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-20">

      {/* Hero */}
      <div className="mb-12">
        <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
          Legal
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">Terms &amp; Conditions</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Last updated: <span className="font-medium text-slate-700 dark:text-slate-300">{LAST_UPDATED}</span>
        </p>
        <div className="mt-5 h-px bg-gradient-to-r from-emerald-500/60 via-emerald-300/30 to-transparent" />
      </div>

      {/* Callout */}
      <div className="mb-10 p-5 rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/60 dark:bg-emerald-900/10">
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          Please read these Terms carefully before using MyTutorMe. They govern your access to and use of our Platform. By using MyTutorMe you agree to these Terms.
        </p>
      </div>

      {/* Table of contents */}
      <nav className="mb-12 p-5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Contents</p>
        <ol className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                {s.heading}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* Sections */}
      <div className="space-y-10">
        {SECTIONS.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-24">
            <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">{s.heading}</h2>
            <div className="space-y-3 text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              {s.body.map((block, i) =>
                typeof block === 'string' ? (
                  <p key={i}>{block}</p>
                ) : (
                  <ul key={i} className="space-y-2 pl-1">
                    {block.list.map((item, j) => (
                      <li key={j} className="flex gap-3">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )
              )}
            </div>
          </section>
        ))}
      </div>

    </main>

    <Footer />
  </div>
);

export default TermsPage;
