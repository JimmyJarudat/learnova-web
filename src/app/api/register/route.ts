import { NextResponse } from "next/server";
import { createRegisteredUser } from "@/server/auth/register";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { ok: false, formError: "ข้อมูลสมัครสมาชิกไม่ถูกต้อง" },
      { status: 400 },
    );
  }

  const result = await createRegisteredUser(body);

  if (!result.ok) {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result, { status: 201 });
}
