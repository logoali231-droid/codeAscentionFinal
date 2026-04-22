
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function WelcomePage() {
  const router = useRouter();

  const handleLevelSelect = (level: string) => {
    // Salva o nível do usuário
    localStorage.setItem("user_level", level);
    
    // Se for ultranoob, a IA vai gerar lições mais fáceis
    if (level === "ultranoob") {
       alert("Sem problemas! Vamos começar do zero absoluto, com lógica de jogos.");
    }

    router.push("/generate"); // Vai para a tela de gerar o curso
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-black uppercase italic mb-2 tracking-tighter">Code Ascent</h1>
      <p className="text-zinc-500 font-bold mb-12 uppercase text-xs tracking-widest">Qual seu nível atual?</p>

      <div className="grid gap-4 w-full max-w-sm">
        <button 
          onClick={() => handleLevelSelect("ultranoob")}
          className="bg-zinc-900 border-2 border-zinc-800 p-6 rounded-3xl text-left hover:border-blue-500 transition-all group"
        >
          <div className="text-blue-500 font-black mb-1 italic">NUNCA VI CÓDIGO</div>
          <div className="text-zinc-500 text-sm">Vou te ensinar como se fosse um jogo de blocos.</div>
        </button>

        <button 
          onClick={() => handleLevelSelect("beginner")}
          className="bg-zinc-900 border-2 border-zinc-800 p-6 rounded-3xl text-left hover:border-blue-500 transition-all group"
        >
          <div className="text-blue-500 font-black mb-1 italic">INICIANTE</div>
          <div className="text-zinc-500 text-sm">Sei o básico mas me perco na sintaxe.</div>
        </button>
      </div>
    </main>
  );
}