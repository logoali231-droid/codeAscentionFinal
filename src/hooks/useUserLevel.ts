
import { useState, useEffect } from "react";

export function useUserLevel() {
  const [xp, setXp] = useState(0);
  const [level, setLevel] = useState(1);

  // Carrega do localStorage ao iniciar
  useEffect(() => {
    const saved = localStorage.getItem("user_progress");
    if (saved) {
      const { xp, level } = JSON.parse(saved);
      setXp(xp);
      setLevel(level);
    }
  }, []);

  const addXp = (amount: number) => {
    let newXp = xp + amount;
    let newLevel = level;

    // Lógica simples: Cada 100 XP sobe um nível
    if (newXp >= 100) {
      newXp = newXp - 100;
      newLevel += 1;
      alert(`Parabéns! Você subiu para o Nível ${newLevel}!`); // Estilo Duolingo
    }

    setXp(newXp);
    setLevel(newLevel);
    localStorage.setItem("user_progress", JSON.stringify({ xp: newXp, level: newLevel }));
  };

  return { xp, level, addXp };
}