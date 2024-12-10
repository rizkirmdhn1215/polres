import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from './config';
import { 
  GoogleAuthProvider, 
  signInWithPopup,
  signInWithEmailAndPassword 
} from 'firebase/auth';
import { auth } from './config';

// Define roles
export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

// Admin email constant
const ADMIN_EMAIL = 'admin@polres.com';

// Function to create/update user document
export const createUserDocument = async (
  uid: string,
  email: string,
  authProvider: string
) => {
  try {
    const userRef = doc(db, 'users', uid);
    
    // Check if user already exists
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return; // User already exists, no need to create
    }

    // Determine role based on email and auth provider
    const role = email === ADMIN_EMAIL ? ROLES.ADMIN : ROLES.USER;

    const userData = {
      email,
      role,
      authProvider, // 'google' or 'email'
      createdAt: Timestamp.now(),
    };

    await setDoc(userRef, userData);
    console.log('User document created successfully');
  } catch (error) {
    console.error('Error creating user document:', error);
    throw error;
  }
};

// Google Sign In
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    
    // Create/update user document
    await createUserDocument(
      result.user.uid,
      result.user.email!,
      'google'
    );
    
    return result;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

// Email/Password Sign In
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    
    // Create/update user document
    await createUserDocument(
      result.user.uid,
      result.user.email!,
      'email'
    );
    
    return result;
  } catch (error) {
    console.error('Error signing in with email:', error);
    throw error;
  }
};

// Function to get user role
export const getUserRole = async (uid: string): Promise<UserRole | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data().role as UserRole;
    }
    return null;
  } catch (error) {
    console.error('Error getting user role:', error);
    return null;
  }
}; 