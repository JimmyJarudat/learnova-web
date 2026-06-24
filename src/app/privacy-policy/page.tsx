import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "นโยบายความเป็นส่วนตัวของ Learnova สำหรับการใช้งานบัญชีผู้ใช้และ OAuth Login",
};

const policySections = [
  {
    id: "data-collection",
    title: "ข้อมูลที่เราเก็บรวบรวม",
    items: [
      "ข้อมูลบัญชีพื้นฐาน เช่น ชื่อผู้ใช้ อีเมล ชื่อที่แสดง และรูปโปรไฟล์",
      "ข้อมูลจากการเข้าสู่ระบบด้วย OAuth เช่น Google, LINE และ GitHub ได้แก่ provider account id, อีเมลที่ผู้ให้บริการส่งมา และรูปโปรไฟล์",
      "ข้อมูลการใช้งานที่จำเป็นต่อระบบ เช่น วันที่เข้าสู่ระบบล่าสุด และข้อมูล session เพื่อรักษาสถานะการเข้าสู่ระบบ",
    ],
  },
  {
    id: "usage",
    title: "เราใช้ข้อมูลอย่างไร",
    items: [
      "ใช้เพื่อยืนยันตัวตน สร้างบัญชีผู้ใช้ และให้ผู้เรียนเข้าสู่ระบบได้อย่างปลอดภัย",
      "ใช้เพื่อแสดงชื่อและรูปโปรไฟล์ในระบบ เพื่อให้ประสบการณ์ใช้งานชัดเจนและเป็นส่วนตัวมากขึ้น",
      "ใช้เพื่อดูแลความปลอดภัย ป้องกันการใช้งานผิดปกติ และปรับปรุงคุณภาพของบริการ",
    ],
  },
  {
    id: "oauth-login",
    title: "การเข้าสู่ระบบด้วยบริการภายนอก",
    items: [
      "เมื่อผู้ใช้เลือกเข้าสู่ระบบผ่าน Google, LINE หรือ GitHub ระบบจะรับเฉพาะข้อมูลที่จำเป็นสำหรับการยืนยันตัวตนและสร้างบัญชี",
      "Learnova ไม่ได้รับหรือจัดเก็บรหัสผ่านของบัญชี Google, LINE หรือ GitHub ของผู้ใช้",
      "ผู้ใช้สามารถจัดการสิทธิ์การเชื่อมต่อแอปได้จากหน้าตั้งค่าบัญชีของผู้ให้บริการ OAuth แต่ละราย",
    ],
  },
  {
    id: "security",
    title: "การจัดเก็บและการปกป้องข้อมูล",
    items: [
      "ข้อมูลบัญชีถูกจัดเก็บในฐานข้อมูลของระบบ และจำกัดการเข้าถึงเฉพาะส่วนที่จำเป็นต่อการให้บริการ",
      "รูปโปรไฟล์จาก OAuth อาจถูกแคชไว้ในระบบเพื่อให้แสดงผลได้เสถียรขึ้นและลดการเรียกข้อมูลซ้ำจากผู้ให้บริการภายนอก",
      "เราใช้มาตรการด้านเทคนิคที่เหมาะสมเพื่อลดความเสี่ยงจากการเข้าถึงข้อมูลโดยไม่ได้รับอนุญาต",
    ],
  },
  {
    id: "sharing",
    title: "การเปิดเผยข้อมูล",
    items: [
      "เราไม่ขายข้อมูลส่วนบุคคลของผู้ใช้",
      "เราไม่เปิดเผยข้อมูลส่วนบุคคลแก่บุคคลภายนอก เว้นแต่จำเป็นต่อการให้บริการ การปฏิบัติตามกฎหมาย หรือการปกป้องสิทธิและความปลอดภัยของระบบ",
      "บริการภายนอกที่เกี่ยวข้อง เช่น ผู้ให้บริการ OAuth อาจประมวลผลข้อมูลตามนโยบายความเป็นส่วนตัวของผู้ให้บริการนั้น ๆ",
    ],
  },
  {
    id: "user-rights",
    title: "สิทธิของผู้ใช้",
    items: [
      "ผู้ใช้สามารถขอเข้าถึง แก้ไข หรือลบบัญชีและข้อมูลส่วนบุคคลที่เกี่ยวข้องกับบัญชีของตนได้",
      "เมื่อมีคำขอลบบัญชี ระบบจะดำเนินการตามความเหมาะสม โดยอาจยังคงเก็บข้อมูลบางส่วนเท่าที่จำเป็นตามกฎหมายหรือเพื่อความปลอดภัยของระบบ",
      "ผู้ใช้สามารถออกจากระบบหรือยกเลิกการเชื่อมต่อ OAuth จากผู้ให้บริการภายนอกได้ด้วยตนเอง",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <article className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 lg:py-14">
        <Link href="/" className="text-sm font-bold text-sky-700 underline-offset-4 hover:underline">
          Learnova
        </Link>

        <header className="mt-8 border-b border-slate-200 pb-8">
          <p className="text-sm font-semibold text-slate-500">Privacy Policy</p>
          <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl">
            นโยบายความเป็นส่วนตัว
          </h1>
          <p className="mt-5 text-base leading-8 text-slate-600">
            หน้านี้อธิบายวิธีที่ Learnova เก็บ ใช้ และดูแลข้อมูลส่วนบุคคลของผู้ใช้ โดยเฉพาะข้อมูลที่เกี่ยวข้องกับการเข้าสู่ระบบผ่าน OAuth เช่น Google, LINE และ GitHub
          </p>
          <p className="mt-4 text-sm font-semibold text-slate-500">วันที่มีผลบังคับใช้: 24 มิถุนายน 2569</p>
        </header>

        <nav aria-label="หัวข้อนโยบาย" className="my-8 rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-black text-slate-950">หัวข้อในหน้านี้</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {policySections.map((section) => (
              <a key={section.id} href={`#${section.id}`} className="text-sm font-semibold leading-6 text-slate-600 hover:text-sky-700">
                {section.title}
              </a>
            ))}
          </div>
        </nav>

        <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white px-5 sm:px-8">
          {policySections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-8 py-7 sm:py-8">
              <h2 className="text-xl font-black text-slate-950">{section.title}</h2>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <section className="py-7 sm:py-8">
            <h2 className="text-xl font-black text-slate-950">การเปลี่ยนแปลงนโยบาย</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
              Learnova อาจปรับปรุงนโยบายนี้เป็นครั้งคราวเพื่อให้สอดคล้องกับการพัฒนาระบบ กฎหมาย หรือข้อกำหนดของผู้ให้บริการ OAuth โดยจะแสดงวันที่มีผลบังคับใช้ล่าสุดไว้บนหน้านี้
            </p>
          </section>

          <section className="py-7 sm:py-8">
            <h2 className="text-xl font-black text-slate-950">ติดต่อเรา</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
              หากมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัว หรือประสงค์ขอจัดการข้อมูลส่วนบุคคล สามารถติดต่อ Learnova ได้ที่
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
