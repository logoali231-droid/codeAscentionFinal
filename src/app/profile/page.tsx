
// src/app/profile/page.tsx
'use client'
import { useEffect, useState } from 'react';
import { getLocalUser, UserProfile } from '@/lib/engine';
import { Flame, Star, TrendingUp, Award, History } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    setUser(getLocalUser());
  }, []);

  if (!user) return null;

  return (
    <main className="android-container min-h-screen bg-black text-white pb-32">
      <header className="p-8 bg-gradient-to-b from-blue-600/20 flex flex-col items-center gap-4 text-center">
        <div className="w-24 h-24 rounded-full border-4 border-blue-600 overflow-hidden relative">
           <img src={`https://picsum.photos/seed/${user.name}/200`} alt="Avatar" />
        </div>
        <h1 className="text-2xl font-black italic uppercase tracking-tighter">{user.name}</h1>
        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
          {user.expertise} • LEVEL {Math.floor(user.xp / 1000) + 1}
        </p>
      </header>

      <div className="px-6 space-y-6">
        <div className="grid grid-cols-3 gap-3">
          <StatBox icon={<Star />} label="XP" value={user.xp.toLocaleString()} />
          <StatBox icon={<TrendingUp />} label="RANK" value={user.rank} />
          <StatBox icon={<Award />} label="LOGS" value={user.errorLog.length.toString()} />
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            <History className="w-3 h-3" /> User Struggle Notes
          </h3>
          {user.errorLog.length === 0 ? (
            <div className="p-8 text-center text-zinc-700 border-2 border-dashed border-zinc-900 rounded-3xl">No logs yet.</div>
          ) : (
            user.errorLog.slice(-3).reverse().map((error, i) => (
              <div key={i} className="bg-zinc-900/50 border-l-4 border-blue-600 p-5 rounded-r-3xl">
                <p className="text-[10px] font-black text-blue-400 uppercase mb-1">{error.topic}</p>
                <p className="text-sm text-zinc-300 italic">"{error.userExplanation}"</p>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

function StatBox({ icon, label, value }: any) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
      <div className="flex justify-center mb-1 text-blue-500 opacity-50">{icon}</div>
      <div className="text-sm font-bold">{value}</div>
      <div className="text-[8px] text-zinc-600 font-black uppercase mt-1">{label}</div>
    </div>
  );
}