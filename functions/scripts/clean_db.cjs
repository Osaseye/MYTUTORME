const admin = require("firebase-admin");

// Initialize Firebase Admin (Uses default application credentials if run via Firebase CLI or with GOOGLE_APPLICATION_CREDENTIALS)
// Alternatively, if you have a service account key, you can initialize it here.
admin.initializeApp();

const db = admin.firestore();

async function deleteCollection(collectionPath) {
    const collectionRef = db.collection(collectionPath);
    const snapshot = await collectionRef.get();

    if (snapshot.empty) {
        console.log(`✅ Collection '${collectionPath}' is already empty.`);
        return;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`🧨 Deleted ${snapshot.size} documents from '${collectionPath}'.`);
}

async function runCleanup() {
    console.log("Starting Database Cleanup for MVP Launch...");
    try {
        // Core collections to wipe:
        await deleteCollection("courses");
        await deleteCollection("lessons");
        await deleteCollection("transactions");
        await deleteCollection("enrollments");
        await deleteCollection("certificates");
        await deleteCollection("exams"); // If exams exist
        
        console.log("🎉 Database Cleanup Complete!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error cleaning database:", error);
        process.exit(1);
    }
}

runCleanup();
okay lets start getting the PWA format and configuration started for mytutorme 
lets start by creating the necessary assests so help me with the dependency so i can install it 