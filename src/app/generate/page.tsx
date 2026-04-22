
"use client";

import React, { useState } from "react";
import { getAiEngine } from "@/lib/ai"; // Importando o motor local

interface Exercise {
  question: string;
  options: string[];
  answer: string;
}

export default function GeneratePage() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]); 
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const generateExercises = async () => {
    if (!topic) return;
    setLoading(true);

    try {
      const userLevel = localStorage.getItem("user_level") || "beginner";
      const engine = await getAiEngine(); // Inicializa/Pega o motor Phi-3

      const prompt = `
        Você é um professor de programação Duolingo.
        Gere 3 exercícios de QUIZ sobre o tema "${topic}" para um aluno nível "${userLevel}".
        Responda APENAS com um JSON puro no seguinte formato:
        [
          {
            "question": "O que é tal coisa?",
            "options": ["Opção 1", "Opção 2", "Opção 3", "Opção 4"],
            "answer": "Opção 1"
          }
        ]
      `;

      const reply = await engine.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        // Forçamos a IA a ser criativa mas técnica
        temperature: 0.7, 
      });

      const aiContent = reply.choices[0].message.content || "[]";
      
      // Limpeza básica caso a IA coloque blocos de código ```json
      const jsonString = aiContent.replace(/```json|```/g, "").trim();
      const generatedExercises = JSON.parse(jsonString);

      setExercises(generatedExercises);
      setCurrentIndex(0);
      setIsFinished(false);
    } catch (error) {
      console.error("Erro na geração local:", error);
      alert("A IA local (Phi-3) teve um problema. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null); // Reseta a seleção
    } else {
      setIsFinished(true);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-10 text-center">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
      <h2 className="text-xl font-black uppercase italic animate-pulse tracking-widest text-blue-500">
        Phi-3 está construindo seu curso...
      </h2>
      <p className="text-zinc-500 text-xs mt-4">Isso pode levar alguns segundos dependendo do seu hardware.</p>
    </div>
  );

  if (isFinished) return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-black text-white">
      <div className="text-8xl mb-6">🎉</div>
      <h1 className="text-4xl font-black text-blue-500 mb-2 uppercase italic">Curso Concluído!</h1>
      <p className="text-zinc-400 mb-10">Você dominou os fundamentos de {topic}.</p>
      <button 
        onClick={() => { setExercises([]); setTopic(""); }}
        className="w-full max-w-sm bg-blue-600 py-5 rounded-3xl font-black uppercase shadow-[0_6px_0_#1e40af] active:translate-y-1 active:shadow-none transition-all"
      >
        Voltar ao Início
      </button>
    </div>
  );

  if (exercises.length > 0) {
    const current = exercises[currentIndex];
    const progress = ((currentIndex + 1) / exercises.length) * 100;

    return (
      <main className="min-h-screen bg-black text-white flex flex-col">
        {/* PROGRESS BAR */}
        <nav className="p-4 flex items-center gap-4 max-w-2xl mx-auto w-full sticky top-0 bg-black z-10">
          <button onClick={() => setExercises([])} className="text-zinc-500 font-bold text-2xl">✕</button>
          <div className="flex-1 bg-zinc-800 h-3 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </nav>

        <div className="flex-1 p-6 max-w-2xl mx-auto w-full pt-12">
          <h2 className="text-3xl font-black mb-10 leading-tight italic tracking-tighter">
            {current.question}
          </h2>
          
          <div className="grid gap-4">
            {current.options.map((opt, i) => (
              <button 
                key={i} 
                onClick={() => setSelectedOption(i)}
                className={`w-full text-left p-5 rounded-3xl border-2 transition-all font-bold text-lg flex items-center gap-4
                  ${selectedOption === i ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.2)]' : 'border-zinc-800 bg-zinc-900/50'}`}
              >
                <span className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center text-xs font-black
                  ${selectedOption === i ? 'border-blue-500 text-blue-500' : 'border-zinc-800 text-zinc-500'}`}>
                  {i + 1}
                </span>
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* ACTION BUTTON */}
        <footer className="p-6 bg-black border-t border-zinc-900 sticky bottom-0">
          <div className="max-w-2xl mx-auto">
            <button 
              onClick={handleNext}
              disabled={selectedOption === null}
              className="w-full bg-blue-600 disabled:opacity-50 py-5 rounded-2xl font-black uppercase tracking-widest shadow-[0_6px_0_#1e40af] active:translate-y-1 active:shadow-none transition-all text-xl"
            >
              {currentIndex === exercises.length - 1 ? "Finalizar" : "Continuar"}
            </button>
          </div>
        </footer>
      </main>
    );
  }

  return (
    <main className="p-6 max-w-2xl mx-auto min-h-screen flex flex-col justify-center bg-black text-white">
      <div className="mb-12">
        <h1 className="text-6xl font-black italic tracking-tighter text-blue-500 uppercase leading-none">Code<br/>Ascent</h1>
        <div className="h-2 w-20 bg-blue-600 mt-2 rounded-full"></div>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="text-xs font-black text-zinc-500 uppercase tracking-widest ml-1">O que você quer aprender?</label>
          <input 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ex: Loops, Arrays, React..." 
            className="w-full bg-zinc-900/50 border-2 border-zinc-800 rounded-3xl p-5 mt-2 text-white focus:border-blue-500 outline-none text-lg"
          />
        </div>
        <button 
          onClick={generateExercises}
          disabled={!topic || loading}
          className="w-full bg-blue-600 py-5 rounded-3xl font-black uppercase tracking-widest shadow-[0_6px_0_#1e40af] active:translate-y-1 active:shadow-none transition-all text-xl disabled:opacity-50"
        >
          Gerar Curso Customizado
        </button>
      </div>
    </main>
  );
}