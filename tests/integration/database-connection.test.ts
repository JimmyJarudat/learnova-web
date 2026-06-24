import { describe, expect, test } from "bun:test";
import pg from "pg";

const { Client } = pg;

describe("database connection", () => {
  test("connects to the configured PostgreSQL database", async () => {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
      throw new Error("DATABASE_URL is missing. Add it to your .env file first.");
    }

    const client = new Client({
      connectionString: databaseUrl,
      connectionTimeoutMillis: 5000,
    });

    await client.connect();

    try {
      const result = await client.query<{ database: string; user: string }>(
        "select current_database() as database, current_user as user",
      );

      expect(result.rows[0]?.database).toBeTruthy();
      expect(result.rows[0]?.user).toBeTruthy();
    } finally {
      await client.end();
    }
  });
});
