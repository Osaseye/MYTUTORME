"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
const React = __importStar(require("react"));
const resend_1 = require("resend");
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const WelcomeEmail_1 = require("../emails/templates/WelcomeEmail");
const PasswordResetEmail_1 = require("../emails/templates/PasswordResetEmail");
const CertificateAwardEmail_1 = require("../emails/templates/CertificateAwardEmail");
const CourseReceiptEmail_1 = require("../emails/templates/CourseReceiptEmail");
const TeacherApprovalEmail_1 = require("../emails/templates/TeacherApprovalEmail");
const TeacherRejectionEmail_1 = require("../emails/templates/TeacherRejectionEmail");
const CourseApprovalEmail_1 = require("../emails/templates/CourseApprovalEmail");
const CourseRejectionEmail_1 = require("../emails/templates/CourseRejectionEmail");
const PaymentFailedEmail_1 = require("../emails/templates/PaymentFailedEmail");
const SubscriptionSuccessEmail_1 = require("../emails/templates/SubscriptionSuccessEmail");
const SubscriptionCancelledEmail_1 = require("../emails/templates/SubscriptionCancelledEmail");
const StudentEnrollmentEmail_1 = require("../emails/templates/StudentEnrollmentEmail");
const TEST_RECIPIENT = 'sadebowale092@gmail.com';
const FROM = 'MyTutorMe <hello@mytutorme.org>';
const emails = [
    {
        name: 'WelcomeEmail (Student)',
        subject: '[TEST] Welcome to MyTutorMe',
        element: React.createElement(WelcomeEmail_1.WelcomeEmailTemplate, { name: 'Adewale', role: 'student' }),
    },
    {
        name: 'WelcomeEmail (Teacher)',
        subject: '[TEST] Welcome to MyTutorMe — Teacher Account',
        element: React.createElement(WelcomeEmail_1.WelcomeEmailTemplate, { name: 'Mr. Bello', role: 'teacher' }),
    },
    {
        name: 'PasswordResetEmail',
        subject: '[TEST] Reset your MyTutorMe password',
        element: React.createElement(PasswordResetEmail_1.PasswordResetEmail, {
            name: 'Adewale',
            resetLink: 'https://mytutorme.org/reset-password?oobCode=test-oob-code-123',
        }),
    },
    {
        name: 'CertificateAwardEmail',
        subject: '[TEST] Your certificate is ready — Congratulations!',
        element: React.createElement(CertificateAwardEmail_1.CertificateAwardEmail, {
            studentName: 'Adewale',
            courseTitle: 'Introduction to Data Science',
            certificateUrl: 'https://mytutorme.org/certificates/test-cert-id',
        }),
    },
    {
        name: 'CourseReceiptEmail',
        subject: '[TEST] Payment Receipt — MyTutorMe',
        element: React.createElement(CourseReceiptEmail_1.CourseReceiptEmail, {
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
        element: React.createElement(TeacherApprovalEmail_1.TeacherApprovalEmail, {
            name: 'Mr. Bello',
            loginUrl: 'https://mytutorme.org/teacher/dashboard',
        }),
    },
    {
        name: 'TeacherRejectionEmail',
        subject: '[TEST] Update on your teacher application',
        element: React.createElement(TeacherRejectionEmail_1.TeacherRejectionEmail, {
            name: 'Mr. Bello',
            reason: 'Your profile is missing a valid academic credential. Please upload a verified degree certificate and re-apply.',
        }),
    },
    {
        name: 'CourseApprovalEmail',
        subject: '[TEST] Your course is now live on MyTutorMe!',
        element: React.createElement(CourseApprovalEmail_1.CourseApprovalEmail, {
            teacherName: 'Mr. Bello',
            courseTitle: 'Introduction to Data Science',
            courseUrl: 'https://mytutorme.org/courses/test-course-id',
        }),
    },
    {
        name: 'CourseRejectionEmail',
        subject: '[TEST] Course review update — Action needed',
        element: React.createElement(CourseRejectionEmail_1.CourseRejectionEmail, {
            teacherName: 'Mr. Bello',
            courseTitle: 'Introduction to Data Science',
            reason: 'Some module videos are below the minimum quality threshold. Please re-record lessons 3 and 5 with better audio clarity before resubmitting.',
        }),
    },
    {
        name: 'PaymentFailedEmail',
        subject: '[TEST] Action Required: Payment Failed',
        element: React.createElement(PaymentFailedEmail_1.PaymentFailedEmail, { name: 'Adewale' }),
    },
    {
        name: 'SubscriptionSuccessEmail',
        subject: '[TEST] Subscription Confirmed — MyTutorMe Pro',
        element: React.createElement(SubscriptionSuccessEmail_1.SubscriptionSuccessEmail, {
            name: 'Adewale',
            planName: 'Student Premium Monthly',
            amount: 4500,
        }),
    },
    {
        name: 'SubscriptionCancelledEmail',
        subject: '[TEST] Your subscription has been cancelled',
        element: React.createElement(SubscriptionCancelledEmail_1.SubscriptionCancelledEmail, { name: 'Adewale' }),
    },
    {
        name: 'StudentEnrollmentEmail',
        subject: '[TEST] Enrollment Confirmed — Start Learning!',
        element: React.createElement(StudentEnrollmentEmail_1.StudentEnrollmentEmail, {
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
    const resend = new resend_1.Resend(apiKey);
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
            }
            else {
                console.log('✓');
                passed++;
            }
        }
        catch (err) {
            console.log(`✗  ${err.message}`);
            failed++;
        }
    }
    console.log(`\n${'─'.repeat(44)}`);
    console.log(`  ✓ ${passed} sent    ✗ ${failed} failed`);
    console.log(`${'─'.repeat(44)}\n`);
    if (failed > 0)
        process.exit(1);
}
main();
//# sourceMappingURL=test-emails.js.map