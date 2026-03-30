import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import axios from "axios";
import * as crypto from "crypto";
import React from 'react';
import { sendEmail } from "./lib/email";
import { SubscriptionSuccessEmail } from "./emails/templates/SubscriptionSuccessEmail";
import { PaymentFailedEmail } from "./emails/templates/PaymentFailedEmail";
import { SubscriptionCancelledEmail } from "./emails/templates/SubscriptionCancelledEmail";
import { PaymentFailedEmail } from "./emails/templates/PaymentFailedEmail";
import { SubscriptionCancelledEmail } from "./emails/templates/SubscriptionCancelledEmail";

admin.initializeApp();
const db = admin.firestore();

import * as dotenv from "dotenv";
dotenv.config();

// Use an environment variable for secret keys in production.
// Set it via: firebase functions:secrets:set PAYSTACK_SECRET_KEY
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "";
const PAYSTACK_WEBHOOK_SECRET = process.env.PAYSTACK_WEBHOOK_SECRET || ""; // Typically same as secret in test mode

const PLAN_TEACHER_PREMIUM = process.env.PAYSTACK_PLAN_TEACHER_PREMIUM || "PLN_f310wmozw4tnxhq";
const PLAN_STUDENT_MONTHLY = process.env.PAYSTACK_PLAN_STUDENT_MONTHLY || "PLN_6txydrn1y6vh7pl";
const PLAN_STUDENT_YEARLY = process.env.PAYSTACK_PLAN_STUDENT_YEARLY || "PLN_c879xjnliprqly3";

const axiosInstance = axios.create({
  baseURL: "https://api.paystack.co",
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    "Content-Type": "application/json",
  },
});

/**
 * Callable function to initialize a Paystack subscription.
 */
export const initializeSubscription = functions.https.onCall(async (request) => {
  const { planCode, email, userId } = request.data;

  if (!planCode || !email || !userId) {
    throw new functions.https.HttpsError("invalid-argument", "Missing required fields.");
  }

  try {
    const response = await axiosInstance.post("/transaction/initialize", {
      email,
      plan: planCode,
      amount: planCode === PLAN_TEACHER_PREMIUM ? 1200000 : planCode === PLAN_STUDENT_MONTHLY ? 400000 : 4000000, // Paystack amount is in kobo. Pass explicit amounts based on plan codes.
      // Pass the user's ID so we know who is paying when the webhook fires.
      metadata: {
        custom_fields: [
          {
            display_name: "User ID",
            variable_name: "userId",
            value: userId,
          },
        ],
      },
    });

    return {
      authorizationUrl: response.data.data.authorization_url,
      reference: response.data.data.reference,
    };
  } catch (error: any) {
    console.error("Paystack Initialize Error:", error.response?.data || error.message);
    throw new functions.https.HttpsError("internal", "Unable to initialize payment.");
  }
});

/**
 * Webhook endpoint for Paystack events.
 */
export const paystackWebhook = functions.https.onRequest(async (req, res) => {
  const hash = crypto
    .createHmac("sha512", PAYSTACK_WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash !== req.headers["x-paystack-signature"]) {
    console.error("Invalid signature");
    res.status(400).send("Invalid signature");
    return;
  }

  const event = req.body;
  
  try {
    switch (event.event) {
      case "charge.success": {
        const { metadata, customer, plan } = event.data;
        // Use custom metadata if it exists, else try to find user by email.
        const userId = metadata?.custom_fields?.find((f: any) => f.variable_name === "userId")?.value;
        const email = customer.email;
        
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
          const subscriptionCode = event.data.subscription_code || "";
          
          const updatePayload: any = {
            subscriptionStatus: "active",
            subscriptionCode: subscriptionCode,
            emailToken: customer.customer_code, // Store customer code instead of email token
            paystackCustomerCode: customer.customer_code,
            nextPaymentDate: admin.firestore.Timestamp.fromDate(new Date(event.data.created_at)), // Adjust as needed
          };

          if (plan && plan.plan_code === PLAN_TEACHER_PREMIUM) {
            updatePayload.teacherSubscriptionPlan = "premium_tools";
            updatePayload.currentCommissionRate = 0.15; // Set base commission rate to 15% instead of 30%
          } else {
            updatePayload.plan = plan && plan.plan_code === PLAN_STUDENT_YEARLY ? "pro_yearly" : "pro_monthly"; // Explicit plan string mapped for frontend
          }

          await userDocRef.set(updatePayload, { merge: true });

          // Record the transaction for Admin Dashboard revenue analytics
          await db.collection("transactions").add({
            amount: event.data.amount / 100, // Convert sub-currency (kobo) back to NGN for dashboard
            type: 'subscription',
            status: 'successful',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            platformFee: event.data.amount / 100, // For subscriptions, the entire amount goes to the platform
            userId: userDocRef.id,
            userRole: userData?.role || "student",
            description: `Subscription Upgrade to ${plan ? plan.name : "Pro"}`,
            reference: event.data.reference
          });

          // Send subscription success email
          if (email && userData) {
            const planName = plan ? plan.name : (userData.role === 'teacher' ? 'Premium Teacher Tools' : 'Pro Plan');
            await sendEmail({
              to: email,
              subject: 'Your Subscription is Active! - MyTutorMe',
              react: React.createElement(SubscriptionSuccessEmail, {
                name: userData.displayName || 'Learner',
                planName: planName,
                amount: event.data.amount / 100,
                dashboardUrl: 'https://mytutorme.com/dashboard',
              }),
            });
          }
        }
        break;
      }

      case "subscription.disable": {
         // Fired when subscription is cancelled
        const customerCode = event.data.customer.customer_code;
        const qs = await db.collection("users").where("paystackCustomerCode", "==", customerCode).get();
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
      
      case "invoice.payment_failed": {
         const customerCode = event.data.customer.customer_code;
         const qs = await db.collection("users").where("paystackCustomerCode", "==", customerCode).get();
         if(!qs.empty) {
             const userDoc = qs.docs[0];
             await userDoc.ref.update({
                 subscriptionStatus: "past_due"
             });

             const userData = userDoc.data();
             if (userData.email) {
               await sendEmail({
                 to: userData.email,
                 subject: 'Payment Failed: Action Required - MyTutorMe',
                 react: React.createElement(PaymentFailedEmail, {
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
 * Callable function to cancel a Paystack subscription.
 */
export const cancelSubscription = functions.https.onCall(async (request) => {
  const { subscriptionCode, emailToken } = request.data;

  if (!subscriptionCode || !emailToken) {
     throw new functions.https.HttpsError("invalid-argument", "Missing subscription code or token.");
  }

  try {
    await axiosInstance.post("/subscription/disable", {
        code: subscriptionCode,
        token: emailToken
    });
    
    // The webhook 'subscription.disable' will hit shortly after this and update Firestore.
    // Alternatively, update it strictly here.
    return { success: true, message: "Subscription cancelled successfully." };
  } catch (error: any) {
    console.error("Cancel Subscription Error:", error.response?.data || error.message);
    throw new functions.https.HttpsError("internal", "Unable to cancel subscription.");
  }
});

export * from "./triggers/user";

export * from "./endpoints/auth";

export * from "./triggers/course";
