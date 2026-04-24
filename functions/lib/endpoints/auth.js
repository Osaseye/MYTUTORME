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
exports.requestPasswordReset = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const react_1 = __importDefault(require("react"));
const email_1 = require("../lib/email");
const PasswordResetEmail_1 = require("../emails/templates/PasswordResetEmail");
// Update this to your production domain when you go live
const APP_URL = process.env.APP_URL || 'https://app.mytutorme.org';
exports.requestPasswordReset = functions.https.onCall(async (request) => {
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
        await (0, email_1.sendEmail)({
            to: email,
            subject: 'Reset your MyTutorMe password',
            react: react_1.default.createElement(PasswordResetEmail_1.PasswordResetEmail, {
                name,
                resetLink,
            }),
        });
        return { success: true, message: 'Password reset email sent' };
    }
    catch (error) {
        console.error('Error generating/sending password reset:', error);
        // Don't leak whether the email exists
        return { success: true, message: 'If the email exists, a reset link has been sent.' };
    }
});
//# sourceMappingURL=auth.js.map