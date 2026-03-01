import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';


const firebaseConfig = {
  apiKey: "AIzaSyCmIjIZ0N5Ea6w6Wee-Bimy0of3SOVvFwA",
  authDomain: "mytutorme-1f7cb.firebaseapp.com",
  projectId: "mytutorme-1f7cb",
  storageBucket: "mytutorme-1f7cb.firebasestorage.app",
  messagingSenderId: "166334865796",
  appId: "1:166334865796:web:1d83f0f5d98dceec5d7dd1",
  measurementId: "G-0CNMYEKVWF"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app;
