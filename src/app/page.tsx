import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";

const heroImage =
  "https://www.tcfe.or.th/wp-content/uploads/2018/05/%E0%B8%84%E0%B8%A3%E0%B8%B9%E0%B8%9C%E0%B8%B9%E0%B9%89%E0%B8%99%E0%B8%B3%E0%B8%81%E0%B8%B2%E0%B8%A3%E0%B9%80%E0%B8%9B%E0%B8%A5%E0%B8%B5%E0%B9%88%E0%B8%A2%E0%B8%99%E0%B9%81%E0%B8%9B%E0%B8%A5%E0%B8%87%E0%B8%81%E0%B8%B1%E0%B8%9A%E0%B8%99%E0%B8%B1%E0%B8%81%E0%B9%80%E0%B8%A3%E0%B8%B5%E0%B8%A2%E0%B8%99.jpg";
const libraryImage =
  "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1000&q=80";
const deskImage =
  "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1000&q=80";
const focusImage =
  "https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1000&q=80";

const examBoards = [
  {
    name: "สพฐ.",
    fullName: "สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน",
    focus: "ภาค ก วิชาชีพครู กฎหมายการศึกษา และแนวข้อสอบมาตรฐานครูผู้ช่วย",
    exams: "24 ชุด",
    questions: "1,720 ข้อ",
    color: "bg-[#0b66c3]",
    href: "/affiliations/obec",
  },
  {
    name: "สอศ.",
    fullName: "สำนักงานคณะกรรมการการอาชีวศึกษา",
    focus: "แนวข้อสอบครูผู้ช่วยสายอาชีวะ งานอาชีวศึกษา สมรรถนะครู และกฎหมายที่เกี่ยวข้อง",
    exams: "16 ชุด",
    questions: "1,080 ข้อ",
    color: "bg-[#e94b7b]",
    href: "/affiliations/ovec",
  },
  {
    name: "สกร.",
    fullName: "กรมส่งเสริมการเรียนรู้",
    focus: "การศึกษานอกระบบ การเรียนรู้ตลอดชีวิต งานชุมชน และบทบาทครูยุคใหม่",
    exams: "10 ชุด",
    questions: "680 ข้อ",
    color: "bg-[#00a86b]",
    href: "/affiliations/dole",
  },
  {
    name: "อปท.",
    fullName: "องค์กรปกครองส่วนท้องถิ่น",
    focus: "ระเบียบท้องถิ่น งานราชการ การจัดการศึกษาในพื้นที่ และกฎหมายพื้นฐาน",
    exams: "12 ชุด",
    questions: "840 ข้อ",
    color: "bg-[#f6b21a]",
    href: "/affiliations/local",
  },
];

const studyResources = [
  {
    title: "ชุดเริ่มต้นครูผู้ช่วยทุกสังกัด",
    subtitle: "ปูพื้นฐาน ภาค ก + วิชาชีพครู + กฎหมาย",
    price: "เริ่มต้น",
    detail: "เหมาะสำหรับคนเริ่มอ่าน ต้องการรู้ภาพรวมและทำข้อสอบวัดระดับก่อนเลือกสนาม",
    href: "/study-plans/all-affiliations-starter",
    color: "bg-[#0b66c3]",
  },
  {
    title: "ชุดอ่านเฉพาะทาง สอศ. ครูอาชีวะ",
    subtitle: "งานอาชีวศึกษา สมรรถนะครู และชุดจำลองสนาม",
    price: "แนะนำ",
    detail: "สำหรับผู้สอบสายอาชีวะที่ต้องการอ่านต่างจากสนามทั่วไปและเก็บประเด็นเฉพาะ สอศ.",
    href: "/study-plans/ovec-teacher-assistant",
    color: "bg-[#e94b7b]",
  },
  {
    title: "ตะลุยกฎหมายการศึกษา",
    subtitle: "สรุปมาตรา ข้อสอบซ้ำ และเฉลยแยกประเด็น",
    price: "เข้มข้น",
    detail: "เก็บคะแนนกฎหมายที่ใช้ได้ทุกสนาม ทั้ง สพฐ. สอศ. สกร. และ อปท.",
    href: "/study-plans/education-law-intensive",
    color: "bg-[#00a86b]",
  },
];

