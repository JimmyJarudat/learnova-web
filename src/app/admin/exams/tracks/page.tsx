import { revalidatePath } from "next/cache";
import prisma from "@/lib/db/postgres";

export const metadata = {
  title: "สนามสอบ | Admin Exams",
};

export const dynamic = "force-dynamic";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9ก-๙]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

async function createExamTrack(formData: FormData) {
  "use server";

  const affiliationId = String(formData.get("affiliationId") ?? "");
  const majorName = String(formData.get("majorName") ?? "").trim();
  const majorShortName = String(formData.get("majorShortName") ?? "").trim();
  const majorSlug = slugify(String(formData.get("majorSlug") ?? "") || majorName);

  if (!affiliationId || !majorName || !majorSlug) {
    throw new Error("กรุณาเลือกสังกัดและกรอกชื่อเอก");
  }

  const affiliation = await prisma.examAffiliation.findUnique({ where: { id: affiliationId } });

  if (!affiliation) {
    throw new Error("ไม่พบสังกัด");
  }

  const lastMajor = await prisma.examMajor.findFirst({ orderBy: { sortOrder: "desc" } });
  const major = await prisma.examMajor.upsert({
    where: { slug: majorSlug },
    create: {
      slug: majorSlug,
      name: majorName,
      shortName: majorShortName || majorName,
      description: `${majorName} สำหรับสอบครูผู้ช่วย`,
      sortOrder: (lastMajor?.sortOrder ?? 0) + 10,
      isActive: true,
    },
    update: {
      name: majorName,
      shortName: majorShortName || majorName,
      isActive: true,
    },
  });

  const existingTrack = await prisma.examTrack.findUnique({
    where: {
      affiliationId_majorId: {
        affiliationId,
        majorId: major.id,
      },
    },
  });

  if (!existingTrack) {
    const lastTrack = await prisma.examTrack.findFirst({ orderBy: { sortOrder: "desc" } });
    await prisma.examTrack.create({
      data: {
        affiliationId,
        majorId: major.id,
        slug: major.slug,
        title: `${affiliation.label} ${major.shortName ?? major.name}`,
        description: `สนามสอบ ${affiliation.label} ${major.shortName ?? major.name}`,
        sortOrder: (lastTrack?.sortOrder ?? 0) + 10,
        isActive: true,
      },
    });
  }

  revalidatePath("/admin/exams/tracks");
  revalidatePath("/admin/exams/simulations");
  revalidatePath("/exams");
}

export default async function AdminExamTracksPage() {
  const affiliations = await prisma.examAffiliation.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
    include: {
      tracks: {
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
        include: { major: true },
      },
    },
  });

  return (
    <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <form action={createExamTrack} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-black text-[#0b66c3]">สนามสอบ</p>
        <h2 className="mt-1 text-2xl font-black text-[#071f4a]">เพิ่มเอกและผูกกับสังกัด</h2>
        <div className="mt-5 space-y-4">
          <label className="block">
            <span className="text-sm font-black text-slate-700">สังกัด</span>
            <select name="affiliationId" required className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#0b66c3]">
              {affiliations.map((affiliation) => (
                <option key={affiliation.id} value={affiliation.id}>
                  {affiliation.label} - {affiliation.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-black text-slate-700">ชื่อเอก</span>
            <input name="majorName" required className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm font-semibold outline-none focus:border-[#0b66c3]" placeholder="เอกคณิตศาสตร์" />
          </label>
          <label className="block">
            <span className="text-sm font-black text-slate-700">ชื่อสั้น</span>
            <input name="majorShortName" className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm font-semibold outline-none focus:border-[#0b66c3]" placeholder="เอกคณิต" />
          </label>
          <label className="block">
            <span className="text-sm font-black text-slate-700">Slug เอก</span>
            <input name="majorSlug" className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm font-semibold outline-none focus:border-[#0b66c3]" placeholder="major-math" />
          </label>
          <button className="w-full rounded-xl bg-[#071f4a] px-4 py-3 text-sm font-black text-white transition hover:bg-[#0b66c3]">
            สร้างสนามสอบ
          </button>
        </div>
      </form>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <h2 className="text-xl font-black text-[#071f4a]">สนามสอบที่มีอยู่</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {affiliations.map((affiliation) => (
            <div key={affiliation.id} className="p-5">
              <p className="text-lg font-black text-[#071f4a]">{affiliation.label}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {affiliation.tracks.map((track) => (
                  <div key={track.id} className="rounded-md border border-slate-200 bg-slate-50 p-4">
                    <p className="font-black text-[#071f4a]">{track.major.shortName ?? track.major.name}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{track.major.slug}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}
