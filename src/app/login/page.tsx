import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "เข้าสู่ระบบ",
  description:
    "เข้าสู่ระบบ Learnova เพื่อฝึกทำข้อสอบครูผู้ช่วย ดูผลวิเคราะห์ และอ่านแผนเตรียมสอบตามสังกัด",
};

const socialProviders = [
  {
    name: "Google",
    icon: "https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg",
    className: "bg-white hover:border-slate-300",
  },
  {
    name: "Facebook",
    icon: "https://cdn.simpleicons.org/facebook/1877F2",
    className: "bg-white hover:border-[#1877f2]/45",
  },
  {
    name: "LINE",
    icon: "https://cdn.simpleicons.org/line/06C755",
    className: "bg-white hover:border-[#06c755]/45",
  },
  {
    name: "GitHub",
    icon: "https://cdn.simpleicons.org/github/181717",
    className: "bg-white hover:border-slate-400",
  },
];

export default function LoginPage() {
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

      <Link
        href="/"
        className="absolute left-4 top-4 z-20 rounded-full bg-white/90 px-4 py-2 text-sm font-black text-[#071f4a] shadow-lg backdrop-blur transition hover:-translate-y-0.5 hover:bg-white sm:left-6 sm:top-6"
      >
        กลับหน้าแรก
      </Link>

      <section className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-[440px] overflow-hidden rounded-[28px] border border-white/45 bg-white/92 p-5 shadow-2xl backdrop-blur-xl sm:p-7">
          <div className="mb-6 text-center">
            <Link href="/" className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#ffd35a] text-2xl font-black text-[#071f4a] shadow-sm">
              L
            </Link>
            <h1 className="mt-4 text-4xl font-black leading-tight text-[#071f4a]">เข้าสู่ระบบ</h1>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
              กลับมาทำข้อสอบต่อและดูผลวิเคราะห์ของคุณ
            </p>
          </div>

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

          <div className="flex items-center justify-center gap-3">
            {socialProviders.map((provider) => (
              <button
                key={provider.name}
                type="button"
                aria-label={`เข้าสู่ระบบด้วย ${provider.name}`}
                title={provider.name}
                className={`grid h-10 w-10 place-items-center rounded-full border border-slate-200 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${provider.className}`}
              >
                <img src={provider.icon} alt="" className="h-5 w-5" />
              </button>
            ))}
          </div>

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





