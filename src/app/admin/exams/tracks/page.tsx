import { revalidatePath } from "next/cache";
import { AdminSubmitButton } from "@/components/admin/admin-submit-button";
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

async function updateExamTrack(formData: FormData) {
  "use server";

  const trackId = String(formData.get("trackId") ?? "");
  const majorId = String(formData.get("majorId") ?? "");
  const majorName = String(formData.get("majorName") ?? "").trim();
  const majorShortName = String(formData.get("majorShortName") ?? "").trim();
  const majorSlug = slugify(String(formData.get("majorSlug") ?? "") || majorName);
  const trackTitle = String(formData.get("trackTitle") ?? "").trim();
  const sortOrder = Number(formData.get("sortOrder") ?? 0);

  if (!trackId || !majorId || !majorName || !majorSlug) {
    throw new Error("กรุณากรอกข้อมูลสนามสอบให้ครบ");
  }

  await prisma.$transaction([
    prisma.examMajor.update({
      where: { id: majorId },
      data: {
        name: majorName,
        shortName: majorShortName || majorName,
        slug: majorSlug,
      },
    }),
    prisma.examTrack.update({
      where: { id: trackId },
      data: {
        slug: majorSlug,
        title: trackTitle || majorShortName || majorName,
        sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
      },
    }),
  ]);

  revalidatePath("/admin/exams/tracks");
  revalidatePath("/admin/exams/simulations");
  revalidatePath("/exams");
}

async function deleteExamTrack(formData: FormData) {
  "use server";

  const trackId = String(formData.get("trackId") ?? "");

  if (!trackId) {
    throw new Error("ไม่พบสนามสอบที่ต้องการลบ");
  }

  await prisma.examTrack.update({
    where: { id: trackId },
    data: { isActive: false },
  });

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
          <AdminSubmitButton pendingText="กำลังสร้างสนาม..." className="w-full rounded-xl bg-[#071f4a] px-4 py-3 text-sm font-black text-white transition hover:bg-[#0b66c3]">
            สร้างสนามสอบ
          </AdminSubmitButton>
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
                  <details key={track.id} className="rounded-md border border-[#d8e9ff] bg-[#f7fbff] p-4">
                    <summary className="cursor-pointer list-none">
                      <p className="font-black text-[#064c9b]">{track.major.shortName ?? track.major.name}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        {track.major.slug} | ลำดับ {track.sortOrder}
                      </p>
                    </summary>
                    <div className="mt-4 space-y-3">
                      <form action={updateExamTrack} className="grid gap-3">
                        <input type="hidden" name="trackId" value={track.id} />
                        <input type="hidden" name="majorId" value={track.major.id} />
                        <label className="block">
                          <span className="text-xs font-black text-slate-600">ชื่อเอก</span>
                          <input name="majorName" defaultValue={track.major.name} required className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#0b66c3]" />
                        </label>
                        <label className="block">
                          <span className="text-xs font-black text-slate-600">ชื่อสั้น</span>
                          <input name="majorShortName" defaultValue={track.major.shortName ?? ""} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#0b66c3]" />
                        </label>
                        <label className="block">
                          <span className="text-xs font-black text-slate-600">Slug เอก</span>
                          <input name="majorSlug" defaultValue={track.major.slug} required className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#0b66c3]" />
                        </label>
                        <label className="block">
                          <span className="text-xs font-black text-slate-600">ชื่อสนาม</span>
                          <input name="trackTitle" defaultValue={track.title} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#0b66c3]" />
                        </label>
                        <label className="block">
                          <span className="text-xs font-black text-slate-600">ลำดับ</span>
                          <input name="sortOrder" type="number" defaultValue={track.sortOrder} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold outline-none focus:border-[#0b66c3]" />
                        </label>
                        <AdminSubmitButton pendingText="กำลังบันทึก..." className="rounded-lg bg-[#0759b8] px-4 py-2.5 text-sm font-black text-white transition hover:bg-[#0b66c3]">
                          บันทึก
                        </AdminSubmitButton>
                      </form>
                      <form action={deleteExamTrack}>
                        <input type="hidden" name="trackId" value={track.id} />
                        <AdminSubmitButton pendingText="กำลังลบ..." className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-black text-rose-700 transition hover:bg-rose-100">
                          ลบสนามนี้
                        </AdminSubmitButton>
                      </form>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}
