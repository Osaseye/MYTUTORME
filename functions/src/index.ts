import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios from "axios";

import React from 'react';
import { sendEmail } from "./lib/email";
import { SubscriptionSuccessEmail } from "./emails/templates/SubscriptionSuccessEmail";
import { CourseReceiptEmail } from "./emails/templates/CourseReceiptEmail";

import { SubscriptionCancelledEmail } from "./emails/templates/SubscriptionCancelledEmail";

admin.initializeApp();
const db = admin.firestore();

import * as dotenv from "dotenv";
dotenv.config();

export { generateCourseContent } from "./endpoints/ai-generation-admin";

// Use an environment variable for secret keys in production.
// Set it via: firebase functions:secrets:set FLUTTERWAVE_SECRET_KEY
// and: firebase functions:secrets:set FLUTTERWAVE_WEBHOOK_SECRET
const FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY || "";
const FLUTTERWAVE_WEBHOOK_SECRET = process.env.FLUTTERWAVE_WEBHOOK_SECRET || "";

const PLAN_TEACHER_PREMIUM = process.env.FLUTTERWAVE_PLAN_TEACHER_PREMIUM || "FW_PLAN_TEACHER_PREMIUM";
const PLAN_STUDENT_MONTHLY = process.env.FLUTTERWAVE_PLAN_STUDENT_MONTHLY || "FW_PLAN_STUDENT_MONTHLY";
const PLAN_STUDENT_YEARLY = process.env.FLUTTERWAVE_PLAN_STUDENT_YEARLY || "FW_PLAN_STUDENT_YEARLY";

const axiosInstance = axios.create({
  baseURL: "https://api.flutterwave.com/v3",
  headers: {
    Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});

/**
 * Callable function to initialize a Flutterwave subscription.
 */
export const initializeSubscription = functions.https.onCall(async (request: any) => {
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
  } catch (error: any) {
    console.error("Flutterwave Initialize Error:", error.response?.data || error.message);
    throw new functions.https.HttpsError("internal", "Unable to initialize payment.");
  }
});

/**
 * Callable function to manually verify a subscription.
 */
export const verifySubscription = functions.https.onCall(async (request: any, context) => {
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

    const userId = txData.meta?.userId || txRef.split('-').slice(2).join('-');
    const mappedPlanCode = txData.meta?.planCode || txData.payment_plan || PLAN_STUDENT_MONTHLY;
    const email = txData.customer?.email;

    let userDocRef;
    let userData: any;

    if (userId) {
        userDocRef = db.collection("users").doc(userId);
        const userSnap = await userDocRef.get();
        if (userSnap.exists) userData = userSnap.data();
    } else {
        const qs = await db.collection("users").where("email", "==", email).get();
        if(!qs.empty) {
            userDocRef = qs.docs[0].ref;
            userData = qs.docs[0].data();
        }
    }

    if (userDocRef) {
      const updatePayload: any = {
        subscriptionStatus: "active",
        subscriptionId: String(txData.id), 
        paymentProviderCustomerId: String(txData.customer?.id), 
        paymentProvider: "flutterwave",
      };

      if (mappedPlanCode === PLAN_TEACHER_PREMIUM) {
        updatePayload.teacherSubscriptionPlan = "premium_tools";
        updatePayload.currentCommissionRate = 0.15;
      } else {
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
        userRole: userData?.role || "student",
        description: `Subscription Upgrade via Flutterwave`,
        reference: txRef
      });

      if (email && userData) {
        const planName = mappedPlanCode === PLAN_TEACHER_PREMIUM ? 'Premium Teacher Tools' : 'Pro Plan';
        await sendEmail({
          to: email,
          subject: 'Your Subscription is Active! - MyTutorMe',
          react: React.createElement(SubscriptionSuccessEmail, {
            name: userData.displayName || 'Learner',
            planName: planName,
            amount: txData.amount,
          }),
        });
      }
    }
    return { success: true };
  } catch (error: any) {
    console.error("Flutterwave Verify Error:", error.response?.data || error.message);
    throw new functions.https.HttpsError("internal", "Unable to verify payment.");
  }
});

/**
 * Webhook endpoint for Flutterwave events.
 */
