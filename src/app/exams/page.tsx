import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/config/site";
import { getExamOverview } from "@/server/exams/exam-data";

const pageTitle = "คลังข้อสอบครูผู้ช่วย ภาค ก และจำลองสนามจริง";
const pageDescription =
  "ฝึกภาค ก กลางที่ใช้ร่วมหลายสังกัด หรือเลือกสังกัดและเอกเพื่อจำลองสนามจริง เช่น สพฐ. สอศ. สกร. อปท. กทม.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords: [
    "คลังข้อสอบครูผู้ช่วย",
    "ข้อสอบครูผู้ช่วยแยกสังกัด",
    "ภาค ก ครูผู้ช่วย สอศ",
    "ภาค ก ครูผู้ช่วย สพฐ",
    "ข้อสอบครูผู้ช่วยย้อนหลัง",
    "ข้อสอบครูผู้ช่วยหลายปี",
  ],
  alternates: {
    canonical: "/exams",
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: "/exams",
    siteName: siteConfig.name,
    locale: "th_TH",
    type: "website",
    images: [
      {
        url: "/images/learnova-hero-teachers-group.png",
        width: 1200,
        height: 630,
        alt: "คลังข้อสอบครูผู้ช่วย Learnova",
      },
    ],
  },
};

export const dynamic = "force-dynamic";

