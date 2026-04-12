

const KEY = "ai_memory";

const memory = [
  {
    type: "syntax",
    topic: "loops",
    count: 3
  },
  {
    type: "logic",
    topic: "arrays",
    count: 2
  }
];

localStorage.setItem("ai_memory", JSON.stringify(memory));

"use client";



type MemoryItem = {
  topic: string;
  type: string;
  count: number;
};

export function updateMemory(topic: string, type: string) {
  let memory: MemoryItem[] = getUserMemory();

  // 🛡️ garantir que é array
  if (!Array.isArray(memory)) {
    memory = [];
  }

  const existing = memory.find(
    (m) => m.topic === topic && m.type === type
  );

  if (existing) {
    existing.count += 1;
  } else {
    memory.push({ topic, type, count: 1 });
  }

  // 🔥 ordenar por importância
  memory.sort((a, b) => b.count - a.count);

  // ✂️ limitar tamanho (CRÍTICO)
  memory = memory.slice(0, 5);

  localStorage.setItem("ai_memory", JSON.stringify(memory));
}


export function saveToMemory(entry: string) {
    const existing = localStorage.getItem(KEY) || "";
    let lines = existing.split("\n").filter(Boolean);

    lines.push(entry);

    // mantém só últimos 20
    if (lines.length > 20) {
        lines = lines.slice(-20);
    }

    localStorage.setItem(KEY, lines.join("\n"));
}

export function getMemory(): string {
    return localStorage.getItem(KEY) || "";
}
"use client";

export function getUserMemory() {
  const raw = localStorage.getItem("ai_memory");

  if (!raw) return [];

  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}