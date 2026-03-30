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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onUserUpdated = exports.onUserCreated = void 0;
const functions = __importStar(require("firebase-functions"));
const react_1 = __importDefault(require("react"));
const email_1 = require("../lib/email");
const WelcomeEmail_1 = require("../emails/templates/WelcomeEmail");
const TeacherApprovalEmail_1 = require("../emails/templates/TeacherApprovalEmail");
const TeacherRejectionEmail_1 = require("../emails/templates/TeacherRejectionEmail");
exports.onUserCreated = functions.firestore
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
        await (0, email_1.sendEmail)({
            to: email,
            subject: 'Welcome to MyTutorMe!',
            react: react_1.default.createElement(WelcomeEmail_1.WelcomeEmail, {
                name,
                loginUrl: 'https://mytutorme.com/login',
            }),
        });
        console.log(`Welcome email successfully sent to ${email}`);
    }
    catch (error) {
        console.error(`Failed to send welcome email to ${email}:`, error);
    }
    return null;
});
exports.onUserUpdated = functions.firestore
    .document('users/{userId}')
    .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const email = after.email;
    const name = after.displayName || 'Teacher';
    if (!email || after.role !== 'teacher')
        return null;
    // Check for approval status change
    if (before.isApproved !== true && after.isApproved === true) {
        try {
            await (0, email_1.sendEmail)({
                to: email,
                subject: 'Your Teacher Profile is Approved!',
                react: react_1.default.createElement(TeacherApprovalEmail_1.TeacherApprovalEmail, {
                    name,
                    loginUrl: 'https://mytutorme.com/login',
                }),
            });
            console.log(`Teacher approval email sent to ${email}`);
        }
        catch (e) {
            console.error('Error sending approval email', e);
        }
    }
    // Check for rejection status
    if (before.status !== 'rejected' && after.status === 'rejected') {
        try {
            await (0, email_1.sendEmail)({
                to: email,
                subject: 'Update on Your Teacher Application',
                react: react_1.default.createElement(TeacherRejectionEmail_1.TeacherRejectionEmail, {
                    name,
                    reason: after.rejectionReason || 'Does not meet our current guidelines.',
                }),
            });
            console.log(`Teacher rejection email sent to ${email}`);
        }
        catch (e) {
            console.error('Error sending rejection email', e);
        }
    }
    return null;
});
//# sourceMappingURL=user.js.map