export default async function ExamsPage() {
  const { affiliations, practiceCategories, popularPackages, totals } = await getExamOverview();

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-950">
      <SiteHeader />

      <section className="relative overflow-hidden bg-[#071f4a] text-white">
        <Image
          src="/images/learnova-hero-teachers-group.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#071f4a] via-[#071f4a]/88 to-[#071f4a]/28" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#071f4a]/70 via-transparent to-transparent" />

        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[1fr_420px] lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <span className="rounded-full bg-[#ffd35a] px-4 py-2 text-sm font-black text-[#071f4a] shadow-sm">
              คลังข้อสอบ
            </span>
            <h1 className="mt-5 text-4xl font-black leading-tight sm:text-6xl">
              เลือกฝึกให้ตรงจังหวะที่คุณต้องใช้
            </h1>
            <p className="mt-5 max-w-2xl text-lg font-semibold leading-8 text-white/85">
              ฝึกภาค ก แบบรวมได้ทันที หรือเลือกสังกัด เอก และปีสอบเพื่อจำลองสนามเต็มชุดที่มี ภาค ก ภาค ข และภาค ค อยู่ในหน้าเดียว
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/exams/practice/part-a" className="rounded-xl bg-[#ffd35a] px-6 py-3 text-sm font-black text-[#071f4a] shadow-lg shadow-black/10 transition hover:bg-[#f6bf22]">
                ฝึกภาค ก
              </Link>
              <Link href="/exams/ovec" className="rounded-xl bg-[#ffd35a] px-6 py-3 text-sm font-black text-[#071f4a] shadow-lg shadow-black/10 transition hover:bg-[#f6bf22]">
                จำลองสนาม สอศ.
              </Link>
              <Link href="#affiliations" className="rounded-xl bg-white px-6 py-3 text-sm font-black text-[#071f4a] shadow-lg shadow-black/10 transition hover:bg-slate-100">
                เลือกสังกัดสอบ
              </Link>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {[
              ["สังกัด", totals.affiliations],
              ["ชุดข้อสอบ", totals.sets],
              ["ข้อทั้งหมด", totals.questions.toLocaleString("th-TH")],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-white/15 bg-white/12 p-5 shadow-sm backdrop-blur">
                <p className="text-sm font-bold text-white/70">{label}</p>
                <p className="mt-1 text-4xl font-black text-[#ffd35a]">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {practiceCategories.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-black text-[#0b66c3]">ฝึกตามหมวด</p>
              <h2 className="mt-1 text-3xl font-black text-[#071f4a]">อยากฝึกเรื่องไหนซ้ำ ๆ</h2>
            </div>
            <p className="max-w-xl text-sm font-semibold leading-6 text-slate-500">
              สำหรับคนที่อยากฝึกภาคที่ใช้ร่วมกันหลายสนาม โดยไม่ต้องเลือกสังกัดและเอกก่อน
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {practiceCategories.map((category) => (
              <Link
                key={category.slug}
                href={`/exams/practice/${category.slug}`}
                className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <span className={`block h-1.5 w-16 rounded-full ${category.colorClass}`} />
                <h3 className="mt-4 text-xl font-black leading-7 text-[#071f4a] group-hover:text-[#0b66c3]">{category.title}</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{category.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#fff2c2] px-3 py-1 text-xs font-black text-[#9a5b00]">{category.setCount} ชุด</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">ทุกสังกัด</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <Link
          href="/exams/all"
          className="group grid gap-5 rounded-lg border border-[#0b66c3]/20 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl lg:grid-cols-[1fr_auto] lg:items-center"
        >
          <div>
            <p className="text-sm font-black text-[#0b66c3]">สนามจริงทั้งหมด</p>
            <h2 className="mt-1 text-2xl font-black text-[#071f4a]">รวมชุดจำลองสนามตามสังกัด เอก และปีสอบ</h2>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">
              เหมาะสำหรับคนที่เลือกสนามสอบแล้ว และต้องการเห็นชุดเต็มของสนามนั้น ทั้ง ภาค ก ภาค ข และภาค ค
            </p>
          </div>
          <span className="inline-flex w-fit rounded-xl bg-[#0b66c3] px-5 py-3 text-sm font-black text-white transition group-hover:bg-[#084f99]">
            เปิดคลังรวม →
          </span>
        </Link>
      </section>

      <section id="affiliations" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black text-[#0b66c3]">เลือกสนามสอบ</p>
            <h2 className="mt-1 text-3xl font-black text-[#071f4a]">คุณกำลังเตรียมสอบสังกัดไหน</h2>
          </div>
          <p className="max-w-xl text-sm font-semibold leading-6 text-slate-500">
            แต่ละสังกัดมีวิชาแกนกลางเหมือนกัน แต่ชุดข้อสอบและหัวข้อเฉพาะจะจัดให้ตรงสนามที่เลือก
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-5">
          {affiliations.map((affiliation) => (
            <Link
              key={affiliation.slug}
              href={`/exams/${affiliation.slug}`}
              className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className={`${affiliation.colorClass} relative h-40 overflow-hidden`}>
                {affiliation.imageUrl ? (
                  <Image src={affiliation.imageUrl} alt="" fill sizes="(min-width: 1024px) 20vw, 100vw" className="object-contain object-bottom transition group-hover:scale-105" />
                ) : null}
                <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-black text-[#071f4a]">
                  {affiliation.label}
                </span>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-black text-[#071f4a] group-hover:text-[#0b66c3]">{affiliation.label}</h3>
                <p className="mt-2 line-clamp-3 text-sm font-semibold leading-6 text-slate-600">{affiliation.description}</p>
                <p className="mt-4 text-sm font-black text-[#0b66c3]">{affiliation.trackCount} เอก | {affiliation.packageCount} ชุด →</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-12 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <div>
          <div className="mb-5">
            <p className="text-sm font-black text-[#0b66c3]">เริ่มทำได้เลย</p>
            <h2 className="mt-1 text-3xl font-black text-[#071f4a]">ชุดจำลองสนามจริงที่พร้อมเปิด</h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
              เลือกเส้นทางตามสังกัดและเอกก่อน แล้วเข้าไปเลือกทำ ภาค ก ภาค ข หรือ ภาค ค ของสนามนั้น
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {popularPackages.map((pack) => (
                <Link
                  key={`${pack.affiliationSlug}-${pack.majorSlug}-${pack.slug}`}
                  href={`/exams/${pack.affiliationSlug}/track/${pack.majorSlug}/${pack.slug}`}
                  className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[#071f4a] px-3 py-1 text-xs font-black text-white">{pack.affiliationLabel}</span>
                    <span className="rounded-full bg-[#fff2c2] px-3 py-1 text-xs font-black text-[#9a5b00]">{pack.majorShortName}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{pack.year}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-black leading-7 text-[#071f4a]">{pack.title}</h3>
                  <p className="mt-2 text-sm font-semibold text-slate-600">
                    เลือกทำ ภาค ก, ภาค ข วิชาชีพครู, ภาค ข {pack.majorShortName} หรือ ภาค ค
                  </p>
                </Link>
              ))}
          </div>
        </div>

        <aside className="rounded-lg bg-[#071f4a] p-5 text-white shadow-sm">
          <p className="text-sm font-black text-[#ffd35a]">เริ่มยังไงดี</p>
          <div className="mt-5 space-y-4">
            {[
              ["1", "ฝึกภาค ก รวม", "เริ่มซ้อมพื้นฐานกลางได้ทันที โดยไม่ต้องเลือกสังกัดหรือเอก"],
              ["2", "จำลองสนาม", "เลือกสังกัด เอก และปีสอบเมื่อต้องการทำชุดเต็ม"],
              ["3", "เลือกภาค", "ในสนามจำลองจะมี ภาค ก ภาค ข และภาค ค ให้เลือก"],
              ["4", "ดูคะแนน", "ส่งคำตอบแล้วดูคะแนนสูงสุดและประวัติของแต่ละภาคได้"],
            ].map((item) => (
              <div key={item[0]} className="flex gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#ffd35a] text-sm font-black text-[#071f4a]">{item[0]}</span>
                <div>
                  <h3 className="font-black">{item[1]}</h3>
                  <p className="mt-1 text-sm font-semibold leading-6 text-white/70">{item[2]}</p>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <SiteFooter />
    </main>
  );
}
