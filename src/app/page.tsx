
"use client";

import React, { useState } from "react";

// 1. Define the type for your exercises
interface Exercise {
  question: string;
  description: string;
  answer: string;
}

export default function GeneratePage() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([]); 
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const generateExercises = async () => {
    setLoading(true);
    // This is where your AI logic (WebLLM) or API call goes
    // Example Mock Data:
    const mockData = [
      { 
        question: "Recursive Function to Calculate Factorial", 
        description: "Create a recursive function to calculate the factorial of a given number...", 
        answer: "" 
      }
    ];
    await new Promise(r => setTimeout(r, 1500)); // simulate AI thinking
    setExercises(mockData);
    setLoading(false);
  };

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  // --- UI STATES ---

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-blue-500 font-black animate-pulse">
      GENERATING LESSON...
    </div>
  );

  if (isFinished) return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-4xl font-black text-blue-500 mb-4">LESSON COMPLETE!</h1>
      <button onClick={() => setExercises([])} className="bg-blue-600 px-8 py-4 rounded-2xl font-black uppercase">Continue</button>
    </div>
  );

  // THIS IS THE BLOCK THAT FIXES YOUR MISSING BUTTON
  if (exercises.length > 0) {
    const current = exercises[currentIndex];
    const progress = ((currentIndex + 1) / exercises.length) * 100;

    return (
      <div className="min-h-screen bg-black text-white flex flex-col">
        {/* PROGRESS BAR (TOP) */}
        <nav className="p-4 flex items-center gap-4 max-w-2xl mx-auto w-full sticky top-0 bg-black z-50">
          <button onClick={() => setExercises([])} className="text-zinc-500">✕</button>
          <div className="flex-1 bg-zinc-800 h-3 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </nav>

        {/* EXERCISE UI (What you see in your image) */}
        <main className="flex-1 p-6 max-w-2xl mx-auto w-full pb-32">
          <h1 className="text-2xl font-black text-white mb-2">{current.question}</h1>
          <p className="text-zinc-400 mb-6 font-medium">{current.description}</p>
          
          <textarea 
            className="w-full h-64 bg-zinc-900 border-2 border-zinc-800 rounded-2xl p-4 font-mono text-sm focus:border-blue-500 outline-none transition-all"
            placeholder="Write your code here..."
          />
        </main>

        {/* SEND BUTTON (BOTTOM) - This is what you were missing! */}
        <footer className="fixed bottom-0 left-0 w-full p-6 bg-black border-t border-zinc-900 z-50">
          <div className="max-w-2xl mx-auto">
            <button 
              onClick={handleNext}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest shadow-[0_5px_0_#1e40af] active:translate-y-1 active:shadow-none transition-all"
            >
              {currentIndex === exercises.length - 1 ? "Finish" : "Check Answer"}
            </button>
          </div>
        </footer>
      </div>
    );
  }

  // DEFAULT GENERATE SCREEN
  return (
    <main className="p-6 max-w-2xl mx-auto flex flex-col justify-center min-h-screen">
      <h1 className="text-4xl font-black text-blue-500 mb-8 uppercase italic">Code Ascent</h1>
      <input 
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="What to learn?" 
        className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-2xl p-5 text-white mb-4 outline-none focus:border-blue-500"
      />
      <button onClick={generateExercises} className="bg-blue-600 py-5 rounded-2xl font-black uppercase shadow-[0_5px_0_#1e40af]">
        Generate Exercise
      </button>
    </main>
  );
}