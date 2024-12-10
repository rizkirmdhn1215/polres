import { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/app/firebase/config';
import { getUserRole } from '@/app/firebase/auth';

interface AuthState {
  user: User | null;
  role: 'admin' | 'user' | null;
  loading: boolean;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    role: null,
    loading: true,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const role = await getUserRole(user.uid);
        setAuthState({ user, role, loading: false });
      } else {
        setAuthState({ user: null, role: null, loading: false });
      }
    });

    return unsubscribe;
  }, []);

  return authState;
}; 