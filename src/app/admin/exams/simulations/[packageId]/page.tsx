import { revalidatePath } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminSubmitButton } from "@/components/admin/admin-submit-button";
import { ExamPartKind } from "@/generated/prisma/client";
import prisma from "@/lib/db/postgres";

type AdminSimulationDetailPageProps = {
  params: Promise<{ packageId: string }>;
};

export const metadata = {
  title: "จัดการชุดจำลอง | Admin Exams",
};

export const dynamic = "force-dynamic";

const partKindOptions = [
  { value: ExamPartKind.PART_A_GENERAL, label: "ภาค ก / ข้อสอบปรนัย" },
  { value: ExamPartKind.PART_B_PROFESSION, label: "ภาค ข วิชาชีพ / ข้อสอบปรนัย" },
  { value: ExamPartKind.PART_B_MAJOR, label: "ภาค ข เอกวิชา / ข้อสอบปรนัย" },
  { value: ExamPartKind.PART_C_INTERVIEW, label: "ภาค ค / สัมภาษณ์" },
] as const;

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9ก-๙]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

function readText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function readNumber(formData: FormData, key: string, fallback: number) {
  const value = Number(formData.get(key) ?? fallback);

  return Number.isFinite(value) ? value : fallback;
}

function getPartKind(value: FormDataEntryValue | null) {
  const kind = String(value ?? "");

  return partKindOptions.some((option) => option.value === kind)
    ? (kind as ExamPartKind)
    : ExamPartKind.PART_A_GENERAL;
}

function getPartKindLabel(kind: ExamPartKind) {
  return partKindOptions.find((option) => option.value === kind)?.label ?? "ข้อสอบปรนัย";
}

function revalidateSimulationAdmin(packageId: string) {
  revalidatePath("/admin/exams/simulations");
  revalidatePath(`/admin/exams/simulations/${packageId}`);
  revalidatePath("/admin/exams/questions");
  revalidatePath("/admin/exams/question-bank");
  revalidatePath("/exams");
}

async function recalculatePartTotals(partId: string) {
  const items = await prisma.examPackagePartQuestion.findMany({
    where: { partId },
    select: { score: true },
  });

  await prisma.examPackagePart.update({
    where: { id: partId },
    data: {
      totalQuestions: items.length,
      totalScore: items.reduce((sum, item) => sum + Number(item.score), 0),
    },
  });
}

async function createPackagePart(formData: FormData) {
  "use server";

  const packageId = readText(formData, "packageId");
  const kind = getPartKind(formData.get("kind"));
  const title = readText(formData, "title");
  const slug = slugify(readText(formData, "slug") || title);
  const shortTitle = readText(formData, "shortTitle");
  const audienceLabel = readText(formData, "audienceLabel");
  const description = readText(formData, "description");
  const durationMinutes = readNumber(formData, "durationMinutes", 60);
  const difficulty = readText(formData, "difficulty");
  const sortOrder = readNumber(formData, "sortOrder", 50);

  if (!packageId || !title || !slug) {
    throw new Error("กรุณากรอกข้อมูลภาคให้ครบ");
  }

  await prisma.examPackagePart.create({
    data: {
      packageId,
      kind,
      title,
      slug,
      shortTitle: shortTitle || title,
      audienceLabel: audienceLabel || null,
      description: description || null,
      durationMinutes,
      difficulty: difficulty || null,
      sortOrder,
      isActive: true,
    },
  });

  revalidateSimulationAdmin(packageId);
}

async function updatePackagePart(formData: FormData) {
  "use server";

  const packageId = readText(formData, "packageId");
  const partId = readText(formData, "partId");
  const kind = getPartKind(formData.get("kind"));
  const title = readText(formData, "title");
  const slug = slugify(readText(formData, "slug") || title);
  const shortTitle = readText(formData, "shortTitle");
  const audienceLabel = readText(formData, "audienceLabel");
  const description = readText(formData, "description");
  const durationMinutes = readNumber(formData, "durationMinutes", 60);
  const difficulty = readText(formData, "difficulty");
  const sortOrder = readNumber(formData, "sortOrder", 50);

  if (!packageId || !partId || !title || !slug) {
    throw new Error("กรุณากรอกข้อมูลภาคให้ครบ");
  }

  await prisma.examPackagePart.update({
    where: { id: partId },
    data: {
      kind,
      title,
      slug,
      shortTitle: shortTitle || title,
      audienceLabel: audienceLabel || null,
      description: description || null,
      durationMinutes,
      difficulty: difficulty || null,
      sortOrder,
    },
  });

  revalidateSimulationAdmin(packageId);
}

