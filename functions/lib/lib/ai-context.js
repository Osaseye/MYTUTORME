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
exports.getAiTutorContext = exports.getRecentMockExams = exports.getRecentAssignments = exports.getEnrolledCourses = exports.getStudentProfile = void 0;
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
const getStudentProfile = async (uid) => {
    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists)
        return "";
    const studentProfile = userDoc.data() || {};
    let profileContext = `The student's name is ${studentProfile.displayName || 'Unknown'}.`;
    if (studentProfile.institution) {
        profileContext += ` They study at ${studentProfile.institution}`;
        if (studentProfile.courseOfStudy) {
            profileContext += ` and their course of study is ${studentProfile.courseOfStudy}.`;
        }
    }
    if (studentProfile.interests) {
        profileContext += ` Their interests include: ${studentProfile.interests.join(', ')}.`;
    }
    if (studentProfile.painPoint) {
        profileContext += ` Their main pain point with their studies is: ${studentProfile.painPoint}.`;
    }
    if (studentProfile.currentCGPA) {
        profileContext += ` Their current CGPA is ${studentProfile.currentCGPA} out of ${studentProfile.gradingSystem}.`;
        if (studentProfile.targetCGPA) {
            profileContext += ` Their target CGPA is ${studentProfile.targetCGPA}.`;
        }
    }
    return profileContext;
};
exports.getStudentProfile = getStudentProfile;
const getEnrolledCourses = async (userId) => {
    const enrollmentsSnapshot = await db.collection("enrollments")
        .where("studentId", "==", userId)
        .limit(10)
        .get();
    if (enrollmentsSnapshot.empty) {
        return '';
    }
    const courseIds = enrollmentsSnapshot.docs.map(doc => doc.data().courseId);
    if (courseIds.length === 0)
        return '';
    // We have to batch get courses or run multiple queries since 'in' max size is 10
    const validCourseIds = courseIds.slice(0, 10);
    const coursesSnapshot = await db.collection("courses")
        .where("__name__", "in", validCourseIds)
        .get();
    if (coursesSnapshot.empty) {
        return '';
    }
    const courseNames = coursesSnapshot.docs.map(doc => doc.data().title);
    return `The student is enrolled in the following courses: ${courseNames.join(', ')}.`;
};
exports.getEnrolledCourses = getEnrolledCourses;
const getRecentAssignments = async (userId) => {
    const assignmentsSnapshot = await db.collection("assignments")
        .where('studentId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(5)
        .get();
    if (assignmentsSnapshot.empty) {
        return '';
    }
    const assignmentInfo = assignmentsSnapshot.docs.map(doc => {
        const data = doc.data();
        return `${data.title} (Subject: ${data.subject}, Status: ${data.status})`;
    });
    return `The student has the following recent assignments: ${assignmentInfo.join('; ')}.`;
};
exports.getRecentAssignments = getRecentAssignments;
const getRecentMockExams = async (userId) => {
    const examsSnapshot = await db.collection("mock_exams")
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(3)
        .get();
    if (examsSnapshot.empty) {
        return '';
    }
    const examInfo = examsSnapshot.docs.map(doc => {
        const data = doc.data();
        return `Exam on ${data.topic} (Score: ${data.score || 'not graded yet'})`;
    });
    return `The student has recently taken mock exams on these topics: ${examInfo.join('; ')}.`;
};
exports.getRecentMockExams = getRecentMockExams;
const getAiTutorContext = async (uid) => {
    const profile = await (0, exports.getStudentProfile)(uid);
    const courses = await (0, exports.getEnrolledCourses)(uid);
    const assignments = await (0, exports.getRecentAssignments)(uid);
    const exams = await (0, exports.getRecentMockExams)(uid);
    const context = [profile, courses, assignments, exams].filter(Boolean).join('\n');
    return `Here is some context about the student you are tutoring:\n${context}`;
};
exports.getAiTutorContext = getAiTutorContext;
//# sourceMappingURL=ai-context.js.map