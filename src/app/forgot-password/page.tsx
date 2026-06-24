import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = {
  title: "ลืมรหัสผ่าน",
  description: "ขอลิงก์ตั้งรหัสผ่านใหม่สำหรับบัญชี Learnova",
};

export default function ForgotPasswordPage() {
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
            <p className="text-sm font-black uppercase tracking-normal text-[#0b66c3]">Reset Password</p>
            <h1 className="mt-2 text-4xl font-black leading-tight text-[#071f4a]">ลืมรหัสผ่าน</h1>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
              กรอกอีเมลที่ใช้สมัคร ระบบจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ไปยังอีเมลของคุณ
            </p>
          </div>

          <ForgotPasswordForm />
        </div>
      </section>
    </main>
  );
}

