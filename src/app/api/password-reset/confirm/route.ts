import { NextResponse } from "next/server";
import { resetPasswordWithToken } from "@/server/auth/password-reset";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const confirmPassword = typeof body?.confirmPassword === "string" ? body.confirmPassword : "";

  if (!token) {
    return NextResponse.json(
      { ok: false, error: "ไม่พบ token สำหรับตั้งรหัสผ่านใหม่" },
      { status: 400 },
    );
  }

  if (password !== confirmPassword) {
    return NextResponse.json(
      { ok: false, error: "รหัสผ่านยืนยันไม่ตรงกัน" },
      { status: 400 },
    );
  }

  const result = await resetPasswordWithToken(token, password);

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
