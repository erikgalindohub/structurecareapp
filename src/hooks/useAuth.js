import { useEffect, useState, useCallback } from 'react';
import { auth, googleProvider } from '../firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';

const COMPANY_DOMAIN = 'structurelandscapes.com';

const isCompanyUser = (email) =>
  typeof email === 'string' && /@structurelandscapes\.com$/i.test(email.trim());

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signIn = useCallback(async () => {
    setError(null);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      if (!isCompanyUser(cred.user?.email)) {
        await signOut(auth);
        throw new Error('Please sign in with your @structurelandscapes.com account.');
      }
    } catch (err) {
      setError(err?.message || 'Sign-in failed.');
      throw err;
    }
  }, []);

  const signOutUser = useCallback(() => signOut(auth), []);

  return { user, loading, error, signIn, signOut: signOutUser };
}

