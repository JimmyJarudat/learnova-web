import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getExamTrack } from "@/server/exams/exam-data";

type MajorPageProps = {
  params: Promise<{ affiliation: string; major: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: MajorPageProps): Promise<Metadata> {
  const { affiliation: affiliationSlug, major: majorSlug } = await params;
  const track = await getExamTrack(affiliationSlug, majorSlug);

  if (!track) {
    return {};
  }

  return {
    title: `${track.affiliation.label} ${track.major.shortName} เลือกปีและชุดข้อสอบ`,
    description: `เลือกปีและชุดจำลองสนามของ ${track.major.shortName} สนาม ${track.affiliation.label} ก่อนเลือกทำ ภาค ก ภาค ข หรือ ภาค ค`,
    alternates: {
      canonical: `/exams/${track.affiliation.slug}/track/${track.major.slug}`,
    },
  };
}

export default async function ExamMajorPage({ params }: MajorPageProps) {
  const { affiliation: affiliationSlug, major: majorSlug } = await params;
  const track = await getExamTrack(affiliationSlug, majorSlug);

  if (!track) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-950">
      <SiteHeader />

      <section className="bg-[#071f4a] text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <Link href={`/exams/${track.affiliation.slug}`} className="text-sm font-black text-[#ffd35a] hover:text-white">
            กลับไปเลือกเอก
          </Link>
          <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">
            {track.affiliation.label} {track.major.shortName}
          </h1>
          <p className="mt-4 max-w-2xl text-lg font-semibold leading-8 text-white/85">
            เลือกปีหรือชุดจำลองสนามก่อน แล้วเข้าไปเลือกทำ ภาค ก, ภาค ข วิชาชีพครู, ภาค ข {track.major.shortName} หรือ ภาค ค ในชุดเดียวกัน
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-sm font-black text-[#0b66c3]">เลือกปีและชุดข้อสอบ</p>
          <h2 className="mt-1 text-3xl font-black text-[#071f4a]">อยากเริ่มจากชุดไหน</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {track.packages.map((pack) => (
            <Link
              key={pack.slug}
              href={`/exams/${track.affiliation.slug}/track/${track.major.slug}/${pack.slug}`}
              className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#071f4a] px-3 py-1 text-xs font-black text-white">{pack.year}</span>
                <span className="rounded-full bg-[#fff2c2] px-3 py-1 text-xs font-black text-[#9a5b00]">{pack.label ?? "พร้อมเลือก"}</span>
              </div>
              <h3 className="mt-4 text-xl font-black leading-7 text-[#071f4a] group-hover:text-[#0b66c3]">{pack.title}</h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{pack.description}</p>
              <p className="mt-5 text-sm font-black text-[#0b66c3]">{pack.partCount} ภาค | เลือกภาคที่จะทำ →</p>
            </Link>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
