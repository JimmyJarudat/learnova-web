import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "นโยบายความเป็นส่วนตัวของ Learnova สำหรับการใช้งานบัญชีผู้ใช้และ OAuth Login",
};

const policySections = [
  {
    title: "ข้อมูลที่เราเก็บรวบรวม",
    items: [
      "ข้อมูลบัญชีพื้นฐาน เช่น ชื่อผู้ใช้ อีเมล ชื่อที่แสดง และรูปโปรไฟล์",
      "ข้อมูลจากการเข้าสู่ระบบด้วย OAuth เช่น Google, LINE และ GitHub ได้แก่ provider account id, อีเมลที่ผู้ให้บริการส่งมา และรูปโปรไฟล์",
      "ข้อมูลการใช้งานที่จำเป็นต่อระบบ เช่น วันที่เข้าสู่ระบบล่าสุด และข้อมูล session เพื่อรักษาสถานะการเข้าสู่ระบบ",
    ],
  },
  {
    title: "เราใช้ข้อมูลอย่างไร",
    items: [
      "ใช้เพื่อยืนยันตัวตน สร้างบัญชีผู้ใช้ และให้ผู้เรียนเข้าสู่ระบบได้อย่างปลอดภัย",
      "ใช้เพื่อแสดงชื่อและรูปโปรไฟล์ในระบบ เพื่อให้ประสบการณ์ใช้งานชัดเจนและเป็นส่วนตัวมากขึ้น",
      "ใช้เพื่อดูแลความปลอดภัย ป้องกันการใช้งานผิดปกติ และปรับปรุงคุณภาพของบริการ",
    ],
  },
  {
    title: "การเข้าสู่ระบบด้วยบริการภายนอก",
    items: [
      "เมื่อผู้ใช้เลือกเข้าสู่ระบบผ่าน Google, LINE หรือ GitHub ระบบจะรับเฉพาะข้อมูลที่จำเป็นสำหรับการยืนยันตัวตนและสร้างบัญชี",
      "Learnova ไม่ได้รับหรือจัดเก็บรหัสผ่านของบัญชี Google, LINE หรือ GitHub ของผู้ใช้",
      "ผู้ใช้สามารถจัดการสิทธิ์การเชื่อมต่อแอปได้จากหน้าตั้งค่าบัญชีของผู้ให้บริการ OAuth แต่ละราย",
    ],
  },
  {
    title: "การจัดเก็บและการปกป้องข้อมูล",
    items: [
      "ข้อมูลบัญชีถูกจัดเก็บในฐานข้อมูลของระบบ และจำกัดการเข้าถึงเฉพาะส่วนที่จำเป็นต่อการให้บริการ",
      "รูปโปรไฟล์จาก OAuth อาจถูกแคชไว้ในระบบเพื่อให้แสดงผลได้เสถียรขึ้นและลดการเรียกข้อมูลซ้ำจากผู้ให้บริการภายนอก",
      "เราใช้มาตรการด้านเทคนิคที่เหมาะสมเพื่อลดความเสี่ยงจากการเข้าถึงข้อมูลโดยไม่ได้รับอนุญาต",
    ],
  },
  {
    title: "การเปิดเผยข้อมูล",
    items: [
      "เราไม่ขายข้อมูลส่วนบุคคลของผู้ใช้",
      "เราไม่เปิดเผยข้อมูลส่วนบุคคลแก่บุคคลภายนอก เว้นแต่จำเป็นต่อการให้บริการ การปฏิบัติตามกฎหมาย หรือการปกป้องสิทธิและความปลอดภัยของระบบ",
      "บริการภายนอกที่เกี่ยวข้อง เช่น ผู้ให้บริการ OAuth อาจประมวลผลข้อมูลตามนโยบายความเป็นส่วนตัวของผู้ให้บริการนั้น ๆ",
    ],
  },
  {
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
    <main className="min-h-screen bg-[#f6f8fb] text-slate-900">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-5 py-12 sm:px-8 lg:py-16">
        <div className="rounded-[2rem] border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-10 sm:py-10">
          <p className="text-sm font-semibold text-sky-700">Learnova</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            นโยบายความเป็นส่วนตัว
          </h1>
          <p className="mt-4 text-base leading-8 text-slate-600">
            หน้านี้อธิบายวิธีที่ Learnova เก็บ ใช้ และดูแลข้อมูลส่วนบุคคลของผู้ใช้ โดยเฉพาะข้อมูลที่เกี่ยวข้องกับการเข้าสู่ระบบผ่าน OAuth เช่น Google, LINE และ GitHub
          </p>
          <p className="mt-4 text-sm text-slate-500">วันที่มีผลบังคับใช้: 24 มิถุนายน 2569</p>
        </div>

        <div className="space-y-5">
          {policySections.map((section) => (
            <section key={section.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
              <h2 className="text-xl font-bold text-slate-950">{section.title}</h2>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600 sm:text-base">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-sky-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          <h2 className="text-xl font-bold text-slate-950">การเปลี่ยนแปลงนโยบาย</h2>
          <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
            Learnova อาจปรับปรุงนโยบายนี้เป็นครั้งคราวเพื่อให้สอดคล้องกับการพัฒนาระบบ กฎหมาย หรือข้อกำหนดของผู้ให้บริการ OAuth โดยจะแสดงวันที่มีผลบังคับใช้ล่าสุดไว้บนหน้านี้
          </p>
        </section>

        <section className="rounded-2xl border border-sky-100 bg-sky-50 p-6 sm:p-7">
          <h2 className="text-xl font-bold text-slate-950">ติดต่อเรา</h2>
          <p className="mt-4 text-sm leading-7 text-slate-700 sm:text-base">
            หากมีคำถามเกี่ยวกับนโยบายความเป็นส่วนตัว หรือประสงค์ขอจัดการข้อมูลส่วนบุคคล สามารถติดต่อ Learnova ได้ที่
            <a href="mailto:privacy@learnova.com" className="ml-1 font-semibold text-sky-700 underline-offset-4 hover:underline">
              privacy@learnova.com
            </a>
          </p>
        </section>
      </section>
    </main>
  );
}

