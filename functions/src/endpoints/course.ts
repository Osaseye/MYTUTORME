import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

export const enrollInCourse = functions.https.onCall(async (request) => {
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
    const price = courseData?.price || 0;
    const teacherId = courseData?.teacherId || courseData?.teacherName || "unknown_teacher";

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
        if (courseData?.teacherId) {
            const teacherRef = db.collection('users').doc(courseData.teacherId);
            const teacherSnap = await teacherRef.get();
            if (teacherSnap.exists) {
                const tData = teacherSnap.data();
                if (tData?.currentCommissionRate !== undefined) {
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
        message: `A new student enrolled in your course: ${courseData?.title}`,
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    });

    await batch.commit();

    return { success: true, enrollmentId: newEnrollmentRef.id };
});
