import { describe, expect, test } from "bun:test";
import { hashPassword, verifyPassword } from "@/server/auth/password";

describe("password hashing", () => {
  test("verifies a password against its hash", async () => {
    const passwordHash = await hashPassword("teacher-password");

    expect(await verifyPassword("teacher-password", passwordHash)).toBe(true);
  });

  test("rejects an incorrect password", async () => {
    const passwordHash = await hashPassword("teacher-password");

    expect(await verifyPassword("wrong-password", passwordHash)).toBe(false);
  });

  test("rejects an unsupported hash format", async () => {
    expect(await verifyPassword("teacher-password", "plain-text-hash")).toBe(false);
  });
});
