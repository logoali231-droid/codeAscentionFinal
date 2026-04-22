"use client";

import { useState } from "react";
import CodeEditor from "@/components/CodeEditor";
import { runCode } from "@/lib/codeRunner";

export default function PracticePage() {
  const [output, setOutput] = useState("");

  function handleRun(code: string) {
    const res = runCode(code);
    setOutput(res.output);
  }

  return (
    <div className="p-4 bg-black text-white min-h-screen space-y-4">
      <h1>Practice</h1>

      <p>👉 Return 10</p>

      <CodeEditor onRun={handleRun} />

      <pre>{output}</pre>
    </div>
  );
}