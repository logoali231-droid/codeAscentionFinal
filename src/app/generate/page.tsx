
"use client";

import React, { useState } from "react";

// 1. Define what an Exercise looks like
interface Exercise {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export default function GeneratePage() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  
  // 2. Tell TypeScript this is an array of Exercises
  const [exercises, setExercises] = useState<Exercise[]>([]); 
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Your In-Device AI logic (e.g., using WebLLM)
 
// Dentro do seu src/app/generate/page.tsx

const generateExercises = async () => {
  if (!topic) return;
  setLoading(true);

  try {
    // 1. Pegamos o nível do usuário do localStorage
    const userLevel = localStorage.getItem("user_level") || "beginner";

    // 2. Criamos o Prompt Real para o Phi-3
    const prompt = `
      Você é um professor de programação Duolingo.
      Gere 3 exercícios de QUIZ sobre o tema "${topic}" para um aluno nível "${userLevel}".
      
      Retorne APENAS um JSON puro no seguinte formato:
      [
        {
          "question": "Pergunta 1",
          "options": ["Opção 1", "Opção 2", "Opção 3", "Opção 4"],
          "answer": "Opção 1"
        }
      ]
    `;

    // 3. Chamamos o motor do WebLLM (Phi-3)
    const reply = await engine.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" } // Tenta forçar JSON
    });

    const aiContent = reply.choices[0].message.content;
    
    // 4. Transformamos a string da IA em um objeto real
    const generatedExercises = JSON.parse(aiContent);

    // 5. Atualizamos o estado
    setExercises(generatedExercises);
    setCurrentIndex(0);
    setIsFinished(false);

  } catch (error) {
    console.error("Erro ao gerar exercícios com Phi-3:", error);
    alert("A IA local falhou ao gerar. Verifique o console.");
  } finally {
    setLoading(false);
  }
};
  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <div className="animate-pulse font-black text-primary">AI IS THINKING...</div>
    </div>
  );

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-black">
        <div className="text-6xl mb-4">🏆</div>
        <h1 className="text-4xl font-black text-primary mb-2">LESSON DONE!</h1>
        <p className="text-zinc-400 mb-8">You finished {exercises.length} exercises locally.</p>
        <button 
          onClick={() => setExercises([])}
          className="w-full max-w-xs bg-primary py-4 rounded-2xl font-black uppercase"
        >
          Generate New
        </button>
      </div>
    );
  }

  if (exercises.length > 0) {
    const currentExercise = exercises[currentIndex];
    const progress = ((currentIndex + 1) / exercises.length) * 100;

    return (
      <main className="android-container min-h-screen bg-black text-white flex flex-col">
        {/* PROGRESS BAR */}
        <div className="p-4 flex items-center gap-4">
          <button onClick={() => setExercises([])} className="text-zinc-500 font-bold">✕</button>
          <div className="flex-1 bg-zinc-800 h-3 rounded-full">
            <div 
              className="bg-primary h-full transition-all duration-500 rounded-full shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex-1 p-6 max-w-2xl mx-auto w-full">
          <h2 className="text-2xl font-black mb-8 leading-tight">
            {currentExercise.question} {/* TypeScript is happy now! */}
          </h2>
          
          <div className="grid gap-3">
            {currentExercise.options.map((opt, i) => (
              <button key={i} className="w-full text-left p-4 rounded-2xl border-2 border-zinc-800 hover:border-primary hover:bg-primary/5 transition-all font-bold">
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* BOTTOM ACTION */}
        <div className="p-6 bg-black border-t border-zinc-900">
          <button 
            onClick={handleNext}
            className="w-full bg-primary py-4 rounded-2xl font-black uppercase tracking-widest shadow-[0_5px_0_#1a5fb4] active:translate-y-1 active:shadow-none transition-all"
          >
            {currentIndex === exercises.length - 1 ? "Finish Lesson" : "Continue"}
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="android-container p-6 max-w-2xl mx-auto min-h-screen flex flex-col justify-center">
      <h1 className="text-4xl font-black text-primary uppercase mb-2">Code Ascent</h1>
      <p className="text-zinc-500 font-bold mb-8">Offline AI Learning</p>
      
      <div className="space-y-4">
        <input 
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="What do you want to master?" 
          className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-2xl p-4 text-white focus:border-primary outline-none"
        />
        <button 
          onClick={generateExercises}
          disabled={!topic || loading}
          className="w-full bg-primary py-4 rounded-2xl font-black uppercase tracking-widest disabled:opacity-50"
        >
          Start Lesson
        </button>
      </div>
    </main>
  );
}