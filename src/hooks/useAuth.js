import { useEffect, useState, useCallback } from 'react';
import { auth, googleProvider } from '../firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';

const LAST_EMAIL_KEY = 'structurecare:lastEmail';
const COMPANY_DOMAIN = '@structurelandscapes.com';

const isCompanyUser = (email) =>
  typeof email === 'string' && email.trim().toLowerCase().endsWith(COMPANY_DOMAIN);

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastEmail, setLastEmail] = useState(() => localStorage.getItem(LAST_EMAIL_KEY) || '');

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
      const params = { hd: 'structurelandscapes.com' };
      if (lastEmail) {
        params.login_hint = lastEmail;
        params.prompt = 'select_account';
      } else {
        params.prompt = 'consent';
      }
      googleProvider.setCustomParameters(params);

      const cred = await signInWithPopup(auth, googleProvider);
      if (!isCompanyUser(cred.user?.email)) {
        await signOut(auth);
        throw new Error('Please sign in with your @structurelandscapes.com account.');
      }
      if (cred.user?.email) {
        localStorage.setItem(LAST_EMAIL_KEY, cred.user.email);
        setLastEmail(cred.user.email);
      }
    } catch (err) {
      setError(err?.message || 'Sign-in failed.');
      throw err;
    }
  }, [lastEmail]);

  const signOutUser = useCallback(() => signOut(auth), []);

  return { user, loading, error, lastEmail, signIn, signOut: signOutUser };
}
