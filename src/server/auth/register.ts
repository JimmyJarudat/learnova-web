import { hashPassword } from "./password";

type RegisterInput = {
  displayName?: unknown;
  username?: unknown;
  email?: unknown;
  password?: unknown;
  confirmPassword?: unknown;
  acceptedTerms?: unknown;
};

export type RegisterFieldErrors = Partial<Record<"displayName" | "username" | "email" | "password" | "confirmPassword" | "acceptedTerms", string>>;

export type NormalizedRegisterInput = {
  displayName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptedTerms: boolean;
};

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeRegisterInput(input: RegisterInput): NormalizedRegisterInput {
  return {
    displayName: asString(input.displayName),
    username: asString(input.username).toLowerCase(),
    email: asString(input.email).toLowerCase(),
    password: typeof input.password === "string" ? input.password : "",
    confirmPassword: typeof input.confirmPassword === "string" ? input.confirmPassword : "",
    acceptedTerms: input.acceptedTerms === true || input.acceptedTerms === "on",
  };
}

export function validateRegisterInput(input: RegisterInput) {
  const normalized = normalizeRegisterInput(input);
  const fieldErrors: RegisterFieldErrors = {};

  if (!normalized.displayName) {
    fieldErrors.displayName = "กรุณากรอกชื่อที่แสดง";
  } else if (normalized.displayName.length > 80) {
    fieldErrors.displayName = "ชื่อที่แสดงต้องไม่เกิน 80 ตัวอักษร";
  }

  if (!/^[a-z0-9_]{3,24}$/.test(normalized.username)) {
    fieldErrors.username = "username ใช้ a-z, 0-9, _ และยาว 3-24 ตัวอักษร";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.email)) {
    fieldErrors.email = "กรุณากรอกอีเมลให้ถูกต้อง";
  }

  if (normalized.password.length < 8) {
    fieldErrors.password = "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร";
  }

  if (normalized.confirmPassword !== normalized.password) {
    fieldErrors.confirmPassword = "รหัสผ่านยืนยันไม่ตรงกัน";
  }

  if (!normalized.acceptedTerms) {
    fieldErrors.acceptedTerms = "กรุณารับทราบนโยบายและเงื่อนไขการใช้งาน";
  }

  return {
    input: normalized,
    fieldErrors,
    isValid: Object.keys(fieldErrors).length === 0,
  };
}

export async function createRegisteredUser(input: RegisterInput) {
  const validation = validateRegisterInput(input);

  if (!validation.isValid) {
    return { ok: false as const, fieldErrors: validation.fieldErrors };
  }

  const { default: prisma } = await import("@/lib/db/postgres");

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { username: validation.input.username },
        { email: validation.input.email },
      ],
    },
    select: {
      username: true,
      email: true,
      deletedAt: true,
    },
  });

  if (existingUser) {
    return {
      ok: false as const,
      fieldErrors: {
        ...(existingUser.username === validation.input.username ? { username: "username นี้ถูกใช้แล้ว" } : {}),
        ...(existingUser.email === validation.input.email ? { email: "อีเมลนี้ถูกใช้แล้ว" } : {}),
      },
    };
  }

  const user = await prisma.user.create({
    data: {
      username: validation.input.username,
      email: validation.input.email,
      displayName: validation.input.displayName,
      passwordHash: await hashPassword(validation.input.password),
      lastLoginAt: new Date(),
    },
    select: {
      id: true,
      username: true,
      email: true,
      displayName: true,
    },
  });

  return { ok: true as const, user };
}


