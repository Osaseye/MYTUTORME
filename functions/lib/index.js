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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processPendingDowngrades = exports.scheduleDowngrade = exports.verifyCoursePayment = exports.initializeCoursePayment = exports.requestPayout = exports.cancelSubscription = exports.paymentWebhook = exports.verifySubscription = exports.initializeSubscription = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const axios_1 = __importDefault(require("axios"));
const react_1 = __importDefault(require("react"));
const email_1 = require("./lib/email");
const SubscriptionSuccessEmail_1 = require("./emails/templates/SubscriptionSuccessEmail");
const CourseReceiptEmail_1 = require("./emails/templates/CourseReceiptEmail");
const SubscriptionCancelledEmail_1 = require("./emails/templates/SubscriptionCancelledEmail");
admin.initializeApp();
const db = admin.firestore();
const dotenv = __importStar(require("dotenv"));
dotenv.config();
// Use an environment variable for secret keys in production.
// Set it via: firebase functions:secrets:set FLUTTERWAVE_SECRET_KEY
// and: firebase functions:secrets:set FLUTTERWAVE_WEBHOOK_SECRET
const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY || "";
const FLUTTERWAVE_WEBHOOK_SECRET = process.env.FLUTTERWAVE_WEBHOOK_SECRET || "";
const PLAN_TEACHER_PREMIUM = process.env.FLUTTERWAVE_PLAN_TEACHER_PREMIUM || "FW_PLAN_TEACHER_PREMIUM";
const PLAN_STUDENT_MONTHLY = process.env.FLUTTERWAVE_PLAN_STUDENT_MONTHLY || "FW_PLAN_STUDENT_MONTHLY";
const PLAN_STUDENT_YEARLY = process.env.FLUTTERWAVE_PLAN_STUDENT_YEARLY || "FW_PLAN_STUDENT_YEARLY";
const axiosInstance = axios_1.default.create({
    baseURL: "https://api.flutterwave.com/v3",
    headers: {
        Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
        "Content-Type": "application/json",
    },
});
/**
 * Callable function to initialize a Flutterwave subscription.
 */
