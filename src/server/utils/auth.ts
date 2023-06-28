import lucia from "lucia-auth";
import { h3 } from "lucia-auth/middleware";
import prisma from "@lucia-auth/adapter-prisma";
import { prisma as prismaClient } from "@/server/libs/database";

export const auth = lucia({
  adapter: prisma(prismaClient),
  env: process.env.NODE_ENV === "development" ? "DEV" : "PROD",
  middleware: h3(),
});

export type Auth = typeof auth;
