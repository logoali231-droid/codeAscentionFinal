
export type SkillStatus = "locked" | "available" | "completed";
export type SkillType = "core" | "checkpoint" | "bonus";

export interface Skill {
  id: string;
  title: string;
  description: string;
  starterCode: string;
  language: string;
  status: SkillStatus;
  type: SkillType;
}

export interface Course {
  id: string;
  title: string;
  icon: string;
  color: string;
  skills: Skill[];
}

export const COURSES: Course[] = [
  {
    id: "js-path",
    title: "JavaScript Mastery",
    icon: "Javascript",
    color: "yellow",
    skills: [
      { 
        id: "js-basics", 
        title: "Variables", 
        description: "Declare a variable named 'score' and assign it the value 100.",
        starterCode: "// Your code here",
        language: "JavaScript",
        status: "completed", 
        type: "core" 
      },
      { 
        id: "loops", 
        title: "Loops", 
        description: "Write a for loop that prints numbers from 1 to 5.",
        starterCode: "for (let i = 1; i <= 5; i++) {\n  // Print i\n}",
        language: "JavaScript",
        status: "completed", 
        type: "core" 
      },
      { 
        id: "functions", 
        title: "Functions", 
        description: "Create a function named `greet` that takes a `name` parameter and returns 'Hello, [name]!'.",
        starterCode: "function greet(name) {\n  // Your code here\n}",
        language: "JavaScript",
        status: "available", 
        type: "core" 
      },
      { 
        id: "objects", 
        title: "Objects", 
        description: "Create an object named 'user' with properties 'name' and 'age'.",
        starterCode: "const user = {\n  \n};",
        language: "JavaScript",
        status: "locked", 
        type: "core" 
      },
      { 
        id: "async", 
        title: "Async/Await", 
        description: "Write an async function that fetches data from a URL.",
        starterCode: "async function fetchData() {\n  \n}",
        language: "JavaScript",
        status: "locked", 
        type: "checkpoint" 
      },
    ]
  },
  {
    id: "python-path",
    title: "Python Pro",
    icon: "Python",
    color: "blue",
    skills: [
      { 
        id: "py-intro", 
        title: "Indentation", 
        description: "Fix the indentation in this if statement.",
        starterCode: "if True:\nprint('Hello')",
        language: "Python",
        status: "available", 
        type: "core" 
      },
      { 
        id: "lists", 
        title: "Lists", 
        description: "Append 'apple' to the list named 'fruits'.",
        starterCode: "fruits = []\n# Your code here",
        language: "Python",
        status: "locked", 
        type: "core" 
      },
      { 
        id: "dictionaries", 
        title: "Dicts", 
        description: "Access the value of key 'name' in dictionary 'data'.",
        starterCode: "data = {'name': 'Alice'}\nname = ",
        language: "Python",
        status: "locked", 
        type: "core" 
      },
      { 
        id: "flask", 
        title: "Web with Flask", 
        description: "Create a basic Flask route that returns 'Hello World'.",
        starterCode: "from flask import Flask\napp = Flask(__name__)\n\n@app.route('/')",
        language: "Python",
        status: "locked", 
        type: "checkpoint" 
      },
    ]
  },
  {
    id: "cyber-path",
    title: "Cybersecurity",
    icon: "Shield",
    color: "red",
    skills: [
      { 
        id: "networking", 
        title: "TCP/IP Basics", 
        description: "Explain the difference between TCP and UDP in a comment.",
        starterCode: "# TCP is...\n# UDP is...",
        language: "Text",
        status: "available", 
        type: "core" 
      },
      { 
        id: "encryption", 
        title: "AES/RSA", 
        description: "Identify which one is symmetric and which is asymmetric.",
        starterCode: "# AES: \n# RSA: ",
        language: "Text",
        status: "locked", 
        type: "core" 
      },
      { 
        id: "phishing", 
        title: "Social Eng.", 
        description: "List three common signs of a phishing email.",
        starterCode: "1. \n2. \n3. ",
        language: "Text",
        status: "locked", 
        type: "bonus" 
      },
      { 
        id: "pen-test", 
        title: "Penetration", 
        description: "What is the first phase of a penetration test?",
        starterCode: "# Your answer: ",
        language: "Text",
        status: "locked", 
        type: "checkpoint" 
      },
    ]
  },
  {
    id: "web-path",
    title: "Web Frontend",
    icon: "Layout",
    color: "cyan",
    skills: [
      { 
        id: "html", 
        title: "Semantic HTML", 
        description: "Create a main heading and a paragraph using semantic tags.",
        starterCode: "<div>\n  \n</div>",
        language: "HTML",
        status: "completed", 
        type: "core" 
      },
      { 
        id: "css-flex", 
        title: "Flexbox", 
        description: "Center items in a container using flexbox properties.",
        starterCode: ".container {\n  display: flex;\n}",
        language: "CSS",
        status: "available", 
        type: "core" 
      },
      { 
        id: "tailwind", 
        title: "Tailwind UI", 
        description: "Create a button with blue background and white text using Tailwind classes.",
        starterCode: "<button className=''>Button</button>",
        language: "HTML",
        status: "locked", 
        type: "core" 
      },
      { 
        id: "react", 
        title: "React Hooks", 
        description: "Create a counter using the useState hook.",
        starterCode: "import { useState } from 'react';\n\nfunction Counter() {\n  \n}",
        language: "JavaScript",
        status: "locked", 
        type: "checkpoint" 
      },
    ]
  }
];
