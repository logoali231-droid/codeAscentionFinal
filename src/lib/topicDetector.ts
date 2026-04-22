import { knowledgeBase } from "./knowledge";

export function detectTopic(input: string) {
  const topic = input.toLowerCase().trim();

  if (!knowledgeBase[topic]) {
    return {
      topic,
      isNew: true,
    };
  }

  return {
    topic,
    isNew: false,
  };
}