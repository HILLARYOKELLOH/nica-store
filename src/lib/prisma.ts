import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER ?? "root",
  password: process.env.DB_PASSWORD ?? "rootpassword",
  database: process.env.DB_NAME ?? "nica_store",
  connectionLimit: 5,
});

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter, log: ["error"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;