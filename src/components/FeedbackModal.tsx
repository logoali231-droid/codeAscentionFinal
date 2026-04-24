
// src/components/FeedbackModal.tsx
'use client'
import { useState } from 'react';
import { logStruggle } from '@/lib/engine';

export default function FeedbackModal({ topic, onClose }: { topic: string, onClose: () => void }) {
  const [why, setWhy] = useState('');
  const [diff, setDiff] = useState(3);

  return (
    <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-6 backdrop-blur-md">
      <div className="w-full max-w-md bg-zinc-900 border-2 border-zinc-800 rounded-[40px] p-8 space-y-6 shadow-2xl">
        <h2 className="text-3xl font-black italic text-blue-500 uppercase tracking-tighter">My Struggle</h2>
        <p className="text-zinc-500 text-xs uppercase tracking-widest font-black">AI is listening to your notes...</p>
        
        <textarea 
          value={why} onChange={e => setWhy(e.target.value)}
          placeholder="What exactly was confusing? The AI will use this to adapt..."
          className="w-full h-32 bg-black rounded-3xl p-5 border border-zinc-800 outline-none focus:border-blue-500 text-sm"
        />

        <div className="flex justify-between items-center px-2">
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Difficulty: {diff}/5</span>
          <input type="range" min="1" max="5" value={diff} onChange={e => setDiff(Number(e.target.value))} className="accent-blue-600" />
        </div>

        <button 
          onClick={() => { logStruggle(topic, why, diff); onClose(); }}
          className="w-full bg-blue-600 py-5 rounded-[32px] font-black uppercase tracking-widest shadow-[0_6px_0_#1e40af] active:translate-y-1 active:shadow-none transition-all"
        >
          LOG TO ENGINE
        </button>
      </div>
    </div>
  );
}