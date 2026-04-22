const KEY = "knowledge_v1";

export type Knowledge = {
  [topic: string]: {
    explanation: string;
    examples: string[];
    raw: string;
  };
};

function load(): Knowledge {
  if (typeof window === "undefined") return {};
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : {};
}

function save(data: Knowledge) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function getKnowledge() {
  return load();
}

export function saveKnowledge(topic: string, data: any) {
  const db = load();

  db[topic] = data;

  save(db);
}