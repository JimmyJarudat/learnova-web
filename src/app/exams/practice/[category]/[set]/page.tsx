import Link from "next/link";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { ExamRunner } from "@/components/exams/exam-runner";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getAuthOptions } from "@/lib/auth/options";
import { getPracticeSet, getPracticeSetAttemptDraft, getPracticeSetAttemptHistory } from "@/server/exams/exam-data";

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
  const currentPath = `/exams/practice/${categorySlug}/${setSlug}`;
  const session = await getServerSession(await getAuthOptions());

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent(currentPath)}`);
  }

  const practiceSet = await getPracticeSet(categorySlug, setSlug);

  if (!practiceSet) {
    notFound();
  }

  const [history, draft] = await Promise.all([
    getPracticeSetAttemptHistory(practiceSet.id, session.user.id),
    getPracticeSetAttemptDraft(practiceSet.id, session.user.id),
  ]);
  const runnerPart = {
    id: practiceSet.id,
    title: practiceSet.title,
    shortTitle: practiceSet.category.shortTitle,
    durationMinutes: practiceSet.durationMinutes,
    totalQuestions: practiceSet.totalQuestions,
    difficulty: practiceSet.difficulty,
    questions: practiceSet.questions,
  };

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
              <p className="text-xs font-bold text-slate-500">ข้อทั้งหมด</p>
              <p className="text-xl font-black text-[#071f4a]">{practiceSet.totalQuestions}</p>
            </div>
            <div className="rounded-lg bg-white px-4 py-3 ring-1 ring-slate-200">
              <p className="text-xs font-bold text-slate-500">ระดับ</p>
              <p className="text-xl font-black text-[#0b66c3]">{practiceSet.difficulty}</p>
            </div>
          </div>
        </div>
      </section>

      <ExamRunner
        part={runnerPart}
        initialHistory={history}
        initialDraft={draft}
        submitUrl={`/api/exams/practice-sets/${practiceSet.id}/submit`}
        draftTarget={{ type: "practiceSet", id: practiceSet.id }}
      />

      <SiteFooter />
    </main>
  );
}
