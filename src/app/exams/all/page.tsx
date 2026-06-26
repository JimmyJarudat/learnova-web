import Link from "next/link";
import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/config/site";
import { examAffiliations, examTrackPackages, getExamMajor, getExamTotals } from "@/lib/exam-mock";

const pageTitle = "ข้อสอบทั้งหมด ครูผู้ช่วยทุกสังกัด";
const pageDescription =
  "รวมข้อสอบครูผู้ช่วยทุกภาค ทุกวิชา และทุกหน่วยงาน ทั้ง สพฐ. สอศ. สกร. อปท. กทม. พร้อมชุดย้อนหลังและชุดจำลองสนาม";

const totals = getExamTotals();

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: "/exams/all",
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: "/exams/all",
    siteName: siteConfig.name,
    locale: "th_TH",
    type: "website",
  },
};

export default function AllExamsPage() {
  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-950">
      <SiteHeader />

      <section className="bg-[#071f4a] text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <Link href="/exams" className="text-sm font-black text-[#ffd35a] hover:text-white">
            กลับคลังข้อสอบ
          </Link>
          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_420px] lg:items-end">
            <div>
              <p className="text-sm font-black text-white/70">ข้อสอบทั้งหมด</p>
              <h1 className="mt-2 text-4xl font-black leading-tight sm:text-5xl">
                รวมทุกภาค ทุกวิชา ทุกหน่วยงาน
              </h1>
              <p className="mt-4 max-w-2xl text-lg font-semibold leading-8 text-white/85">
                ดูชุดข้อสอบทั้งหมดในหน้าเดียว ทั้ง ภาค ก วิชาชีพครู กฎหมายการศึกษา และเนื้อหาเฉพาะสังกัดจากหลายสนามสอบ
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-white/15 bg-white/12 p-4 backdrop-blur">
                <p className="text-xs font-bold text-white/70">สังกัด</p>
                <p className="mt-1 text-3xl font-black text-[#ffd35a]">{totals.affiliations}</p>
              </div>
              <div className="rounded-lg border border-white/15 bg-white/12 p-4 backdrop-blur">
                <p className="text-xs font-bold text-white/70">ชุด</p>
                <p className="mt-1 text-3xl font-black text-[#ffd35a]">{totals.sets}</p>
              </div>
              <div className="rounded-lg border border-white/15 bg-white/12 p-4 backdrop-blur">
                <p className="text-xs font-bold text-white/70">ข้อ</p>
                <p className="mt-1 text-3xl font-black text-[#ffd35a]">{totals.questions.toLocaleString("th-TH")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black text-[#0b66c3]">ค้นแบบเร็ว</p>
            <h2 className="mt-1 text-2xl font-black text-[#071f4a]">กรองตามสังกัดและวิชา</h2>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {["ทั้งหมด", ...examAffiliations.map((item) => item.label), "ภาค ก", "วิชาชีพครู", "กฎหมาย"].map((item) => (
              <button
                key={item}
                className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-600 shadow-sm transition hover:border-[#0b66c3] hover:text-[#0b66c3]"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          {examTrackPackages.map((track) => {
            const affiliation = examAffiliations.find((item) => item.slug === track.affiliationSlug);
            const major = getExamMajor(track.affiliationSlug, track.majorSlug);

            return (
              <Link
                key={`${track.affiliationSlug}-${track.majorSlug}-${track.slug}`}
                href={`/exams/${track.affiliationSlug}/track/${track.majorSlug}/${track.slug}`}
                className="grid gap-4 border-b border-slate-100 p-5 transition last:border-b-0 hover:bg-slate-50 lg:grid-cols-[1fr_90px_120px_100px_110px] lg:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#071f4a] px-3 py-1 text-xs font-black text-white">{affiliation?.label}</span>
                    <span className="rounded-full bg-[#fff2c2] px-3 py-1 text-xs font-black text-[#9a5b00]">{major?.audience}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{track.year}</span>
                  </div>
                  <h3 className="mt-3 text-lg font-black leading-7 text-[#071f4a]">{track.title}</h3>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{track.description}</p>
                </div>
                <span className="text-sm font-black text-[#0b66c3]">4 ภาค</span>
                <span className="text-sm font-semibold text-slate-600">{track.label}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-center text-xs font-black text-slate-600">{track.status}</span>
                <span className="text-sm font-black text-[#0b66c3] lg:text-right">เลือกภาค →</span>
              </Link>
            );
          })}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
