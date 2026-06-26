import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/config/site";
import { examAffiliations, examTrackPackages, getExamMajor, getExamTotals } from "@/lib/exam-mock";

const pageTitle = "คลังข้อสอบครูผู้ช่วย แยกตามสังกัดและวิชา";
const pageDescription =
  "เลือกข้อสอบครูผู้ช่วยตามสังกัด เช่น สพฐ. สอศ. สกร. อปท. กทม. แล้วเจาะต่อเป็น ภาค ก วิชาชีพครู กฎหมายการศึกษา และชุดข้อสอบหลายปี";

const totals = getExamTotals();
const popularTracks = examTrackPackages.filter((pack) => pack.slug === "full-mock-1").slice(0, 4);

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

export default function ExamsPage() {
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
              เริ่มฝึกข้อสอบให้ตรงสนามที่คุณจะสอบ
            </h1>
            <p className="mt-5 max-w-2xl text-lg font-semibold leading-8 text-white/85">
              เลือกสนามสอบของคุณ แล้วเข้าไปฝึก ภาค ก วิชาชีพครู กฎหมาย หรือเนื้อหาเฉพาะสังกัด พร้อมชุดย้อนหลังและชุดจำลองสนามที่จัดไว้ให้เริ่มทำได้ทันที
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/exams/all" className="rounded-xl bg-[#ffd35a] px-6 py-3 text-sm font-black text-[#071f4a] shadow-lg shadow-black/10 transition hover:bg-[#f6bf22]">
                ดูข้อสอบทั้งหมด
              </Link>
              <Link href="/exams/ovec" className="rounded-xl bg-[#ffd35a] px-6 py-3 text-sm font-black text-[#071f4a] shadow-lg shadow-black/10 transition hover:bg-[#f6bf22]">
                เริ่มจาก สอศ.
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

      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <Link
          href="/exams/all"
          className="group grid gap-5 rounded-lg border border-[#0b66c3]/20 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl lg:grid-cols-[1fr_auto] lg:items-center"
        >
          <div>
            <p className="text-sm font-black text-[#0b66c3]">ข้อสอบทั้งหมด</p>
            <h2 className="mt-1 text-2xl font-black text-[#071f4a]">รวมทุกภาค ทุกวิชา ทุกหน่วยงานในหน้าเดียว</h2>
            <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">
              เหมาะสำหรับคนที่อยากไล่ดูทั้งหมดก่อนเลือกสนาม หรืออยากค้นหาชุดย้อนหลังจากหลายสังกัดพร้อมกัน
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
          {examAffiliations.map((affiliation) => (
            <Link
              key={affiliation.slug}
              href={`/exams/${affiliation.slug}`}
              className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className={`${affiliation.color} relative h-40 overflow-hidden`}>
                <Image src={affiliation.image} alt="" fill sizes="(min-width: 1024px) 20vw, 100vw" className="object-contain object-bottom transition group-hover:scale-105" />
                <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-black text-[#071f4a]">
                  {affiliation.label}
                </span>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-black text-[#071f4a] group-hover:text-[#0b66c3]">{affiliation.label}</h3>
                <p className="mt-2 line-clamp-3 text-sm font-semibold leading-6 text-slate-600">{affiliation.description}</p>
                <p className="mt-4 text-sm font-black text-[#0b66c3]">ดูวิชาของสังกัดนี้ →</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 pb-12 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <div>
          <div className="mb-5">
            <p className="text-sm font-black text-[#0b66c3]">เริ่มทำได้เลย</p>
            <h2 className="mt-1 text-3xl font-black text-[#071f4a]">ชุดจำลองสนามยอดนิยม</h2>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
              เลือกเส้นทางตามสังกัดและเอกก่อน แล้วค่อยเลือกว่าจะเริ่มทำ ภาค ก หรือ ภาค ข ในชุดนั้น
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {popularTracks.map((track) => {
              const affiliation = examAffiliations.find((item) => item.slug === track.affiliationSlug);
              const major = getExamMajor(track.affiliationSlug, track.majorSlug);

              return (
                <Link
                  key={`${track.affiliationSlug}-${track.majorSlug}-${track.slug}`}
                  href={`/exams/${track.affiliationSlug}/track/${track.majorSlug}/${track.slug}`}
                  className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[#071f4a] px-3 py-1 text-xs font-black text-white">{affiliation?.label}</span>
                    <span className="rounded-full bg-[#fff2c2] px-3 py-1 text-xs font-black text-[#9a5b00]">{major?.audience}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{track.year}</span>
                  </div>
                  <h3 className="mt-4 text-lg font-black leading-7 text-[#071f4a]">{track.title}</h3>
                  <p className="mt-2 text-sm font-semibold text-slate-600">
                    เลือกทำ ภาค ก, วิชาชีพครู, ภาค ข {major?.audience} หรือ ภาค ค
                  </p>
                </Link>
              );
            })}
          </div>
        </div>

        <aside className="rounded-lg bg-[#071f4a] p-5 text-white shadow-sm">
          <p className="text-sm font-black text-[#ffd35a]">เริ่มยังไงดี</p>
          <div className="mt-5 space-y-4">
            {[
              ["1", "เลือกสังกัด", "เริ่มจากสนามที่ต้องสอบจริง เช่น สอศ. หรือ สพฐ."],
              ["2", "เลือกเอก", "เลือกเอกคอม เอกคณิต เอกอังกฤษ หรือเอกที่สมัคร"],
              ["3", "เลือกปี/ชุด", "เลือกปี 2568, 2567 หรือชุดจำลองสนามเต็มชุด"],
              ["4", "เลือกภาค", "เลือกทำ ภาค ก ภาค ข วิชาชีพครู ภาค ข วิชาเอก หรือ ภาค ค"],
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
