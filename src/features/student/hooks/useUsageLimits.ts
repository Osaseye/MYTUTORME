import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export const checkAndIncrementUsage = async (
  userId: string,
  plan: string,
  type: 'mockExams' | 'flashcards'
): Promise<boolean> => {
  // Pro limits

  if (plan === 'pro_monthly' || plan === 'pro_yearly') {
    return true; // Unlimited
  }

  const limits = {
    mockExams: 1, // 1 per day
    flashcards: 3 // 3 per day
  };

  const limit = limits[type];
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) return false;

  const data = userSnap.data();
  const stats = data.generationStats || { date: '', mockExams: 0, flashcards: 0 };
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  let currentCount = 0;
  if (stats.date === today) {
    currentCount = stats[type] || 0;
  } else {
    // Reset for new day
    stats.date = today;
    stats.mockExams = 0;
    stats.flashcards = 0;
  }

  if (currentCount >= limit) {
    return false; // Limit reached
  }

  // Increment
  stats[type] = currentCount + 1;
  await updateDoc(userRef, { generationStats: stats });
  
  return true;
};
