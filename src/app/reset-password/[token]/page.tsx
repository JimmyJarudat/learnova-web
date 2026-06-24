import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { findValidPasswordResetToken } from "@/server/auth/password-reset";
import { ResetPasswordForm } from "./reset-password-form";

export const metadata: Metadata = {
  title: "ตั้งรหัสผ่านใหม่",
  description: "ตั้งรหัสผ่านใหม่สำหรับบัญชี Learnova",
};

type ResetPasswordPageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function ResetPasswordPage({ params }: ResetPasswordPageProps) {
  const { token } = await params;
  const resetToken = await findValidPasswordResetToken(token);
  const isValid = Boolean(resetToken);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#071f4a] text-slate-950">
      <Image
        src="/images/login-classroom-background.png"
        alt="พื้นหลังการ์ตูนครูและการตั้งรหัสผ่านใหม่"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[#071f4a]/32" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/8 via-white/0 to-[#071f4a]/24" />

      <section className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
        <div className="relative w-full max-w-[440px] overflow-hidden rounded-[28px] border border-white/45 bg-white/92 px-5 pb-5 pt-20 shadow-2xl backdrop-blur-xl sm:px-7 sm:pb-7">
          <Link href="/" className="absolute left-1/2 top-5 grid h-10 w-10 -translate-x-1/2 place-items-center rounded-xl bg-[#ffd35a] text-lg font-black text-[#071f4a] shadow-sm">
            L
          </Link>

          <div className="mb-6 text-center">
            <p className="text-sm font-black uppercase tracking-normal text-[#0b66c3]">New Password</p>
            <h1 className="mt-2 text-4xl font-black leading-tight text-[#071f4a]">ตั้งรหัสผ่านใหม่</h1>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
              {isValid ? "กรอกรหัสผ่านใหม่สำหรับบัญชีของคุณ" : "ลิงก์ตั้งรหัสผ่านใหม่ไม่ถูกต้องหรือหมดอายุแล้ว"}
            </p>
          </div>

          {isValid ? (
            <ResetPasswordForm token={token} />
          ) : (
            <div className="rounded-[24px] border border-[#ffc9c9] bg-[#fff1f1] p-5 text-center shadow-sm">
              <p className="text-sm font-bold leading-6 text-[#b42318]">
                กรุณาขอลิงก์ตั้งรหัสผ่านใหม่อีกครั้ง
              </p>
              <Link href="/forgot-password" className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-[#0b66c3] px-5 text-sm font-black text-white hover:bg-[#084f99]">
                ขอรหัสผ่านใหม่
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
