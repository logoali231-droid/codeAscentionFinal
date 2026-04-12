/**
 * LOCAL CHALLENGE DATABASE
 * 
 * Pre-built, high-quality coding challenges that work 100% offline.
 * No API calls needed. Instant. Free forever.
 */

export interface LocalChallenge {
  challengeTitle: string;
  challengeDescription: string;
  problemStatement: string;
  inputExamples: string[];
  outputExamples: string[];
  hints: string[];
  tags: string[]; // keywords for matching
}

const CHALLENGES: LocalChallenge[] = [
  // ===== RECURSION =====
  {
    challengeTitle: "Recursive Factorial",
    challengeDescription: "Master recursion by computing factorials without loops.",
    problemStatement: "Write a recursive function `factorial(n)` that returns the factorial of n. factorial(0) = 1, factorial(n) = n * factorial(n-1).",
    inputExamples: ["factorial(5)", "factorial(0)", "factorial(3)"],
    outputExamples: ["120", "1", "6"],
    hints: ["Every recursive function needs a base case — what's yours?", "The base case is when n equals 0 or 1.", "factorial(n) = n * factorial(n - 1)"],
    tags: ["recursion", "recursive", "factorial", "recurse"]
  },
  {
    challengeTitle: "Recursive Fibonacci",
    challengeDescription: "Compute the nth Fibonacci number using recursion.",
    problemStatement: "Write a function `fibonacci(n)` that returns the nth Fibonacci number. fib(0)=0, fib(1)=1, fib(n)=fib(n-1)+fib(n-2).",
    inputExamples: ["fibonacci(6)", "fibonacci(0)", "fibonacci(10)"],
    outputExamples: ["8", "0", "55"],
    hints: ["You need TWO base cases: n===0 and n===1.", "fib(n) = fib(n-1) + fib(n-2)", "Watch out for performance — this naive approach is O(2^n)!"],
    tags: ["recursion", "recursive", "fibonacci", "recurse"]
  },
  {
    challengeTitle: "Recursive Sum of Array",
    challengeDescription: "Sum all elements in an array using only recursion.",
    problemStatement: "Write a function `sumArray(arr)` that returns the sum of all numbers in an array, using recursion instead of loops.",
    inputExamples: ["sumArray([1, 2, 3, 4])", "sumArray([10])", "sumArray([])"],
    outputExamples: ["10", "10", "0"],
    hints: ["Base case: what should you return for an empty array?", "Use arr.slice(1) to get everything except the first element.", "return arr[0] + sumArray(arr.slice(1))"],
    tags: ["recursion", "recursive", "array", "sum", "recurse"]
  },

  // ===== LOOPS =====
  {
    challengeTitle: "FizzBuzz Classic",
    challengeDescription: "The most famous coding interview question of all time.",
    problemStatement: "Write a function that prints numbers 1-20. For multiples of 3, print 'Fizz'. For multiples of 5, print 'Buzz'. For multiples of both, print 'FizzBuzz'.",
    inputExamples: ["fizzBuzz(15)", "fizzBuzz(5)", "fizzBuzz(3)"],
    outputExamples: ["FizzBuzz", "Buzz", "Fizz"],
    hints: ["Use the modulo operator %. If n % 3 === 0, it's divisible by 3.", "Check for the FizzBuzz case (divisible by both) FIRST.", "Use a for loop from 1 to 20."],
    tags: ["loop", "loops", "for", "while", "fizzbuzz", "iteration"]
  },
  {
    challengeTitle: "Reverse a String",
    challengeDescription: "Use a loop to reverse a string character by character.",
    problemStatement: "Write a function `reverseString(str)` that returns the reversed version of the input string using a loop.",
    inputExamples: ["reverseString('hello')", "reverseString('world')", "reverseString('a')"],
    outputExamples: ["'olleh'", "'dlrow'", "'a'"],
    hints: ["Start with an empty string and build it character by character.", "Loop from the end of the string to the beginning.", "result += str[i] adds each character."],
    tags: ["loop", "loops", "string", "reverse", "for", "iteration"]
  },

  // ===== FUNCTIONS =====
  {
    challengeTitle: "Arrow Function Converter",
    challengeDescription: "Practice converting traditional functions to arrow functions.",
    problemStatement: "Convert this function to an arrow function: function add(a, b) { return a + b; }. Then create a `multiply` arrow function that multiplies two numbers.",
    inputExamples: ["add(3, 5)", "multiply(4, 6)"],
    outputExamples: ["8", "24"],
    hints: ["Arrow syntax: const add = (a, b) => a + b;", "For single expressions, you can omit the curly braces and 'return'.", "const multiply = (a, b) => a * b;"],
    tags: ["function", "functions", "arrow", "callback", "lambda"]
  },
  {
    challengeTitle: "Higher-Order Functions",
    challengeDescription: "Write a function that takes another function as an argument.",
    problemStatement: "Write a function `applyOperation(a, b, operation)` that takes two numbers and a callback function, then returns the result of calling the operation with those numbers.",
    inputExamples: ["applyOperation(2, 3, (a,b) => a+b)", "applyOperation(10, 5, (a,b) => a-b)"],
    outputExamples: ["5", "5"],
    hints: ["A higher-order function accepts functions as parameters.", "Just call: return operation(a, b);", "This pattern is the foundation of .map(), .filter(), and .reduce()!"],
    tags: ["function", "functions", "callback", "higher-order", "closures"]
  },

  // ===== ARRAYS =====
  {
    challengeTitle: "Array Map & Filter",
    challengeDescription: "Transform and filter arrays like a pro.",
    problemStatement: "Given an array of numbers, use .filter() to keep only even numbers, then use .map() to double each remaining number.",
    inputExamples: ["transform([1, 2, 3, 4, 5, 6])", "transform([10, 15, 20])"],
    outputExamples: ["[4, 8, 12]", "[20, 40]"],
    hints: ["Chain .filter() and .map(): arr.filter(...).map(...)", "Even number check: n % 2 === 0", "Double: n => n * 2"],
    tags: ["array", "arrays", "map", "filter", "reduce", "method"]
  },
  {
    challengeTitle: "Find the Maximum",
    challengeDescription: "Find the largest number in an array without using Math.max.",
    problemStatement: "Write a function `findMax(arr)` that returns the largest number in an array using a loop, without using Math.max().",
    inputExamples: ["findMax([3, 7, 2, 9, 1])", "findMax([-5, -1, -10])"],
    outputExamples: ["9", "-1"],
    hints: ["Start by assuming the first element is the maximum.", "Loop through and compare each element.", "if (arr[i] > max) max = arr[i];"],
    tags: ["array", "arrays", "loop", "max", "search"]
  },

  // ===== ASYNC/AWAIT =====
  {
    challengeTitle: "Promise Chain",
    challengeDescription: "Master async/await by simulating API calls.",
    problemStatement: "Write an async function `fetchUser()` that returns a Promise resolving to {name: 'Alice', age: 25} after a 1-second delay using setTimeout wrapped in a Promise.",
    inputExamples: ["const user = await fetchUser()", "console.log(user.name)"],
    outputExamples: ["{name: 'Alice', age: 25}", "'Alice'"],
    hints: ["Wrap setTimeout in: new Promise(resolve => setTimeout(resolve, 1000))", "Use async/await to make asynchronous code look synchronous.", "return new Promise(resolve => setTimeout(() => resolve({name:'Alice', age:25}), 1000))"],
    tags: ["async", "await", "promise", "fetch", "api", "asynchronous"]
  },

  // ===== OBJECTS =====
  {
    challengeTitle: "Object Destructuring",
    challengeDescription: "Extract values from objects using modern syntax.",
    problemStatement: "Given an object `person = {name: 'Bob', age: 30, city: 'NYC'}`, use destructuring to extract name and city into separate variables.",
    inputExamples: ["const {name, city} = person", "console.log(name, city)"],
    outputExamples: ["name = 'Bob'", "'Bob' 'NYC'"],
    hints: ["Destructuring syntax: const { key1, key2 } = object;", "You can rename: const { name: userName } = person;", "You can set defaults: const { country = 'US' } = person;"],
    tags: ["object", "objects", "destructuring", "property", "json"]
  },

  // ===== CSS =====
  {
    challengeTitle: "Flexbox Centering",
    challengeDescription: "Center content perfectly using CSS Flexbox.",
    problemStatement: "Write CSS to perfectly center a div both horizontally and vertically inside its parent container using Flexbox.",
    inputExamples: [".container { ??? }", ".container { height: 100vh; }"],
    outputExamples: ["display: flex; justify-content: center; align-items: center;", "Content is perfectly centered"],
    hints: ["Start with display: flex;", "justify-content centers horizontally, align-items centers vertically.", "Make sure the container has a defined height!"],
    tags: ["css", "flex", "flexbox", "center", "layout", "style", "grid"]
  },

  // ===== HTML =====
  {
    challengeTitle: "Semantic HTML Structure",
    challengeDescription: "Build a proper HTML document using semantic tags.",
    problemStatement: "Create an HTML structure for a blog post using semantic tags: <article>, <header>, <main>, <footer>. Include an h1 title and two paragraphs.",
    inputExamples: ["<article>...</article>"],
    outputExamples: ["A properly structured semantic HTML document"],
    hints: ["Use <article> as the wrapper.", "Put the <h1> inside a <header>.", "<main> holds the body content, <footer> holds metadata."],
    tags: ["html", "semantic", "tag", "structure", "web", "dom"]
  },

  // ===== CYBERSECURITY =====
  {
    challengeTitle: "TCP vs UDP Analysis",
    challengeDescription: "Understand the core networking protocols.",
    problemStatement: "Explain the key differences between TCP and UDP. When would you use each? List at least 3 differences.",
    inputExamples: ["TCP is: ___", "UDP is: ___"],
    outputExamples: ["TCP: reliable, ordered, connection-oriented", "UDP: fast, unordered, connectionless"],
    hints: ["Think about reliability vs speed.", "TCP uses a 3-way handshake (SYN, SYN-ACK, ACK).", "Streaming video uses UDP; loading a webpage uses TCP."],
    tags: ["tcp", "udp", "network", "networking", "protocol", "cyber", "security", "cybersecurity"]
  },
  {
    challengeTitle: "Encryption Fundamentals",
    challengeDescription: "Classify encryption algorithms.",
    problemStatement: "Identify whether AES and RSA are symmetric or asymmetric encryption. Explain the practical difference and when you'd use each.",
    inputExamples: ["AES is: ___", "RSA is: ___"],
    outputExamples: ["AES: Symmetric (same key)", "RSA: Asymmetric (public/private keys)"],
    hints: ["Symmetric = same key encrypts and decrypts.", "Asymmetric = different keys (public encrypts, private decrypts).", "TLS/HTTPS uses RSA for key exchange, then AES for data."],
    tags: ["encrypt", "encryption", "aes", "rsa", "crypto", "security", "cybersecurity", "cyber"]
  },

  // ===== PYTHON =====
  {
    challengeTitle: "Python List Comprehension",
    challengeDescription: "Master Python's most powerful one-liner.",
    problemStatement: "Use list comprehension to create a list of squares of even numbers from 1 to 20.",
    inputExamples: ["squares = [??? for x in range(1, 21) if ???]"],
    outputExamples: ["[4, 16, 36, 64, 100, 144, 196, 256, 324, 400]"],
    hints: ["List comprehension: [expression for item in iterable if condition]", "Even check: x % 2 == 0", "Square: x ** 2 or x * x"],
    tags: ["python", "list", "comprehension", "for", "range"]
  },
  {
    challengeTitle: "Python Dictionary Operations",
    challengeDescription: "Work with Python dictionaries like a pro.",
    problemStatement: "Create a dictionary of student grades, then write a function that returns the name of the student with the highest grade.",
    inputExamples: ["grades = {'Alice': 92, 'Bob': 85, 'Charlie': 98}","best_student(grades)"],
    outputExamples: ["'Charlie'"],
    hints: ["Use max() with key parameter: max(grades, key=grades.get)", "Or loop through items: for name, grade in grades.items()", "dict.get(key) returns the value for that key."],
    tags: ["python", "dict", "dictionary", "key", "value"]
  }
];

/**
 * Finds the best matching local challenge for a given topic.
 * Returns null only if absolutely no match is found.
 */
export function findLocalChallenge(topic: string): LocalChallenge | null {
  const search = topic.toLowerCase().trim();
  
  // Exact tag match
  const exactMatch = CHALLENGES.find(c => 
    c.tags.some(tag => search.includes(tag))
  );
  if (exactMatch) return exactMatch;

  // Fuzzy match on title/description
  const fuzzyMatch = CHALLENGES.find(c =>
    c.challengeTitle.toLowerCase().includes(search) ||
    c.challengeDescription.toLowerCase().includes(search) ||
    c.problemStatement.toLowerCase().includes(search)
  );
  if (fuzzyMatch) return fuzzyMatch;

  // Return a random challenge as last resort
  return CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)];
}

/**
 * Returns ALL challenges matching a topic (for variety).
 */
export function findAllLocalChallenges(topic: string): LocalChallenge[] {
  const search = topic.toLowerCase().trim();
  const matches = CHALLENGES.filter(c =>
    c.tags.some(tag => search.includes(tag)) ||
    c.challengeTitle.toLowerCase().includes(search)
  );
  return matches.length > 0 ? matches : [CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)]];
}
