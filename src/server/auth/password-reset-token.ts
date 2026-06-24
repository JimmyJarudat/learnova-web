import crypto from "node:crypto";

const resetTokenByteLength = 32;

export function hashPasswordResetToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function createPasswordResetToken() {
  return crypto.randomBytes(resetTokenByteLength).toString("base64url");
}

function appBaseUrl() {
  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3000";
  }

  return process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "";
}

export function buildPasswordResetUrl(token: string) {
  return `${appBaseUrl()}/reset-password/${encodeURIComponent(token)}`;
}

export function canRequestPasswordReset(user: { passwordHash?: string | null } | null | undefined) {
  return Boolean(user?.passwordHash);
}

export function remainingCooldownSeconds(lastRequestedAt: Date | null | undefined, cooldownMs: number, now = new Date()) {
  if (!lastRequestedAt) {
    return 0;
  }

  const remainingMs = cooldownMs - (now.getTime() - lastRequestedAt.getTime());
  return Math.max(0, Math.ceil(remainingMs / 1000));
}
