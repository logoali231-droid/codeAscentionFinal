import { createUser, findUser } from "@/lib/users";
import bcrypt from "bcrypt";

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

    const hashed = await bcrypt.hash(password, 10);

    const user = await createUser(email, hashed);

    return Response.json({ user });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}