export const paymentWebhook = functions.https.onRequest(async (req, res) => {
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
        if (data.status !== "successful") break;

        const txRef = data.tx_ref;
        // check if already saved
        const existingTx = await db.collection("transactions").where("reference", "==", txRef).get();
        if (!existingTx.empty) break;

        const userId = data.meta?.userId || txRef?.split('-')?.slice(2)?.join('-');
        const mappedPlanCode = data.meta?.planCode || data.payment_plan || PLAN_STUDENT_MONTHLY;
        const email = data.customer?.email;
        
        let userDocRef;
        let userData: any;

        if (userId) {
            userDocRef = db.collection("users").doc(userId);
            const userSnap = await userDocRef.get();
            if (userSnap.exists) userData = userSnap.data();
        } else {
            // Fallback: finding user by email
            const qs = await db.collection("users").where("email", "==", email).get();
            if(!qs.empty) {
                userDocRef = qs.docs[0].ref;
                userData = qs.docs[0].data();
            }
        }
        
        if (userDocRef) {
          // Adjust payload for abstract generic system
          const updatePayload: any = {
            subscriptionStatus: "active",
            subscriptionId: String(data.id), // e.g., the transaction/sub ID
            paymentProviderCustomerId: String(data.customer?.id), 
            paymentProvider: "flutterwave",
            // Can calculate nextpayment date based on flutterwave plan logic or save directly
          };

          if (mappedPlanCode === PLAN_TEACHER_PREMIUM) {
            updatePayload.teacherSubscriptionPlan = "premium_tools";
            updatePayload.currentCommissionRate = 0.15; // Set base commission rate to 15% instead of 30%
          } else {
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
            userRole: userData?.role || "student",
            description: `Subscription Upgrade via Flutterwave`,
            reference: data.tx_ref
          });

          // Send subscription success email
          if (email && userData) {
            const planName = mappedPlanCode === PLAN_TEACHER_PREMIUM ? 'Premium Teacher Tools' : 'Pro Plan';
            await sendEmail({
              to: email,
              subject: 'Your Subscription is Active! - MyTutorMe',
              react: React.createElement(SubscriptionSuccessEmail, {
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
         const customerId = String(data.customer?.id);
         const qs = await db.collection("users").where("paymentProviderCustomerId", "==", customerId).get();
         if(!qs.empty) {
            const userDoc = qs.docs[0];
            await userDoc.ref.update({
                subscriptionStatus: "cancelled"
            });
            
            const userData = userDoc.data();
            if (userData.email) {
              await sendEmail({
                to: userData.email,
                subject: 'Your Subscription has been Cancelled - MyTutorMe',
                react: React.createElement(SubscriptionCancelledEmail, {
                  name: userData.displayName || 'Learner',
                }),
              });
            }
         }
         break;
      }
    }
  } catch (error) {
    console.error("Webhook processing error:", error);
    // Always return 200 to prevent retries of badly shaped events.
  }

  res.status(200).send("OK");
});

/**
 * Callable function to cancel a Flutterwave subscription.
 */
export const cancelSubscription = functions.https.onCall(async (data: any, context: any) => {
  const { subscriptionId } = data;

  if (!subscriptionId) {
     throw new functions.https.HttpsError("invalid-argument", "Missing subscription ID.");
  }

  try {
    await axiosInstance.put(`/subscriptions/${subscriptionId}/cancel`);
    
    // Send cancellation email if user authentication context is present
    const userId = context?.auth?.uid;
    if (userId) {
      const userSnapshot = await db.collection("users").doc(userId).get();
      if (userSnapshot.exists) {
        const userData = userSnapshot.data();
        if (userData?.email) {
          try {
            await sendEmail({
              to: userData.email,
              subject: "Your MyTutorMe Subscription is Cancelled",
              react: SubscriptionCancelledEmail({ 
                name: userData.name || userData.displayName || "Student" 
              })
            });
          } catch (emailErr) {
            console.error("Failed to send cancellation email:", emailErr);
          }
        }
      }
    }
    
    return { success: true, message: "Subscription cancelled successfully." };
  } catch (error: any) {
    console.error("Cancel Subscription Error:", error.response?.data || error.message);
    
    // Gracefully handle 400 or 404 errors (e.g., "Non existent or invalid subscription")
    const status = error.response?.status;
    if (status === 400 || status === 404) {
      console.log(`Subscription ${subscriptionId} treated as cancelled (Flutterwave returned ${status}).`);
      
      const userId = context?.auth?.uid;
      if (userId) {
        const userSnapshot = await db.collection("users").doc(userId).get();
        if (userSnapshot.exists) {
          const userData = userSnapshot.data();
          if (userData?.email) {
            try {
              await sendEmail({
                to: userData.email,
                subject: "Your MyTutorMe Subscription is Cancelled",
                react: SubscriptionCancelledEmail({ 
                  name: userData.name || userData.displayName || "Student" 
                })
              });
            } catch (emailErr) {
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
export const requestPayout = functions.https.onCall(async (data: any, context: any) => {
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
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'User profile not found.');
      }

      const currentBalance = userDoc.data()?.balance || 0;

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

  } catch (error: any) {
    console.error('Error processing payout:', error);
    if (error instanceof functions.https.HttpsError) throw error;
    throw new functions.https.HttpsError('internal', 'An error occurred while processing the payout.');
  }
});

/**
 * Callable function to initialize a Flutterwave course payment.
 */
export const initializeCoursePayment = functions.https.onCall(async (request: any) => {
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
  } catch (error: any) {
    console.error("Flutterwave Course Initialize Error:", error.response?.data || error.message);
    throw new functions.https.HttpsError("internal", "Unable to initialize course payment.");
  }
});

/**
 * Callable function to verify a course payment.
 */
export const verifyCoursePayment = functions.https.onCall(async (request: any, context) => {
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

    const userId = txData.meta?.userId || txRef.split('-').slice(2).join('-');
    const courseId = txData.meta?.courseId;
    
    if (!courseId || !userId) {
      throw new functions.https.HttpsError("internal", "Missing metadata for course enrollment.");
    }

    // Fetch Course & Teacher Details
    const courseRef = db.collection("courses").doc(courseId);
    const courseSnap = await courseRef.get();
    if (!courseSnap.exists) {
      throw new functions.https.HttpsError("internal", "Course not found.");
    }
    const courseData = courseSnap.data()!;

    let commissionRate = 0.30;
    if (courseData.teacherId) {
      const teacherSnap = await db.collection("users").doc(courseData.teacherId).get();
      if (teacherSnap.exists) {
        commissionRate = teacherSnap.data()?.currentCommissionRate ?? 0.30;
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
        if (studentData?.email) {
          await sendEmail({
            to: studentData.email,
            subject: `Receipt for ${courseData.title} - MyTutorMe`,
            react: React.createElement(CourseReceiptEmail, {
              studentName: studentData.displayName || 'Student',
              courseTitle: courseData.title,
              amount: price,
              transactionId: transactionId,
              date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
            }),
          });
        }
      }
    } catch (e) {
      console.error("Error sending course receipt email:", e);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Flutterwave Course Verify Error:", error.response?.data || error.message);
    throw new functions.https.HttpsError("internal", "Unable to verify course payment.");
  }
});

/**
 * Callable function to schedule a subscription downgrade.
 */
export const scheduleDowngrade = functions.https.onCall(async (data: any, context: any) => {
  const { newPlan } = data;
  const userId = context?.auth?.uid;

  if (!userId) throw new functions.https.HttpsError("unauthenticated", "User must be authenticated.");

  const userRef = db.collection("users").doc(userId);
  const userSnap = await userRef.get();
  const userData = userSnap.data();

  if (!userData || !["pro_yearly", "pro_monthly", "premium_tools"].includes(userData.plan || userData.teacherSubscriptionPlan)) {
    throw new functions.https.HttpsError("failed-precondition", "Only premium users can schedule a downgrade.");
  }

  if (userData.subscriptionId) {
    try {
      await axiosInstance.put(`/subscriptions/${userData.subscriptionId}/cancel`);
    } catch (e: any) {
      console.log(`Cancel schedule: could not cancel flutterwave sub immediately. Status: ${e?.response?.status}`);
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
import { onSchedule } from "firebase-functions/v2/scheduler";

export const processPendingDowngrades = onSchedule("every 24 hours", async (event) => {
  const now = admin.firestore.Timestamp.now();

  const usersSnapshot = await db.collection("users")
    .where("pendingDowngrade.effectiveDate", "<=", now)
    .get();

  if (usersSnapshot.empty) return;

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

export * from "./triggers/user";

export * from "./endpoints/auth";

export * from "./triggers/course";

export * from "./endpoints/course";
export * from "./endpoints/ai";
export * from "./endpoints/ai-generation";
