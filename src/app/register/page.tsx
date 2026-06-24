import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "สมัครสมาชิก",
  description: "สมัครสมาชิก Learnova เพื่อเริ่มฝึกทำข้อสอบครูผู้ช่วยและติดตามแผนอ่านสอบของคุณ",
};

const benefits = [
  "บันทึกผลสอบและดูพัฒนาการของตัวเอง",
  "เลือกสนามที่สนใจ เช่น สพฐ. สอศ. สกร. หรือ อปท.",
  "อ่านต่อจากแผนเดิมได้ ไม่ต้องเริ่มนับหนึ่งทุกครั้ง",
  "เก็บหัวข้อที่ยังอ่อนเพื่อกลับมาทบทวน",
];

const previewStats = [
  ["สนาม", "4 สังกัด"],
  ["แผน", "45 วัน"],
  ["เฉลย", "ละเอียด"],
];

export default function RegisterPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#071f4a] text-slate-950">
      <Image
        src="/images/login-classroom-background.png"
        alt="พื้นหลังการ์ตูนครูและการสมัครสมาชิก"
        fill
        priority
        sizes="50vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[#071f4a]/38" />
      <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/0 to-[#071f4a]/30" />

      <section className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-[30px] border border-white/45 bg-white shadow-2xl lg:grid-cols-[0.95fr_1fr]">
          <aside className="relative hidden min-h-[640px] overflow-hidden bg-[#071f4a] lg:block">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_22%,#46bdf522,transparent_34%),linear-gradient(135deg,#071f4a_0%,#0b66c3_54%,#eaf4ff_100%)]" />
            <Image
              src="/images/signup-welcome.png"
              alt="ครูชุดข้าราชการยืนไหว้ต้อนรับผู้สมัคร Learnova"
              width={520}
              height={620}
              priority
              sizes="(min-width: 1024px) 35vw, 100vw"
              className="absolute left-1/2 top-4 z-10 h-[15%] w-auto -translate-x-1/2 object-contain drop-shadow-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#071f4a]/70 via-[#071f4a]/90 to-[#071f4a]/96" />
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent to-[#071f4a]/55" />


            <div className="absolute inset-x-0 top-[18%] z-20 flex flex-col px-8 pb-8 pt-4 text-center text-white">
              <p className="text-sm font-black text-[#ffd35a]">ยินดีต้อนรับสู่ Learnova</p>
              <h1 className="mx-auto mt-3 max-w-[380px] text-4xl font-black leading-tight">
                สมัครครั้งเดียว แล้วเริ่มเตรียมสอบครูผู้ช่วยอย่างเป็นระบบ
              </h1>
              <p className="mx-auto mt-4 max-w-[390px] text-sm font-semibold leading-7 text-white/76">
                บัญชีของคุณจะช่วยเก็บผลสอบ แผนอ่าน และหัวข้อที่ต้องทบทวน เพื่อให้การเตรียมสอบแต่ละวันต่อเนื่องและเห็นภาพชัดขึ้น
              </p>

              <div className="mx-auto mt-5 grid w-full max-w-[380px] grid-cols-3 gap-2">
                {previewStats.map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-white/14 bg-white/10 p-3 backdrop-blur">
                    <p className="text-[11px] font-bold text-white/56">{label}</p>
                    <p className="mt-1 text-sm font-black text-white">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mx-auto mt-5 max-w-[390px] space-y-3 text-left">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex gap-3 text-sm font-bold leading-6 text-white/86">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#ffd35a]" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <div className="relative flex items-start bg-[#fbfcff] px-5 pb-2 pt-8 sm:px-6 sm:pb-6 sm:pt-10 lg:px-8 lg:pb-8 lg:pt-10">
            
            <div className="mx-auto w-full max-w-[440px]">
              <div className="mb-6 text-center">
                <h2 className="mt-2 text-4xl font-black leading-tight text-[#071f4a]">สมัครสมาชิก</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                  สร้างบัญชีเพื่อบันทึกผลสอบและอ่านต่อจากจุดเดิม
                </p>
              </div>

              <RegisterForm />

              <p className="mt-6 text-center text-sm font-semibold text-slate-600">
                มีบัญชีแล้ว?{" "}
                <Link href="/login" className="font-black text-[#0b66c3] hover:text-[#084f99]">
                  เข้าสู่ระบบ
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}















