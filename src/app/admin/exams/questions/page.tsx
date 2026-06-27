import { revalidatePath } from "next/cache";
import { ExamQuestionType } from "@/generated/prisma/client";
import prisma from "@/lib/db/postgres";

export const metadata = {
  title: "เพิ่มคำถาม | Admin Exams",
};

export const dynamic = "force-dynamic";

function readText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

async function getOrCreatePartSection(partId: string, title: string) {
  if (!title) {
    return null;
  }

  const existing = await prisma.examSection.findFirst({
    where: { partId, title },
  });

  if (existing) {
    return existing;
  }

  const lastSection = await prisma.examSection.findFirst({
    where: { partId },
    orderBy: { sortOrder: "desc" },
  });

  return prisma.examSection.create({
    data: {
      partId,
      title,
      sortOrder: (lastSection?.sortOrder ?? 0) + 10,
    },
  });
}

async function getOrCreatePracticeSection(setId: string, title: string) {
  if (!title) {
    return null;
  }

  const existing = await prisma.examSection.findFirst({
    where: { practiceSetId: setId, title },
  });

  if (existing) {
    return existing;
  }

  const lastSection = await prisma.examSection.findFirst({
    where: { practiceSetId: setId },
    orderBy: { sortOrder: "desc" },
  });

  return prisma.examSection.create({
    data: {
      practiceSetId: setId,
      title,
      sortOrder: (lastSection?.sortOrder ?? 0) + 10,
    },
  });
}

async function addQuestion(formData: FormData) {
  "use server";

  const destination = readText(formData, "destination");
  const sectionTitle = readText(formData, "sectionTitle");
  const stem = readText(formData, "stem");
  const explanation = readText(formData, "explanation");
  const answer = readText(formData, "answer").toUpperCase();
  const choices = ["A", "B", "C", "D"].map((label, index) => ({
    label,
    text: readText(formData, `choice${label}`),
    sortOrder: index + 1,
  }));

  if (!destination || !stem || !answer || !choices.some((choice) => choice.label === answer && choice.text)) {
    throw new Error("กรุณากรอกโจทย์ ตัวเลือก และคำตอบถูกให้ครบ");
  }

  const filledChoices = choices.filter((choice) => choice.text);
  const question = await prisma.examQuestion.create({
    data: {
      type: ExamQuestionType.SINGLE_CHOICE,
      contentFormat: "MARKDOWN",
      stem,
      explanation: explanation || null,
      explanationFormat: "MARKDOWN",
      difficulty: "พื้นฐาน",
      sourceLabel: `admin:${Date.now()}`,
      isActive: true,
      choices: {
        create: filledChoices.map((choice) => ({
          label: choice.label,
          text: choice.text,
          contentFormat: "MARKDOWN",
          isCorrect: choice.label === answer,
          sortOrder: choice.sortOrder,
        })),
      },
    },
  });

  if (destination.startsWith("part:")) {
    const partId = destination.replace("part:", "");
    const section = await getOrCreatePartSection(partId, sectionTitle);
    const lastItem = await prisma.examPackagePartQuestion.findFirst({
      where: { partId },
      orderBy: { position: "desc" },
    });
    const position = (lastItem?.position ?? 0) + 1;

    await prisma.examPackagePartQuestion.create({
      data: {
        partId,
        sectionId: section?.id ?? null,
        questionId: question.id,
        position,
        score: 1,
      },
    });

    const count = await prisma.examPackagePartQuestion.count({ where: { partId } });
    await prisma.examPackagePart.update({
      where: { id: partId },
      data: {
        totalQuestions: count,
        totalScore: count,
      },
    });
  } else if (destination.startsWith("practice:")) {
    const setId = destination.replace("practice:", "");
    const section = await getOrCreatePracticeSection(setId, sectionTitle);
    const lastItem = await prisma.practiceSetQuestion.findFirst({
      where: { setId },
      orderBy: { position: "desc" },
    });
    const position = (lastItem?.position ?? 0) + 1;

    await prisma.practiceSetQuestion.create({
      data: {
        setId,
        sectionId: section?.id ?? null,
        questionId: question.id,
        position,
        score: 1,
      },
    });

    const count = await prisma.practiceSetQuestion.count({ where: { setId } });
    await prisma.practiceSet.update({
      where: { id: setId },
      data: {
        totalQuestions: count,
        totalScore: count,
      },
    });
  } else {
    throw new Error("ปลายทางคำถามไม่ถูกต้อง");
  }

  revalidatePath("/admin/exams/questions");
  revalidatePath("/admin/exams/practice-sets");
  revalidatePath("/admin/exams/simulations");
  revalidatePath("/exams");
}

