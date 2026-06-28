import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ",
  description:
    "เข้าสู่ระบบ Learnova เพื่อฝึกทำข้อสอบครูผู้ช่วย ดูผลวิเคราะห์ และอ่านแผนเตรียมสอบตามสังกัด",
};

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string | string[];
    registered?: string | string[];
    callbackUrl?: string | string[];
  }>;
};

const authErrorMessages: Record<string, string> = {
  OAuthCallback: "เข้าสู่ระบบด้วย OAuth ไม่สำเร็จ กรุณาลองอีกครั้ง",
  OAuthAccountNotLinked: "อีเมลนี้เคยสมัครด้วยวิธีอื่น กรุณาใช้วิธีเดิมหรือเชื่อมบัญชีภายหลัง",
  CredentialsSignin: "อีเมล username หรือรหัสผ่านไม่ถูกต้อง",
  AccessDenied: "ไม่สามารถเข้าสู่ระบบด้วยบัญชีนี้ได้",
  Configuration: "การตั้งค่าระบบเข้าสู่ระบบยังไม่สมบูรณ์",
  default: "เข้าสู่ระบบไม่สำเร็จ กรุณาลองอีกครั้ง",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const error = Array.isArray(params?.error) ? params.error[0] : params?.error;
  const errorMessage = error ? authErrorMessages[error] ?? authErrorMessages.default : null;
  const registered = Array.isArray(params?.registered) ? params.registered[0] : params?.registered;
  const callbackUrlParam = Array.isArray(params?.callbackUrl) ? params.callbackUrl[0] : params?.callbackUrl;
  const callbackUrl = callbackUrlParam?.startsWith("/") ? callbackUrlParam : "/";
  const successMessage = registered === "1" ? "สร้างบัญชีสำเร็จแล้ว กรุณาเข้าสู่ระบบด้วย username หรืออีเมลของคุณ" : null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#071f4a] text-slate-950">
      <Image
        src="/images/login-classroom-background.png"
        alt="พื้นหลังการ์ตูนครูและการเข้าสู่ระบบ"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[#071f4a]/28" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/8 via-white/0 to-[#071f4a]/24" />

      <section className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
        <div className="relative w-full max-w-[440px] overflow-hidden rounded-[28px] border border-white/45 bg-white/92 px-5 pb-5 pt-20 shadow-2xl backdrop-blur-xl sm:px-7 sm:pb-7">
          <Link href="/" className="absolute left-1/2 top-5 grid h-10 w-10 -translate-x-1/2 place-items-center rounded-xl bg-[#ffd35a] text-lg font-black text-[#071f4a] shadow-sm">
            L
          </Link>
          <LoginForm errorMessage={errorMessage} successMessage={successMessage} callbackUrl={callbackUrl} />
        </div>
      </section>
    </main>
  );
}


