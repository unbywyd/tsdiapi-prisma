import 'dotenv/config';
import { defineConfig, env } from "prisma/config";

/**
 * Prisma CLI configuration (Prisma 7.0+)
 * This file is used ONLY by Prisma CLI commands:
 * - prisma migrate (uses shadowDatabaseUrl for safe migration testing)
 * - prisma studio, prisma db push/pull (use DATABASE_URL)
 * - prisma generate
 * 
 * Runtime PrismaClient does NOT read this file.
 * Runtime client is configured separately in src/main.ts with adapter.
 */
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: env("DATABASE_URL"),
    shadowDatabaseUrl: env("SHADOW_DATABASE_URL"),
  },
});
