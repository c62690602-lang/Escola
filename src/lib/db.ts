import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
const globalDb = globalThis as unknown as { nexoPool?: Pool };
export const pool =
  globalDb.nexoPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    connectionTimeoutMillis: 5000,
  });
if (process.env.NODE_ENV !== "production") globalDb.nexoPool = pool;
export const db = drizzle(pool, { schema });
