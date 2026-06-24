import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Delete Account",
  description: "คำแนะนำการลบบัญชีและข้อมูลส่วนบุคคลของ Learnova สำหรับผู้ใช้ OAuth",
};

const deletionSteps = [
  "ส่งอีเมลจากอีเมลเดียวกับบัญชี Learnova ของคุณมาที่ privacy@learnova.com",
  "ระบุหัวข้ออีเมลว่า Delete Learnova Account",
  "ระบุชื่อที่แสดงในระบบ และผู้ให้บริการที่ใช้เข้าสู่ระบบ เช่น Google, LINE, GitHub หรือ Facebook",
  "ทีมงานจะตรวจสอบคำขอและยืนยันตัวตนตามความเหมาะสมก่อนดำเนินการลบบัญชี",
];

const deletedData = [
  "ข้อมูลบัญชี เช่น username, email, ชื่อที่แสดง และรูปโปรไฟล์",
  "ข้อมูลการเชื่อมต่อบัญชี OAuth เช่น provider account id และอีเมลจากผู้ให้บริการ",
  "ข้อมูล session หรือข้อมูลการเข้าสู่ระบบที่ไม่จำเป็นต่อการให้บริการอีกต่อไป",
];

const retainedData = [
  "ข้อมูลบางส่วนอาจถูกเก็บไว้ชั่วคราวเท่าที่จำเป็นเพื่อความปลอดภัย การตรวจสอบการใช้งานผิดปกติ หรือการปฏิบัติตามกฎหมาย",
  "ข้อมูลที่ถูกทำให้ไม่สามารถระบุตัวบุคคลได้อาจถูกใช้เพื่อวิเคราะห์และปรับปรุงคุณภาพของบริการ",
];

export default function DeleteAccountPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <article className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 lg:py-14">
        <Link href="/" className="text-sm font-bold text-sky-700 underline-offset-4 hover:underline">
          Learnova
        </Link>

        <header className="mt-8 border-b border-slate-200 pb-8">
          <p className="text-sm font-semibold text-slate-500">Account Deletion</p>
          <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl">
            การลบบัญชีและข้อมูลผู้ใช้
          </h1>
          <p className="mt-5 text-base leading-8 text-slate-600">
            ผู้ใช้ Learnova สามารถขอลบบัญชีและข้อมูลส่วนบุคคลที่เกี่ยวข้องกับบัญชีของตนได้ หน้านี้จัดทำขึ้นเพื่ออธิบายขั้นตอนการส่งคำขอ รวมถึงข้อมูลที่จะถูกลบหรืออาจยังคงเก็บไว้ตามความจำเป็น
          </p>
          <p className="mt-4 text-sm font-semibold text-slate-500">วันที่มีผลบังคับใช้: 24 มิถุนายน 2569</p>
        </header>

        <div className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white px-5 sm:px-8">
          <section className="py-7 sm:py-8">
            <h2 className="text-xl font-black text-slate-950">วิธีขอลบบัญชี</h2>
            <ol className="mt-4 space-y-3 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
              {deletionSteps.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-sky-100 text-xs font-black text-sky-700">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="py-7 sm:py-8">
            <h2 className="text-xl font-black text-slate-950">ข้อมูลที่จะถูกลบ</h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
              {deletedData.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="py-7 sm:py-8">
            <h2 className="text-xl font-black text-slate-950">ข้อมูลที่อาจยังคงเก็บไว้ชั่วคราว</h2>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
              {retainedData.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="py-7 sm:py-8">
            <h2 className="text-xl font-black text-slate-950">ระยะเวลาดำเนินการ</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
              หลังได้รับคำขอและตรวจสอบข้อมูลเรียบร้อยแล้ว Learnova จะดำเนินการลบบัญชีภายในระยะเวลาที่เหมาะสม โดยทั่วไปไม่เกิน 30 วัน เว้นแต่มีเหตุจำเป็นด้านความปลอดภัยหรือข้อกำหนดทางกฎหมาย
            </p>
          </section>

          <section className="py-7 sm:py-8">
            <h2 className="text-xl font-black text-slate-950">ติดต่อเรา</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
              ส่งคำขอลบบัญชีหรือสอบถามเรื่องข้อมูลส่วนบุคคลได้ที่
              <a href="mailto:privacy@learnova.com" className="ml-1 font-bold text-sky-700 underline-offset-4 hover:underline">
                privacy@learnova.com
              </a>
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
