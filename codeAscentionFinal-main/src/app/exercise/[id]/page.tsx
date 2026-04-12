import { COURSES } from "@/app/lib/courses-data";
import ExerciseClient from "./ExerciseClient";

interface ExercisePageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return COURSES.flatMap((course) =>
    course.skills.map((skill) => ({
      id: skill.id,
    }))
  );
}

export default async function ExercisePage({ params }: ExercisePageProps) {
  const { id } = await params;
  
  return <ExerciseClient id={id} />;
}
