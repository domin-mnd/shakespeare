import lucia from "lucia-auth";
import { h3 } from "lucia-auth/middleware";
import prisma from "@lucia-auth/adapter-prisma";
import { PrismaClient } from "@prisma/client";

// Polyfill crypto global
import "lucia-auth/polyfill/node";

export const auth = lucia({
  adapter: prisma(new PrismaClient()),
  env: process.env.NODE_ENV ? "DEV" : "PROD",
  middleware: h3(),
});

export type Auth = typeof auth;
