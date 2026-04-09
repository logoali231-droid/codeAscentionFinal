import ExerciseClient from "./ExerciseClient";

export default function ExercisePage({ params }: { params: { id: string } }) {
  const { id } = params;
  return <ExerciseClient id={id} />;
}
