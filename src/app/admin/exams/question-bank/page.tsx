import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/postgres";

export const metadata = {
  title: "จัดการคำถาม | Admin Exams",
};

export const dynamic = "force-dynamic";

type QuestionBankPageProps = {
  searchParams: Promise<{ q?: string; source?: string }>;
};

function readText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function parseSource(value: string) {
  if (value.startsWith("practice:")) {
    return { type: "practice" as const, id: value.replace("practice:", "") };
  }

  if (value.startsWith("part:")) {
    return { type: "part" as const, id: value.replace("part:", "") };
  }

  return { type: "all" as const, id: "" };
}

function buildQuestionBankPath(q: string, source: string) {
  const params = new URLSearchParams();

  if (q) {
    params.set("q", q);
  }

  if (source) {
    params.set("source", source);
  }

  const query = params.toString();
  return query ? `/admin/exams/question-bank?${query}` : "/admin/exams/question-bank";
}

async function searchQuestions(formData: FormData) {
  "use server";

  const q = readText(formData, "q");
  const source = readText(formData, "source");
  redirect(buildQuestionBankPath(q, source));
}

async function updateQuestion(formData: FormData) {
  "use server";

  const questionId = readText(formData, "questionId");
  const stem = readText(formData, "stem");
  const explanation = readText(formData, "explanation");
  const answer = readText(formData, "answer").toUpperCase();

  if (!questionId || !stem || !answer) {
    throw new Error("กรุณากรอกโจทย์และคำตอบถูก");
  }

  const choices = ["A", "B", "C", "D"].map((label, index) => ({
    label,
    text: readText(formData, `choice${label}`),
    sortOrder: index + 1,
  })).filter((choice) => choice.text);

  if (!choices.some((choice) => choice.label === answer)) {
    throw new Error("คำตอบถูกต้องตรงกับตัวเลือกที่กรอก");
  }

  await prisma.$transaction(async (tx) => {
    await tx.examQuestion.update({
      where: { id: questionId },
      data: {
        stem,
        explanation: explanation || null,
        explanationFormat: "MARKDOWN",
      },
    });

    await tx.examQuestionChoice.deleteMany({
      where: {
        questionId,
        label: { notIn: choices.map((choice) => choice.label) },
      },
    });

    for (const choice of choices) {
      await tx.examQuestionChoice.upsert({
        where: {
          questionId_label: {
            questionId,
            label: choice.label,
          },
        },
        create: {
          questionId,
          label: choice.label,
          text: choice.text,
          contentFormat: "MARKDOWN",
          isCorrect: choice.label === answer,
          sortOrder: choice.sortOrder,
        },
        update: {
          text: choice.text,
          isCorrect: choice.label === answer,
          sortOrder: choice.sortOrder,
        },
      });
    }
  });

  revalidatePath("/admin/exams/question-bank");
  revalidatePath("/exams");
}

async function deleteQuestion(formData: FormData) {
  "use server";

  const questionId = readText(formData, "questionId");
  const source = readText(formData, "source");
  const selectedSource = parseSource(source);

  if (!questionId) {
    throw new Error("ไม่พบคำถามที่ต้องการลบ");
  }

  if (selectedSource.type === "all") {
    throw new Error("กรุณาเลือกต้นทางก่อนลบคำถาม");
  }

  await prisma.$transaction(async (tx) => {
    if (selectedSource.type === "practice") {
      await tx.practiceSetQuestion.deleteMany({
        where: {
          questionId,
          setId: selectedSource.id,
        },
      });

      const items = await tx.practiceSetQuestion.findMany({
        where: { setId: selectedSource.id },
        orderBy: { position: "asc" },
        select: { id: true, score: true },
      });

      for (const [index, item] of items.entries()) {
        await tx.practiceSetQuestion.update({
          where: { id: item.id },
          data: { position: index + 1 },
        });
      }

      await tx.practiceSet.update({
        where: { id: selectedSource.id },
        data: {
          totalQuestions: items.length,
          totalScore: items.reduce((sum, item) => sum + Number(item.score), 0),
        },
      });
    } else if (selectedSource.type === "part") {
      await tx.examPackagePartQuestion.deleteMany({
        where: {
          questionId,
          partId: selectedSource.id,
        },
      });

      const items = await tx.examPackagePartQuestion.findMany({
        where: { partId: selectedSource.id },
        orderBy: { position: "asc" },
        select: { id: true, score: true },
      });

      for (const [index, item] of items.entries()) {
        await tx.examPackagePartQuestion.update({
          where: { id: item.id },
          data: { position: index + 1 },
        });
      }

      await tx.examPackagePart.update({
        where: { id: selectedSource.id },
        data: {
          totalQuestions: items.length,
          totalScore: items.reduce((sum, item) => sum + Number(item.score), 0),
        },
      });
    }

    const [practiceUsage, packageUsage] = await Promise.all([
      tx.practiceSetQuestion.count({ where: { questionId } }),
      tx.examPackagePartQuestion.count({ where: { questionId } }),
    ]);

    if (practiceUsage + packageUsage === 0) {
      await tx.examQuestion.update({
        where: { id: questionId },
        data: { isActive: false },
      });
    }
  });

  revalidatePath("/admin/exams/question-bank");
  revalidatePath("/admin/exams/practice-sets");
  revalidatePath("/admin/exams/simulations");
  revalidatePath("/exams");
}

