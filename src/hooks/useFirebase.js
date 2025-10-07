import { useEffect, useState } from 'react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';

const useFirebase = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const ensureAuth = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error('Firebase Auth failed during initial sign-in:', error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!isMounted) {
        return;
      }

      if (user) {
        setIsReady(true);
      } else {
        ensureAuth();
      }
    });

    ensureAuth();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return { db, auth, isReady };
};

export default useFirebase;
