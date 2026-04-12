/**
 * Client-side Local AI Intelligence Layer.
 * 
 * This module provides TWO tiers of local intelligence:
 * 1. A Web Worker running TinyLlama (if supported by the device)
 * 2. A bulletproof heuristic engine that ALWAYS works, even offline
 */

// ============================================================
// TIER 2: Bulletproof Heuristic Hint Engine (Always Works)
// ============================================================

const HINT_DATABASE: Record<string, string[]> = {
  // JavaScript hints
  "variable": [
    "Remember: use `let` for values that change, `const` for values that stay the same.",
    "To declare a variable, use the syntax: `let variableName = value;`",
    "Make sure you're using the assignment operator `=`, not the comparison operator `==`.",
  ],
  "loop": [
    "A `for` loop needs three parts: initialization, condition, and update. Example: `for (let i = 0; i < 5; i++)`",
    "Make sure your loop condition will eventually become false, or you'll create an infinite loop!",
    "Try using `console.log(i)` inside your loop to print each value.",
  ],
  "function": [
    "A function declaration looks like: `function name(param) { return value; }`",
    "Don't forget the `return` keyword! Without it, your function returns `undefined`.",
    "Make sure you're using the parameter name inside the function body.",
  ],
  "object": [
    "Objects use key-value pairs: `{ key: 'value', anotherKey: 42 }`",
    "Access object properties with dot notation: `obj.property` or bracket notation: `obj['property']`",
    "Remember to separate properties with commas!",
  ],
  "array": [
    "Arrays are ordered lists: `[1, 2, 3]`. Access elements with index: `arr[0]`",
    "Use `.push()` to add items and `.pop()` to remove the last item.",
    "Array indices start at 0, not 1!",
  ],
  "async": [
    "An async function always returns a Promise. Use `await` to wait for the result.",
    "Remember: `await` can only be used inside an `async` function.",
    "Wrap your await calls in try/catch for proper error handling.",
  ],
  // Python hints
  "indent": [
    "Python uses indentation to define code blocks. Use 4 spaces or 1 tab consistently.",
    "After a colon `:`, the next line must be indented.",
    "Make sure all lines in the same block have the same indentation level.",
  ],
  "list": [
    "Use `.append(item)` to add an item to a list.",
    "Lists are zero-indexed: `my_list[0]` returns the first element.",
    "You can use list comprehensions: `[x for x in range(10)]`",
  ],
  "dict": [
    "Access dictionary values with: `data['key']` or `data.get('key')`",
    "Use `.get('key', default)` to avoid KeyError when the key might not exist.",
    "Dictionaries use curly braces: `{'key': 'value'}`",
  ],
  // CSS hints
  "flex": [
    "To center items with flexbox: `display: flex; justify-content: center; align-items: center;`",
    "Use `flex-direction: column` to stack items vertically.",
    "The `gap` property adds space between flex items without margins.",
  ],
  // HTML hints
  "html": [
    "Use semantic tags like `<main>`, `<section>`, `<article>` instead of generic `<div>`.",
    "Every page should have exactly one `<h1>` heading.",
    "Use `<p>` for paragraphs and `<h1>` through `<h6>` for headings.",
  ],
  // Cybersecurity hints
  "tcp": [
    "TCP is connection-oriented (reliable), UDP is connectionless (fast but unreliable).",
    "TCP uses a 3-way handshake: SYN, SYN-ACK, ACK.",
    "UDP is used for streaming and gaming where speed matters more than reliability.",
  ],
  "encrypt": [
    "AES is symmetric (same key for encrypt/decrypt). RSA is asymmetric (public/private key pair).",
    "Symmetric encryption is faster but requires secure key exchange.",
    "RSA is commonly used for secure key exchange, then AES for the actual data.",
  ],
  "phish": [
    "Common phishing signs: urgent language, suspicious links, requests for personal info.",
    "Always check the sender's email address carefully—phishing often uses similar-looking domains.",
    "Legitimate companies never ask for passwords via email.",
  ],
  "penetration": [
    "The first phase of a penetration test is Reconnaissance (information gathering).",
    "Pen testing follows: Recon → Scanning → Exploitation → Post-Exploitation → Reporting.",
    "Always get written authorization before performing any penetration testing.",
  ],
  // Generic fallback
  "default": [
    "Take a step back and re-read the exercise description carefully. The answer is often simpler than you think!",
    "Try breaking the problem into smaller pieces. What's the very first thing your code needs to do?",
    "Check your syntax carefully: missing semicolons, brackets, or parentheses are the most common bugs.",
    "Think about what type of data you're working with. Is it a string, number, array, or object?",
    "Don't be afraid to start over with a clean approach. Sometimes a fresh perspective is all you need!",
  ]
};

/**
 * Generates a smart, context-aware hint using local heuristics.
 * This NEVER fails and NEVER needs an API call.
 */
export function getHeuristicHint(exerciseTitle: string, exerciseDescription: string, code: string): string {
  const context = `${exerciseTitle} ${exerciseDescription} ${code}`.toLowerCase();
  
  // Find the best matching category
  const categories = Object.keys(HINT_DATABASE).filter(k => k !== 'default');
  let bestCategory = 'default';
  
  for (const category of categories) {
    if (context.includes(category)) {
      bestCategory = category;
      break;
    }
  }
  
  const hints = HINT_DATABASE[bestCategory];
  const randomIndex = Math.floor(Math.random() * hints.length);
  return hints[randomIndex];
}


// ============================================================
// TIER 1: Web Worker AI (Optional, Enhanced Quality)
// ============================================================

export class LocalAIClient {
    private worker: Worker | null = null;
    private static instance: LocalAIClient;
    private onProgress?: (data: any) => void;
    private workerReady = false;

    private constructor() {
        if (typeof window !== 'undefined') {
            try {
                this.worker = new Worker(new URL('./local-brain.worker.ts', import.meta.url), {
                    type: 'module',
                });
                this.workerReady = true;
            } catch (e) {
                console.warn("Local AI Worker could not be initialized. Falling back to heuristic engine.", e);
                this.worker = null;
                this.workerReady = false;
            }
        }
    }

    public static getInstance(): LocalAIClient {
        if (!this.instance) {
            this.instance = new LocalAIClient();
        }
        return this.instance;
    }

    public setProgressCallback(callback: (data: any) => void) {
        this.onProgress = callback;
    }

    public isReady(): boolean {
        return this.workerReady;
    }

    public async generate(text: string, config: any = {}): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!this.worker) {
                return reject(new Error("Local AI Worker not available."));
            }

            // Add a timeout so we don't hang forever
            const timeout = setTimeout(() => {
                this.worker?.removeEventListener('message', handleMessage);
                reject(new Error("Local AI Worker timed out after 30 seconds."));
            }, 30000);

            const handleMessage = (event: MessageEvent) => {
                const { status, output, error, data } = event.data;

                if (status === 'progress') {
                    if (this.onProgress) this.onProgress(data);
                } else if (status === 'complete') {
                    clearTimeout(timeout);
                    this.worker?.removeEventListener('message', handleMessage);
                    resolve(output);
                } else if (status === 'error') {
                    clearTimeout(timeout);
                    this.worker?.removeEventListener('message', handleMessage);
                    reject(new Error(error));
                }
            };

            this.worker.addEventListener('message', handleMessage);
            this.worker.postMessage({ text, config });
        });
    }
}

export const localAi = LocalAIClient.getInstance();
