export type LevelState = {
  topic: string;
  level: number;
};

export function getLevel(topic: string): LevelState {
  const raw = localStorage.getItem("progress_" + topic);

  if (!raw) {
    return { topic, level: 0 };
  }

  return JSON.parse(raw);
}

export function increaseLevel(topic: string) {
  const current = getLevel(topic);

  const updated = {
    topic,
    level: current.level + 1,
  };

  localStorage.setItem("progress_" + topic, JSON.stringify(updated));

  return updated;
}

export function decreaseLevel(topic: string) {
  const current = getLevel(topic);

  const updated = {
    topic,
    level: Math.max(0, current.level - 1),
  };

  localStorage.setItem("progress_" + topic, JSON.stringify(updated));

  return updated;
}