const subjects = [
  ["ภาค ก ความสามารถทั่วไป", "ภาษาไทย คณิต เหตุผล ความรู้รอบตัว", "1,260 ข้อ", "ต้องเริ่มก่อน"],
  ["วิชาชีพครู", "หลักสูตร การสอน จิตวิทยา การวัดผล และจรรยาบรรณ", "1,540 ข้อ", "ออกทุกสนาม"],
  ["กฎหมายการศึกษา", "พ.ร.บ. การศึกษา ระเบียบครู งานราชการ และหน่วยงาน", "980 ข้อ", "จุดตัดคะแนน"],
  ["สังกัดเฉพาะ", "สพฐ. สอศ. สกร. อปท. และบริบทงานของแต่ละสนาม", "760 ข้อ", "อ่านให้ตรงสนาม"],
];

const recommendedExams = [
  {
    title: "สอศ. ครูผู้ช่วยสายอาชีวะ ชุดจำลองสนามจริง",
    tag: "สอศ.",
    detail: "90 ข้อ | 120 นาที | เน้นงานอาชีวศึกษาและสมรรถนะครู",
    href: "/exams/ovec-teacher-assistant-practice",
    color: "bg-[#e94b7b]",
  },
  {
    title: "สพฐ. ครูผู้ช่วย ภาค ก + วิชาชีพครู",
    tag: "สพฐ.",
    detail: "100 ข้อ | 120 นาที | ครบข้อสอบพื้นฐานที่ต้องผ่าน",
    href: "/exams/obec-teacher-assistant-general",
    color: "bg-[#0b66c3]",
  },
  {
    title: "กฎหมายการศึกษา สำหรับทุกสังกัด",
    tag: "ทุกสังกัด",
    detail: "75 ข้อ | 90 นาที | เฉลยแยกมาตราและประเด็นออกสอบ",
    href: "/exams/education-law-all-affiliations",
    color: "bg-[#00a86b]",
  },
];

const studyPlans = [
  {
    title: "แผนอ่านครูผู้ช่วยทุกสังกัด 45 วัน",
    label: "Study Plan",
    image: libraryImage,
    href: "/articles/teacher-assistant-45-days",
  },
  {
    title: "สอบ สอศ. ต้องอ่านอะไรบ้าง",
    label: "OVEC Focus",
    image: deskImage,
    href: "/articles/ovec-teacher-assistant-guide",
  },
  {
    title: "กฎหมายการศึกษาที่ออกสอบบ่อย",
    label: "Law Guide",
    image: focusImage,
    href: "/articles/education-law-all-affiliations",
  },
];

const studyRoadmap = [
  ["สัปดาห์ 1", "วัดพื้นฐาน", "ทำข้อสอบ ภาค ก และกฎหมาย เพื่อดูว่าควรเริ่มเก็บคะแนนจากจุดไหน"],
  ["สัปดาห์ 2-3", "เก็บแกนกลาง", "อ่านวิชาชีพครู หลักสูตร จิตวิทยา การวัดผล และกฎหมายที่ใช้ทุกสังกัด"],
  ["สัปดาห์ 4-5", "เลือกสังกัด", "ลงชุด สพฐ. สอศ. สกร. หรือ อปท. พร้อมอ่านบริบทเฉพาะสนาม"],
  ["สัปดาห์ 6", "ซ้อมสนามจริง", "ทำข้อสอบเต็มเวลา ทบทวนข้อผิด และจดหัวข้อที่ยังพลาดก่อนสอบจริง"],
];

const boardCompare = [
  ["สพฐ.", "โรงเรียนพื้นฐาน", "ภาค ก วิชาชีพครู กฎหมาย", "เหมาะกับผู้สอบสายสามัญ"],
  ["สอศ.", "สถานศึกษาอาชีวะ", "งานอาชีวศึกษา สมรรถนะครู กฎหมาย", "เหมาะกับผู้สอบครูสายอาชีพ"],
  ["สกร.", "การเรียนรู้ตลอดชีวิต", "งานชุมชน การศึกษานอกระบบ", "เหมาะกับผู้สอบงานส่งเสริมการเรียนรู้"],
  ["อปท.", "โรงเรียนท้องถิ่น", "ระเบียบท้องถิ่น งานราชการ การศึกษา", "เหมาะกับผู้สอบท้องถิ่น"],
];

