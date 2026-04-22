
interface Lesson {
  id: number;
  title: string;
  type: "theory" | "exercise";
  difficulty: "beginner" | "intermediate" | "advanced";
  completed: boolean;
}