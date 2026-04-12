"use client";

export function canRunAI() {
  return (
    typeof window !== "undefined" &&
    "gpu" in navigator &&
    navigator.hardwareConcurrency >= 4
  );
}