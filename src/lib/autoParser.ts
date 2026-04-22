import { saveKnowledge } from "./brain";

export function autoLearn(input: string) {
  const text = input.trim();

  if (text.length < 20) return null;

  // 🧠 tenta detectar tópico (primeira frase ou palavra chave)
  const firstLine = text.split("\n")[0];
  let topic = firstLine.toLowerCase();

  if (topic.includes(":")) {
    topic = topic.split(":")[0];
  }

  topic = topic.slice(0, 40);

  // 🧠 tenta extrair exemplos (linhas com "function", "=" etc)
  const lines = text.split("\n");

  const examples = lines.filter(
    (l) =>
      l.includes("function") ||
      l.includes("=>") ||
      l.includes("=")
  );

  // 🧠 explicação = primeiras linhas
  const explanation = lines.slice(0, 3).join(" ");

  const parsed = {
    explanation,
    examples,
    raw: text,
  };

  saveKnowledge(topic, parsed);

  return {
    topic,
    parsed,
  };
}