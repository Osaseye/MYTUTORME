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
exports.enrollInCourse = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const db = admin.firestore();
exports.enrollInCourse = functions.https.onCall(async (request) => {
    const data = request.data;
    const context = request;
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated to enroll.");
    }
    const { courseId } = data;
    const uid = context.auth.uid;
    if (!courseId) {
        throw new functions.https.HttpsError("invalid-argument", "Course ID is required.");
    }
    const courseRef = db.collection("courses").doc(courseId);
    const courseSnap = await courseRef.get();
    if (!courseSnap.exists) {
        throw new functions.https.HttpsError("not-found", "Course not found.");
    }
    const courseData = courseSnap.data();
    const price = (courseData === null || courseData === void 0 ? void 0 : courseData.price) || 0;
    const teacherId = (courseData === null || courseData === void 0 ? void 0 : courseData.teacherId) || (courseData === null || courseData === void 0 ? void 0 : courseData.teacherName) || "unknown_teacher";
    // Prevent double enrollment
    const existingEnrollment = await db.collection("enrollments")
        .where("courseId", "==", courseId)
        .where("studentId", "==", uid)
        .get();
    if (!existingEnrollment.empty) {
        throw new functions.https.HttpsError("already-exists", "User is already enrolled in this course.");
    }
    const batch = db.batch();
    // 1. Create enrollment
    const enrollmentsRef = db.collection("enrollments");
    const newEnrollmentRef = enrollmentsRef.doc();
    batch.set(newEnrollmentRef, {
        courseId: courseId,
        studentId: uid,
        teacherId: teacherId,
        enrolledAt: admin.firestore.FieldValue.serverTimestamp(),
        progress: 0,
        completedModules: []
    });
    // 2. Create transaction if there is a price
    if (price > 0) {
        let commissionRate = 0.3; // Base commission
        if (courseData === null || courseData === void 0 ? void 0 : courseData.teacherId) {
            const teacherRef = db.collection('users').doc(courseData.teacherId);
            const teacherSnap = await teacherRef.get();
            if (teacherSnap.exists) {
                const tData = teacherSnap.data();
                if ((tData === null || tData === void 0 ? void 0 : tData.currentCommissionRate) !== undefined) {
                    commissionRate = tData.currentCommissionRate;
                }
            }
        }
        const platformFee = price * commissionRate;
        const teacherEarnings = price - platformFee;
        const transactionsRef = db.collection("transactions");
        const newTransactionRef = transactionsRef.doc();
        batch.set(newTransactionRef, {
            amount: price,
            platformFee,
            teacherEarnings,
            courseId: courseId,
            studentId: uid,
            teacherId: teacherId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            status: 'completed',
            type: 'purchase'
        });
    }
    // 3. Increment course enrollment count
    batch.update(courseRef, {
        enrollmentCount: admin.firestore.FieldValue.increment(1)
    });
    // 4. Notify the teacher
    const notificationsRef = db.collection("notifications");
    const newNotificationRef = notificationsRef.doc();
    batch.set(newNotificationRef, {
        teacherId: teacherId,
        message: `A new student enrolled in your course: ${courseData === null || courseData === void 0 ? void 0 : courseData.title}`,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    await batch.commit();
    return { success: true, enrollmentId: newEnrollmentRef.id };
});
//# sourceMappingURL=course.js.map