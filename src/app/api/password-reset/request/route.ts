import { NextResponse } from "next/server";
import { requestPasswordReset } from "@/server/auth/password-reset";

const responseMessages = {
  sent: "ส่งลิงก์ตั้งรหัสผ่านใหม่ไปที่อีเมลนี้แล้ว",
  send_failed: "พบอีเมลนี้ในระบบ แต่ส่งอีเมลไม่สำเร็จ กรุณาตรวจสอบ SMTP หรืออีเมลผู้ส่ง",
  not_found: "ไม่พบบัญชีที่ใช้อีเมลนี้",
  oauth_only: "บัญชีนี้เข้าสู่ระบบด้วย OAuth จึงไม่มีรหัสผ่านให้รีเซ็ต",
  cooldown: "เพิ่งส่งคำขอไปแล้ว กรุณารอก่อนส่งอีกครั้ง",
} as const;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { ok: false, error: "กรุณากรอกอีเมลให้ถูกต้อง" },
      { status: 400 },
    );
  }

  const result = await requestPasswordReset(email);

  return NextResponse.json({
    ok: true,
    status: result.status,
    emailSent: result.emailSent,
    message: result.status === "cooldown" && result.retryAfterSeconds
      ? `${responseMessages[result.status]} (${Math.ceil(result.retryAfterSeconds / 60)} นาที)`
      : responseMessages[result.status],
    retryAfterSeconds: result.retryAfterSeconds,
  });
}