export default async function AdminExamQuestionBankPage({ searchParams }: QuestionBankPageProps) {
  const { q = "", source = "" } = await searchParams;
  const keyword = q.trim();
  const [practiceSets, packages] = await Promise.all([
    prisma.practiceSet.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        category: true,
        _count: { select: { items: true } },
      },
    }),
    prisma.examPackage.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        track: {
          include: {
            affiliation: true,
            major: true,
          },
        },
        parts: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
          include: {
            _count: { select: { items: true } },
          },
        },
      },
    }),
  ]);

  const sourceOptions = [
    ...practiceSets.map((set) => ({
      value: `practice:${set.id}`,
      label: `คลังฝึก: ${set.category.title} / ${set.title}`,
      count: set._count.items,
    })),
    ...packages.flatMap((examPackage) =>
      examPackage.parts.map((part) => ({
        value: `part:${part.id}`,
        label: `จำลองสนาม: ${examPackage.track.affiliation.label} / ${examPackage.track.major.name} / ${examPackage.title} / ${part.title}`,
        count: part._count.items,
      })),
    ),
  ];
  const selectedSourceValue = sourceOptions.some((option) => option.value === source) ? source : (sourceOptions[0]?.value ?? "");
  const selectedSource = parseSource(selectedSourceValue);
  const sourceWhere =
    selectedSource.type === "practice"
      ? { practiceItems: { some: { setId: selectedSource.id } } }
      : selectedSource.type === "part"
        ? { packageItems: { some: { partId: selectedSource.id } } }
        : { id: "__no_question_source_selected__" };

  const questions = await prisma.examQuestion.findMany({
    where: {
      isActive: true,
      ...sourceWhere,
      ...(keyword
        ? {
            OR: [
              { stem: { contains: keyword, mode: "insensitive" } },
              { explanation: { contains: keyword, mode: "insensitive" } },
              { sourceLabel: { contains: keyword, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      choices: { orderBy: { sortOrder: "asc" } },
      sharedPassage: true,
      _count: {
        select: {
          packageItems: true,
          practiceItems: true,
        },
      },
    },
  });
  const selectedSourceLabel = sourceOptions.find((option) => option.value === selectedSourceValue)?.label ?? "ยังไม่มีต้นทางคำถาม";

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-black text-[#0b66c3]">จัดการคำถาม</p>
        <h2 className="mt-1 text-3xl font-black text-[#071f4a]">แก้ไขหรือลบคำถาม</h2>
        <form action={searchQuestions} className="mt-5 grid gap-3 lg:grid-cols-[minmax(220px,360px)_1fr_auto_auto]">
          <select name="source" defaultValue={selectedSourceValue} className="rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#0b66c3]">
            {sourceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} ({option.count} ข้อ)
              </option>
            ))}
          </select>
          <input name="q" defaultValue={keyword} className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-3 text-sm font-semibold outline-none focus:border-[#0b66c3]" placeholder="ค้นหาโจทย์ / เฉลย / source label" />
          <button className="rounded-xl bg-[#071f4a] px-5 py-3 text-sm font-black text-white transition hover:bg-[#0b66c3]">
            ค้นหา
          </button>
          {keyword || source ? (
            <Link href="/admin/exams/question-bank" className="rounded-xl border border-slate-200 px-5 py-3 text-center text-sm font-black text-slate-600 transition hover:border-[#0b66c3] hover:text-[#0b66c3]">
              ล้าง
            </Link>
          ) : null}
        </form>
        <p className="mt-3 text-sm font-semibold text-slate-500">
          กำลังดู: <span className="font-black text-slate-700">{selectedSourceLabel}</span>
        </p>
      </div>

      <div className="space-y-4">
        {questions.map((question) => {
          const correctChoice = question.choices.find((choice) => choice.isCorrect)?.label ?? "A";
          const choiceByLabel = new Map(question.choices.map((choice) => [choice.label, choice.text]));

          return (
            <article key={question.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black text-[#0b66c3]">
                    ใช้ในชุด {question._count.practiceItems + question._count.packageItems} จุด
                    {question.sharedPassage ? " | มีข้อความร่วม" : ""}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-slate-400">{question.sourceLabel ?? question.id}</p>
                </div>
                <form action={deleteQuestion}>
                  <input type="hidden" name="questionId" value={question.id} />
                  <input type="hidden" name="source" value={selectedSourceValue} />
                  <button className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-black text-rose-700 transition hover:bg-rose-100">
                    ลบจากต้นทางนี้
                  </button>
                </form>
              </div>

              <form action={updateQuestion} className="space-y-4">
                <input type="hidden" name="questionId" value={question.id} />
                <label className="block">
                  <span className="text-sm font-black text-slate-700">โจทย์</span>
                  <textarea name="stem" defaultValue={question.stem} required className="mt-2 min-h-28 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm font-semibold outline-none focus:border-[#0b66c3]" />
                </label>
                <div className="grid gap-3 md:grid-cols-2">
                  {["A", "B", "C", "D"].map((label) => (
                    <label key={label} className="block">
                      <span className="text-sm font-black text-slate-700">ตัวเลือก {label}</span>
                      <input name={`choice${label}`} defaultValue={choiceByLabel.get(label) ?? ""} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm font-semibold outline-none focus:border-[#0b66c3]" />
                    </label>
                  ))}
                </div>
                <div className="grid gap-3 md:grid-cols-[180px_1fr]">
                  <label className="block">
                    <span className="text-sm font-black text-slate-700">คำตอบถูก</span>
                    <select name="answer" defaultValue={correctChoice} required className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#0b66c3]">
                      {["A", "B", "C", "D"].map((label) => (
                        <option key={label} value={label}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-sm font-black text-slate-700">เฉลย</span>
                    <input name="explanation" defaultValue={question.explanation ?? ""} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm font-semibold outline-none focus:border-[#0b66c3]" />
                  </label>
                </div>
                <button className="rounded-xl bg-[#071f4a] px-5 py-3 text-sm font-black text-white transition hover:bg-[#0b66c3]">
                  บันทึกการแก้ไข
                </button>
              </form>
            </article>
          );
        })}
      </div>
    </section>
  );
}
