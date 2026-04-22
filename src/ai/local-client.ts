export async function runLocalAI(prompt: string) {
  try {
    await new Promise((r) => setTimeout(r, 300));

    return `
Topic: ${prompt}

Explanation:
Simple explanation of ${prompt}.

Example:
function test() {
  return "${prompt}";
}

Challenge:
Create something using ${prompt}.
`;
  } catch {
    return "AI failed";
  }
}