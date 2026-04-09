import ExerciseClient from "./ExerciseClient";

type Params = Promise<{ id: string }>;

export default async function ExercisePage({ params }: { params: Params }) {
  const { id } = await params;
  return <ExerciseClient id={id} />;
}
