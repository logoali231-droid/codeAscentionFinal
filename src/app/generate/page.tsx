"use client";

import { useState } from "react";
import { generateLesson } from "@/lib/ai";
import { autoLearn } from "@/lib/autoParser";

export default function GeneratePage() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [learned, setLearned] = useState<string | null>(null);

  async function handleGenerate() {
    if (!input) return;

    setLoading(true);
    setLearned(null);

    try {
      // 🧠 AUTO LEARNING AQUI (ESSA É A LINHA QUE VOCÊ NÃO SABIA ONDE COLOCAR)
      const learnedData = autoLearn(input);

      if (learnedData) {
        setLearned(learnedData.topic);
      }

      // 🤖 GERA A LESSON
      const res = await generateLesson(input);
      setOutput(res);
    } catch {
      setOutput("error generating");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 bg-black text-white min-h-screen space-y-4">
      <h1 className="text-xl font-bold">Generate Lesson</h1>

      <input
        className="p-2 text-black w-full"
        placeholder="Type anything (ex: recursion, neural networks...)"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button
        onClick={handleGenerate}
        className="bg-blue-600 px-4 py-2 rounded"
      >
        {loading ? "Generating..." : "Generate"}
      </button>

      {/* 🧠 AVISO AUTOMÁTICO DE APRENDIZADO */}
      {learned && (
        <div className="text-green-400">
          Learned new topic: <strong>{learned}</strong>
        </div>
      )}

      <pre className="whitespace-pre-wrap">{output}</pre>
    </div>
  );
}