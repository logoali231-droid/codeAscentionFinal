import { setDoc, addDoc, type DocumentReference, type CollectionReference } from "firebase/firestore";

export async function setDocumentNonBlocking(ref: DocumentReference, data: any, options?: any) {
  try {
    await setDoc(ref, data, options);
  } catch (err) {
    console.error("Non-blocking update failed:", err);
  }
}

export async function addDocumentNonBlocking(ref: CollectionReference, data: any) {
  try {
    await addDoc(ref, data);
  } catch (err) {
    console.error("Non-blocking add failed:", err);
  }
}
