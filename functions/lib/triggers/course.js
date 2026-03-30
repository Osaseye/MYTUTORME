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
exports.onCourseUpdated = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const react_1 = __importDefault(require("react"));
const email_1 = require("../lib/email");
const CourseApprovalEmail_1 = require("../emails/templates/CourseApprovalEmail");
const CourseRejectionEmail_1 = require("../emails/templates/CourseRejectionEmail");
exports.onCourseUpdated = functions.firestore
    .document('courses/{courseId}')
    .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const courseId = context.params.courseId;
    // We only care if status changed
    if (before.status === after.status)
        return null;
    try {
        const teacherId = after.teacherId;
        if (!teacherId)
            return null;
        // Fetch teacher info
        const teacherDoc = await admin.firestore().collection('users').doc(teacherId).get();
        if (!teacherDoc.exists)
            return null;
        const teacherData = teacherDoc.data();
        if (!teacherData || !teacherData.email)
            return null;
        const teacherName = teacherData.displayName || 'Teacher';
        const email = teacherData.email;
        if (after.status === 'published' && before.status !== 'published') {
            // Course Approved
            await (0, email_1.sendEmail)({
                to: email,
                subject: `Your course "${after.title}" is now Live!`,
                react: react_1.default.createElement(CourseApprovalEmail_1.CourseApprovalEmail, {
                    teacherName,
                    courseTitle: after.title || 'Your Course',
                    courseUrl: `https://mytutorme.com/courses/${courseId}`,
                }),
            });
        }
        else if (after.status === 'rejected' && before.status !== 'rejected') {
            // Course Rejected
            await (0, email_1.sendEmail)({
                to: email,
                subject: `Action Required: Your course "${after.title}" review update`,
                react: react_1.default.createElement(CourseRejectionEmail_1.CourseRejectionEmail, {
                    teacherName,
                    courseTitle: after.title || 'Your Course',
                    reason: after.rejectionReason || 'Does not meet the quality guidelines required for our platform.',
                }),
            });
        }
    }
    catch (e) {
        console.error('Error sending course status email:', e);
    }
    return null;
});
//# sourceMappingURL=course.js.map