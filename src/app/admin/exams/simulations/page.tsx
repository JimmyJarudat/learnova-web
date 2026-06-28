import { revalidatePath } from "next/cache";
import Link from "next/link";
import { AdminSubmitButton } from "@/components/admin/admin-submit-button";
import { ExamPartKind } from "@/generated/prisma/client";
import prisma from "@/lib/db/postgres";

export const metadata = {
  title: "ชุดจำลองสนาม | Admin Exams",
};

export const dynamic = "force-dynamic";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9ก-๙]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

async function createSimulationPackage(formData: FormData) {
  "use server";

  const trackId = String(formData.get("trackId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const year = String(formData.get("year") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "") || title);

  if (!trackId || !title || !year || !slug) {
    throw new Error("กรุณากรอกข้อมูลชุดจำลองให้ครบ");
  }

  const pack = await prisma.examPackage.create({
    data: {
      trackId,
      slug,
      title,
      year,
      label,
      description: `${title} รวมภาค ก ภาค ข และภาค ค ในชุดเดียว`,
      sortOrder: 20,
      isActive: true,
    },
  });

  await prisma.examPackagePart.createMany({
    data: [
      {
        packageId: pack.id,
        slug: "part-a-general",
        kind: ExamPartKind.PART_A_GENERAL,
        title: "ภาค ก ความรู้ความสามารถทั่วไป",
        shortTitle: "ภาค ก",
        audienceLabel: "ใช้ร่วมหลายสังกัด",
        description: "ข้อสอบภาค ก สำหรับจำลองสนาม",
        durationMinutes: 120,
        sortOrder: 10,
      },
      {
        packageId: pack.id,
        slug: "part-b-profession",
        kind: ExamPartKind.PART_B_PROFESSION,
        title: "ภาค ข วิชาชีพครู",
        shortTitle: "ข วิชาชีพ",
        audienceLabel: "ทุกเอก",
        description: "ข้อสอบวิชาชีพครู",
        durationMinutes: 60,
        sortOrder: 20,
      },
      {
        packageId: pack.id,
        slug: "part-b-major",
        kind: ExamPartKind.PART_B_MAJOR,
        title: "ภาค ข วิชาเอก",
        shortTitle: "ข วิชาเอก",
        audienceLabel: "ตามเอกที่เลือก",
        description: "ข้อสอบวิชาเอก",
        durationMinutes: 60,
        sortOrder: 30,
      },
      {
        packageId: pack.id,
        slug: "part-c-interview",
        kind: ExamPartKind.PART_C_INTERVIEW,
        title: "ภาค ค สัมภาษณ์และประเมินความเหมาะสม",
        shortTitle: "ภาค ค",
        audienceLabel: "จำลองแนวประเมิน",
        description: "แบบฝึกภาค ค",
        durationMinutes: 30,
        sortOrder: 40,
      },
    ],
  });

  revalidatePath("/admin/exams/simulations");
  revalidatePath("/admin/exams/questions");
  revalidatePath("/exams");
}

async function updateSimulationPackage(formData: FormData) {
  "use server";

  const packageId = String(formData.get("packageId") ?? "");
  const trackId = String(formData.get("trackId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const year = String(formData.get("year") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? "") || title);
  const sortOrder = Number(formData.get("sortOrder") ?? 20);

  if (!packageId || !trackId || !title || !year || !slug) {
    throw new Error("กรุณากรอกข้อมูลชุดจำลองให้ครบ");
  }

  await prisma.examPackage.update({
    where: { id: packageId },
    data: {
      trackId,
      title,
      year,
      label,
      slug,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 20,
    },
  });

  revalidatePath("/admin/exams/simulations");
  revalidatePath("/admin/exams/questions");
  revalidatePath("/exams");
}

async function deleteSimulationPackage(formData: FormData) {
  "use server";

  const packageId = String(formData.get("packageId") ?? "");

  if (!packageId) {
    throw new Error("ไม่พบชุดจำลองที่ต้องการลบ");
  }

  await prisma.$transaction([
    prisma.examPackagePart.updateMany({
      where: { packageId },
      data: { isActive: false },
    }),
    prisma.examPackage.update({
      where: { id: packageId },
      data: { isActive: false },
    }),
  ]);

  revalidatePath("/admin/exams/simulations");
  revalidatePath("/admin/exams/questions");
  revalidatePath("/exams");
}

export default async function AdminExamSimulationsPage() {
  const [tracks, packages] = await Promise.all([
    prisma.examTrack.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      include: {
        affiliation: true,
        major: true,
      },
    }),
    prisma.examPackage.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        track: { include: { affiliation: true, major: true } },
        parts: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          include: { _count: { select: { items: true } } },
        },
      },
    }),
  ]);

  return (
    <section className="space-y-6">
      <form action={createSimulationPackage} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-black text-[#0b66c3]">ชุดจำลองสนาม</p>
        <h2 className="mt-1 text-2xl font-black text-[#071f4a]">สร้างชุดที่มี ก ข ค</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <label className="block">
            <span className="text-sm font-black text-slate-700">สนามสอบ</span>
            <select name="trackId" required className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#0b66c3]">
              {tracks.map((track) => (
                <option key={track.id} value={track.id}>
                  {track.affiliation.label} / {track.major.shortName ?? track.major.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-black text-slate-700">ชื่อชุด</span>
            <input name="title" required className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm font-semibold outline-none focus:border-[#0b66c3]" placeholder="สอศ. เอกคอมพิวเตอร์ ปี 2568 ชุดที่ 1" />
          </label>
          <label className="block">
            <span className="text-sm font-black text-slate-700">ปี</span>
            <input name="year" required className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm font-semibold outline-none focus:border-[#0b66c3]" placeholder="2568" />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-black text-slate-700">ชุด</span>
              <input name="label" className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm font-semibold outline-none focus:border-[#0b66c3]" placeholder="ชุดที่ 1" />
            </label>
            <label className="block">
              <span className="text-sm font-black text-slate-700">Slug</span>
              <input name="slug" className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm font-semibold outline-none focus:border-[#0b66c3]" placeholder="ovec-computer-2568-set-1" />
            </label>
          </div>
        </div>
        <AdminSubmitButton pendingText="กำลังสร้างชุด..." className="mt-5 rounded-xl bg-[#071f4a] px-5 py-3 text-sm font-black text-white transition hover:bg-[#0b66c3]">
          สร้างชุดจำลอง
        </AdminSubmitButton>
      </form>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-xl font-black text-[#071f4a]">ชุดจำลองที่มีอยู่</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {packages.map((pack) => (
            <details key={pack.id} className="p-5">
              <summary className="cursor-pointer list-none">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-black text-[#064c9b]">{pack.title}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      {pack.track.affiliation.label} / {pack.track.major.shortName ?? pack.track.major.name} | {pack.year} {pack.label}
                    </p>
                  </div>
                  <Link href={`/exams/${pack.track.affiliation.slug}/track/${pack.track.major.slug}/${pack.slug}`} className="rounded-lg border border-[#cfe5ff] bg-[#eef6ff] px-4 py-2 text-sm font-black text-[#0b66c3] transition hover:border-[#0b66c3]">
                    ดูหน้าเว็บ
                  </Link>
                  <Link href={`/admin/exams/simulations/${pack.id}`} className="rounded-lg bg-[#0759b8] px-4 py-2 text-sm font-black text-white transition hover:bg-[#0b66c3]">
                    จัดการภายในชุด
                  </Link>
                </div>
                <div className="mt-3 grid gap-2 md:grid-cols-4">
                  {pack.parts.map((part) => (
                    <span key={part.id} className={`rounded-md px-3 py-2 text-xs font-black ${part._count.items > 0 ? "bg-[#eef6ff] text-[#0b66c3]" : "bg-amber-50 text-amber-700"}`}>
                      {part.shortTitle ?? part.title}: {part._count.items}
                    </span>
                  ))}
                </div>
              </summary>
              <div className="mt-5 rounded-xl border border-[#d8e9ff] bg-[#f7fbff] p-4">
                <form action={updateSimulationPackage} className="grid gap-3 lg:grid-cols-3">
                  <input type="hidden" name="packageId" value={pack.id} />
                  <label className="block">
                    <span className="text-xs font-black text-slate-600">สนามสอบ</span>
                    <select name="trackId" defaultValue={pack.trackId} required className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none focus:border-[#0b66c3]">
                      {tracks.map((track) => (
                        <option key={track.id} value={track.id}>
                          {track.affiliation.label} / {track.major.shortName ?? track.major.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-xs font-black text-slate-600">ชื่อชุด</span>
                    <input name="title" defaultValue={pack.title} required className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#0b66c3]" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-black text-slate-600">Slug</span>
                    <input name="slug" defaultValue={pack.slug} required className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#0b66c3]" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-black text-slate-600">ปี</span>
                    <input name="year" defaultValue={pack.year} required className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#0b66c3]" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-black text-slate-600">ชุด</span>
                    <input name="label" defaultValue={pack.label ?? ""} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#0b66c3]" />
                  </label>
                  <label className="block">
                    <span className="text-xs font-black text-slate-600">ลำดับ</span>
                    <input name="sortOrder" type="number" defaultValue={pack.sortOrder} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#0b66c3]" />
                  </label>
                  <div className="flex flex-wrap gap-2 lg:col-span-3">
                    <AdminSubmitButton pendingText="กำลังบันทึก..." className="rounded-lg bg-[#0759b8] px-4 py-2.5 text-sm font-black text-white transition hover:bg-[#0b66c3]">
                      บันทึก
                    </AdminSubmitButton>
                  </div>
                </form>
                <form action={deleteSimulationPackage} className="mt-3">
                  <input type="hidden" name="packageId" value={pack.id} />
                  <AdminSubmitButton pendingText="กำลังลบ..." className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-black text-rose-700 transition hover:bg-rose-100">
                    ลบชุดจำลองนี้
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
