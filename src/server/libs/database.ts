import { PrismaClient } from "@prisma/client";

export let prisma: PrismaClient;

// Somewhat prisma singleton for "sorry, too many clients already" error of hot reloads
if (process.env.NODE_ENV === "development") {
  if (!global.prisma) global.prisma = new PrismaClient();

  prisma = global.prisma;
} else {
  prisma = new PrismaClient();
}
