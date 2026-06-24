import { describe, expect, test } from "bun:test";
import { buildPasswordResetUrl, canRequestPasswordReset, createPasswordResetToken, hashPasswordResetToken, remainingCooldownSeconds } from "@/server/auth/password-reset-token";

describe("password reset token helpers", () => {
  test("creates URL-safe tokens", () => {
    const token = createPasswordResetToken();

    expect(token.length > 20).toBe(true);
    expect(token.includes("/")).toBe(false);
    expect(token.includes("+")).toBe(false);
  });

  test("hashes the same token consistently", () => {
    const token = "sample-token";

    expect(hashPasswordResetToken(token)).toBe(hashPasswordResetToken(token));
  });

  test("uses localhost in development reset URLs", () => {
    expect(buildPasswordResetUrl("abc123")).toBe("http://localhost:3000/reset-password/abc123");
  });
  test("allows password reset only for password accounts", () => {
    expect(canRequestPasswordReset({ passwordHash: "hash" })).toBe(true);
    expect(canRequestPasswordReset({ passwordHash: null })).toBe(false);
    expect(canRequestPasswordReset(null)).toBe(false);
  });

  test("calculates remaining cooldown seconds", () => {
    const now = new Date("2026-06-25T00:05:00.000Z");

    expect(remainingCooldownSeconds(new Date("2026-06-25T00:03:00.000Z"), 5 * 60 * 1000, now)).toBe(180);
    expect(remainingCooldownSeconds(new Date("2026-06-25T00:00:00.000Z"), 5 * 60 * 1000, now)).toBe(0);
  });
});


