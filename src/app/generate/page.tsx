"use client";

import { useState } from "react";
import  { generateExercise } from "@/ai/webllm";


export default function GeneratePage() {
  const [input, setInput] = useState("");
  const [exercise, setExercise] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (!input) return;

    try {
      setLoading(true);
      setExercise(null);

      console.log("CHAMANDO IA...");

      const ex = await generateExercise(input, "easy");

      console.log("RESPOSTA IA:", ex);

      setExercise(ex);
    } catch (err) {
      console.error("ERRO IA:", err);
      alert("Erro ao gerar exercício");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 space-y-4 text-white">
      <h1 className="text-xl font-bold">Generate</h1>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ex: recursion"
        className="border p-2 w-full bg-black"
      />

      <button
        onClick={handleGenerate}
        className="bg-blue-500 px-4 py-2 rounded"
      >
        {loading ? "Loading AI..." : "Generate"}
      </button>

      {/* RESULTADO */}
      {exercise && (
        <div className="bg-zinc-900 p-4 rounded">
          <h2 className="text-lg font-bold">{exercise.title}</h2>
          <p className="mt-2">{exercise.description}</p>

          <button
            onClick={() => {
              localStorage.setItem("current_exercise", JSON.stringify(exercise));
              window.location.href = "/practice";
            }}
            className="mt-4 bg-green-600 px-4 py-2 rounded"
          >
            Enter Training Room
          </button>
        </div>
      )}
    </div>
  );
}