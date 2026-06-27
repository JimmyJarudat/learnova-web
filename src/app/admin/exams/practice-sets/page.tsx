import { revalidatePath } from "next/cache";
import Link from "next/link";
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

async function createPracticeSet(formData: FormData) {
  "use server";

  const categoryId = String(formData.get("categoryId") ?? "");
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
            <Link key={set.id} href={`/exams/practice/${set.category.slug}/${set.slug}`} className="block p-5 transition hover:bg-slate-50">
              <p className="text-xs font-black text-[#0b66c3]">{set.category.title}</p>
              <p className="font-black text-[#071f4a]">{set.title}</p>
              <p className="mt-1 text-sm font-semibold text-slate-500">{set._count.items} ข้อ | {set.durationMinutes} นาที</p>
            </Link>
          ))}
        </div>
      </section>
    </section>
  );
}
