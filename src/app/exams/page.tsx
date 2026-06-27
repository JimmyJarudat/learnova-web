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

const affiliationLogoBySlug: Record<string, string> = {
  obec: "/images/affiliations/obec.png",
  ovec: "/images/affiliations/ovec.png",
  dole: "/images/affiliations/dole.png",
  dla: "/images/affiliations/dla.svg",
  bma: "/images/affiliations/bma.svg",
};

export default async function ExamsPage() {
  const { affiliations, practiceCategories, popularPackages, totals } = await getExamOverview();

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-950">
      <SiteHeader />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-stretch">
            <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-[#071f4a] p-6 text-white shadow-sm">
              <div className="absolute inset-y-0 right-0 w-24 bg-[#ffd35a]" />
              <div className="absolute right-8 top-8 hidden h-24 w-24 rotate-6 rounded-lg border-2 border-[#071f4a] bg-white/95 p-3 shadow-lg sm:block">
                <div className="h-2 w-16 rounded-full bg-[#071f4a]" />
                <div className="mt-3 space-y-2">
                  <div className="h-2 rounded-full bg-slate-200" />
                  <div className="h-2 w-10 rounded-full bg-slate-200" />
                  <div className="h-2 w-14 rounded-full bg-[#ffd35a]" />
                </div>
              </div>
              <div className="relative max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#071f4a]">คลังข้อสอบ</span>
                  <span className="rounded-full bg-[#ffd35a] px-3 py-1 text-xs font-black text-[#071f4a]">
                    ครูผู้ช่วยทุกสังกัด
                  </span>
                </div>
                <h1 className="mt-4 max-w-2xl text-3xl font-black leading-tight sm:text-5xl">
                  เลือกชุดข้อสอบที่ตรงกับสนามของคุณ
                </h1>
                <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-white/78 sm:text-base">
                  เลือกฝึกภาค ก รวม หรือเลือกสังกัดและเอกเพื่อทำชุดจำลองสนามสอบตามโครงสร้างของแต่ละสนาม
                </p>

                <div className="mt-6 flex flex-wrap gap-2">
                  <Link href="/exams/practice/part-a" className="rounded-lg bg-[#ffd35a] px-4 py-2.5 text-sm font-black text-[#071f4a] shadow-sm transition hover:bg-[#f6bf22]">
                    ฝึกภาค ก
                  </Link>
                  <Link href="#affiliations" className="rounded-lg bg-white px-4 py-2.5 text-sm font-black text-[#071f4a] shadow-sm transition hover:bg-slate-100">
                    เลือกสังกัด
                  </Link>
                  <Link href="/exams/all" className="rounded-lg border border-white/25 bg-white/10 px-4 py-2.5 text-sm font-black text-white transition hover:bg-white/18">
                    ข้อสอบทั้งหมด
                  </Link>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-[#f8fafc] p-5 shadow-sm">
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="text-sm font-black text-[#0b66c3]">ภาพรวมคลังข้อสอบ</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">ข้อมูลข้อสอบที่เปิดใช้งาน</p>
              </div>
              <div className="mt-4 grid gap-3">
                {[
                  ["สังกัดสอบทั้งหมด", totals.affiliations],
                  ["ชุดข้อสอบทั้งหมด", totals.sets],
                  ["ข้อสอบทั้งหมด", totals.questions.toLocaleString("th-TH")],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
                    <p className="text-sm font-black text-slate-600">{label}</p>
                    <p className="text-2xl font-black text-[#071f4a]">{value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-lg bg-[#071f4a] px-4 py-3 text-sm font-black text-white">
                เลือกหมวดฝึก หรือเลือกสังกัดเพื่อเข้าสู่ชุดจำลองสนาม
              </div>
            </div>
          </div>
        </div>
      </section>

      {practiceCategories.length > 0 ? (
        <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
          <div className="mb-6 rounded-lg border border-[#ffd35a]/50 bg-[#fff8df] p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-black text-[#9a5b00]">ฝึกตามหมวด</p>
                <h2 className="mt-1 text-3xl font-black text-[#071f4a]">เลือกหมวดข้อสอบที่ต้องการฝึก</h2>
                <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-600">
                  เหมาะสำหรับการฝึกเนื้อหาที่ใช้ร่วมกันในหลายสนามสอบ โดยไม่จำเป็นต้องเลือกสังกัดหรือเอกก่อน
                </p>
              </div>
              <Link href="/exams/practice" className="inline-flex w-fit rounded-lg bg-[#071f4a] px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-[#0b66c3]">
                ดูชุดฝึกทั้งหมด
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {practiceCategories.map((category) => (
              <Link
                key={category.slug}
                href={`/exams/practice/${category.slug}`}
                className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-[#0b66c3]/40 hover:shadow-lg"
              >
                <div className={`${category.colorClass} flex items-center justify-between px-5 py-3`}>
                  <span className="text-xs font-black text-white drop-shadow-sm">หมวดฝึก</span>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#071f4a] shadow-sm">
                    {category.setCount} ชุด
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-black leading-7 text-[#071f4a] group-hover:text-[#0b66c3]">{category.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm font-semibold leading-6 text-slate-600">{category.description}</p>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">ทุกสังกัด</span>
                    <span className="text-sm font-black text-[#0b66c3]">เลือกชุด →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section id="affiliations" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black text-[#0b66c3]">เลือกสนามสอบ</p>
            <h2 className="mt-1 text-3xl font-black text-[#071f4a]">เลือกสังกัดที่ต้องการเตรียมสอบ</h2>
          </div>
          <p className="max-w-xl text-sm font-semibold leading-6 text-slate-500">
            แต่ละสังกัดมีโครงสร้างข้อสอบและหัวข้อเฉพาะแตกต่างกัน ระบบจะแสดงชุดข้อสอบตามสนามที่เลือก
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-5">
          {affiliations.map((affiliation) => (
            <Link
              key={affiliation.slug}
              href={`/exams/${affiliation.slug}`}
              className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className={`${affiliation.colorClass} relative grid h-44 place-items-center overflow-hidden`}>
                <div className="absolute inset-x-8 bottom-0 h-24 rounded-t-full bg-white/20 blur-xl" />
                <Image
                  src={affiliationLogoBySlug[affiliation.slug] ?? affiliation.imageUrl ?? "/images/teacher-card-general.png"}
                  alt={`โลโก้${affiliation.label}`}
                  width={156}
                  height={156}
                  unoptimized
                  className="relative max-h-36 w-auto object-contain drop-shadow-xl transition group-hover:scale-105"
                />
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
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-black text-[#0b66c3]">ชุดข้อสอบแนะนำ</p>
              <h2 className="mt-1 text-3xl font-black text-[#071f4a]">ชุดจำลองสนามที่พร้อมใช้งาน</h2>
              <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
                เลือกชุดข้อสอบตามสังกัดและเอก จากนั้นเลือกภาคที่ต้องการทำภายในชุดนั้น
              </p>
            </div>
            <Link href="/exams/simulations" className="inline-flex w-fit rounded-lg border border-[#0b66c3]/25 bg-white px-4 py-2.5 text-sm font-black text-[#0b66c3] shadow-sm transition hover:border-[#0b66c3] hover:bg-[#f3f8ff]">
              ดูชุดจำลองทั้งหมด
            </Link>
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
                  ประกอบด้วย ภาค ก, ภาค ข วิชาชีพครู, ภาค ข {pack.majorShortName} และ ภาค ค
                </p>
              </Link>
            ))}
          </div>
        </div>

        <aside className="rounded-lg bg-[#071f4a] p-5 text-white shadow-sm">
          <p className="text-sm font-black text-[#ffd35a]">แนวทางการเลือกชุดข้อสอบ</p>
          <div className="mt-5 space-y-4">
            {[
              ["1", "ฝึกเนื้อหาพื้นฐาน", "เลือกหมวดฝึกภาค ก รวม"],
              ["2", "เตรียมสอบตามสนามจริง", "เลือกสังกัดและเอกที่ต้องการสอบ"],
              ["3", "ทำชุดข้อสอบแบบแยกภาค", "เลือกภาค ก ภาค ข หรือ ภาค ค ภายในชุดสอบ"],
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
