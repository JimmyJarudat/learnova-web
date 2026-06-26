import Link from "next/link";
import { getServerSession } from "next-auth";
import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/config/site";
import { getAuthOptions } from "@/lib/auth/options";
import { getAllExamPackages } from "@/server/exams/exam-data";

const pageTitle = "ข้อสอบทั้งหมด ครูผู้ช่วยทุกสังกัด";
const pageDescription =
  "รวมข้อสอบครูผู้ช่วยทุกภาค ทุกวิชา และทุกหน่วยงาน ทั้ง สพฐ. สอศ. สกร. อปท. กทม. พร้อมชุดย้อนหลังและชุดจำลองสนาม";

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

export const dynamic = "force-dynamic";

export default async function AllExamsPage() {
  const session = await getServerSession(await getAuthOptions());
  const { affiliations, packages, totals } = await getAllExamPackages(session?.user?.id);

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
            {["ทั้งหมด", ...affiliations.map((item) => item.label), "ภาค ก", "วิชาชีพครู", "กฎหมาย"].map((item) => (
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
          {packages.map((pack) => (
              <Link
                key={`${pack.affiliationSlug}-${pack.majorSlug}-${pack.slug}`}
                href={`/exams/${pack.affiliationSlug}/track/${pack.majorSlug}/${pack.slug}`}
                className="grid gap-4 border-b border-slate-100 p-5 transition last:border-b-0 hover:bg-slate-50 lg:grid-cols-[1fr_90px_120px_100px_110px] lg:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-[#071f4a] px-3 py-1 text-xs font-black text-white">{pack.affiliationLabel}</span>
                    <span className="rounded-full bg-[#fff2c2] px-3 py-1 text-xs font-black text-[#9a5b00]">{pack.majorShortName}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{pack.year}</span>
                  </div>
                  <h3 className="mt-3 text-lg font-black leading-7 text-[#071f4a]">{pack.title}</h3>
                  <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{pack.description}</p>
                </div>
                <span className="text-sm font-black text-[#0b66c3]">{pack.partCount} ภาค</span>
                <span className="text-sm font-semibold text-slate-600">{pack.label}</span>
                {pack.history?.bestAttempt ? (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-center text-xs font-black text-emerald-700">
                    สูงสุด {pack.history.bestAttempt.score}/{pack.history.bestAttempt.maxScore}
                  </span>
                ) : session?.user?.id ? (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-center text-xs font-black text-slate-600">ยังไม่เคยทำ</span>
                ) : (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-center text-xs font-black text-slate-600">เข้าสู่ระบบเพื่อเก็บคะแนน</span>
                )}
                <span className="text-sm font-black text-[#0b66c3] lg:text-right">เลือกภาค →</span>
              </Link>
            ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
