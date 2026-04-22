import { increaseLevel, decreaseLevel } from "./progression";

export function evaluateAnswer(topic: string, success: boolean) {
  if (success) {
    return increaseLevel(topic);
  } else {
    return decreaseLevel(topic);
  }
}