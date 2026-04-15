import { createUser, findUser } from "@/lib/users";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return Response.json({ error: "Missing fields" }, { status: 400 });
    }

    const existing = await findUser(email);
    if (existing) {
      return Response.json({ error: "User exists" }, { status: 400 });
    }

    const user = await createUser(email, password);

    return Response.json({ user });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}