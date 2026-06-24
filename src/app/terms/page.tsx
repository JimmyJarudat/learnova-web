import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "เงื่อนไขการใช้งาน Learnova สำหรับผู้เรียนและผู้ใช้บัญชี OAuth",
};

const termsSections = [
  {
    title: "การยอมรับเงื่อนไข",
    body: "เมื่อเข้าใช้งาน Learnova หรือเข้าสู่ระบบผ่าน Google, LINE, GitHub หรือ Facebook ผู้ใช้ถือว่าได้อ่าน เข้าใจ และยอมรับเงื่อนไขการใช้งานนี้แล้ว หากไม่ยอมรับเงื่อนไข โปรดหยุดใช้งานบริการ",
  },
  {
    title: "บัญชีผู้ใช้และความปลอดภัย",
    body: "ผู้ใช้มีหน้าที่ดูแลบัญชีของตนเอง ใช้ข้อมูลที่ถูกต้อง และไม่อนุญาตให้ผู้อื่นใช้บัญชีโดยไม่ได้รับอนุญาต Learnova อาจระงับหรือจำกัดการใช้งานบัญชีที่มีพฤติกรรมผิดปกติ ละเมิดระบบ หรือกระทบต่อผู้ใช้รายอื่น",
  },
  {
    title: "การใช้งานเนื้อหา",
    body: "เนื้อหา แบบทดสอบ สรุป และข้อมูลใน Learnova จัดทำเพื่อการเรียนรู้และการเตรียมสอบ ผู้ใช้สามารถใช้งานเพื่อวัตถุประสงค์ส่วนบุคคลได้ แต่ไม่ควรคัดลอก ดัดแปลง แจกจ่าย หรือใช้ในเชิงพาณิชย์โดยไม่ได้รับอนุญาต",
  },
  {
    title: "บริการเข้าสู่ระบบภายนอก",
    body: "Learnova รองรับการเข้าสู่ระบบผ่านผู้ให้บริการภายนอก เช่น Google, LINE, GitHub และ Facebook โดยระบบจะใช้ข้อมูลเท่าที่จำเป็นต่อการยืนยันตัวตนและสร้างบัญชีเท่านั้น ผู้ให้บริการแต่ละรายมีข้อกำหนดและนโยบายของตนเอง",
  },
  {
    title: "ข้อจำกัดความรับผิด",
    body: "Learnova พยายามดูแลข้อมูลและเนื้อหาให้ถูกต้องและเป็นประโยชน์ แต่ไม่รับประกันว่าข้อมูลทั้งหมดจะถูกต้องสมบูรณ์ตลอดเวลา ผู้ใช้ควรตรวจสอบประกาศสอบ ข้อกำหนด และข้อมูลทางการจากหน่วยงานที่เกี่ยวข้องควบคู่กันเสมอ",
  },
  {
    title: "การเปลี่ยนแปลงเงื่อนไข",
    body: "Learnova อาจปรับปรุงเงื่อนไขการใช้งานนี้เป็นครั้งคราว เพื่อให้สอดคล้องกับการพัฒนาระบบ กฎหมาย หรือข้อกำหนดของผู้ให้บริการ OAuth โดยจะแสดงวันที่มีผลบังคับใช้ล่าสุดไว้บนหน้านี้",
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <article className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 lg:py-14">
        <Link href="/" className="text-sm font-bold text-sky-700 underline-offset-4 hover:underline">
          Learnova
        </Link>

        <header className="mt-8 border-b border-slate-200 pb-8">
          <p className="text-sm font-semibold text-slate-500">Terms of Service</p>
          <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl">
            เงื่อนไขการใช้งาน
          </h1>
          <p className="mt-5 text-base leading-8 text-slate-600">
            เงื่อนไขนี้อธิบายขอบเขตการใช้งาน Learnova สำหรับผู้เรียน ผู้ใช้บัญชี และการเข้าสู่ระบบผ่านบริการ OAuth ต่าง ๆ
          </p>
          <p className="mt-4 text-sm font-semibold text-slate-500">วันที่มีผลบังคับใช้: 24 มิถุนายน 2569</p>
        </header>

        <div className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white px-5 sm:px-8">
          {termsSections.map((section) => (
            <section key={section.title} className="py-7 sm:py-8">
              <h2 className="text-xl font-black text-slate-950">{section.title}</h2>
              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">{section.body}</p>
            </section>
          ))}

          <section className="py-7 sm:py-8">
            <h2 className="text-xl font-black text-slate-950">ติดต่อเรา</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
              หากมีคำถามเกี่ยวกับเงื่อนไขการใช้งาน ติดต่อได้ที่
              <a href="mailto:support@learnova.com" className="ml-1 font-bold text-sky-700 underline-offset-4 hover:underline">
                support@learnova.com
              </a>
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
