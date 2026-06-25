import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const featuredImage =
  "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1400&q=80";
const heroImage = "/images/news-hero-teacher-officials.png";

const categories = ["ทั้งหมด", "ประกาศระบบ", "ข่าวสอบ", "อัปเดตคลังข้อสอบ", "กิจกรรม"];

const featuredNews = {
  tag: "ข่าวสอบ",
  color: "bg-[#e94b7b]",
  date: "24 มิ.ย. 2569",
  title: "สพฐ. ประกาศปฏิทินสอบครูผู้ช่วย ปี 2569 เช็กกำหนดการเตรียมตัวที่นี่",
  detail:
    "สรุปช่วงเวลาเปิดรับสมัคร ภาค ก ภาค ข และภาค ค พร้อมจุดที่ผู้สอบทุกสังกัดต้องวางแผนอ่านหนังสือให้ทันก่อนปิดรับสมัคร",
  href: "/news/obec-exam-calendar-2569",
};

const newsItems = [
  {
    tag: "อัปเดตคลังข้อสอบ",
    color: "bg-[#0b66c3]",
    date: "20 มิ.ย. 2569",
    title: "เพิ่มชุดข้อสอบ สอศ. ครูผู้ช่วยสายอาชีวะ อีก 120 ข้อ",
    detail: "เก็บแนวข้อสอบสมรรถนะครูสายอาชีวะและงานอาชีวศึกษาเพิ่มเติม พร้อมเฉลยแยกประเด็นรายข้อ",
    image: "/images/teacher-card-ovec.png",
    href: "/news/ovec-question-bank-update",
  },
  {
    tag: "ประกาศระบบ",
    color: "bg-[#00a86b]",
    date: "18 มิ.ย. 2569",
    title: "ปรับปรุงระบบวัดระดับให้แม่นยำขึ้น แยกคะแนนตามหมวดวิชา",
    detail: "ผลวัดระดับจะแสดงคะแนนแยกภาค ก วิชาชีพครู และกฎหมายการศึกษา เพื่อวางแผนอ่านได้ตรงจุดมากขึ้น",
    image: "/images/teacher-card-general.png",
    href: "/news/scoring-system-update",
  },
  {
    tag: "ข่าวสอบ",
    color: "bg-[#e94b7b]",
    date: "15 มิ.ย. 2569",
    title: "อปท. เปิดรับสมัครครูผู้ช่วยท้องถิ่นรอบใหม่",
    detail: "สรุปคุณสมบัติผู้สมัคร ขอบเขตเนื้อหา และช่วงเวลาที่ต้องเตรียมเอกสารให้พร้อมก่อนปิดรับสมัคร",
    image: "/images/teacher-card-law.png",
    href: "/news/dla-recruitment-2569",
  },
  {
    tag: "กิจกรรม",
    color: "bg-[#f6b21a]",
    date: "10 มิ.ย. 2569",
    title: "ไลฟ์ติวฟรี กฎหมายการศึกษาที่ออกสอบบ่อยทุกสังกัด",
    detail: "ทบทวนมาตราที่ออกสอบซ้ำหลายปี พร้อมแนวคำถามที่มักเจอในสนามจริงของ สพฐ. และ สอศ.",
    image: "/images/teacher-card-law.png",
    href: "/news/free-live-education-law",
  },
  {
    tag: "อัปเดตคลังข้อสอบ",
    color: "bg-[#0b66c3]",
    date: "5 มิ.ย. 2569",
    title: "เพิ่มแนวข้อสอบ สกร. งานการศึกษานอกระบบ 80 ข้อ",
    detail: "ครอบคลุมการเรียนรู้ตลอดชีวิต งานชุมชน และบทบาทครูยุคใหม่ พร้อมเฉลยอ้างอิงเนื้อหา",
    image: "/images/teacher-card-general.png",
    href: "/news/dole-question-bank-update",
  },
  {
    tag: "ประกาศระบบ",
    color: "bg-[#00a86b]",
    date: "1 มิ.ย. 2569",
    title: "เปิดให้ดาวน์โหลดสรุปเนื้อหาเป็น PDF สำหรับสมาชิก",
    detail: "สรุปเนื้อหารายหมวดสามารถบันทึกเป็น PDF เพื่ออ่านออฟไลน์ได้แล้วในหน้าสรุปเนื้อหาแต่ละหัวข้อ",
    image: "/images/teacher-card-ovec.png",
    href: "/news/pdf-summary-export",
  },
];