async function deletePackagePart(formData: FormData) {
  "use server";

  const packageId = readText(formData, "packageId");
  const partId = readText(formData, "partId");

  if (!packageId || !partId) {
    throw new Error("ไม่พบภาคที่ต้องการลบ");
  }

  await prisma.examPackagePart.update({
    where: { id: partId },
    data: { isActive: false },
  });

  revalidateSimulationAdmin(packageId);
}

async function importPracticeSetToPart(formData: FormData) {
  "use server";

  const packageId = readText(formData, "packageId");
  const partId = readText(formData, "partId");
  const practiceSetId = readText(formData, "practiceSetId");
  const mode = readText(formData, "mode") === "replace" ? "replace" : "append";

  if (!packageId || !partId || !practiceSetId) {
    throw new Error("กรุณาเลือกภาคและชุดฝึกต้นทาง");
  }

  const [part, practiceSet] = await Promise.all([
    prisma.examPackagePart.findUnique({ where: { id: partId } }),
    prisma.practiceSet.findUnique({
      where: { id: practiceSetId },
      include: {
        items: {
          orderBy: { position: "asc" },
          include: {
            section: true,
          },
        },
      },
    }),
  ]);

  if (!part || !practiceSet) {
    throw new Error("ไม่พบภาคหรือชุดฝึกต้นทาง");
  }

  if (part.kind === ExamPartKind.PART_C_INTERVIEW) {
    throw new Error("ภาค ค เป็นสัมภาษณ์ ไม่รองรับการดึงข้อสอบปรนัย");
  }

  await prisma.$transaction(async (tx) => {
    if (mode === "replace") {
      await tx.examPackagePartQuestion.deleteMany({ where: { partId } });
      await tx.examSection.deleteMany({ where: { partId } });
    }

    const existingItems = await tx.examPackagePartQuestion.findMany({
      where: { partId },
      select: { questionId: true, position: true },
      orderBy: { position: "desc" },
    });
    const existingQuestionIds = new Set(existingItems.map((item) => item.questionId));
    let nextPosition = (existingItems[0]?.position ?? 0) + 1;
    const sectionIdByTitle = new Map<string, string>();

    for (const item of practiceSet.items) {
      if (mode === "append" && existingQuestionIds.has(item.questionId)) {
        continue;
      }

      let sectionId: string | null = null;

      if (item.section) {
        const sectionKey = `${item.section.title}\n${item.section.description ?? ""}`;
        sectionId = sectionIdByTitle.get(sectionKey) ?? null;

        if (!sectionId) {
          const createdSection = await tx.examSection.create({
            data: {
              partId,
              title: item.section.title,
              description: item.section.description,
              contentFormat: item.section.contentFormat,
              sortOrder: item.section.sortOrder,
            },
          });
          sectionId = createdSection.id;
          sectionIdByTitle.set(sectionKey, createdSection.id);
        }
      }

      await tx.examPackagePartQuestion.create({
        data: {
          partId,
          sectionId,
          questionId: item.questionId,
          position: nextPosition,
          score: item.score,
        },
      });
      nextPosition++;
    }
  });

  await recalculatePartTotals(partId);
  revalidateSimulationAdmin(packageId);
}

async function removePartQuestion(formData: FormData) {
  "use server";

  const packageId = readText(formData, "packageId");
  const partId = readText(formData, "partId");
  const itemId = readText(formData, "itemId");

  if (!packageId || !partId || !itemId) {
    throw new Error("ไม่พบคำถามที่ต้องการลบ");
  }

  await prisma.$transaction(async (tx) => {
    await tx.examPackagePartQuestion.delete({ where: { id: itemId } });
    const items = await tx.examPackagePartQuestion.findMany({
      where: { partId },
      orderBy: { position: "asc" },
      select: { id: true },
    });

    for (const [index, item] of items.entries()) {
      await tx.examPackagePartQuestion.update({
        where: { id: item.id },
        data: { position: index + 1 },
      });
    }
  });

  await recalculatePartTotals(partId);
  revalidateSimulationAdmin(packageId);
}

