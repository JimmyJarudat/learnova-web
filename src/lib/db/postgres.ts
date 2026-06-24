import pg from "pg";

const { Pool } = pg;

declare global {
  var learnovaPgPool: pg.Pool | undefined;
}

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is missing.");
  }

  return databaseUrl;
}

export const db =
  globalThis.learnovaPgPool ??
  new Pool({
    connectionString: getDatabaseUrl(),
    max: 10,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.learnovaPgPool = db;
}
