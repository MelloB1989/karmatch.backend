import type { Config } from "drizzle-kit";

export default {
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql", // 'pg' | 'mysql2' | 'better-sqlite' | 'libsql' | 'turso'
  dbCredentials: {
    host: "localhost",
    user: "admin",
    password: "Mellob198978SadcDWFewd",
    database: "karmatch",
    ssl: false,
  },
} satisfies Config;
