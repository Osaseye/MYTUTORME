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
exports.sendEmail = void 0;
const resend_1 = require("resend");
const dotenv = __importStar(require("dotenv"));
const render_1 = require("@react-email/render");
dotenv.config();
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const resend = new resend_1.Resend(RESEND_API_KEY);
const DEFAULT_FROM_EMAIL = 'MyTutorMe <noreply@mytutorme.com>'; // Replace with actual verified domain
const sendEmail = async ({ to, subject, react, html }) => {
    var _a;
    if (!RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is not set. Email not sent.', { to, subject });
        return { success: false, error: 'Missing API key' };
    }
    try {
        let htmlContent = html;
        if (react) {
            htmlContent = await (0, render_1.render)(react);
        }
        const data = await resend.emails.send({
            from: DEFAULT_FROM_EMAIL,
            to,
            subject,
            html: htmlContent || '',
        });
        console.log(`Email sent successfully to ${to}. ID:`, (_a = data.data) === null || _a === void 0 ? void 0 : _a.id);
        return { success: true, data };
    }
    catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error };
    }
};
exports.sendEmail = sendEmail;
//# sourceMappingURL=email.js.map