async function movePartQuestion(formData: FormData) {
  "use server";

  const packageId = readText(formData, "packageId");
  const partId = readText(formData, "partId");
  const itemId = readText(formData, "itemId");
  const direction = readText(formData, "direction");

  if (!packageId || !partId || !itemId) {
    throw new Error("ไม่พบคำถามที่ต้องการจัดลำดับ");
  }

  await prisma.$transaction(async (tx) => {
    const current = await tx.examPackagePartQuestion.findUnique({ where: { id: itemId } });

    if (!current) {
      return;
    }

    const target = await tx.examPackagePartQuestion.findFirst({
      where: {
        partId,
        position: direction === "up" ? { lt: current.position } : { gt: current.position },
      },
      orderBy: {
        position: direction === "up" ? "desc" : "asc",
      },
    });

    if (!target) {
      return;
    }

    await tx.examPackagePartQuestion.update({ where: { id: current.id }, data: { position: -1 } });
    await tx.examPackagePartQuestion.update({ where: { id: target.id }, data: { position: current.position } });
    await tx.examPackagePartQuestion.update({ where: { id: current.id }, data: { position: target.position } });
  });

  revalidateSimulationAdmin(packageId);
}

export default async function AdminSimulationDetailPage({ params }: AdminSimulationDetailPageProps) {
  const { packageId } = await params;
  const [pack, practiceSets] = await Promise.all([
    prisma.examPackage.findUnique({
      where: { id: packageId, isActive: true },
      include: {
        track: { include: { affiliation: true, major: true } },
        parts: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          include: {
            items: {
              orderBy: { position: "asc" },
              include: {
                section: true,
                question: {
                  select: {
                    id: true,
                    stem: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.practiceSet.findMany({
      where: {
        isActive: true,
        kind: { not: ExamPartKind.PART_C_INTERVIEW },
      },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      include: {
        category: true,
        _count: { select: { items: true } },
      },
    }),
  ]);

  if (!pack) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div className="rounded-xl bg-[#0759b8] p-6 text-white shadow-sm">
        <Link href="/admin/exams/simulations" className="text-sm font-black text-[#b9ddff] hover:text-white">
          กลับชุดจำลองสนาม
        </Link>
        <h1 className="mt-3 text-3xl font-black">{pack.title}</h1>
        <p className="mt-2 text-sm font-semibold text-white/75">
          {pack.track.affiliation.label} / {pack.track.major.shortName ?? pack.track.major.name} | {pack.year} {pack.label}
        </p>
      </div>

      <form action={createPackagePart} className="rounded-xl border border-[#cfe5ff] bg-white p-5 shadow-sm">
        <input type="hidden" name="packageId" value={pack.id} />
        <p className="text-sm font-black text-[#0b66c3]">เพิ่มภาคในชุดจำลอง</p>
        <div className="mt-4 grid gap-3 lg:grid-cols-4">
          <label className="block">
            <span className="text-xs font-black text-slate-600">ประเภทภาค</span>
            <select name="kind" className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#0b66c3]">
              {partKindOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-black text-slate-600">ชื่อภาค</span>
            <input name="title" required className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#0b66c3]" placeholder="ภาค ข กฎหมายการศึกษา" />
          </label>
          <label className="block">
            <span className="text-xs font-black text-slate-600">ชื่อสั้น</span>
            <input name="shortTitle" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#0b66c3]" placeholder="ข กฎหมาย" />
          </label>
          <label className="block">
            <span className="text-xs font-black text-slate-600">Slug</span>
            <input name="slug" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#0b66c3]" placeholder="part-b-education-law" />
          </label>
          <label className="block lg:col-span-2">
            <span className="text-xs font-black text-slate-600">รายละเอียด</span>
            <input name="description" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#0b66c3]" />
          </label>
          <label className="block">
            <span className="text-xs font-black text-slate-600">กลุ่มผู้สอบ</span>
            <input name="audienceLabel" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#0b66c3]" placeholder="ทุกเอก" />
          </label>
          <label className="block">
            <span className="text-xs font-black text-slate-600">เวลา นาที</span>
            <input name="durationMinutes" type="number" defaultValue={60} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#0b66c3]" />
          </label>
          <label className="block">
            <span className="text-xs font-black text-slate-600">ระดับ</span>
            <input name="difficulty" className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#0b66c3]" />
          </label>
          <label className="block">
            <span className="text-xs font-black text-slate-600">ลำดับ</span>
            <input name="sortOrder" type="number" defaultValue={50} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#0b66c3]" />
          </label>
        </div>
        <AdminSubmitButton pendingText="กำลังเพิ่มภาค..." className="mt-4 rounded-lg bg-[#0759b8] px-4 py-2.5 text-sm font-black text-white transition hover:bg-[#0b66c3]">
          เพิ่มภาค
        </AdminSubmitButton>
      </form>

      <div className="space-y-5">
        {pack.parts.map((part) => (
          <details key={part.id} open className="rounded-xl border border-[#cfe5ff] bg-white p-5 shadow-sm">
            <summary className="cursor-pointer list-none">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-black text-[#0b66c3]">{getPartKindLabel(part.kind)}</p>
                  <h2 className="mt-1 text-xl font-black text-[#064c9b]">{part.title}</h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {part.slug} | {part.totalQuestions} ข้อ | {part.durationMinutes} นาที
                  </p>
                </div>
                <Link href={`/exams/${pack.track.affiliation.slug}/track/${pack.track.major.slug}/${pack.slug}/${part.slug}`} className="rounded-lg border border-[#cfe5ff] bg-[#eef6ff] px-4 py-2 text-center text-sm font-black text-[#0b66c3] transition hover:border-[#0b66c3]">
                  ดูหน้าเว็บ
                </Link>
              </div>
            </summary>

            <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-4">
                <form action={updatePackagePart} className="rounded-xl bg-[#f7fbff] p-4">
                  <input type="hidden" name="packageId" value={pack.id} />
                  <input type="hidden" name="partId" value={part.id} />
                  <div className="grid gap-3 lg:grid-cols-3">
                    <label className="block">
                      <span className="text-xs font-black text-slate-600">ประเภทภาค</span>
                      <select name="kind" defaultValue={part.kind} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#0b66c3]">
                        {partKindOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block">
                      <span className="text-xs font-black text-slate-600">ชื่อภาค</span>
                      <input name="title" defaultValue={part.title} required className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#0b66c3]" />
                    </label>
                    <label className="block">
                      <span className="text-xs font-black text-slate-600">Slug</span>
                      <input name="slug" defaultValue={part.slug} required className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#0b66c3]" />
                    </label>
                    <label className="block">
                      <span className="text-xs font-black text-slate-600">ชื่อสั้น</span>
                      <input name="shortTitle" defaultValue={part.shortTitle ?? ""} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#0b66c3]" />
                    </label>
                    <label className="block">
                      <span className="text-xs font-black text-slate-600">กลุ่มผู้สอบ</span>
                      <input name="audienceLabel" defaultValue={part.audienceLabel ?? ""} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#0b66c3]" />
                    </label>
                    <label className="block">
                      <span className="text-xs font-black text-slate-600">เวลา นาที</span>
                      <input name="durationMinutes" type="number" defaultValue={part.durationMinutes} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#0b66c3]" />
                    </label>
                    <label className="block lg:col-span-2">
                      <span className="text-xs font-black text-slate-600">รายละเอียด</span>
                      <input name="description" defaultValue={part.description ?? ""} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#0b66c3]" />
                    </label>
                    <label className="block">
                      <span className="text-xs font-black text-slate-600">ลำดับ</span>
                      <input name="sortOrder" type="number" defaultValue={part.sortOrder} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#0b66c3]" />
                    </label>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <AdminSubmitButton pendingText="กำลังบันทึก..." className="rounded-lg bg-[#0759b8] px-4 py-2.5 text-sm font-black text-white transition hover:bg-[#0b66c3]">
                      บันทึกภาค
                    </AdminSubmitButton>
                  </div>
                </form>

                <section className="rounded-xl border border-slate-200">
                  <div className="border-b border-slate-100 p-4">
                    <p className="font-black text-[#064c9b]">คำถามในภาคนี้</p>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {part.items.length > 0 ? (
                      part.items.map((item, index) => (
                        <div key={item.id} className="grid gap-3 p-4 lg:grid-cols-[80px_1fr_auto] lg:items-start">
                          <p className="text-sm font-black text-[#0b66c3]">ข้อ {item.position}</p>
                          <div>
                            {item.section ? (
                              <p className="mb-1 text-xs font-black text-slate-400">{item.section.title}</p>
                            ) : null}
                            <p className="line-clamp-2 text-sm font-semibold leading-6 text-slate-700">{item.question.stem}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <form action={movePartQuestion}>
                              <input type="hidden" name="packageId" value={pack.id} />
                              <input type="hidden" name="partId" value={part.id} />
                              <input type="hidden" name="itemId" value={item.id} />
                              <input type="hidden" name="direction" value="up" />
                              <AdminSubmitButton pendingText="..." className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-black text-slate-600 disabled:opacity-40" >
                                ขึ้น
                              </AdminSubmitButton>
                            </form>
                            <form action={movePartQuestion}>
                              <input type="hidden" name="packageId" value={pack.id} />
                              <input type="hidden" name="partId" value={part.id} />
                              <input type="hidden" name="itemId" value={item.id} />
                              <input type="hidden" name="direction" value="down" />
                              <AdminSubmitButton pendingText="..." className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-black text-slate-600 disabled:opacity-40">
                                ลง
                              </AdminSubmitButton>
                            </form>
                            <form action={removePartQuestion}>
                              <input type="hidden" name="packageId" value={pack.id} />
                              <input type="hidden" name="partId" value={part.id} />
                              <input type="hidden" name="itemId" value={item.id} />
                              <AdminSubmitButton pendingText="กำลังลบ..." className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-black text-rose-700">
                                ลบ
                              </AdminSubmitButton>
                            </form>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="p-4 text-sm font-semibold text-slate-500">ยังไม่มีคำถามในภาคนี้</p>
                    )}
                  </div>
                </section>
              </div>

              <aside className="space-y-4">
                <form action={importPracticeSetToPart} className="rounded-xl border border-[#cfe5ff] bg-[#eef6ff] p-4">
                  <input type="hidden" name="packageId" value={pack.id} />
                  <input type="hidden" name="partId" value={part.id} />
                  <p className="text-sm font-black text-[#064c9b]">ดึงคำถามจากชุดฝึก</p>
                  {part.kind === ExamPartKind.PART_C_INTERVIEW ? (
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">ภาค ค เป็นสัมภาษณ์ จึงไม่ใช้คำถามปรนัยจากชุดฝึก</p>
                  ) : (
                    <>
                      <label className="mt-3 block">
                        <span className="text-xs font-black text-slate-600">ชุดฝึกต้นทาง</span>
                        <select name="practiceSetId" className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#0b66c3]">
                          {practiceSets.map((set) => (
                            <option key={set.id} value={set.id}>
                              {set.category.shortTitle ?? set.category.title} / {set.title} ({set._count.items} ข้อ)
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="mt-3 block">
                        <span className="text-xs font-black text-slate-600">วิธีนำเข้า</span>
                        <select name="mode" defaultValue="append" className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#0b66c3]">
                          <option value="append">เพิ่มต่อท้าย และข้ามข้อที่ซ้ำ</option>
                          <option value="replace">แทนที่คำถามเดิมทั้งหมดในภาคนี้</option>
                        </select>
                      </label>
                      <AdminSubmitButton pendingText="กำลังดึงคำถาม..." className="mt-3 rounded-lg bg-[#0759b8] px-4 py-2.5 text-sm font-black text-white transition hover:bg-[#0b66c3]">
                        ดึงเข้าภาคนี้
                      </AdminSubmitButton>
                    </>
                  )}
                </form>

                <div className="rounded-xl border border-[#cfe5ff] bg-white p-4">
                  <p className="text-sm font-black text-[#064c9b]">เพิ่มคำถามเข้าภาคนี้</p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">เปิดหน้าเพิ่มคำถามโดยเลือกปลายทางเป็นภาคนี้ไว้แล้ว</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link href={`/admin/exams/questions?destination=part:${part.id}`} className="rounded-lg bg-[#0759b8] px-4 py-2.5 text-sm font-black text-white transition hover:bg-[#0b66c3]">
                      นำเข้า JSON / เพิ่มคำถาม
                    </Link>
                    <Link href={`/admin/exams/question-bank?source=part:${part.id}`} className="rounded-lg border border-[#cfe5ff] bg-[#eef6ff] px-4 py-2.5 text-sm font-black text-[#0b66c3] transition hover:border-[#0b66c3]">
                      แก้คำถาม
                    </Link>
                  </div>
                </div>

                <form action={deletePackagePart} className="rounded-xl border border-rose-200 bg-rose-50 p-4">
                  <input type="hidden" name="packageId" value={pack.id} />
                  <input type="hidden" name="partId" value={part.id} />
                  <p className="text-sm font-black text-rose-800">ลบภาคนี้</p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-rose-700">ระบบจะปิดใช้งานภาคนี้ ไม่ลบคำถามกลางออกจากคลัง</p>
                  <AdminSubmitButton pendingText="กำลังลบ..." className="mt-3 rounded-lg border border-rose-200 bg-white px-4 py-2 text-sm font-black text-rose-700">
                    ลบภาค
                  </AdminSubmitButton>
                </form>
              </aside>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
