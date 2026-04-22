
import * as admin from 'firebase-admin';
import * as fs from 'fs';
const serviceAccount = JSON.parse(fs.readFileSync('../../mytutorme/firebase-admin.json', 'utf8')); // path guess, I will search for json

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();
const docs = await db.collection('courses').get();
docs.forEach(doc => { console.log(doc.id, doc.data().title, doc.data().status); });