async function getQuestionsPageData() {
  const [practiceSets, packages] = await Promise.all([
    prisma.practiceSet.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      include: {
        category: true,
        _count: { select: { items: true } },
      },
    }),
    prisma.examPackage.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
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

  return { practiceSets, packages };
}

export default async function AdminExamQuestionsPage() {
  const { practiceSets, packages } = await getQuestionsPageData();

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-black text-[#0b66c3]">เพิ่มคำถาม</p>
        <h2 className="mt-1 text-3xl font-black text-[#071f4a]">เพิ่มข้อสอบทีละข้อเข้าไปยังชุดที่เลือก</h2>
        <p className="mt-2 text-sm font-semibold text-slate-500">
          เลือกปลายทาง เช่น ภาค ข วิชาชีพครู แล้วกรอกโจทย์ ตัวเลือก และคำตอบถูก ระบบจะเพิ่มเป็นข้อต่อไปอัตโนมัติ
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <form action={addQuestion} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-2">
            <label className="block">
              <span className="text-sm font-black text-slate-700">ปลายทางคำถาม</span>
              <select name="destination" required className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#0b66c3]">
                <optgroup label="คลังฝึกกลาง">
                  {practiceSets.map((set) => (
                    <option key={set.id} value={`practice:${set.id}`}>
                      {set.title} ({set._count.items} ข้อ)
                    </option>
                  ))}
                </optgroup>
                <optgroup label="ชุดจำลองสนาม">
                  {packages.flatMap((pack) =>
                    pack.parts.map((part) => (
                      <option key={part.id} value={`part:${part.id}`}>
                        {pack.title} / {part.title} ({part._count.items} ข้อ)
                      </option>
                    )),
                  )}
                </optgroup>
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-black text-slate-700">หัวข้อ/ตอน</span>
              <input name="sectionTitle" className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm font-semibold outline-none focus:border-[#0b66c3]" placeholder="เช่น ความรู้วิชาชีพครู" />
            </label>
          </div>

          <label className="mt-4 block">
            <span className="text-sm font-black text-slate-700">โจทย์</span>
            <textarea name="stem" required className="mt-2 min-h-36 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm font-semibold outline-none focus:border-[#0b66c3]" placeholder="พิมพ์โจทย์" />
          </label>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {["A", "B", "C", "D"].map((label) => (
              <label key={label} className="block">
                <span className="text-sm font-black text-slate-700">ตัวเลือก {label}</span>
                <input name={`choice${label}`} required={label === "A" || label === "B"} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm font-semibold outline-none focus:border-[#0b66c3]" />
              </label>
            ))}
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-[180px_1fr]">
            <label className="block">
              <span className="text-sm font-black text-slate-700">คำตอบถูก</span>
              <select name="answer" required className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#0b66c3]">
                {["A", "B", "C", "D"].map((label) => (
                  <option key={label} value={label}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm font-black text-slate-700">เฉลย</span>
              <input name="explanation" className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm font-semibold outline-none focus:border-[#0b66c3]" />
            </label>
          </div>

          <button className="mt-5 rounded-xl bg-[#071f4a] px-5 py-3 text-sm font-black text-white transition hover:bg-[#0b66c3]">
            เพิ่มคำถาม
          </button>
        </form>

        <aside className="rounded-lg border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-sm font-black text-amber-700">ภาคที่ยังว่าง</p>
          <div className="mt-4 space-y-3">
            {packages.flatMap((pack) =>
              pack.parts
                .filter((part) => part._count.items === 0)
                .map((part) => (
                  <div key={part.id} className="rounded-lg bg-white p-4 shadow-sm">
                    <p className="text-sm font-black text-[#071f4a]">{part.title}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">{pack.title}</p>
                  </div>
                )),
            )}
          </div>
        </aside>
      </div>
    </section>
  );
}
