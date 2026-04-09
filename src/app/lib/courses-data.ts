export interface Skill {
  id: string;
  title: string;
  description: string;
  language: string;
  starterCode: string;
  status: 'locked' | 'unlocked' | 'start' | 'completed';
}

export interface Course {
  id: string;
  title: string;
  skills: Skill[];
}

export const COURSES: Course[] = [
  {
    id: "js-basics",
    title: "JavaScript Fundamentals",
    skills: [
      {
        id: "variables-1",
        title: "Working with Variables",
        description: "declare a variable named 'score' and assign it the value 100.",
        language: "javascript",
        starterCode: "// Your code here\n",
        status: "start"
      }
    ]
  }
];
