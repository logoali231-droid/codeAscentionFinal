export function login(email: string) {
  localStorage.setItem("user", JSON.stringify({ email }));
}

export function logout() {
  localStorage.removeItem("user");
}

export function getUser() {
  const raw = localStorage.getItem("user");
  if (!raw) return null;
  return JSON.parse(raw);
}