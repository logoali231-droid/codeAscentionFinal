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

export function getHeuristicHint(
  title: string,
  description: string,
  code: string
) {
  const text = `${title} ${description} ${code}`.toLowerCase();

  if (text.includes("recursion")) {
    return "Hint: Make sure you have a base case and reduce the problem each call.";
  }

  if (text.includes("array")) {
    return "Hint: Try iterating or using built-in array methods like map/filter.";
  }

  if (text.includes("loop")) {
    return "Hint: Check your loop condition to avoid infinite loops.";
  }

  if (code.includes("undefined")) {
    return "Hint: You may be accessing something that doesn't exist.";
  }

  return "Hint: Break the problem into smaller steps and verify each part.";
}