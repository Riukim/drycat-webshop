import { PrismaClient } from "@/generated/prisma";

declare global {
  var __prisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.__prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "info", "warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = prisma;
}

// Graceful shutdown
if (process.env.NODE_ENV !== "production") {
  process.on('SIGINT', async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}