exports.initializeSubscription = functions.https.onCall(async (request) => {
    var _a;
    const data = request.data || request;
    const { planCode, email, userId, redirectUrl } = data;
    if (!planCode || !email || !userId) {
        throw new functions.https.HttpsError("invalid-argument", "Missing required fields.");
    }
    // Determine pricing based on plan (Flutterwave uses whole currency values, e.g., 4000 = NGN 4,000)
    const amount = planCode === PLAN_TEACHER_PREMIUM ? 12000 : planCode === PLAN_STUDENT_MONTHLY ? 4000 : 40000;
    // Default to mytutorme.org if no redirect URL is provided
    const finalRedirectUrl = redirectUrl || "https://mytutorme.org/dashboard";
    try {
        const response = await axiosInstance.post("/payments", {
            tx_ref: `tx-${Date.now()}-${userId}`,
            amount: amount,
            currency: "NGN", // Add variables if supporting multiple currencies
            redirect_url: finalRedirectUrl,
            payment_plan: planCode,
            customer: {
                email: email,
            },
            customizations: {
                title: "MyTutorMe Auto-Renewing Subscription",
                description: "Premium Plan Upgrade",
            },
            meta: {
                userId: userId, // Pass mapping variable through metadata
                planCode: planCode, // Helps webhook attribute plan properly
            }
        });
        return {
            authorizationUrl: response.data.data.link, // Flutterwave returns checkout link in 'link'
            reference: response.data.data.tx_ref,
        };
    }
    catch (error) {
        console.error("Flutterwave Initialize Error:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        throw new functions.https.HttpsError("internal", "Unable to initialize payment.");
    }
});
/**
 * Callable function to manually verify a subscription.
 */
exports.verifySubscription = functions.https.onCall(async (request, context) => {
    var _a, _b, _c, _d, _e;
    const data = request.data || request;
    const { transactionId, status } = data;
    if (status !== 'successful' && status !== 'completed') {
        return { success: false, message: "Transaction not successful" };
    }
    if (!transactionId) {
        throw new functions.https.HttpsError("invalid-argument", "Missing transaction ID.");
    }
    try {
        const response = await axiosInstance.get(`/transactions/${transactionId}/verify`);
        const txData = response.data.data;
        if (txData.status !== "successful") {
            return { success: false, status: txData.status };
        }
        const txRef = txData.tx_ref;
        const existingTx = await db.collection("transactions").where("reference", "==", txRef).get();
        if (!existingTx.empty) {
            return { success: true, message: "Already verified by webhook" };
        }
        const userId = ((_a = txData.meta) === null || _a === void 0 ? void 0 : _a.userId) || txRef.split('-').slice(2).join('-');
        const mappedPlanCode = ((_b = txData.meta) === null || _b === void 0 ? void 0 : _b.planCode) || txData.payment_plan || PLAN_STUDENT_MONTHLY;
        const email = (_c = txData.customer) === null || _c === void 0 ? void 0 : _c.email;
        let userDocRef;
        let userData;
        if (userId) {
            userDocRef = db.collection("users").doc(userId);
            const userSnap = await userDocRef.get();
            if (userSnap.exists)
                userData = userSnap.data();
        }
        else {
            const qs = await db.collection("users").where("email", "==", email).get();
            if (!qs.empty) {
                userDocRef = qs.docs[0].ref;
                userData = qs.docs[0].data();
            }
        }
        if (userDocRef) {
            const updatePayload = {
                subscriptionStatus: "active",
                subscriptionId: String(txData.id),
                paymentProviderCustomerId: String((_d = txData.customer) === null || _d === void 0 ? void 0 : _d.id),
                paymentProvider: "flutterwave",
            };
            if (mappedPlanCode === PLAN_TEACHER_PREMIUM) {
                updatePayload.teacherSubscriptionPlan = "premium_tools";
                updatePayload.currentCommissionRate = 0.15;
            }
            else {
                updatePayload.plan = mappedPlanCode === PLAN_STUDENT_YEARLY ? "pro_yearly" : "pro_monthly";
            }
            await userDocRef.set(updatePayload, { merge: true });
            await db.collection("transactions").add({
                amount: txData.amount,
                type: 'subscription',
                status: 'successful',
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                platformFee: txData.amount,
                userId: userDocRef.id,
                userRole: (userData === null || userData === void 0 ? void 0 : userData.role) || "student",
                description: `Subscription Upgrade via Flutterwave`,
                reference: txRef
            });
            if (email && userData) {
                const planName = mappedPlanCode === PLAN_TEACHER_PREMIUM ? 'Premium Teacher Tools' : 'Pro Plan';
                await (0, email_1.sendEmail)({
                    to: email,
                    subject: 'Your Subscription is Active! - MyTutorMe',
                    react: react_1.default.createElement(SubscriptionSuccessEmail_1.SubscriptionSuccessEmail, {
                        name: userData.displayName || 'Learner',
                        planName: planName,
                        amount: txData.amount,
                    }),
                });
            }
        }
        return { success: true };
    }
    catch (error) {
        console.error("Flutterwave Verify Error:", ((_e = error.response) === null || _e === void 0 ? void 0 : _e.data) || error.message);
        throw new functions.https.HttpsError("internal", "Unable to verify payment.");
    }
});
/**
 * Webhook endpoint for Flutterwave events.
 */
exports.paymentWebhook = functions.https.onRequest(async (req, res) => {
    var _a, _b, _c, _d, _e, _f, _g;
    const signature = req.headers["verif-hash"];
    if (!signature || signature !== FLUTTERWAVE_WEBHOOK_SECRET) {
        console.error("Invalid signature");
        res.status(401).send("Invalid signature");
        return;
    }
    const { event, data } = req.body;
    try {
        switch (event) {
            case "charge.completed": {
                if (data.status !== "successful")
                    break;
                const txRef = data.tx_ref;
                // check if already saved
                const existingTx = await db.collection("transactions").where("reference", "==", txRef).get();
                if (!existingTx.empty)
                    break;
                const userId = ((_a = data.meta) === null || _a === void 0 ? void 0 : _a.userId) || ((_c = (_b = txRef === null || txRef === void 0 ? void 0 : txRef.split('-')) === null || _b === void 0 ? void 0 : _b.slice(2)) === null || _c === void 0 ? void 0 : _c.join('-'));
                const mappedPlanCode = ((_d = data.meta) === null || _d === void 0 ? void 0 : _d.planCode) || data.payment_plan || PLAN_STUDENT_MONTHLY;
                const email = (_e = data.customer) === null || _e === void 0 ? void 0 : _e.email;
                let userDocRef;
                let userData;
                if (userId) {
                    userDocRef = db.collection("users").doc(userId);
                    const userSnap = await userDocRef.get();
                    if (userSnap.exists)
                        userData = userSnap.data();
                }
                else {
                    // Fallback: finding user by email
                    const qs = await db.collection("users").where("email", "==", email).get();
                    if (!qs.empty) {
                        userDocRef = qs.docs[0].ref;
                        userData = qs.docs[0].data();
                    }
                }
                if (userDocRef) {
                    // Adjust payload for abstract generic system
                    const updatePayload = {
                        subscriptionStatus: "active",
                        subscriptionId: String(data.id), // e.g., the transaction/sub ID
                        paymentProviderCustomerId: String((_f = data.customer) === null || _f === void 0 ? void 0 : _f.id),
                        paymentProvider: "flutterwave",
                        // Can calculate nextpayment date based on flutterwave plan logic or save directly
                    };
                    if (mappedPlanCode === PLAN_TEACHER_PREMIUM) {
                        updatePayload.teacherSubscriptionPlan = "premium_tools";
                        updatePayload.currentCommissionRate = 0.15; // Set base commission rate to 15% instead of 30%
                    }
                    else {
                        updatePayload.plan = mappedPlanCode === PLAN_STUDENT_YEARLY ? "pro_yearly" : "pro_monthly"; // Explicit plan string mapped for frontend
                    }
                    await userDocRef.set(updatePayload, { merge: true });
                    // Record the transaction for Admin Dashboard revenue analytics
                    await db.collection("transactions").add({
                        amount: data.amount, // Flutterwave amount is already in whole numbers
                        type: 'subscription',
                        status: 'successful',
                        createdAt: admin.firestore.FieldValue.serverTimestamp(),
                        platformFee: data.amount, // For subscriptions, the entire amount goes to the platform
                        userId: userDocRef.id,
                        userRole: (userData === null || userData === void 0 ? void 0 : userData.role) || "student",
                        description: `Subscription Upgrade via Flutterwave`,
                        reference: data.tx_ref
                    });
                    // Send subscription success email
                    if (email && userData) {
                        const planName = mappedPlanCode === PLAN_TEACHER_PREMIUM ? 'Premium Teacher Tools' : 'Pro Plan';
                        await (0, email_1.sendEmail)({
                            to: email,
                            subject: 'Your Subscription is Active! - MyTutorMe',
                            react: react_1.default.createElement(SubscriptionSuccessEmail_1.SubscriptionSuccessEmail, {
                                name: userData.displayName || 'Learner',
                                planName: planName,
                                amount: data.amount,
                            }),
                        });
                    }
                }
                break;
            }
            case "subscription.cancelled": {
                const customerId = String((_g = data.customer) === null || _g === void 0 ? void 0 : _g.id);
                const qs = await db.collection("users").where("paymentProviderCustomerId", "==", customerId).get();
                if (!qs.empty) {
                    const userDoc = qs.docs[0];
                    await userDoc.ref.update({
                        subscriptionStatus: "cancelled"
                    });
                    const userData = userDoc.data();
                    if (userData.email) {
                        await (0, email_1.sendEmail)({
                            to: userData.email,
                            subject: 'Your Subscription has been Cancelled - MyTutorMe',
                            react: react_1.default.createElement(SubscriptionCancelledEmail_1.SubscriptionCancelledEmail, {
                                name: userData.displayName || 'Learner',
                            }),
                        });
                    }
                }
                break;
            }
        }
    }
    catch (error) {
        console.error("Webhook processing error:", error);
        // Always return 200 to prevent retries of badly shaped events.
    }
    res.status(200).send("OK");
});
/**
 * Callable function to cancel a Flutterwave subscription.
 */
exports.cancelSubscription = functions.https.onCall(async (request) => {
    var _a, _b, _c, _d;
    const data = request.data || request;
    const context = request; // In v2, auth is directly on the request object
    const { subscriptionId } = data;
    if (!subscriptionId) {
        throw new functions.https.HttpsError("invalid-argument", "Missing subscription ID.");
    }
    try {
        await axiosInstance.put(`/subscriptions/${subscriptionId}/cancel`);
        // Send cancellation email if user authentication context is present
        const userId = (_a = context === null || context === void 0 ? void 0 : context.auth) === null || _a === void 0 ? void 0 : _a.uid;
        if (userId) {
            const userSnapshot = await db.collection("users").doc(userId).get();
            if (userSnapshot.exists) {
                const userData = userSnapshot.data();
                if (userData === null || userData === void 0 ? void 0 : userData.email) {
                    try {
                        await (0, email_1.sendEmail)({
                            to: userData.email,
                            subject: "Your MyTutorMe Subscription is Cancelled",
                            react: (0, SubscriptionCancelledEmail_1.SubscriptionCancelledEmail)({
                                name: userData.name || userData.displayName || "Student"
                            })
                        });
                    }
                    catch (emailErr) {
                        console.error("Failed to send cancellation email:", emailErr);
                    }
                }
            }
        }
        return { success: true, message: "Subscription cancelled successfully." };
    }
    catch (error) {
        console.error("Cancel Subscription Error:", ((_b = error.response) === null || _b === void 0 ? void 0 : _b.data) || error.message);
        // Gracefully handle 400 or 404 errors (e.g., "Non existent or invalid subscription")
        const status = (_c = error.response) === null || _c === void 0 ? void 0 : _c.status;
        if (status === 400 || status === 404) {
            console.log(`Subscription ${subscriptionId} treated as cancelled (Flutterwave returned ${status}).`);
            const userId = (_d = context === null || context === void 0 ? void 0 : context.auth) === null || _d === void 0 ? void 0 : _d.uid;
            if (userId) {
                const userSnapshot = await db.collection("users").doc(userId).get();
                if (userSnapshot.exists) {
                    const userData = userSnapshot.data();
                    if (userData === null || userData === void 0 ? void 0 : userData.email) {
                        try {
                            await (0, email_1.sendEmail)({
                                to: userData.email,
                                subject: "Your MyTutorMe Subscription is Cancelled",
                                react: (0, SubscriptionCancelledEmail_1.SubscriptionCancelledEmail)({
                                    name: userData.name || userData.displayName || "Student"
                                })
                            });
                        }
                        catch (emailErr) {
                            console.error("Failed to send cancellation email:", emailErr);
                        }
                    }
                }
            }
            return { success: true, message: "Subscription already inactive or cancelled." };
        }
        throw new functions.https.HttpsError("internal", "Unable to cancel subscription.");
    }
});
/**
 * Callable function to process Teacher payouts
 */
exports.requestPayout = functions.https.onCall(async (request) => {
    const data = request.data || request;
    const context = request;
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
    }
    const uid = context.auth.uid;
    const { amount, bankCode, accountNumber } = data;
    if (!amount || amount <= 0 || !bankCode || !accountNumber) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing or invalid parameters.');
    }
    const userRef = db.collection('users').doc(uid);
    try {
        await db.runTransaction(async (transaction) => {
            var _a;
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists) {
                throw new functions.https.HttpsError('not-found', 'User profile not found.');
            }
            const currentBalance = ((_a = userDoc.data()) === null || _a === void 0 ? void 0 : _a.balance) || 0;
            if (currentBalance < amount) {
                throw new functions.https.HttpsError('failed-precondition', 'Insufficient balance.');
            }
            transaction.update(userRef, {
                balance: admin.firestore.FieldValue.increment(-amount),
            });
        });
        const transferPayload = {
            account_bank: bankCode,
            account_number: accountNumber,
            amount: amount,
            narration: 'Teacher Payout',
            currency: 'NGN',
            reference: `payout_${uid}_${Date.now()}`,
            debit_currency: 'NGN'
        };
        const response = await axiosInstance.post('/transfers', transferPayload);
        if (response.data.status !== 'success') {
            await userRef.update({
                balance: admin.firestore.FieldValue.increment(amount),
            });
            throw new functions.https.HttpsError('internal', `Transfer failed: ${response.data.message}`);
        }
        return {
            success: true,
            message: 'Payout requested successfully.',
            data: response.data.data
        };
    }
    catch (error) {
        console.error('Error processing payout:', error);
        if (error instanceof functions.https.HttpsError)
            throw error;
        throw new functions.https.HttpsError('internal', 'An error occurred while processing the payout.');
    }
});
/**
 * Callable function to initialize a Flutterwave course payment.
 */
