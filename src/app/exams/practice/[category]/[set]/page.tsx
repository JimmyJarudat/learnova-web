import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPracticeSet } from "@/server/exams/exam-data";

type PracticeSetPageProps = {
  params: Promise<{ category: string; set: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PracticeSetPageProps): Promise<Metadata> {
  const { category: categorySlug, set: setSlug } = await params;
  const practiceSet = await getPracticeSet(categorySlug, setSlug);

  if (!practiceSet) {
    return {};
  }

  return {
    title: practiceSet.title,
    description: `ทำข้อสอบ ${practiceSet.title} จำนวน ${practiceSet.totalQuestions} ข้อ ใช้เวลา ${practiceSet.durationMinutes} นาที`,
    alternates: {
      canonical: `/exams/practice/${practiceSet.category.slug}/${practiceSet.slug}`,
    },
  };
}

export default async function PracticeSetPage({ params }: PracticeSetPageProps) {
  const { category: categorySlug, set: setSlug } = await params;
  const practiceSet = await getPracticeSet(categorySlug, setSlug);

  if (!practiceSet) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#eef2f7] text-slate-950">
      <SiteHeader />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <Link href={`/exams/practice/${practiceSet.category.slug}`} className="text-sm font-black text-[#0b66c3] hover:text-[#071f4a]">
              กลับไปเลือกชุดฝึก
            </Link>
            <h1 className="mt-2 text-2xl font-black text-[#071f4a]">{practiceSet.title}</h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              {practiceSet.category.shortTitle} | {practiceSet.scopeLabel} | {practiceSet.totalQuestions} ข้อ | {practiceSet.durationMinutes} นาที
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-[#071f4a] px-4 py-3 text-white">
              <p className="text-xs font-bold text-white/60">เวลา</p>
              <p className="text-xl font-black text-[#ffd35a]">{practiceSet.durationMinutes}:00</p>
            </div>
            <div className="rounded-lg bg-white px-4 py-3 ring-1 ring-slate-200">
              <p className="text-xs font-bold text-slate-500">ทำแล้ว</p>
              <p className="text-xl font-black text-[#071f4a]">0/{practiceSet.totalQuestions}</p>
            </div>
            <div className="rounded-lg bg-white px-4 py-3 ring-1 ring-slate-200">
              <p className="text-xs font-bold text-slate-500">ระดับ</p>
              <p className="text-xl font-black text-[#0b66c3]">{practiceSet.difficulty}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8">
        <div className="space-y-5">
          {practiceSet.questions.length > 0 ? (
            practiceSet.questions.map((question) => (
              <article key={question.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-[#0b66c3]">ข้อ {question.no}</p>
                  <h2 className="mt-2 text-xl font-black leading-8 text-[#071f4a]">{question.stem}</h2>
                </div>
                <span className="rounded-full bg-[#fff2c2] px-3 py-1 text-xs font-black text-[#9a5b00]">
                  {question.score} คะแนน
                </span>
              </div>

              <div className="mt-5 grid gap-3">
                {question.choices.map((choice) => (
                  <label key={choice.id} className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-[#0b66c3] hover:bg-white">
                    <input type="radio" name={`question-${question.id}`} className="mt-1 h-4 w-4 accent-[#0b66c3]" />
                    <span className="text-sm font-semibold leading-6 text-slate-700">{choice.label}. {choice.text}</span>
                  </label>
                ))}
              </div>
            </article>
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
              <p className="text-sm font-black text-[#0b66c3]">ยังไม่มีคำถามในชุดฝึกนี้</p>
              <h2 className="mt-2 text-2xl font-black text-[#071f4a]">เพิ่มคำถามในฐานข้อมูลแล้วหน้านี้จะแสดงทันที</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm font-semibold leading-6 text-slate-500">
                ข้อมูลชุดฝึกนี้มาจาก `practice_sets` แล้ว เหลือผูกคำถามผ่าน `practice_set_questions`
              </p>
            </div>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-[#071f4a]">สารบัญข้อสอบ</h2>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {Array.from({ length: Math.max(practiceSet.totalQuestions, practiceSet.questions.length, 1) }).map((_, index) => (
                <button
                  key={index + 1}
                  className={`h-10 rounded-lg text-sm font-black ${
                    index < practiceSet.questions.length ? "bg-[#0b66c3] text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-[#071f4a] p-5 text-white shadow-sm">
            <p className="text-sm font-black text-[#ffd35a]">พร้อมส่งคำตอบ</p>
            <h2 className="mt-2 text-2xl font-black">ตรวจคะแนนหลังทำเสร็จ</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-white/70">
              ระบบจะสรุปคะแนนของ {practiceSet.category.shortTitle} พร้อมหัวข้อที่ควรกลับไปทบทวน
            </p>
            <button className="mt-5 w-full rounded-xl bg-[#ffd35a] px-4 py-3 text-sm font-black text-[#071f4a]">
              ส่งคำตอบ
            </button>
          </div>
        </aside>
      </section>

      <SiteFooter />
    </main>
  );
}
