import { revalidatePath } from "next/cache";
import Link from "next/link";
import { ExamPartKind } from "@/generated/prisma/client";
import prisma from "@/lib/db/postgres";

export const metadata = {
  title: "ชุดคลังฝึก | Admin Exams",
};

export const dynamic = "force-dynamic";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9ก-๙]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

const practiceSetKindOptions = [
  {
    value: ExamPartKind.PART_A_GENERAL,
    label: "ภาค ก / ข้อสอบปรนัย",
    description: "ใช้ ExamRunner สำหรับข้อสอบแบบมีตัวเลือกและเฉลย",
  },
  {
    value: ExamPartKind.PART_B_PROFESSION,
    label: "ภาค ข วิชาชีพ / ข้อสอบปรนัย",
    description: "ใช้กับกฎหมาย การศึกษา หรือความรู้วิชาชีพครู",
  },
  {
    value: ExamPartKind.PART_B_MAJOR,
    label: "ภาค ข เอกวิชา / ข้อสอบปรนัย",
    description: "ใช้กับชุดฝึกเฉพาะเอก เช่น คอมพิวเตอร์ คณิตศาสตร์ ภาษาอังกฤษ",
  },
  {
    value: ExamPartKind.PART_C_INTERVIEW,
    label: "ภาค ค / สัมภาษณ์",
    description: "ใช้ InterviewCoach สำหรับซ้อมตอบสัมภาษณ์และให้ AI ประเมิน",
  },
] as const;

function getPracticeSetKind(value: FormDataEntryValue | null) {
  const kind = String(value ?? "");

  return practiceSetKindOptions.some((option) => option.value === kind)
    ? (kind as ExamPartKind)
    : ExamPartKind.PART_A_GENERAL;
}

function getPracticeSetKindLabel(kind: ExamPartKind) {
  return practiceSetKindOptions.find((option) => option.value === kind)?.label ?? "ข้อสอบปรนัย";
}

async function createPracticeSet(formData: FormData) {
  "use server";

  const categoryId = String(formData.get("categoryId") ?? "");
  const kind = getPracticeSetKind(formData.get("kind"));
  const title = String(formData.get("title") ?? "").trim();
  const yearLabel = String(formData.get("yearLabel") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "") || title);
  const durationMinutes = Number(formData.get("durationMinutes") ?? 120);

  if (!categoryId || !title || !slug) {
    throw new Error("กรุณาเลือกหมวด และกรอกชื่อชุด/slug");
  }

  const category = await prisma.practiceCategory.findUnique({ where: { id: categoryId } });

  if (!category) {
    throw new Error("ไม่พบหมวดคลังฝึกกลาง");
  }

  await prisma.practiceSet.create({
    data: {
      categoryId: category.id,
      kind,
      slug,
      title,
      scopeLabel: "ใช้ร่วมหลายสังกัด",
      yearLabel,
      description: `${title} สำหรับ${category.shortTitle ?? category.title}`,
      durationMinutes: Number.isFinite(durationMinutes) ? durationMinutes : 120,
      totalQuestions: 0,
      totalScore: 0,
      difficulty: "รอเพิ่มข้อสอบ",
      sortOrder: 20,
      isActive: true,
    },
  });

  revalidatePath("/admin/exams/practice-sets");
  revalidatePath("/admin/exams/questions");
  revalidatePath("/exams");
}

async function deletePracticeSet(formData: FormData) {
  "use server";

  const setId = String(formData.get("setId") ?? "");

  if (!setId) {
    throw new Error("ไม่พบชุดคลังฝึกที่ต้องการลบ");
  }

  await prisma.practiceSet.update({
    where: { id: setId },
    data: { isActive: false },
  });

  revalidatePath("/admin/exams/practice-sets");
  revalidatePath("/admin/exams/questions");
  revalidatePath("/exams");
}

async function updatePracticeSet(formData: FormData) {
  "use server";

  const setId = String(formData.get("setId") ?? "");
  const categoryId = String(formData.get("categoryId") ?? "");
  const kind = getPracticeSetKind(formData.get("kind"));
  const title = String(formData.get("title") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "") || title);
  const yearLabel = String(formData.get("yearLabel") ?? "").trim();
  const scopeLabel = String(formData.get("scopeLabel") ?? "").trim();
  const durationMinutes = Number(formData.get("durationMinutes") ?? 120);
  const difficulty = String(formData.get("difficulty") ?? "").trim();
  const sortOrder = Number(formData.get("sortOrder") ?? 20);

  if (!setId || !categoryId || !title || !slug) {
    throw new Error("กรุณากรอกข้อมูลชุดคลังฝึกให้ครบ");
  }

  await prisma.practiceSet.update({
    where: { id: setId },
    data: {
      categoryId,
      kind,
      title,
      slug,
      yearLabel: yearLabel || null,
      scopeLabel: scopeLabel || "ใช้ร่วมหลายสังกัด",
      durationMinutes: Number.isFinite(durationMinutes) ? durationMinutes : 120,
      difficulty: difficulty || null,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 20,
    },
  });

  revalidatePath("/admin/exams/practice-sets");
  revalidatePath("/admin/exams/questions");
  revalidatePath("/exams");
}

