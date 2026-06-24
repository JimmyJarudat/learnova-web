import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { SocialLoginButtons } from "./social-login-buttons";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ",
  description:
    "เข้าสู่ระบบ Learnova เพื่อฝึกทำข้อสอบครูผู้ช่วย ดูผลวิเคราะห์ และอ่านแผนเตรียมสอบตามสังกัด",
};

type LoginPageProps = {
  searchParams?: Promise<{
    error?: string | string[];
  }>;
};

const authErrorMessages: Record<string, string> = {
  OAuthCallback: "เข้าสู่ระบบด้วย Google ไม่สำเร็จ กรุณาลองอีกครั้ง",
  OAuthAccountNotLinked: "อีเมลนี้เคยสมัครด้วยวิธีอื่น กรุณาใช้วิธีเดิมหรือเชื่อมบัญชีภายหลัง",
  AccessDenied: "ไม่สามารถเข้าสู่ระบบด้วยบัญชีนี้ได้",
  Configuration: "การตั้งค่าระบบเข้าสู่ระบบยังไม่สมบูรณ์",
  default: "เข้าสู่ระบบไม่สำเร็จ กรุณาลองอีกครั้ง",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const error = Array.isArray(params?.error) ? params.error[0] : params?.error;
  const errorMessage = error ? authErrorMessages[error] ?? authErrorMessages.default : null;
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
          <div className="mb-6 text-center">
            <h1 className="text-4xl font-black leading-tight text-[#071f4a]">เข้าสู่ระบบ</h1>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
              กลับมาทำข้อสอบต่อและดูผลวิเคราะห์ของคุณ
            </p>
          </div>

          {errorMessage ? (
            <div className="mb-5 rounded-2xl border border-[#ffc9c9] bg-[#fff1f1] px-4 py-3 text-sm font-bold leading-6 text-[#b42318]">
              {errorMessage}
            </div>
          ) : null}

          <form className="grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-black text-slate-700">อีเมลหรือ username</span>
              <input
                type="text"
                name="identifier"
                placeholder="teacher@example.com"
                className="h-[54px] rounded-2xl border border-slate-200 bg-white px-4 text-base font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0b66c3] focus:ring-4 focus:ring-[#0b66c3]/10"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-black text-slate-700">รหัสผ่าน</span>
              <input
                type="password"
                name="password"
                placeholder="กรอกรหัสผ่าน"
                className="h-[54px] rounded-2xl border border-slate-200 bg-white px-4 text-base font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0b66c3] focus:ring-4 focus:ring-[#0b66c3]/10"
              />
            </label>

            <div className="flex justify-end text-sm font-bold">
              <Link href="/forgot-password" className="text-[#0b66c3] hover:text-[#084f99]">
                ลืมรหัสผ่าน?
              </Link>
            </div>
            <button
              type="button"
              className="h-[54px] rounded-2xl bg-[#ffd35a] text-base font-black text-[#071f4a] shadow-lg shadow-[#ffd35a]/30 transition hover:-translate-y-0.5 hover:bg-[#f6bf22]"
            >
              เข้าสู่ระบบ
            </button>
          </form>

          <div className="my-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-xs font-black text-slate-400">
            <span className="h-px bg-slate-200" />
            <span>หรือเข้าสู่ระบบด้วย</span>
            <span className="h-px bg-slate-200" />
          </div>

          <SocialLoginButtons />

          <p className="mt-5 text-center text-xs font-semibold leading-5 text-slate-500">
            การเข้าสู่ระบบถือว่าคุณรับทราบ
            <Link href="/privacy-policy" className="ml-1 font-black text-[#0b66c3] hover:text-[#084f99]">
              นโยบายความเป็นส่วนตัว
            </Link>
            <span className="mx-1">และ</span>
            <Link href="/terms" className="font-black text-[#0b66c3] hover:text-[#084f99]">
              เงื่อนไขการใช้งาน
            </Link>
          </p>
          <p className="mt-2 text-center text-xs font-semibold leading-5 text-slate-500">
            ต้องการลบบัญชีหรือข้อมูลส่วนบุคคล?
            <Link href="/delete-account" className="ml-1 font-black text-[#0b66c3] hover:text-[#084f99]">
              ดูขั้นตอนที่นี่
            </Link>
          </p>

          <p className="mt-6 text-center text-sm font-semibold text-slate-600">
            ยังไม่มีบัญชี?{" "}
            <Link href="/register" className="font-black text-[#0b66c3] hover:text-[#084f99]">
              สมัครสมาชิก
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}