exports.initializeCoursePayment = functions.https.onCall(async (request) => {
    var _a;
    const data = request.data || request;
    const { courseId, courseTitle, amount, email, userId, redirectUrl } = data;
    if (!courseId || !courseTitle || !amount || !email || !userId) {
        throw new functions.https.HttpsError("invalid-argument", "Missing required fields.");
    }
    const finalRedirectUrl = redirectUrl || "https://mytutorme.org/student/courses";
    try {
        const response = await axiosInstance.post("/payments", {
            tx_ref: `course-${Date.now()}-${userId}`,
            amount: amount,
            currency: "NGN",
            redirect_url: finalRedirectUrl,
            customer: {
                email: email,
            },
            customizations: {
                title: "MyTutorMe Course Purchase",
                description: courseTitle,
            },
            meta: {
                userId: userId,
                courseId: courseId,
                paymentType: 'course',
            }
        });
        return {
            authorizationUrl: response.data.data.link,
            reference: response.data.data.tx_ref,
        };
    }
    catch (error) {
        console.error("Flutterwave Course Initialize Error:", ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        throw new functions.https.HttpsError("internal", "Unable to initialize course payment.");
    }
});
/**
 * Callable function to verify a course payment.
 */
exports.verifyCoursePayment = functions.https.onCall(async (request, context) => {
    var _a, _b, _c, _d, _e;
    const data = request.data || request;
    const { transactionId, status } = data;
    if (status !== 'successful' && status !== 'completed') {
        return { success: false, message: "Transaction not successful" };
    }
    if (!transactionId) {
        throw new functions.https.HttpsError("invalid-argument", "Missing transaction ID.");
    }
    try {
        const response = await axiosInstance.get(`/transactions/${transactionId}/verify`);
        const txData = response.data.data;
        if (txData.status !== "successful") {
            return { success: false, status: txData.status };
        }
        const txRef = txData.tx_ref;
        const existingTx = await db.collection("transactions").where("reference", "==", txRef).get();
        if (!existingTx.empty) {
            return { success: true, message: "Already verified" };
        }
        const userId = ((_a = txData.meta) === null || _a === void 0 ? void 0 : _a.userId) || txRef.split('-').slice(2).join('-');
        const courseId = (_b = txData.meta) === null || _b === void 0 ? void 0 : _b.courseId;
        if (!courseId || !userId) {
            throw new functions.https.HttpsError("internal", "Missing metadata for course enrollment.");
        }
        // Fetch Course & Teacher Details
        const courseRef = db.collection("courses").doc(courseId);
        const courseSnap = await courseRef.get();
        if (!courseSnap.exists) {
            throw new functions.https.HttpsError("internal", "Course not found.");
        }
        const courseData = courseSnap.data();
        let commissionRate = 0.30;
        if (courseData.teacherId) {
            const teacherSnap = await db.collection("users").doc(courseData.teacherId).get();
            if (teacherSnap.exists) {
                commissionRate = (_d = (_c = teacherSnap.data()) === null || _c === void 0 ? void 0 : _c.currentCommissionRate) !== null && _d !== void 0 ? _d : 0.30;
            }
        }
        const price = txData.amount;
        const platformFee = price * commissionRate;
        const teacherEarnings = price - platformFee;
        const batch = db.batch();
        // 1. Create enrollment
        const newEnrollmentRef = db.collection("enrollments").doc();
        batch.set(newEnrollmentRef, {
            courseId: courseId,
            studentId: userId,
            teacherId: courseData.teacherId || courseData.teacherName,
            enrolledAt: admin.firestore.FieldValue.serverTimestamp(),
            progress: 0,
            completedModules: []
        });
        // 2. Create transaction
        const newTransactionRef = db.collection("transactions").doc();
        batch.set(newTransactionRef, {
            amount: price,
            platformFee: platformFee,
            teacherEarnings: teacherEarnings,
            courseId: courseId,
            studentId: userId,
            teacherId: courseData.teacherId || courseData.teacherName,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            status: 'completed',
            type: 'purchase',
            reference: txRef
        });
        // 3. Increment enrollmentCount
        batch.update(courseRef, {
            enrollmentCount: admin.firestore.FieldValue.increment(1)
        });
        // 4. Create notification for teacher
        const newNotificationRef = db.collection("notifications").doc();
        batch.set(newNotificationRef, {
            teacherId: courseData.teacherId || courseData.teacherName,
            message: `A new student enrolled in your course: ${courseData.title}`,
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        await batch.commit();
        // Send Receipt Email to Student
        try {
            const studentSnap = await db.collection("users").doc(userId).get();
            if (studentSnap.exists) {
                const studentData = studentSnap.data();
                if (studentData === null || studentData === void 0 ? void 0 : studentData.email) {
                    await (0, email_1.sendEmail)({
                        to: studentData.email,
                        subject: `Receipt for ${courseData.title} - MyTutorMe`,
                        react: react_1.default.createElement(CourseReceiptEmail_1.CourseReceiptEmail, {
                            studentName: studentData.displayName || 'Student',
                            courseTitle: courseData.title,
                            amount: price,
                            transactionId: transactionId,
                            date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                        }),
                    });
                }
            }
        }
        catch (e) {
            console.error("Error sending course receipt email:", e);
        }
        return { success: true };
    }
    catch (error) {
        console.error("Flutterwave Course Verify Error:", ((_e = error.response) === null || _e === void 0 ? void 0 : _e.data) || error.message);
        throw new functions.https.HttpsError("internal", "Unable to verify course payment.");
    }
});
/**
 * Callable function to schedule a subscription downgrade.
 */
exports.scheduleDowngrade = functions.https.onCall(async (request) => {
    var _a, _b;
    const data = request.data || request;
    const context = request; // For v2 auth mapping
    const { newPlan } = data;
    const userId = (_a = context === null || context === void 0 ? void 0 : context.auth) === null || _a === void 0 ? void 0 : _a.uid;
    if (!userId)
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");
    const userRef = db.collection("users").doc(userId);
    const userSnap = await userRef.get();
    const userData = userSnap.data();
    if (!userData || !["pro_yearly", "pro_monthly", "premium_tools"].includes(userData.plan || userData.teacherSubscriptionPlan)) {
        throw new functions.https.HttpsError("failed-precondition", "Only premium users can schedule a downgrade.");
    }
    if (userData.subscriptionId) {
        try {
            await axiosInstance.put(`/subscriptions/${userData.subscriptionId}/cancel`);
        }
        catch (e) {
            console.log(`Cancel schedule: could not cancel flutterwave sub immediately. Status: ${(_b = e === null || e === void 0 ? void 0 : e.response) === null || _b === void 0 ? void 0 : _b.status}`);
        }
    }
    const effectiveDate = userData.currentPeriodEnd || admin.firestore.Timestamp.now();
    await userRef.update({
        pendingDowngrade: {
            plan: newPlan,
            effectiveDate: effectiveDate
        }
    });
    return { success: true, message: `Downgrade to ${newPlan} scheduled successfully.` };
});
/**
 * Scheduled function to process pending downgrades daily.
 */
const scheduler_1 = require("firebase-functions/v2/scheduler");
exports.processPendingDowngrades = (0, scheduler_1.onSchedule)("every 24 hours", async (event) => {
    const now = admin.firestore.Timestamp.now();
    const usersSnapshot = await db.collection("users")
        .where("pendingDowngrade.effectiveDate", "<=", now)
        .get();
    if (usersSnapshot.empty)
        return;
    const batch = db.batch();
    usersSnapshot.forEach((doc) => {
        const pendingDowngrade = doc.data().pendingDowngrade;
        batch.update(doc.ref, {
            plan: pendingDowngrade.plan,
            subscriptionId: admin.firestore.FieldValue.delete(),
            pendingDowngrade: admin.firestore.FieldValue.delete(),
        });
    });
    await batch.commit();
    console.log(`Successfully processed ${usersSnapshot.size} downgrades.`);
});
__exportStar(require("./triggers/user"), exports);
__exportStar(require("./endpoints/auth"), exports);
__exportStar(require("./triggers/course"), exports);
__exportStar(require("./endpoints/course"), exports);
__exportStar(require("./endpoints/ai"), exports);
__exportStar(require("./endpoints/ai-generation"), exports);
//# sourceMappingURL=index.js.map