export default async function AdminExamPracticeSetsPage() {
  const [categories, practiceSets] = await Promise.all([
    prisma.practiceCategory.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    }),
    prisma.practiceSet.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        category: true,
        _count: { select: { items: true } },
      },
    }),
  ]);

  return (
    <section className="space-y-6">
      <form action={createPracticeSet} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-black text-[#0b66c3]">ชุดคลังฝึก</p>
        <h2 className="mt-1 text-2xl font-black text-[#071f4a]">เพิ่มชุดใต้หมวดที่ใช้ร่วมกัน</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <label className="block">
            <span className="text-sm font-black text-slate-700">หมวด</span>
            <select name="categoryId" required className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#0b66c3]">
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.title}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-black text-slate-700">ประเภทชุด</span>
            <select name="kind" required className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#0b66c3]">
              {practiceSetKindOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs font-semibold leading-5 text-slate-500">
              เลือกภาค ค เมื่อต้องการให้หน้าเว็บเปิดเป็นระบบสัมภาษณ์ ไม่ใช่หน้าทำข้อสอบ
            </p>
          </label>
          <label className="block">
            <span className="text-sm font-black text-slate-700">ชื่อชุด</span>
            <input name="title" required className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm font-semibold outline-none focus:border-[#0b66c3]" placeholder="ภาค ข กฎหมายการศึกษา ปี 2567 ชุดที่ 1" />
          </label>
          <label className="block">
            <span className="text-sm font-black text-slate-700">Slug</span>
            <input name="slug" className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm font-semibold outline-none focus:border-[#0b66c3]" placeholder="part-b-education-law-2567-set-1" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-black text-slate-700">ปี</span>
              <input name="yearLabel" className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm font-semibold outline-none focus:border-[#0b66c3]" placeholder="2567" />
            </label>
            <label className="block">
              <span className="text-sm font-black text-slate-700">เวลา นาที</span>
              <input name="durationMinutes" type="number" defaultValue={120} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm font-semibold outline-none focus:border-[#0b66c3]" />
            </label>
          </div>
        </div>
        <button className="mt-5 rounded-xl bg-[#071f4a] px-5 py-3 text-sm font-black text-white transition hover:bg-[#0b66c3]">
          เพิ่มชุดคลังฝึก
        </button>
      </form>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-xl font-black text-[#071f4a]">ชุดคลังฝึกที่มีอยู่</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {practiceSets.map((set) => (
            <details key={set.id} className="p-5">
              <summary className="flex cursor-pointer list-none flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black text-[#0b66c3]">{set.category.title}</p>
                <p className="font-black text-[#064c9b]">{set.title}</p>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {getPracticeSetKindLabel(set.kind)} | {set.kind === ExamPartKind.PART_C_INTERVIEW ? "ไม่เกิน 10 คำถาม" : `${set._count.items} ข้อ`} | {set.durationMinutes} นาที
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-lg border border-[#cfe5ff] bg-[#eef6ff] px-4 py-2 text-sm font-black text-[#0b66c3]">
                  แก้ไข
                </span>
                <Link href={`/exams/practice/${set.category.slug}/${set.slug}`} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-black text-[#0b66c3] transition hover:bg-[#eef6ff]">
                  ดูหน้าเว็บ
                </Link>
              </div>
              </summary>
              <div className="mt-5 rounded-xl border border-[#d8e9ff] bg-[#f7fbff] p-4">
                <form action={updatePracticeSet} className="grid gap-3 lg:grid-cols-3">
                  <input type="hidden" name="setId" value={set.id} />
                  <label className="block">
                    <span className="text-xs font-black text-slate-600">หมวด</span>
                    <select name="categoryId" defaultValue={set.categoryId} required className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-[#0b66c3]">
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-xs font-black text-slate-600">ประเภทชุด</span>
                    <select name="kind" defaultValue={set.kind} required className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-[#0b66c3]">
                      {practiceSetKindOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-xs font-black text-slate-600">ชื่อชุด</span>
                    <input name="title" defaultValue={set.title} required className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#0b66c3]" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-black text-slate-600">Slug</span>
                    <input name="slug" defaultValue={set.slug} required className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#0b66c3]" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-black text-slate-600">ปี</span>
                    <input name="yearLabel" defaultValue={set.yearLabel ?? ""} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#0b66c3]" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-black text-slate-600">ขอบเขต</span>
                    <input name="scopeLabel" defaultValue={set.scopeLabel ?? ""} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#0b66c3]" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-black text-slate-600">เวลา นาที</span>
                    <input name="durationMinutes" type="number" defaultValue={set.durationMinutes} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#0b66c3]" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-black text-slate-600">ระดับ</span>
                    <input name="difficulty" defaultValue={set.difficulty ?? ""} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#0b66c3]" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-black text-slate-600">ลำดับ</span>
                    <input name="sortOrder" type="number" defaultValue={set.sortOrder} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#0b66c3]" />
                  </label>
                  <div className="flex flex-wrap gap-2 lg:col-span-3">
                    <button className="rounded-lg bg-[#0759b8] px-4 py-2.5 text-sm font-black text-white transition hover:bg-[#0b66c3]">
                      บันทึก
                    </button>
                  </div>
                </form>
                <form action={deletePracticeSet} className="mt-3">
                  <input type="hidden" name="setId" value={set.id} />
                  <button className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-black text-rose-700 transition hover:bg-rose-100">
                    ลบชุดนี้
                  </button>
                </form>
              </div>
            </details>
          ))}
        </div>
      </section>
    </section>
  );
}
