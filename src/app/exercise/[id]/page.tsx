import ExerciseClient from "./ExerciseClient";

type Params = Promise<{ id: string }>;

export async function generateStaticParams() {
  const languages = ["python", "javascript", "rust", "cplusplus"];
  const levels = ["1", "2", "3", "4", "5"];
  
  const paths: { id: string }[] = [];
  for (const lang of languages) {
    for (const lvl of levels) {
      paths.push({ id: `${lang}_lvl_${lvl}` });
    }
  }
  
  return paths;
}

export default async function ExercisePage({ params }: { params: Params }) {
  const { id } = await params;
  return <ExerciseClient id={id} />;
}
