export type DifficultyLevel = "beginner" | "easy" | "medium" | "hard";

type PerformanceState = {
  correctStreak: number;
  wrongStreak: number;
  level: DifficultyLevel;
};

// estado salvo no localStorage
export function getPerformance(): PerformanceState {
  if (typeof window === "undefined") {
    return { correctStreak: 0, wrongStreak: 0, level: "beginner" };
  }

  const raw = localStorage.getItem("ai_performance");
  return raw
    ? JSON.parse(raw)
    : { correctStreak: 0, wrongStreak: 0, level: "beginner" };
}

export function savePerformance(state: PerformanceState) {
  localStorage.setItem("ai_performance", JSON.stringify(state));
}

export function updateDifficulty(isCorrect: boolean): DifficultyLevel {
  const state = getPerformance();

  if (isCorrect) {
    state.correctStreak += 1;
    state.wrongStreak = 0;
  } else {
    state.wrongStreak += 1;
    state.correctStreak = 0;
  }

  // 🎯 SUBIR dificuldade (precisa consistência)
  if (state.correctStreak >= 3) {
    state.level = increaseDifficulty(state.level);
    state.correctStreak = 0;
  }

  // 🛟 DIMINUIR (mais rápido pra evitar frustração)
  if (state.wrongStreak >= 2) {
    state.level = decreaseDifficulty(state.level);
    state.wrongStreak = 0;
  }

  savePerformance(state);
  return state.level;
}

function increaseDifficulty(level: DifficultyLevel): DifficultyLevel {
  switch (level) {
    case "beginner": return "easy";
    case "easy": return "medium";
    case "medium": return "hard";
    default: return "hard";
  }
}

function decreaseDifficulty(level: DifficultyLevel): DifficultyLevel {
  switch (level) {
    case "hard": return "medium";
    case "medium": return "easy";
    case "easy": return "beginner";
    default: return "beginner";
  }
}