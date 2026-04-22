export function runCode(code: string) {
  try {
    const result = eval(code);
    return { ok: true, output: String(result) };
  } catch (e: any) {
    return { ok: false, output: e.message };
  }
}