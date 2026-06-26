import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  examTrackPackages,
  getExamAffiliation,
  getExamMajor,
  getExamTrackPackage,
  getExamTrackParts,
} from "@/lib/exam-mock";

type PackagePageProps = {
  params: Promise<{ affiliation: string; major: string; package: string }>;
};

export function generateStaticParams() {
  return examTrackPackages.map((pack) => ({
    affiliation: pack.affiliationSlug,
    major: pack.majorSlug,
    package: pack.slug,
  }));
}

export async function generateMetadata({ params }: PackagePageProps): Promise<Metadata> {
  const { affiliation: affiliationSlug, major: majorSlug, package: packageSlug } = await params;
  const affiliation = getExamAffiliation(affiliationSlug);
  const major = getExamMajor(affiliationSlug, majorSlug);
  const pack = getExamTrackPackage(affiliationSlug, majorSlug, packageSlug);

  if (!affiliation || !major || !pack) {
    return {};
  }

  return {
    title: `${pack.title} เลือกภาคข้อสอบ`,
    description: `เลือกทำ ภาค ก ภาค ข วิชาชีพครู ภาค ข ${major.audience} หรือ ภาค ค ของ ${pack.title}`,
    alternates: {
      canonical: `/exams/${affiliation.slug}/track/${major.slug}/${pack.slug}`,
    },
  };
}

export default async function ExamPackagePage({ params }: PackagePageProps) {
  const { affiliation: affiliationSlug, major: majorSlug, package: packageSlug } = await params;
  const affiliation = getExamAffiliation(affiliationSlug);
  const major = getExamMajor(affiliationSlug, majorSlug);
  const pack = getExamTrackPackage(affiliationSlug, majorSlug, packageSlug);

  if (!affiliation || !major || !pack) {
    notFound();
  }

  const parts = getExamTrackParts(major);

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-950">
      <SiteHeader />

      <section className="bg-[#071f4a] text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <Link href={`/exams/${affiliation.slug}/track/${major.slug}`} className="text-sm font-black text-[#ffd35a] hover:text-white">
            กลับไปเลือกปีและชุด
          </Link>
          <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">{pack.title}</h1>
          <p className="mt-4 max-w-2xl text-lg font-semibold leading-8 text-white/85">
            ตอนนี้เลือกชุดแล้ว เหลือเลือกว่าจะเริ่มทำภาคไหนก่อน ภาค ก และวิชาชีพครูใช้ร่วมกันทุกเอก ส่วนภาค ข วิชาเอกนี้เป็นของ {major.audience}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-sm font-black text-[#0b66c3]">เลือกภาคที่จะทำ</p>
          <h2 className="mt-1 text-3xl font-black text-[#071f4a]">อยากลองทำส่วนไหนก่อน</h2>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {parts.map((part) => (
            <Link
              key={part.slug}
              href={`/exams/${affiliation.slug}/track/${major.slug}/${pack.slug}/${part.slug}`}
              className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#071f4a] px-3 py-1 text-xs font-black text-white">{part.shortTitle}</span>
                <span className="rounded-full bg-[#fff2c2] px-3 py-1 text-xs font-black text-[#9a5b00]">{part.partLabel}</span>
              </div>
              <h3 className="mt-4 text-2xl font-black text-[#071f4a] group-hover:text-[#0b66c3]">{part.title}</h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{part.description}</p>
              <p className="mt-4 text-sm font-semibold text-slate-500">
                {part.questions} ข้อ | {part.durationMinutes} นาที | {part.difficulty}
              </p>
              <p className="mt-5 text-sm font-black text-[#0b66c3]">เริ่มทำภาคนี้ →</p>
            </Link>
          ))}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
