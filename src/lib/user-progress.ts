import { Firestore, collection, query, where, orderBy, limit, getDocs, QueryDocumentSnapshot } from "firebase/firestore";

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
    snapshot.forEach((doc: QueryDocumentSnapshot) => {
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
/**
 * Calculates user pacing metrics (avg success rate, etc.) for AI tone and difficulty adjustment.
 */
export async function getUserPacingMetrics(firestore: Firestore, userId: string): Promise<string> {
  try {
    const attemptsRef = collection(firestore, `users/${userId}/exerciseAttempts`);
    
    // Most recent 20 attempts to calculate a rolling success rate
    const q = query(attemptsRef, limit(20));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return "New learner, keep the tone encouraging and introductory.";
    }

    let correctCount = 0;
    let totalCount = 0;
    
    snapshot.forEach((doc: QueryDocumentSnapshot) => {
      const data = doc.data();
      if (data.isCorrect) correctCount++;
      totalCount++;
    });

    const successRate = (correctCount / totalCount) * 100;
    
    let pacingSummary = `Pacing Profile: The user has a success rate of ${successRate.toFixed(1)}% over their last ${totalCount} attempts.\n`;
    
    if (successRate < 40) {
      pacingSummary += "Recommendation: High level of struggle detected. Be very encouraging, simplify concepts, and provide more detailed hints.";
    } else if (successRate > 85) {
      pacingSummary += "Recommendation: Fast learner detected. Tone can be more technically advanced and challenging.";
    } else {
      pacingSummary += "Recommendation: Standard pacing. Balance technical precision with supportive guidance.";
    }

    return pacingSummary;
  } catch (error) {
    console.error("Error fetching user pacing metrics:", error);
    return "User is learning at a steady pace.";
  }
}
