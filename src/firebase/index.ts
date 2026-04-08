import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { useState, useEffect } from "react";

const firebaseConfig = {
  apiKey: "AIza...", // Mock config, user should fill this
  authDomain: "project-code-ascention.firebaseapp.com",
  projectId: "project-code-ascention",
  storageBucket: "project-code-ascention.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export function useAuth() {
  return auth;
}

export function useFirestore() {
  return db;
}

export function useUser() {
  const [user, setUser] = useState<any>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  useEffect(() => {
    return auth.onAuthStateChanged((u) => {
      setUser(u);
      setIsUserLoading(false);
    });
  }, []);

  return { user, isUserLoading };
}
