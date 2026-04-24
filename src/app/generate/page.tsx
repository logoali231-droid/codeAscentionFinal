
// src/app/generate/page.tsx
'use client'
import { useState } from 'react';
import { getSmartNextTopic, analyzeStruggleWithAI, getLocalUser } from '@/lib/engine';

export default function GeneratePage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiThought, setAiThought] = useState('');

  const handleGenerate = () => {
    setIsAnalyzing(true);
    const user = getLocalUser();
    const lastError = user.errorLog[user.errorLog.length - 1];
    
    // Simulate AI "Processing" time
    setTimeout(() => {
      const thought = lastError 
        ? analyzeStruggleWithAI(lastError.userExplanation)
        : "Initial Assessment: Building base curriculum...";
        
      setAiThought(thought);
      setIsAnalyzing(false);
    }, 1500);
  };

  return (
    <main className="p-8 max-w-2xl mx-auto min-h-screen bg-black flex flex-col justify-center">
      <div className="space-y-8">
        <h1 className="text-5xl font-black italic tracking-tighter text-blue-500 uppercase">AI BRAIN</h1>
        
        <div className="min-h-[100px] p-6 bg-zinc-900 border-2 border-zinc-800 rounded-3xl relative overflow-hidden">
           {isAnalyzing ? (
             <div className="animate-pulse text-zinc-500 font-bold uppercase text-xs tracking-widest">AI is thinking...</div>
           ) : (
             <div className="text-sm font-medium text-zinc-300 italic">
               {aiThought || "Brain Idle. Click generate to start analysis."}
             </div>
           )}
        </div>

        <button 
          onClick={handleGenerate}
          className="w-full bg-blue-600 py-6 rounded-3xl font-black uppercase text-xl shadow-[0_8px_0_#1e40af] active:translate-y-1 active:shadow-none transition-all"
        >
          {isAnalyzing ? "ANALYZING..." : "GENERATE LESSON"}
        </button>
      </div>
    </main>
  );
}