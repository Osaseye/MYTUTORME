const fs = require('fs');
const path = 'C:/Users/User/OneDrive/Desktop/MyTutorMe/mytutorme/functions/src/index.ts';

let code = fs.readFileSync(path, 'utf8');

code = code.replace(/case "invoice.payment_failed": \{[\s\S]*?break;\s*\}/, `case "invoice.payment_failed": {
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
       }`);

fs.writeFileSync(path, code);
console.log('Done');
