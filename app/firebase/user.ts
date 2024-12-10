import { doc, getDoc } from 'firebase/firestore';
import { db } from './config';

export const getUserRole = async (uid: string): Promise<'admin' | 'user' | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data().role as 'admin' | 'user' | null;
    }
    return null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}; 