

const KEY = "ai_memory";

export function saveToMemory(entry: string) {
    const existing = localStorage.getItem(KEY) || "";
    let lines = existing.split("\n").filter(Boolean);

    lines.push(entry);

    // mantém só últimos 20
    if (lines.length > 20) {
        lines = lines.slice(-20);
    }

    localStorage.setItem(KEY, lines.join("\n"));
}

export function getMemory(): string {
    return localStorage.getItem(KEY) || "";
}