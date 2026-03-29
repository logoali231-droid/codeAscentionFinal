import { Firestore, collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";

interface ExerciseAttempt {
  id: string;
  userId: string;
  exerciseId: string;
  attemptNumber: number;
  submittedCode: string;
  isCorrect: boolean;
  feedbackSummary: string;
  submittedAt: string;
}

/**
 * Fetches the user's most recent failed exercise attempts and summarizes them.
 * This summary can be injected into the Genkit AI prompt to personalize feedback.
 */
export async function getPastUserErrorsSummary(firestore: Firestore, userId: string): Promise<string> {
  try {
    const attemptsRef = collection(firestore, `users/${userId}/exerciseAttempts`);
    
    // We want the most recent 5 failed attempts
    const q = query(
      attemptsRef,
      where("isCorrect", "==", false),
      // Note: Ordering by submittedAt might require a composite index in Firestore.
      // If errors occur during testing, ordering can be done client-side after fetch.
      limit(5)
    );

    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return "";
    }

    const failedAttempts: ExerciseAttempt[] = [];
    snapshot.forEach((doc) => {
      failedAttempts.push(doc.data() as ExerciseAttempt);
    });

    // Sort descending by date on client side to avoid missing index errors initially
    failedAttempts.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

    let summaryString = "Recent Errors History:\n";
    failedAttempts.forEach((attempt, index) => {
      summaryString += `--- Attempt ${index + 1} ---\n`;
      summaryString += `Feedback Received: ${attempt.feedbackSummary}\n`;
      summaryString += `Problematic Code snippet:\n${attempt.submittedCode.substring(0, 150)}...\n\n`;
    });

    return summaryString;
  } catch (error) {
    console.error("Error fetching past user errors:", error);
    return "";
  }
}
