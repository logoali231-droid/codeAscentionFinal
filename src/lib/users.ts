import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const globalForPrisma = globalThis as any

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production")
  globalForPrisma.prisma = prisma

export async function findUser(email: string) {
  if (!email || typeof email !== "string") return null;

  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      password: true,
    },
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