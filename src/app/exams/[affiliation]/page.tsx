import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { examAffiliations, getExamAffiliation, getExamMajors, getExamTrackPackages } from "@/lib/exam-mock";

type AffiliationPageProps = {
  params: Promise<{ affiliation: string }>;
};

export function generateStaticParams() {
  return examAffiliations.map((affiliation) => ({ affiliation: affiliation.slug }));
}

export async function generateMetadata({ params }: AffiliationPageProps): Promise<Metadata> {
  const { affiliation: slug } = await params;
  const affiliation = getExamAffiliation(slug);

  if (!affiliation) {
    return {};
  }

  return {
    title: `เลือกเอกสอบครูผู้ช่วย ${affiliation.label}`,
    description: `เลือกเอกที่สมัครสอบครูผู้ช่วย ${affiliation.label} เช่น เอกคอม เอกคณิต เอกอังกฤษ แล้วค่อยเลือกปีและภาคข้อสอบ`,
    alternates: {
      canonical: `/exams/${affiliation.slug}`,
    },
  };
}

export default async function ExamAffiliationPage({ params }: AffiliationPageProps) {
  const { affiliation: slug } = await params;
  const affiliation = getExamAffiliation(slug);

  if (!affiliation) {
    notFound();
  }

  const majors = getExamMajors(affiliation.slug);

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-950">
      <SiteHeader />

      <section className={`${affiliation.color} relative overflow-hidden text-white`}>
        <div className="absolute inset-0 bg-gradient-to-r from-[#071f4a]/94 via-[#071f4a]/72 to-transparent" />
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8 lg:py-16">
          <div className="relative z-10">
            <Link href="/exams" className="text-sm font-black text-[#ffd35a] hover:text-white">
              กลับคลังข้อสอบ
            </Link>
            <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">
              เลือกเอกที่สมัครสอบ {affiliation.label}
            </h1>
            <p className="mt-4 max-w-2xl text-lg font-semibold leading-8 text-white/85">
              เพื่อไม่ให้ปนกัน ให้เริ่มจากเอกของคุณก่อน เช่น เอกคอม เอกคณิต หรือเอกอังกฤษ จากนั้นระบบจะแสดงชุดปี 2568, 2567 และชุดจำลองสนาม แล้วค่อยเลือกว่าจะทำ ภาค ก หรือ ภาค ข
            </p>
          </div>

          <div className="relative z-10 hidden min-h-72 lg:block">
            <Image src={affiliation.image} alt="" fill priority sizes="360px" className="object-contain object-bottom" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <p className="text-sm font-black text-[#0b66c3]">เลือกเอกสอบ</p>
          <h2 className="mt-1 text-3xl font-black text-[#071f4a]">คุณสมัครสอบเอกอะไร</h2>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-slate-500">
            หลังเลือกเอกแล้ว ชุดข้อสอบแต่ละปีจะแยกภาคที่ต้องทำให้เอง เช่น ภาค ก ทุกเอก, ภาค ข วิชาชีพครู, ภาค ข วิชาเอก และภาค ค
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {majors.map((major) => {
            const packages = getExamTrackPackages(affiliation.slug, major.slug);

            return (
              <Link
                key={major.slug}
                href={`/exams/${affiliation.slug}/track/${major.slug}`}
                className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-[#071f4a] px-3 py-1 text-xs font-black text-white">{affiliation.label}</span>
                  <span className="rounded-full bg-[#fff2c2] px-3 py-1 text-xs font-black text-[#9a5b00]">{packages.length} ชุดปี</span>
                </div>
                <h3 className="mt-4 text-2xl font-black text-[#071f4a] group-hover:text-[#0b66c3]">{major.audience}</h3>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{major.focus}</p>
                <p className="mt-5 text-sm font-black text-[#0b66c3]">เลือกปีและชุดของเอกนี้ →</p>
              </Link>
            );
          })}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
