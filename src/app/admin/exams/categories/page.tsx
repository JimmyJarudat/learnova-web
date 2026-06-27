import { revalidatePath } from "next/cache";
import { AdminSubmitButton } from "@/components/admin/admin-submit-button";
import prisma from "@/lib/db/postgres";

export const metadata = {
  title: "หมวดคลังฝึก | Admin Exams",
};

export const dynamic = "force-dynamic";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9ก-๙]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

async function createPracticeCategory(formData: FormData) {
  "use server";

  const title = String(formData.get("title") ?? "").trim();
  const shortTitle = String(formData.get("shortTitle") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "") || title);

  if (!title || !slug) {
    throw new Error("กรุณากรอกชื่อหมวดและ slug");
  }

  const lastCategory = await prisma.practiceCategory.findFirst({
    orderBy: { sortOrder: "desc" },
  });

  await prisma.practiceCategory.upsert({
    where: { slug },
    create: {
      slug,
      title,
      shortTitle: shortTitle || title,
      description: `${title} สำหรับฝึกแบบรวม`,
      colorClass: "bg-[#0b66c3]",
      sortOrder: (lastCategory?.sortOrder ?? 0) + 10,
      isActive: true,
    },
    update: {
      title,
      shortTitle: shortTitle || title,
      isActive: true,
    },
  });

  revalidatePath("/admin/exams/categories");
  revalidatePath("/admin/exams/practice-sets");
  revalidatePath("/exams");
}

async function deletePracticeCategory(formData: FormData) {
  "use server";

  const categoryId = String(formData.get("categoryId") ?? "");

  if (!categoryId) {
    throw new Error("ไม่พบหมวดที่ต้องการลบ");
  }

  await prisma.$transaction([
    prisma.practiceSet.updateMany({
      where: { categoryId },
      data: { isActive: false },
    }),
    prisma.practiceCategory.update({
      where: { id: categoryId },
      data: { isActive: false },
    }),
  ]);

  revalidatePath("/admin/exams/categories");
  revalidatePath("/admin/exams/practice-sets");
  revalidatePath("/admin/exams/questions");
  revalidatePath("/exams");
}

async function updatePracticeCategory(formData: FormData) {
  "use server";

  const categoryId = String(formData.get("categoryId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const shortTitle = String(formData.get("shortTitle") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "") || title);
  const sortOrder = Number(formData.get("sortOrder") ?? 0);

  if (!categoryId || !title || !slug) {
    throw new Error("กรุณากรอกข้อมูลหมวดให้ครบ");
  }

  await prisma.practiceCategory.update({
    where: { id: categoryId },
    data: {
      title,
      shortTitle: shortTitle || title,
      slug,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
    },
  });

  revalidatePath("/admin/exams/categories");
  revalidatePath("/admin/exams/practice-sets");
  revalidatePath("/exams");
}

export default async function AdminExamCategoriesPage() {
  const categories = await prisma.practiceCategory.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
    include: {
      _count: { select: { sets: true } },
    },
  });

  return (
    <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <form action={createPracticeCategory} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-black text-[#0b66c3]">หมวดคลังฝึก</p>
        <h2 className="mt-1 text-2xl font-black text-[#071f4a]">เพิ่มหมวดที่ใช้ร่วมกัน</h2>
        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="text-sm font-black text-slate-700">ชื่อหมวด</span>
            <input name="title" required className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm font-semibold outline-none focus:border-[#0b66c3]" placeholder="ภาค ข กฎหมายการศึกษา" />
          </label>
          <label className="block">
            <span className="text-sm font-black text-slate-700">ชื่อสั้น</span>
            <input name="shortTitle" className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm font-semibold outline-none focus:border-[#0b66c3]" placeholder="กฎหมายการศึกษา" />
          </label>
          <label className="block">
            <span className="text-sm font-black text-slate-700">Slug</span>
            <input name="slug" className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm font-semibold outline-none focus:border-[#0b66c3]" placeholder="part-b-education-law" />
          </label>
          <AdminSubmitButton pendingText="กำลังเพิ่มหมวด..." className="w-full rounded-xl bg-[#071f4a] px-4 py-3 text-sm font-black text-white transition hover:bg-[#0b66c3]">
            เพิ่มหมวด
          </AdminSubmitButton>
        </div>
      </form>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-xl font-black text-[#071f4a]">หมวดที่มีอยู่</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {categories.map((category) => (
            <details key={category.id} className="group p-5">
              <summary className="flex cursor-pointer list-none flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-black text-[#064c9b]">{category.title}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {category.slug} | {category._count.sets} ชุด | ลำดับ {category.sortOrder}
                  </p>
                </div>
                <span className="rounded-lg border border-[#cfe5ff] bg-[#eef6ff] px-4 py-2 text-center text-sm font-black text-[#0b66c3]">
                  แก้ไข
                </span>
              </summary>
              <div className="mt-5 rounded-xl border border-[#d8e9ff] bg-[#f7fbff] p-4">
                <form action={updatePracticeCategory} className="grid gap-3 lg:grid-cols-4">
                  <input type="hidden" name="categoryId" value={category.id} />
                  <label className="block">
                    <span className="text-xs font-black text-slate-600">ชื่อหมวด</span>
                    <input name="title" defaultValue={category.title} required className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#0b66c3]" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-black text-slate-600">ชื่อสั้น</span>
                    <input name="shortTitle" defaultValue={category.shortTitle ?? ""} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#0b66c3]" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-black text-slate-600">Slug</span>
                    <input name="slug" defaultValue={category.slug} required className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#0b66c3]" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-black text-slate-600">ลำดับ</span>
                    <input name="sortOrder" type="number" defaultValue={category.sortOrder} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#0b66c3]" />
                  </label>
                  <div className="flex flex-wrap gap-2 lg:col-span-4">
                    <AdminSubmitButton pendingText="กำลังบันทึก..." className="rounded-lg bg-[#0759b8] px-4 py-2.5 text-sm font-black text-white transition hover:bg-[#0b66c3]">
                      บันทึก
                    </AdminSubmitButton>
                  </div>
                </form>
                <form action={deletePracticeCategory} className="mt-3">
                  <input type="hidden" name="categoryId" value={category.id} />
                  <AdminSubmitButton pendingText="กำลังลบ..." className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-black text-rose-700 transition hover:bg-rose-100">
                    ลบหมวดนี้
                  </AdminSubmitButton>
                </form>
              </div>
            </details>
          ))}
        </div>
      </section>
    </section>
  );
}
