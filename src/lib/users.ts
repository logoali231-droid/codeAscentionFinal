import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function findUser(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function createUser(email: string, password: string) {
  const existing = await findUser(email);
  if (existing) throw new Error("User already exists");

  const hashed = await bcrypt.hash(password, 10);

  return prisma.user.create({
    data: {
      email,
      password: hashed,
    },
  });
}