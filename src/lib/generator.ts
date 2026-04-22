import { getKnowledge } from "./brain";
import { getLevel } from "./progression";

export function buildPrompt(input: string) {
  const db = getKnowledge();

  const topic = input.toLowerCase();
  const levelState = getLevel(topic);

  const knowledge = db[topic];

  if (!knowledge) {
    return `
Topic: ${topic}

No stored knowledge.

Use general programming knowledge to:
- explain simply
- create beginner exercise
`;
  }

  return `
Topic: ${topic}

User knowledge:
${knowledge.explanation}

Examples:
${knowledge.examples.join("\n")}

User level: ${levelState.level}

Rules:
- Stay in programming context
- Increase difficulty with level
- Use real-world scenarios

Generate:
1. Explanation
2. Example
3. Challenge
`;
}