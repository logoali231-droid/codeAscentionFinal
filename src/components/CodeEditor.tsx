"use client";

import { useState } from "react";

export default function CodeEditor({
  onRun,
}: {
  onRun: (code: string) => void;
}) {
  const [code, setCode] = useState("");

  return (
    <div className="space-y-2">
      <textarea
        className="w-full h-40 p-2 bg-black text-green-400 font-mono border"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <button
        onClick={() => onRun(code)}
        className="bg-green-600 px-4 py-2"
      >
        Run
      </button>
    </div>
  );
}