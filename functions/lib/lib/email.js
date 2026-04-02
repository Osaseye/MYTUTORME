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
exports.sendEmail = exports.DEFAULT_SENDER = exports.resend = void 0;
const resend_1 = require("resend");
const dotenv = __importStar(require("dotenv"));
const functions = __importStar(require("firebase-functions"));
dotenv.config();
const resendApiKey = process.env.RESEND_API_KEY || '';
if (!resendApiKey) {
    functions.logger.warn('RESEND_API_KEY is not set in environment variables');
}
exports.resend = new resend_1.Resend(resendApiKey);
// A standard sender address that matches your verified domain
exports.DEFAULT_SENDER = 'MyTutorMe <hello@mytutorme.org>';
const sendEmail = async ({ to, subject, react, replyTo }) => {
    var _a;
    if (!resendApiKey) {
        functions.logger.warn('Attempted to send email without RESEND_API_KEY. Aborting.');
        return null;
    }
    try {
        const data = await exports.resend.emails.send({
            from: exports.DEFAULT_SENDER,
            to,
            subject,
            react,
            replyTo: replyTo,
        });
        functions.logger.info(`Email sent successfully to ${to}. ID: ${(_a = data.data) === null || _a === void 0 ? void 0 : _a.id}`);
        return data;
    }
    catch (error) {
        functions.logger.error('Error sending email via Resend:', error);
        throw error;
    }
};
exports.sendEmail = sendEmail;
//# sourceMappingURL=email.js.map