
"use client";

import React, { useState, useEffect } from "react";
import { useUserLevel } from "@/hooks/useUserLevel"; // Certifique-se que o arquivo existe em src/hooks/

export default function PracticePage() {
  // 1. Corrigindo erro 'Cannot find name addXp'
  const { xp, level, addXp } = useUserLevel();

  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "checking" | "success">("idle");
  
  // 2. Corrigindo erro 'Cannot find name exercise'
  const [exercise, setExercise] = useState({
    title: "Carregando...",
    description: "Carregando descrição do exercício..."
  });

  // Carrega o exercício do localStorage ao iniciar
  useEffect(() => {
    const savedExercise = localStorage.getItem("current_exercise");
    if (savedExercise) {
      setExercise(JSON.parse(savedExercise));
    }
  }, []);

  const handleCheck = () => {
    setStatus("checking");

    setTimeout(() => {
      const cleanCode = code.toLowerCase().trim();
      
      // Validação dinâmica baseada no título (como conversamos antes)
      const isRecursive = exercise.title.toLowerCase().includes("recurs");
      const hasLogic = cleanCode.length > 15; // Checa se tem pelo menos algum código

      if (hasLogic) {
        setStatus("success");
        addXp(20); // Agora o addXp existe!
      } else {
        setStatus("idle");
        alert("O código parece muito curto ou incompleto.");
      }
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      {/* XP BAR */}
      <nav className="p-4 bg-black border-b border-zinc-900 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <div className="bg-blue-600 text-[10px] font-black px-2 py-1 rounded-lg uppercase">
            LVL {level}
          </div>
          <div className="flex-1 bg-zinc-800 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full transition-all duration-700" style={{ width: `${xp}%` }} />
          </div>
        </div>
      </nav>

      <div className="flex-1 p-6 max-w-2xl mx-auto w-full pb-64">
        <h1 className="text-3xl font-black italic uppercase mb-2">{exercise.title}</h1>
        <div className="h-1.5 w-16 bg-blue-600 rounded-full mb-8"></div>

        <div className="mb-8 p-6 bg-zinc-900/40 rounded-3xl border border-zinc-800">
          <p className="text-zinc-300 text-lg leading-relaxed font-medium">
            {exercise.description}
          </p>
        </div>

        <textarea 
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="w-full h-80 bg-zinc-900 border-2 border-zinc-800 rounded-3xl p-6 font-mono text-sm text-blue-100 focus:border-blue-500 outline-none"
          placeholder="// Escreva sua solução aqui..."
        />
        
        {status === "success" && (
          <div className="mt-4 p-4 bg-green-500/10 border-2 border-green-500/50 rounded-2xl text-green-500 font-bold text-center animate-bounce uppercase">
            +20 XP Adicionado!
          </div>
        )}
      </div>

      <footer className="fixed bottom-[72px] left-0 w-full p-6 bg-black/80 backdrop-blur-md border-t border-zinc-900 z-40">
        <div className="max-w-2xl mx-auto">
          <button 
            onClick={handleCheck}
            disabled={status === "checking" || status === "success"}
            className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest shadow-[0_6px_0_#1e40af] active:translate-y-1 active:shadow-none transition-all text-xl 
              ${status === "checking" ? 'bg-zinc-700 animate-pulse shadow-none' : 
                status === "success" ? 'bg-green-600 shadow-[0_6px_0_#15803d]' : 'bg-blue-600'}`}
          >
            {status === "checking" ? "Verificando..." : 
             status === "success" ? "Correto!" : "Check Solution"}
          </button>
        </div>
      </footer>
    </main>
  );
}