export default function NewsPage() {
  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-950">
      <SiteHeader />

      <section className="relative overflow-hidden bg-[#071f4a]">
        <Image
          src={heroImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#071f4a] via-[#071f4a]/85 to-[#071f4a]/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071f4a]/40 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <span className="rounded-full bg-[#ffd35a] px-4 py-2 text-sm font-black text-[#071f4a] shadow-sm">
            ข่าวสาร
          </span>
          <h1 className="mt-5 max-w-2xl text-4xl font-black leading-tight text-white sm:text-5xl">
            ข่าวสารและประกาศ
          </h1>
          <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-white/80">
            ติดตามกำหนดการสอบ ประกาศจากหน่วยงานต้นสังกัด และอัปเดตคลังข้อสอบล่าสุด เพื่อให้วางแผนอ่านหนังสือได้ทันทุกสนาม
          </p>
        </div>
      </section>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <form className="flex min-h-12 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <label htmlFor="news-search" className="sr-only">
                ค้นหาข่าว
              </label>
              <input
                id="news-search"
                type="search"
                placeholder="ค้นหาข่าว ประกาศ หรือหน่วยงาน"
                className="min-w-0 flex-1 bg-transparent px-4 text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                className="bg-[#0b66c3] px-5 text-sm font-black text-white transition hover:bg-[#0856a6]"
              >
                ค้นหา
              </button>
            </form>

            <div className="flex flex-wrap gap-2">
              {categories.map((category, index) => (
                <button
                  key={category}
                  type="button"
                  className={`rounded-lg px-4 py-2 text-sm font-black transition ${
                    index === 0
                      ? "bg-[#071f4a] text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f7f8fc]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black text-[#0b66c3]">ข่าวที่ควรติดตาม</p>
              <h2 className="mt-1 text-2xl font-black text-[#071f4a]">ข่าวล่าสุด</h2>
            </div>
            <p className="text-sm font-semibold text-slate-500">แสดงข่าวตัวอย่าง {newsItems.length + 1} รายการ</p>
          </div>

          <Link
            href={featuredNews.href}
            className="group grid overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]"
          >
            <div className="flex flex-col justify-center p-6 lg:p-10">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`rounded-md ${featuredNews.color} px-3 py-1 text-xs font-black text-white`}>
                  {featuredNews.tag}
                </span>
                <span className="text-sm font-bold text-slate-500">{featuredNews.date}</span>
              </div>
              <h3 className="mt-4 text-2xl font-black leading-tight text-[#071f4a] group-hover:text-[#0b66c3] sm:text-3xl">
                {featuredNews.title}
              </h3>
              <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-slate-600">
                {featuredNews.detail}
              </p>
              <span className="mt-6 text-sm font-black text-[#0b66c3]">อ่านต่อ →</span>
            </div>
            <div className="relative h-56 border-t border-slate-100 lg:h-full lg:border-l lg:border-t-0">
              <Image
                src={featuredImage}
                alt=""
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            </div>
          </Link>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {newsItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group grid overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-36 bg-slate-50">
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="object-contain p-5 transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-md ${item.color} px-2.5 py-1 text-xs font-black text-white`}>
                      {item.tag}
                    </span>
                    <span className="text-xs font-bold text-slate-500">{item.date}</span>
                  </div>
                  <h3 className="mt-3 min-h-14 text-lg font-black leading-7 text-[#071f4a] group-hover:text-[#0b66c3]">
                    {item.title}
                  </h3>
                  <p className="mt-3 min-h-16 text-sm font-semibold leading-6 text-slate-600">
                    {item.detail}
                  </p>
                  <span className="mt-4 inline-block text-sm font-black text-[#0b66c3]">อ่านต่อ →</span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10 flex items-center justify-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#071f4a] text-sm font-black text-white">1</span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-black text-slate-600 hover:bg-slate-50">2</span>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-black text-slate-600 hover:bg-slate-50">3</span>
            <span className="flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-black text-slate-600 hover:bg-slate-50">ถัดไป →</span>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