const mustReadTopics = [
  "พ.ร.บ. การศึกษาแห่งชาติ",
  "ระเบียบข้าราชการครูและบุคลากรทางการศึกษา",
  "หลักสูตรแกนกลางและการจัดการเรียนรู้",
  "การวัดและประเมินผลการศึกษา",
  "จิตวิทยาการศึกษาและพัฒนาการผู้เรียน",
  "จรรยาบรรณวิชาชีพครู",
  "เทคโนโลยีดิจิทัลเพื่อการศึกษา",
  "งานอาชีวศึกษาและบริบท สอศ.",
];

const faqItems = [
  ["ควรเลือกอ่านตามสังกัดเลยไหม", "ถ้ายังไม่เคยอ่าน ให้เริ่มจากภาค ก วิชาชีพครู และกฎหมายพื้นฐานก่อน จากนั้นค่อยเลือกสนามเฉพาะ เช่น สอศ. หรือ อปท."],
  ["สอศ. ต้องอ่านต่างจาก สพฐ. แค่ไหน", "ควรเพิ่มเรื่องบริบทอาชีวศึกษา สมรรถนะครูสายอาชีพ การจัดการเรียนรู้เชิงปฏิบัติ และภารกิจของสำนักงานคณะกรรมการการอาชีวศึกษา"],
  ["ควรเริ่มจากชุดข้อสอบไหน", "เริ่มจากชุดวัดระดับก่อน เพื่อดูว่าควรเก็บ ภาค ก กฎหมาย หรือวิชาชีพครูก่อน แล้วค่อยเลือกชุดตามสังกัดที่ต้องสอบ"],
  ["เฉลยควรละเอียดระดับไหน", "เฉลยควรบอกเหตุผลของคำตอบที่ถูก ตัวเลือกที่ผิด และลิงก์กลับไปยังหัวข้ออ่านซ้ำ"],
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-950">
      <SiteHeader />

      <section className="relative overflow-hidden bg-[#071f4a]">
        <Image
          src="/images/learnova-hero-teachers-group.png"
          alt="การ์ตูนกลุ่มครูผู้ช่วยจากหลายสังกัดยืนรวมกัน"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#071f4a] via-[#071f4a]/82 to-[#071f4a]/18" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071f4a]/55 via-transparent to-transparent" />

        <div className="relative mx-auto flex min-h-[720px] max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
          <div className="flex max-w-3xl flex-col justify-center text-white">
            <div className="mb-5 flex flex-wrap gap-2">
              <span className="rounded-full bg-[#ffd35a] px-4 py-2 text-sm font-black text-[#071f4a] shadow-sm">ครูผู้ช่วย</span>
              <span className="rounded-full bg-white/12 px-4 py-2 text-sm font-black text-white ring-1 ring-white/20">ข้อสอบย้อนหลัง</span>
              <span className="rounded-full bg-white/12 px-4 py-2 text-sm font-black text-white ring-1 ring-white/20">วัดระดับ</span>
              <span className="rounded-full bg-white/12 px-4 py-2 text-sm font-black text-white ring-1 ring-white/20">ทุกสังกัด</span>
            </div>

            <h1 className="text-5xl font-black leading-[1.04] tracking-normal sm:text-6xl lg:text-7xl">
              เตรียมสอบครูผู้ช่วย
              <br />
              ให้ตรงสังกัด และตรงจุด
            </h1>

            <p className="mt-5 max-w-2xl text-2xl font-black leading-tight text-[#ffd35a] sm:text-3xl">
              รวมแนวข้อสอบย้อนหลัง สรุปเนื้อหา และแบบทดสอบวัดระดับ สำหรับ สพฐ. สอศ. สกร. และ อปท.
            </p>

            <p className="mt-5 max-w-2xl text-lg font-medium leading-8 text-slate-100">
              รู้ทันทีว่าพร้อมสอบแค่ไหน วิเคราะห์จุดแข็ง จุดอ่อน และวางแผนอ่านหนังสือจากข้อสอบจริง ครอบคลุม ภาค ก วิชาชีพครู กฎหมายการศึกษา และเนื้อหาเฉพาะของแต่ละสังกัด
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-[auto_auto] sm:justify-start">
              <Link href="/affiliations/ovec" className="flex min-h-14 items-center justify-center rounded-2xl bg-[#ffd35a] px-7 text-base font-black text-[#071f4a] shadow-lg shadow-[#ffd35a]/20 transition hover:bg-[#f6bf22]">
                ดูแนวข้อสอบ สอศ.
              </Link>
              <Link href="/exams/education-law-all-affiliations/practice" className="flex min-h-14 items-center justify-center rounded-2xl bg-white px-7 text-base font-black text-[#071f4a] shadow-lg shadow-black/10 transition hover:bg-slate-100">
                เริ่มวัดระดับ
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-normal text-[#e94b7b]">Study Paths</p>
              <h2 className="mt-1 text-3xl font-black text-[#071f4a]">เลือกแนวอ่านตามเป้าหมายสอบ</h2>
            </div>
            <Link href="/study-plans" className="text-sm font-black text-[#0b66c3] hover:text-[#084f99]">ดูแผนอ่านทั้งหมด</Link>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {studyResources.map((course) => (
              <article key={course.href} className="relative isolate overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <div className="pointer-events-none absolute right-0 top-0 z-10 h-32 w-32 translate-x-3 -translate-y-1 sm:h-36 sm:w-36">
                  <Image
                    src="/images/teacher-card-cutout.png"
                    alt=""
                    fill
                    sizes="144px"
                    className="object-contain drop-shadow-xl"
                  />
                </div>
                <div className={`${course.color} min-h-48 p-5 pr-28 text-white`}>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-black">{course.price}</span>
                  <h3 className="mt-8 min-h-20 text-2xl font-black leading-8">{course.title}</h3>
                  <p className="mt-3 text-sm font-bold text-white/80">{course.subtitle}</p>
                </div>
                <div className="p-5">
                  <p className="min-h-16 text-sm font-semibold leading-7 text-slate-600">{course.detail}</p>
                  <div className="mt-5 flex gap-3">
                    <Link href={course.href} className="flex h-11 flex-1 items-center justify-center rounded-xl border border-slate-200 text-sm font-black hover:bg-slate-50">รายละเอียด</Link>
                    <Link href={course.href} className="flex h-11 flex-1 items-center justify-center rounded-xl bg-[#071f4a] text-sm font-black text-white hover:bg-[#0b66c3]">เริ่มอ่าน</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f7f8fc]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-normal text-[#0b66c3]">Exam Boards</p>
              <h2 className="mt-1 text-3xl font-black text-[#071f4a]">เลือกสังกัดที่คุณจะสอบ</h2>
            </div>
            <Link href="/affiliations" className="text-sm font-black text-[#0b66c3] hover:text-[#084f99]">ดูทุกสังกัด</Link>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-4">
            {examBoards.map((item) => (
              <Link key={item.href} href={item.href} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <div className={`h-2 ${item.color}`} />
                <div className="p-5">
                  <p className="text-3xl font-black text-[#071f4a] group-hover:text-[#0b66c3]">{item.name}</p>
                  <h3 className="mt-2 min-h-12 text-sm font-black leading-6 text-slate-700">{item.fullName}</h3>
                  <p className="mt-4 min-h-20 text-sm font-semibold leading-6 text-slate-600">{item.focus}</p>
                  <div className="mt-5 grid grid-cols-2 gap-2 text-center text-sm font-black">
                    <span className="rounded-xl bg-slate-100 px-3 py-2 text-slate-700">{item.exams}</span>
                    <span className="rounded-xl bg-slate-100 px-3 py-2 text-slate-700">{item.questions}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[360px_1fr] lg:items-start">
            <div className="rounded-3xl bg-[#071f4a] p-6 text-white shadow-xl">
              <p className="text-sm font-black text-[#ffd35a]">อ่านให้ครบก่อนลงสนาม</p>
              <h2 className="mt-2 text-3xl font-black leading-tight">เนื้อหาหลักที่ครูผู้ช่วยต้องเจอ</h2>
              <p className="mt-4 text-sm font-semibold leading-7 text-white/75">
                จัดหมวดตามสิ่งที่ผู้สอบใช้จริง: อ่านแกนกลางก่อน แล้วค่อยแยกไปยังสนามเฉพาะ เช่น สอศ. หรือ อปท.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {subjects.map(([title, description, amount, badge]) => (
                <article key={title} className="rounded-3xl border border-slate-200 bg-[#f8fbff] p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-2xl font-black text-[#071f4a]">{title}</h3>
                    <span className="rounded-full bg-[#fff5da] px-3 py-1 text-xs font-black text-[#7a4b00]">{badge}</span>
                  </div>
                  <p className="mt-3 min-h-16 text-sm font-semibold leading-6 text-slate-600">{description}</p>
                  <p className="mt-5 text-sm font-black text-[#0b66c3]">{amount}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f7f8fc]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-normal text-[#e94b7b]">Mock Exams</p>
              <h2 className="mt-1 text-3xl font-black text-[#071f4a]">ชุดข้อสอบที่ควรเริ่มก่อน</h2>
            </div>
            <Link href="/exams" className="text-sm font-black text-[#0b66c3] hover:text-[#084f99]">เปิดคลังข้อสอบ</Link>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {recommendedExams.map((exam) => (
              <article key={exam.href} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <div className={`${exam.color} p-5 text-white`}>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-black">{exam.tag}</span>
                  <h3 className="mt-8 min-h-20 text-2xl font-black leading-8">{exam.title}</h3>
                </div>
                <div className="p-5">
                  <p className="text-sm font-bold leading-6 text-slate-600">{exam.detail}</p>
                  <div className="mt-5 flex gap-3">
                    <Link href={exam.href} className="flex h-11 flex-1 items-center justify-center rounded-xl border border-slate-200 text-sm font-black hover:bg-slate-50">รายละเอียด</Link>
                    <Link href={`${exam.href}/practice`} className="flex h-11 flex-1 items-center justify-center rounded-xl bg-[#071f4a] text-sm font-black text-white hover:bg-[#0b66c3]">เริ่มทำ</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
            <div>
              <p className="text-sm font-black uppercase tracking-normal text-[#0b66c3]">อ่านตามแผน</p>
              <h2 className="mt-1 text-3xl font-black leading-tight text-[#071f4a]">แผนเตรียมสอบ 45 วัน</h2>
              <p className="mt-4 text-sm font-semibold leading-7 text-slate-600">
                เหมาะกับคนที่ไม่รู้จะเริ่มตรงไหน แบ่งช่วงอ่านให้ชัดตั้งแต่ประเมินพื้นฐานจนถึงซ้อมสนามจริง
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {studyRoadmap.map(([period, title, description]) => (
                <article key={period} className="rounded-3xl border border-slate-200 bg-[#f8fbff] p-5 shadow-sm">
                  <p className="text-sm font-black text-[#0b66c3]">{period}</p>
                  <h3 className="mt-2 text-2xl font-black text-[#071f4a]">{title}</h3>
                  <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f7f8fc]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-normal text-[#e94b7b]">เทียบสนามสอบ</p>
              <h2 className="mt-1 text-3xl font-black text-[#071f4a]">สังกัดไหนต้องเน้นอะไร</h2>
            </div>
            <Link href="/affiliations" className="text-sm font-black text-[#0b66c3] hover:text-[#084f99]">อ่านรายละเอียดสังกัด</Link>
          </div>

          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="grid grid-cols-4 bg-[#071f4a] px-5 py-4 text-sm font-black text-white max-md:hidden">
              <span>สังกัด</span>
              <span>สนามสอบ</span>
              <span>ควรเน้น</span>
              <span>เหมาะกับ</span>
            </div>
            <div className="divide-y divide-slate-100">
              {boardCompare.map(([name, context, focus, target]) => (
                <div key={name} className="grid gap-3 px-5 py-5 text-sm md:grid-cols-4 md:items-center">
                  <p className="text-2xl font-black text-[#071f4a]">{name}</p>
                  <p className="font-bold text-slate-700">{context}</p>
                  <p className="font-semibold leading-6 text-slate-600">{focus}</p>
                  <p className="font-semibold leading-6 text-slate-600">{target}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-normal text-[#00a86b]">หัวข้อออกสอบบ่อย</p>
            <h2 className="mt-1 text-3xl font-black text-[#071f4a]">เริ่มอ่านจากหัวข้อเหล่านี้ก่อน</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {mustReadTopics.map((topic, index) => (
                <Link key={topic} href={`/articles/topic-${index + 1}`} className="rounded-2xl border border-slate-200 bg-[#f8fbff] p-4 font-black text-slate-800 transition hover:border-[#0b66c3] hover:text-[#0b66c3]">
                  {topic}
                </Link>
              ))}
            </div>
          </div>

          <aside className="rounded-3xl bg-[#071f4a] p-6 text-white shadow-xl">
            <p className="text-sm font-black text-[#ffd35a]">เน้น สอศ.</p>
            <h2 className="mt-2 text-3xl font-black leading-tight">สายอาชีวะต้องอ่านให้ต่างจากสนามทั่วไป</h2>
            <p className="mt-4 text-sm font-semibold leading-7 text-white/75">
              ผู้สอบ สอศ. ควรเก็บทั้งแกนกลางครูผู้ช่วยและบริบทอาชีวศึกษา เช่น สมรรถนะวิชาชีพ การเรียนรู้เชิงปฏิบัติ และภารกิจของสถานศึกษาอาชีวะ
            </p>
            <Link href="/affiliations/ovec" className="mt-6 inline-flex rounded-xl bg-[#ffd35a] px-5 py-3 text-sm font-black text-[#071f4a] hover:bg-[#f6bf22]">
              ดูแนว สอศ.
            </Link>
          </aside>
        </div>
      </section>

      <section className="bg-[#f7f8fc]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-normal text-[#00a86b]">บทความสรุป</p>
              <h2 className="mt-1 text-3xl font-black text-[#071f4a]">อ่านสรุปก่อนเริ่มทำข้อสอบ</h2>
            </div>
            <Link href="/articles" className="text-sm font-black text-[#0b66c3] hover:text-[#084f99]">ดูบทความทั้งหมด</Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {studyPlans.map((card) => (
              <Link key={card.href} href={card.href} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <div className="relative h-40">
                  <Image src={card.image} alt={card.title} fill sizes="(min-width: 640px) 33vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
                </div>
                <div className="p-5">
                  <p className="text-xs font-black uppercase tracking-normal text-[#0b66c3]">{card.label}</p>
                  <h3 className="mt-2 min-h-20 text-lg font-black leading-7 group-hover:text-[#0b66c3]">{card.title}</h3>
                  <p className="mt-3 text-sm font-black text-slate-500">อ่านต่อ</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
            <div>
              <p className="text-sm font-black uppercase tracking-normal text-[#0b66c3]">FAQ</p>
              <h2 className="mt-1 text-3xl font-black leading-tight text-[#071f4a]">คำถามที่ผู้สอบมักถาม</h2>
              <p className="mt-4 text-sm font-semibold leading-7 text-slate-600">
                รวมคำตอบสั้น ๆ สำหรับคนที่กำลังเลือกว่าจะเริ่มอ่านจากอะไรและควรเลือกสนามสอบอย่างไร
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {faqItems.map(([question, answer]) => (
                <article key={question} className="rounded-3xl border border-slate-200 bg-[#f8fbff] p-5 shadow-sm">
                  <h3 className="text-xl font-black leading-8 text-[#071f4a]">{question}</h3>
                  <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">{answer}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-[#071f4a] text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-2xl font-black">Learnova</p>
            <p className="mt-1 text-sm font-semibold text-white/70">ติวสอบครูผู้ช่วยทุกสังกัด รวม สอศ. พร้อมข้อสอบและสรุปอ่านตรงสนาม</p>
          </div>
          <div className="flex flex-wrap gap-4 text-sm font-bold text-white/75">
            <Link href="/terms" className="hover:text-white">ข้อตกลง</Link>
            <Link href="/privacy" className="hover:text-white">ความเป็นส่วนตัว</Link>
            <Link href="/contact" className="hover:text-white">ติดต่อเรา</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}


















