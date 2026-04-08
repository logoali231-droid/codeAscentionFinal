import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";

export async function getPastUserErrorsSummary(db: any, uid: string) {
  try {
    const attemptsRef = collection(db, "users", uid, "exerciseAttempts");
    const q = query(attemptsRef, where("isCorrect", "==", false), orderBy("submittedAt", "desc"), limit(5));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return null;
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return `- Error in "${data.exerciseId}": ${data.feedbackSummary}`;
    }).join("\n");
  } catch (err) {
    console.error("Failed to fetch past errors:", err);
    return null;
  }
}
