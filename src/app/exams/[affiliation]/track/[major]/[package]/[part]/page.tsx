import Link from "next/link";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { ExamRunner } from "@/components/exams/exam-runner";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getAuthOptions } from "@/lib/auth/options";
import { getExamPackagePart, getPackagePartAttemptHistory } from "@/server/exams/exam-data";

type TrackPartPageProps = {
  params: Promise<{ affiliation: string; major: string; package: string; part: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: TrackPartPageProps): Promise<Metadata> {
  const { affiliation: affiliationSlug, major: majorSlug, package: packageSlug, part: partSlug } = await params;
  const part = await getExamPackagePart(affiliationSlug, majorSlug, packageSlug, partSlug);

  if (!part) {
    return {};
  }

  return {
    title: `${part.title} ${part.package.title}`,
    description: `ทำข้อสอบ ${part.title} สำหรับ ${part.package.title} จำนวน ${part.totalQuestions} ข้อ ใช้เวลา ${part.durationMinutes} นาที`,
    alternates: {
      canonical: `/exams/${part.affiliation.slug}/track/${part.major.slug}/${part.package.slug}/${part.slug}`,
    },
  };
}

export default async function TrackPartPage({ params }: TrackPartPageProps) {
  const { affiliation: affiliationSlug, major: majorSlug, package: packageSlug, part: partSlug } = await params;
  const currentPath = `/exams/${affiliationSlug}/track/${majorSlug}/${packageSlug}/${partSlug}`;
  const session = await getServerSession(await getAuthOptions());

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent(currentPath)}`);
  }

  const part = await getExamPackagePart(affiliationSlug, majorSlug, packageSlug, partSlug);

  if (!part) {
    notFound();
  }

  const history = await getPackagePartAttemptHistory(part.id, session.user.id);

  return (
    <main className="min-h-screen bg-[#eef2f7] text-slate-950">
      <SiteHeader />

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <Link href={`/exams/${part.affiliation.slug}/track/${part.major.slug}/${part.package.slug}`} className="text-sm font-black text-[#0b66c3] hover:text-[#071f4a]">
              กลับไปเลือกภาคข้อสอบ
            </Link>
            <h1 className="mt-2 text-2xl font-black text-[#071f4a]">{part.title}</h1>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              {part.affiliation.label} | {part.major.shortName} | {part.package.year} {part.package.label} | {part.totalQuestions} ข้อ | {part.durationMinutes} นาที
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-[#071f4a] px-4 py-3 text-white">
              <p className="text-xs font-bold text-white/60">เวลา</p>
              <p className="text-xl font-black text-[#ffd35a]">{part.durationMinutes}:00</p>
            </div>
            <div className="rounded-lg bg-white px-4 py-3 ring-1 ring-slate-200">
              <p className="text-xs font-bold text-slate-500">ข้อทั้งหมด</p>
              <p className="text-xl font-black text-[#071f4a]">{part.totalQuestions}</p>
            </div>
            <div className="rounded-lg bg-white px-4 py-3 ring-1 ring-slate-200">
              <p className="text-xs font-bold text-slate-500">ระดับ</p>
              <p className="text-xl font-black text-[#0b66c3]">{part.difficulty}</p>
            </div>
          </div>
        </div>
      </section>

      <ExamRunner part={part} initialHistory={history} />

      <SiteFooter />
    </main>
  );
}
