import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { examAffiliations, getExamAffiliation, getExamSets, getExamSubject } from "@/lib/exam-mock";

type SubjectPageProps = {
  params: Promise<{ affiliation: string; subject: string }>;
};

export function generateStaticParams() {
  return examAffiliations.flatMap((affiliation) =>
    affiliation.subjects.map((subject) => ({
      affiliation: affiliation.slug,
      subject: subject.slug,
    })),
  );
}

export async function generateMetadata({ params }: SubjectPageProps): Promise<Metadata> {
  const { affiliation: affiliationSlug, subject: subjectSlug } = await params;
  const affiliation = getExamAffiliation(affiliationSlug);
  const subject = getExamSubject(affiliationSlug, subjectSlug);

  if (!affiliation || !subject) {
    return {};
  }

  return {
    title: `${subject.shortTitle} ครูผู้ช่วย ${affiliation.label}`,
    description: `รวมชุดข้อสอบ ${subject.title} สำหรับครูผู้ช่วย ${affiliation.label} กลุ่ม ${subject.audience} หลายปี หลายระดับ พร้อมเลือกเริ่มทำข้อสอบตามเป้าหมาย`,
    alternates: {
      canonical: `/exams/${affiliation.slug}/${subject.slug}`,
    },
  };
}

export default async function ExamSubjectPage({ params }: SubjectPageProps) {
  const { affiliation: affiliationSlug, subject: subjectSlug } = await params;
  const affiliation = getExamAffiliation(affiliationSlug);
  const subject = getExamSubject(affiliationSlug, subjectSlug);

  if (!affiliation || !subject) {
    notFound();
  }

  const sets = getExamSets(affiliation.slug, subject.slug);

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-950">
      <SiteHeader />

      <section className="bg-[#071f4a] text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <Link href={`/exams/${affiliation.slug}`} className="text-sm font-black text-[#ffd35a] hover:text-white">
            กลับไป {affiliation.label}
          </Link>
          <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_320px] lg:items-end">
            <div>
              <p className="text-sm font-black text-white/70">เลือกชุดข้อสอบ</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#071f4a]">{subject.partLabel}</span>
                <span className="rounded-full bg-[#ffd35a] px-3 py-1 text-xs font-black text-[#071f4a]">{subject.audience}</span>
              </div>
              <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
                {subject.title} {affiliation.label}
              </h1>
              <p className="mt-4 max-w-2xl text-lg font-semibold leading-8 text-white/85">
                {subject.focus}
              </p>
            </div>
            <div className="rounded-lg border border-white/15 bg-white/12 p-5 backdrop-blur">
              <p className="text-sm font-bold text-white/70">มีให้เลือก</p>
              <p className="mt-1 text-4xl font-black text-[#ffd35a]">{sets.length} ชุด</p>
              <p className="mt-2 text-sm font-semibold text-white/70">ย้อนหลัง / จำลองสนาม / ชุดเก็บคะแนน</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          {sets.map((set) => (
            <Link
              key={set.slug}
              href={`/exams/${affiliation.slug}/${subject.slug}/${set.slug}`}
              className="grid gap-4 border-b border-slate-100 p-5 transition last:border-b-0 hover:bg-slate-50 lg:grid-cols-[1fr_120px_110px_110px_110px] lg:items-center"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#071f4a] px-3 py-1 text-xs font-black text-white">{set.year}</span>
                  <span className="rounded-full bg-[#fff2c2] px-3 py-1 text-xs font-black text-[#9a5b00]">{set.status}</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">{subject.audience}</span>
                </div>
                <h2 className="mt-3 text-xl font-black text-[#071f4a]">{set.title}</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{set.description}</p>
              </div>
              <span className="text-sm font-black text-[#0b66c3]">{set.questions} ข้อ</span>
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
