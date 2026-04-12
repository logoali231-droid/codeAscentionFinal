import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { Firestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

export const signInWithEmail = async (auth: Auth, email: string, pass: string) => {
  return await signInWithEmailAndPassword(auth, email, pass);
};

export const signUpWithEmail = async (auth: Auth, firestore: Firestore, email: string, pass: string, username: string) => {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  const user = cred.user;

  // Initialize the UserProfile document natively on the client
  // with progress metrics set to zero or uninitialized.
  const userRef = doc(firestore, `users/${user.uid}`);
  await setDoc(userRef, {
    id: user.uid,
    username: username,
    email: email,
    registrationDate: new Date().toISOString(),
    lastActivityDate: new Date().toISOString(),
  });

  return cred;
};

export const signOutUser = async (auth: Auth) => {
  return await signOut(auth);
};
