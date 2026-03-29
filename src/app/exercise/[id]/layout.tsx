import { COURSES } from "@/app/lib/courses-data";

export function generateStaticParams() {
  return COURSES.flatMap(c => c.skills.map(s => ({ id: s.id })));
}

export default function ExerciseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
