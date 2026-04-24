
'use client'
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveUser } from '@/lib/engine';

export default function LoginPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const router = useRouter();

  const handleFinish = (level: 'Beginner' | 'Intermediate' | 'Pro') => {
    saveUser({
      name, email: '', expertise: level, xp: 0, badges: 0, rank: '#99+', errorLog: []
    });
    router.push('/profile');
  };

  return (
    <div className="min-h-screen bg-black text-white p-8 flex flex-col justify-center gap-8">
      {step === 1 ? (
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Who is coding today?</h1>
          <input className="w-full bg-zinc-900 p-4 rounded-xl border border-zinc-800" 
                 placeholder="Enter name..." onChange={e => setName(e.target.value)} />
          <button onClick={() => setStep(2)} className="w-full bg-blue-600 p-4 rounded-xl font-bold">NEXT</button>
        </div>
      ) : (
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">Technical Check: Which is O(log n)?</h1>
          {['Linear Search', 'Binary Search', 'Bubble Sort'].map((opt, i) => (
            <button key={opt} onClick={() => handleFinish(i === 1 ? 'Pro' : 'Beginner')} 
                    className="w-full p-4 border border-zinc-800 rounded-xl hover:bg-zinc-900">
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}