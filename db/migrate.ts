import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import "dotenv/config";

const sql = postgres(process.env.DB_URL || "", { max: 1 });
const db = drizzle(sql);

const m = async () => {
  await migrate(db, { migrationsFolder: "drizzle" });
  await sql.end();
};

m();
