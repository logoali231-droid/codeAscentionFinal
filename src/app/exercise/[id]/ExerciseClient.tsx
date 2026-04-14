"use client";

import { useState } from "react";
import { generateFeedback } from "@/ai/generateFeedback";
import { canRunAI } from "@/hooks/useAI";

export default function ExerciseClient({ id }: { id: string }) {
  const [code, setCode] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRunAI() {
    if (!canRunAI()) {
      setFeedback("Device not supported for AI.");
      return;
    }

    setLoading(true);

    try {
      const result = await generateFeedback(code);
      setFeedback(result);
    } catch (err) {
      console.error(err);
      setFeedback("AI failed to run.");
    }

    setLoading(false);
  }

  return (
    <div>
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <button onClick={handleRunAI}>
        Run AI
      </button>

      {loading && <p>Loading AI brain... 🧠⚡</p>}

      <pre>{feedback}</pre>
    </div>
  );
}