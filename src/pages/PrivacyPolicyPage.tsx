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
    id: 'intro',
    heading: '1. Introduction',
    body: [
      'Welcome to MyTutorMe ("we", "us", or "our"). We operate the website and mobile application at mytutorme.org (the "Platform"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Platform.',
      'By accessing or using MyTutorMe you agree to the collection and use of information in accordance with this policy. If you do not agree, please do not use the Platform.',
    ],
  },
  {
    id: 'collect',
    heading: '2. Information We Collect',
    body: [
      'We collect information you provide directly, information generated automatically by your use of the Platform, and information from third-party services you connect.',
      {
        list: [
          'Account data — name, email address, password (hashed), role (student / teacher), and profile photo.',
          'Usage data — pages visited, features used, exam attempts, AI tutor sessions, and course progress.',
          'Content data — files, PDFs, notes, and other materials you upload for AI course generation.',
          'Payment data — billing details processed securely through our third-party payment provider. We do not store full card numbers.',
          'Device & log data — IP address, browser type, operating system, referring URLs, and crash reports.',
          'Communications — messages sent through our support form or in-app community.',
        ],
      },
    ],
  },
  {
    id: 'use',
    heading: '3. How We Use Your Information',
    body: [
      'We use your information to:',
      {
        list: [
          'Provide, operate, and maintain the Platform and its features.',
          'Generate personalised AI courses, mock exams, flashcards, and study plans from your uploaded content.',
          'Process transactions and send related notices (receipts, invoices, subscription updates).',
          'Respond to comments, questions, and support requests.',
          'Send administrative communications including service updates and security alerts.',
          'Send promotional communications — you may opt out at any time.',
          'Monitor and analyse usage trends to improve the Platform.',
          'Detect and prevent fraudulent transactions, abuse, and other prohibited activities.',
          'Comply with legal obligations.',
        ],
      },
    ],
  },
  {
    id: 'share',
    heading: '4. Sharing Your Information',
    body: [
      'We do not sell your personal data. We may share your information in the following limited circumstances:',
      {
        list: [
          'Service providers — trusted third parties who assist us in operating the Platform (e.g. Firebase / Google Cloud, Stripe, email delivery providers). They are contractually bound to keep your information confidential.',
          'Business transfers — if MyTutorMe is involved in a merger, acquisition, or sale of assets, your data may be transferred. We will provide notice before your personal data is transferred.',
          'Legal requirements — if required by law or in response to valid legal processes (court orders, subpoenas).',
          'Protection of rights — when we believe disclosure is necessary to protect our rights, your safety, or the safety of others.',
        ],
      },
    ],
  },
  {
    id: 'ai',
    heading: '5. AI Features & Your Content',
    body: [
      'MyTutorMe uses AI models (Google Vertex AI / Gemini) to generate course content, exam questions, and tutor responses from material you upload.',
      'Content you upload is processed to provide the AI features you request. We do not use your uploaded documents to train AI models without your explicit consent.',
      'AI-generated content is stored in your account and associated with your user ID. You can delete your uploaded materials at any time from your account settings.',
    ],
  },
  {
    id: 'retention',
    heading: '6. Data Retention',
    body: [
      'We retain your personal data for as long as your account is active or as needed to provide services. If you close your account, we will delete or anonymise your personal data within 90 days, except where retention is required by law.',
      'Anonymised, aggregated data (e.g. usage statistics) may be retained indefinitely as it can no longer be used to identify you.',
    ],
  },
  {
    id: 'security',
    heading: '7. Data Security',
    body: [
      'We implement industry-standard security measures including encryption in transit (TLS), encryption at rest, Firebase App Check, and role-based access controls to protect your personal data.',
      'No method of transmission over the internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your data, we cannot guarantee absolute security.',
    ],
  },
  {
    id: 'rights',
    heading: '8. Your Rights',
    body: [
      'Depending on your location you may have the following rights regarding your personal data:',
      {
        list: [
          'Access — request a copy of the personal data we hold about you.',
          'Correction — request that we correct inaccurate or incomplete data.',
          'Deletion — request that we delete your personal data ("right to be forgotten").',
          'Portability — request your data in a structured, machine-readable format.',
          'Objection — object to processing based on legitimate interests.',
          'Restriction — request that we restrict processing of your data.',
          'Withdraw consent — where processing is based on consent, you may withdraw it at any time.',
        ],
      },
      'To exercise any of these rights, contact us at privacy@mytutorme.org. We will respond within 30 days.',
    ],
  },
  {
    id: 'cookies',
    heading: '9. Cookies & Tracking',
    body: [
      'We use cookies and similar tracking technologies to maintain sessions, remember preferences, and analyse Platform performance.',
      'You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, some features of the Platform may not function correctly.',
    ],
  },
  {
    id: 'children',
    heading: '10. Children\'s Privacy',
    body: [
      'The Platform is not directed to children under the age of 13. We do not knowingly collect personal data from children under 13. If you are a parent or guardian and believe your child has provided us with personal data, please contact us immediately and we will take steps to remove that information.',
    ],
  },
  {
    id: 'international',
    heading: '11. International Data Transfers',
    body: [
      'MyTutorMe operates globally and your data may be processed in countries other than your own. Where we transfer data outside your jurisdiction, we ensure appropriate safeguards are in place (such as Standard Contractual Clauses) in accordance with applicable data protection laws.',
    ],
  },
  {
    id: 'changes',
    heading: '12. Changes to This Policy',
    body: [
      'We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page and updating the "Last Updated" date. Your continued use of the Platform after any changes constitutes your acceptance of the new policy.',
    ],
  },
  {
    id: 'contact',
    heading: '13. Contact Us',
    body: [
      'If you have questions or concerns about this Privacy Policy or our data practices, please contact us:',
      {
        list: [
          'Email: privacy@mytutorme.org',
          'Support: mytutorme.org/support',
        ],
      },
    ],
  },
];

export const PrivacyPolicyPage = () => (
  <div className="min-h-screen bg-background-light dark:bg-background-dark font-body text-slate-800 dark:text-slate-100 transition-colors duration-300">
    <Navbar />

    <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-20">

      {/* Hero */}
      <div className="mb-12">
        <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
          Legal
        </span>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">Privacy Policy</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Last updated: <span className="font-medium text-slate-700 dark:text-slate-300">{LAST_UPDATED}</span>
        </p>
        <div className="mt-5 h-px bg-gradient-to-r from-emerald-500/60 via-emerald-300/30 to-transparent" />
      </div>

      {/* Intro callout */}
      <div className="mb-10 p-5 rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/60 dark:bg-emerald-900/10">
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          Your privacy matters to us. This policy explains exactly what data we collect, why we collect it, and how you can control it. We've written it in plain language so it's easy to understand.
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

export default PrivacyPolicyPage;
