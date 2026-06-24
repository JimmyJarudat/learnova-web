import { randomUUID } from "node:crypto";
import prisma from "@/lib/db/postgres";
import { PasswordResetRequestEmailService } from "@/templates/emails/password-reset-request";
import { hashPassword } from "./password";
import { buildPasswordResetUrl, canRequestPasswordReset, createPasswordResetToken, hashPasswordResetToken, remainingCooldownSeconds } from "./password-reset-token";

export const passwordResetExpiryMinutes = 30;
export const passwordResetCooldownMinutes = 5;

type PasswordResetStatus = "sent" | "send_failed" | "not_found" | "oauth_only" | "cooldown";

type PasswordResetRequestRow = {
  createdAt: Date;
};

type PasswordResetTokenRow = {
  id: string;
  userId: string;
  expiresAt: Date;
  usedAt: Date | null;
};

async function findUserByEmail(email: string) {
  return prisma.user.findFirst({
    where: {
      email: email.trim().toLowerCase(),
      deletedAt: null,
    },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      passwordHash: true,
    },
  });
}

async function getLatestResetRequest(userId: string) {
  const rows = await prisma.$queryRaw<PasswordResetRequestRow[]>`
    SELECT "createdAt"
    FROM "password_reset_tokens"
    WHERE "userId" = ${userId}
    ORDER BY "createdAt" DESC
    LIMIT 1
  `;

  return rows[0] ?? null;
}

export async function requestPasswordReset(email: string): Promise<{ ok: true; status: PasswordResetStatus; emailSent: boolean; retryAfterSeconds?: number; error?: string }> {
  const user = await findUserByEmail(email);

  if (!user) {
    return { ok: true, status: "not_found", emailSent: false };
  }

  if (!canRequestPasswordReset(user)) {
    return { ok: true, status: "oauth_only", emailSent: false };
  }

  const latestRequest = await getLatestResetRequest(user.id);
  const retryAfterSeconds = remainingCooldownSeconds(
    latestRequest?.createdAt,
    passwordResetCooldownMinutes * 60 * 1000,
  );

  if (retryAfterSeconds > 0) {
    return { ok: true, status: "cooldown", emailSent: false, retryAfterSeconds };
  }

  const token = createPasswordResetToken();
  const tokenHash = hashPasswordResetToken(token);
  const expiresAt = new Date(Date.now() + passwordResetExpiryMinutes * 60 * 1000);

  await prisma.$transaction([
    prisma.$executeRaw`
      UPDATE "password_reset_tokens"
      SET "usedAt" = NOW()
      WHERE "userId" = ${user.id}
        AND "usedAt" IS NULL
    `,
    prisma.$executeRaw`
      INSERT INTO "password_reset_tokens" ("id", "userId", "tokenHash", "expiresAt", "createdAt")
      VALUES (${randomUUID()}, ${user.id}, ${tokenHash}, ${expiresAt}, NOW())
    `,
  ]);

  const resetUrl = buildPasswordResetUrl(token);
  const result = await PasswordResetRequestEmailService.send({
    username: user.displayName ?? user.username,
    email: user.email,
    resetUrl,
    expiryMinutes: passwordResetExpiryMinutes,
  });

  return {
    ok: true,
    status: result.success ? "sent" : "send_failed",
    emailSent: result.success,
    error: result.error,
  };
}

export async function findValidPasswordResetToken(token: string) {
  if (!token) {
    return null;
  }

  const tokenHash = hashPasswordResetToken(token);
  const rows = await prisma.$queryRaw<PasswordResetTokenRow[]>`
    SELECT "id", "userId", "expiresAt", "usedAt"
    FROM "password_reset_tokens"
    WHERE "tokenHash" = ${tokenHash}
    LIMIT 1
  `;
  const row = rows[0];

  if (!row || row.usedAt || row.expiresAt.getTime() <= Date.now()) {
    return null;
  }

  return row;
}

export async function resetPasswordWithToken(token: string, password: string) {
  if (password.length < 8) {
    return { ok: false as const, error: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" };
  }

  const resetToken = await findValidPasswordResetToken(token);

  if (!resetToken) {
    return { ok: false as const, error: "ลิงก์ตั้งรหัสผ่านใหม่ไม่ถูกต้องหรือหมดอายุแล้ว" };
  }

  const passwordHash = await hashPassword(password);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
      select: { id: true },
    }),
    prisma.$executeRaw`
      UPDATE "password_reset_tokens"
      SET "usedAt" = NOW()
      WHERE "id" = ${resetToken.id}
    `,
  ]);

  return { ok: true as const };
}



