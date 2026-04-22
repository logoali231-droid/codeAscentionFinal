"use client";

import { useEffect, useState } from "react";

export default function PracticePage() {
  const [exercise, setExercise] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("current_exercise");

    if (stored) {
      setExercise(JSON.parse(stored));
    }
  }, []);

  if (!exercise) {
    return <div className="p-4 text-white">No exercise loaded</div>;
  }

  return (
    <div className="p-4 text-white space-y-4">
      <h1 className="text-xl font-bold">{exercise.title}</h1>
      <p>{exercise.description}</p>

      <textarea
        className="w-full h-40 bg-black border p-2"
        placeholder="Write your code here..."
      />
    </div>
  );
}