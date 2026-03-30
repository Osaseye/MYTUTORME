const fs = require('fs');
const path = 'C:/Users/User/OneDrive/Desktop/MyTutorMe/mytutorme/functions/src/index.ts';

let code = fs.readFileSync(path, 'utf8');

code = code.replace(/import { SubscriptionSuccessEmail } from "\.\/emails\/templates\/SubscriptionSuccessEmail";/, `import { SubscriptionSuccessEmail } from "./emails/templates/SubscriptionSuccessEmail";
import { PaymentFailedEmail } from "./emails/templates/PaymentFailedEmail";
import { SubscriptionCancelledEmail } from "./emails/templates/SubscriptionCancelledEmail";`);

if (!code.includes('case "subscription.disable"')) {
    code = code.replace(/case "invoice.payment_failed":/, `case "subscription.disable": {
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
      
      case "invoice.payment_failed":`);
}


fs.writeFileSync(path, code);
console.log('Done 2');