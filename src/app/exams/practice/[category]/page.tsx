import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getPracticeCategory } from "@/server/exams/exam-data";

type PracticeCategoryPageProps = {
  params: Promise<{ category: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PracticeCategoryPageProps): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = await getPracticeCategory(categorySlug);

  if (!category) {
    return {};
  }

  return {
    title: category.title,
    description: `${category.description} พร้อมเลือกทำหลายชุด หลายระดับ และจับเวลา`,
    alternates: {
      canonical: `/exams/practice/${category.slug}`,
    },
  };
}

export default async function PracticeCategoryPage({ params }: PracticeCategoryPageProps) {
  const { category: categorySlug } = await params;
  const category = await getPracticeCategory(categorySlug);

  if (!category) {
    notFound();
  }
  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-950">
      <SiteHeader />

      <section className="bg-[#071f4a] text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <Link href="/exams" className="text-sm font-black text-[#ffd35a] hover:text-white">
            กลับคลังข้อสอบ
          </Link>
          <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">{category.title}</h1>
          <p className="mt-4 max-w-2xl text-lg font-semibold leading-8 text-white/85">
            {category.description}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black text-[#0b66c3]">เลือกชุดฝึก</p>
            <h2 className="mt-1 text-3xl font-black text-[#071f4a]">ฝึกหลายชุดจนจับจังหวะได้</h2>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {["ทั้งหมด", "ทุกสังกัด", "ง่าย", "กลาง", "ยาก", "30 ข้อ", "60 ข้อ"].map((item) => (
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
          {category.sets.map((set) => (
            <Link
              key={set.slug}
              href={`/exams/practice/${category.slug}/${set.slug}`}
              className="grid gap-4 border-b border-slate-100 p-5 transition last:border-b-0 hover:bg-slate-50 lg:grid-cols-[1fr_120px_110px_110px_110px] lg:items-center"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#071f4a] px-3 py-1 text-xs font-black text-white">{category.shortTitle}</span>
                  <span className="rounded-full bg-[#fff2c2] px-3 py-1 text-xs font-black text-[#9a5b00]">{set.scopeLabel}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{set.yearLabel}</span>
                </div>
                <h3 className="mt-3 text-lg font-black leading-7 text-[#071f4a]">{set.title}</h3>
                <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{set.description}</p>
              </div>
              <span className="text-sm font-black text-[#0b66c3]">{set.totalQuestions} ข้อ</span>
              <span className="text-sm font-semibold text-slate-600">{set.durationMinutes} นาที</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-center text-xs font-black text-slate-600">{set.difficulty}</span>
              <span className="text-sm font-black text-[#0b66c3] lg:text-right">เริ่มทำ →</span>
            </Link>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
