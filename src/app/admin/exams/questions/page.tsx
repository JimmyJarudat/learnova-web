import { revalidatePath } from "next/cache";
import crypto from "node:crypto";
import { redirect } from "next/navigation";
import { AdminSubmitButton } from "@/components/admin/admin-submit-button";
import { JsonExampleCopy } from "@/components/admin/json-example-copy";
import { ExamQuestionType } from "@/generated/prisma/client";
import prisma from "@/lib/db/postgres";

export const metadata = {
  title: "เพิ่มคำถาม | Admin Exams",
};

export const dynamic = "force-dynamic";

type AdminExamQuestionsPageProps = {
  searchParams: Promise<{
    destination?: string;
    status?: string;
    count?: string;
  }>;
};

type DestinationOption = {
  value: string;
  label: string;
  meta: string;
  typeLabel: "คลังฝึกกลาง" | "ชุดจำลองสนาม";
};

const jsonImportExample = `{
  "section": "ส่วนที่ 1 ความสามารถด้านตัวเลข",
  "topic": "ตอนที่ 1 อนุกรมและการคิดเชิงตรรกะ",
  "questions": [
    {
      "no": 1,
      "passage": "ครูเป็นผู้มีบทบาทสำคัญในการพัฒนาผู้เรียน ทั้งด้านความรู้ ทักษะ และคุณลักษณะที่พึงประสงค์ การจัดการเรียนรู้จึงควรคำนึงถึงความแตกต่างระหว่างบุคคลและส่งเสริมให้ผู้เรียนพัฒนาเต็มตามศักยภาพ",
      "question": "ข้อใดเป็นหน้าที่สำคัญของครูตามหลักวิชาชีพ",
      "choices": {
        "A": "ถ่ายทอดความรู้และส่งเสริมผู้เรียนตามศักยภาพ",
        "B": "คัดเลือกเฉพาะผู้เรียนที่มีผลการเรียนดี",
        "C": "มอบหมายงานโดยไม่ต้องติดตามผล",
        "D": "เน้นการสอบมากกว่าการพัฒนาผู้เรียน"
      },
      "answer": "A",
      "explanation": "ครูมีหน้าที่จัดการเรียนรู้ ถ่ายทอดความรู้ และส่งเสริมผู้เรียนให้พัฒนาเต็มตามศักยภาพ"
    },
    {
      "no": 2,
      "question": "การวัดและประเมินผลที่ดีควรมีลักษณะอย่างไร",
      "choices": {
        "A": "ใช้คะแนนสอบปลายภาคเท่านั้น",
        "B": "ประเมินหลายวิธีและสอดคล้องกับจุดประสงค์การเรียนรู้",
        "C": "ใช้เกณฑ์เดียวกับทุกบริบทเสมอ",
        "D": "ประเมินเฉพาะผู้เรียนที่ส่งงานครบ"
      },
      "answer": "B",
      "explanation": "การประเมินที่ดีควรหลากหลาย ต่อเนื่อง และสัมพันธ์กับจุดประสงค์การเรียนรู้"
    }
  ]
}`;

function readText(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function DestinationSelect({
  name = "destination",
  options,
  defaultValue,
}: {
  name?: string;
  options: DestinationOption[];
  defaultValue: string;
}) {
  return (
    <select name={name} defaultValue={defaultValue} required className="mt-2 w-full rounded-lg border border-[#cfe5ff] bg-[#f7fbff] px-3 py-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#0b66c3]">
      <optgroup label="คลังฝึกกลาง">
        {options
          .filter((option) => option.typeLabel === "คลังฝึกกลาง")
          .map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} ({option.meta})
            </option>
          ))}
      </optgroup>
      <optgroup label="ชุดจำลองสนาม">
        {options
          .filter((option) => option.typeLabel === "ชุดจำลองสนาม")
          .map((option) => (
            <option key={option.value} value={option.value}>
              {option.label} ({option.meta})
            </option>
          ))}
      </optgroup>
    </select>
  );
}

function buildQuestionsAdminPath(destination: string, status?: string, count?: number) {
  const params = new URLSearchParams();

  if (destination) {
    params.set("destination", destination);
  }

  if (status) {
    params.set("status", status);
  }

  if (typeof count === "number") {
    params.set("count", String(count));
  }

  const query = params.toString();

  return query ? `/admin/exams/questions?${query}` : "/admin/exams/questions";
}

type QuestionChoiceInput = {
  label: string;
  text: string;
  sortOrder: number;
};

type ImportQuestionRow = {
  no: number | null;
  sectionTitle: string;
  passage: string;
  stem: string;
  choices: QuestionChoiceInput[];
  answer: string;
  explanation: string;
};

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

function extractJsonObjects(input: string) {
  const objects: string[] = [];
  let depth = 0;
  let start = -1;
  let inString = false;
  let escaped = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }

      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === "{") {
      if (depth === 0) {
        start = i;
      }
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0 && start >= 0) {
        objects.push(input.slice(start, i + 1));
        start = -1;
      }
    }
  }

  return objects;
}

function getObject(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function parseAnswer(value: unknown) {
  if (Array.isArray(value)) {
    return normalizeText(value[0]).toUpperCase();
  }

  return normalizeText(value).split(/[,/]/)[0]?.toUpperCase() ?? "";
}

function parseChoices(value: unknown) {
  const choicesObject = getObject(value);

  if (!choicesObject) {
    return [];
  }

  return Object.entries(choicesObject)
    .map(([label, text], index) => ({
      label: label.trim().toUpperCase(),
      text: normalizeText(text),
      sortOrder: index + 1,
    }))
    .filter((choice) => choice.label && choice.text);
}

function parseImportRows(input: string) {
  const trimmed = input.trim();

  if (!trimmed) {
    return [];
  }

  const parsedItems = (() => {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return extractJsonObjects(trimmed).map((item) => JSON.parse(item) as unknown);
    }
  })();

  return parsedItems.flatMap((item) => {
    const block = getObject(item);

    if (!block) {
      return [];
    }

    const questions = Array.isArray(block.questions) ? block.questions : [block];
    const section = normalizeText(block.section);
    const topic = normalizeText(block.topic);
    const category = normalizeText(block.category);
    const subCategory = normalizeText(block.sub_category ?? block.subCategory);
    const sectionTitle = [section, topic].filter(Boolean).join("\n") || [category, subCategory].filter(Boolean).join(" - ");

    return questions.map((questionValue) => {
      const question = getObject(questionValue) ?? {};

      return {
        no: Number.isFinite(Number(question.no)) ? Number(question.no) : null,
        sectionTitle,
        passage: normalizeText(question.passage),
        stem: normalizeText(question.question ?? question.stem),
        choices: parseChoices(question.choices),
        answer: parseAnswer(question.answer),
        explanation: normalizeText(question.explanation),
      };
    });
  });
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

async function createQuestionAndAttach({
  destination,
  sectionTitle,
  stem,
  explanation,
  answer,
  choices,
  passageId,
}: {
  destination: string;
  sectionTitle: string;
  stem: string;
  explanation: string;
  answer: string;
  choices: QuestionChoiceInput[];
  passageId?: string | null;
}) {
  if (!destination || !stem || !answer || !choices.some((choice) => choice.label === answer && choice.text)) {
    throw new Error("กรุณากรอกโจทย์ ตัวเลือก และคำตอบถูกให้ครบ");
  }

  const filledChoices = choices.filter((choice) => choice.text);
  const question = await prisma.examQuestion.create({
    data: {
      type: ExamQuestionType.SINGLE_CHOICE,
      passageId: passageId ?? null,
      contentFormat: "MARKDOWN",
      stem,
      explanation: explanation || null,
      explanationFormat: "MARKDOWN",
      difficulty: "พื้นฐาน",
      sourceLabel: `admin:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
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
    return;
  }

  if (destination.startsWith("practice:")) {
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
    return;
  }

  throw new Error("ปลายทางคำถามไม่ถูกต้อง");
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

  await createQuestionAndAttach({ destination, sectionTitle, stem, explanation, answer, choices });

  revalidatePath("/admin/exams/questions");
  revalidatePath("/admin/exams/practice-sets");
  revalidatePath("/admin/exams/simulations");
  revalidatePath("/exams");
  redirect(buildQuestionsAdminPath(destination, "added", 1));
}

async function importQuestions(formData: FormData) {
  "use server";

  const destination = readText(formData, "destination");
  const fallbackSectionTitle = readText(formData, "sectionTitle");
  const jsonText = readText(formData, "jsonText");
  const file = formData.get("jsonFile");
  const fileText = file instanceof File && file.size > 0 ? await file.text() : "";
  const rows = parseImportRows(jsonText || fileText);

  if (!destination) {
    throw new Error("กรุณาเลือกปลายทางคำถาม");
  }

  if (rows.length === 0) {
    throw new Error("ไม่พบคำถามใน JSON หรือไฟล์");
  }

  const passageIds = new Map<string, string>();

  for (const row of rows) {
    let passageId: string | null = null;

    if (row.passage) {
      const passageKey = crypto.createHash("sha1").update(row.passage).digest("hex");
      passageId = passageIds.get(passageKey) ?? null;

      if (!passageId) {
        const passage = await prisma.examPassage.create({
          data: {
            title: "อ่านข้อความต่อไปนี้ แล้วตอบคำถาม",
            content: row.passage,
            contentFormat: "MARKDOWN",
            sourceLabel: `admin-passage:${passageKey}`,
          },
        });
        passageId = passage.id;
        passageIds.set(passageKey, passage.id);
      }
    }

    await createQuestionAndAttach({
      destination,
      sectionTitle: row.sectionTitle || fallbackSectionTitle,
      passageId,
      stem: row.stem,
      explanation: row.explanation,
      answer: row.answer,
      choices: row.choices,
    });
  }

  revalidatePath("/admin/exams/questions");
  revalidatePath("/admin/exams/practice-sets");
  revalidatePath("/admin/exams/simulations");
  revalidatePath("/exams");
  redirect(buildQuestionsAdminPath(destination, "imported", rows.length));
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

export default async function AdminExamQuestionsPage({ searchParams }: AdminExamQuestionsPageProps) {
  const { destination = "", status = "", count = "" } = await searchParams;
  const { practiceSets, packages } = await getQuestionsPageData();
  const destinationOptions: DestinationOption[] = [
    ...practiceSets.map((set) => ({
      value: `practice:${set.id}`,
      label: `${set.category.title} / ${set.title}`,
      meta: `${set._count.items} ข้อ`,
      typeLabel: "คลังฝึกกลาง" as const,
    })),
    ...packages.flatMap((pack) =>
      pack.parts.map((part) => ({
        value: `part:${part.id}`,
        label: `${pack.track.affiliation.label} / ${pack.track.major.shortName ?? pack.track.major.name} / ${pack.title} / ${part.title}`,
        meta: `${part._count.items} ข้อ`,
        typeLabel: "ชุดจำลองสนาม" as const,
      })),
    ),
  ];
  const selectedDestinationValue = destinationOptions.some((option) => option.value === destination)
    ? destination
    : (destinationOptions[0]?.value ?? "");
  const selectedDestination = destinationOptions.find((option) => option.value === selectedDestinationValue);
  const successMessage =
    status === "added"
      ? "เพิ่มคำถามสำเร็จ 1 ข้อ"
      : status === "imported"
        ? `นำเข้าคำถามสำเร็จ ${Number(count || 0).toLocaleString("th-TH")} ข้อ`
        : "";

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-black text-[#0b66c3]">เพิ่มคำถาม</p>
        <h2 className="mt-1 text-3xl font-black text-[#071f4a]">เพิ่มข้อสอบทีละข้อ หรือนำเข้าจาก JSON</h2>
        <p className="mt-2 text-sm font-semibold text-slate-500">
          เลือกปลายทาง เช่น ภาค ข วิชาชีพครู แล้วกรอกโจทย์เอง หรือวาง JSON/เลือกไฟล์ ระบบจะเพิ่มเป็นข้อต่อไปอัตโนมัติ
        </p>
        {successMessage ? (
          <p className="mt-4 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-black text-emerald-700">
            {successMessage}
          </p>
        ) : null}
      </div>

      <div className="grid gap-6">
        <form action={addQuestion} className="order-2 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-black text-[#0b66c3]">เพิ่มทีละข้อ</p>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <label className="block">
              <span className="text-sm font-black text-slate-700">ปลายทางคำถาม</span>
              <DestinationSelect options={destinationOptions} defaultValue={selectedDestinationValue} />
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

          <AdminSubmitButton pendingText="กำลังเพิ่มคำถาม..." className="mt-5 rounded-xl bg-[#071f4a] px-5 py-3 text-sm font-black text-white transition hover:bg-[#0b66c3]">
            เพิ่มคำถาม
          </AdminSubmitButton>
        </form>

        <form action={importQuestions} className="order-1 rounded-lg border-2 border-[#0b66c3] bg-white p-5 shadow-sm">
          <p className="text-sm font-black text-[#0b66c3]">นำเข้า JSON / ไฟล์</p>
          <h2 className="mt-1 text-2xl font-black text-[#071f4a]">เพิ่มหลายข้อในครั้งเดียว</h2>
          <p className="mt-2 text-sm font-semibold text-slate-500">
            ใส่ `section` และ `topic` ได้ถ้าต้องการหัวข้อคั่นแบบข้อสอบไทย แต่ไม่ใส่ก็ได้ ระบบจะใช้หัวข้อสำรองหรือไม่สร้างหัวข้อคั่น
          </p>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <label className="block">
              <span className="text-sm font-black text-slate-700">ปลายทางคำถาม</span>
              <DestinationSelect options={destinationOptions} defaultValue={selectedDestinationValue} />
              <span className="mt-2 block rounded-lg bg-amber-50 px-3 py-2 text-xs font-black text-amber-800">
                ตรวจปลายทางตรงนี้ก่อนกดนำเข้า ระบบจะนำเข้าไปยังชุดที่เลือกในฟอร์มนี้ทันที
              </span>
            </label>
            <label className="block">
              <span className="text-sm font-black text-slate-700">หัวข้อสำรอง</span>
              <input name="sectionTitle" className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm font-semibold outline-none focus:border-[#0b66c3]" placeholder="ไม่กรอกก็ได้ เช่น ส่วนที่ 1 ความรู้วิชาชีพครู" />
            </label>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
            <label className="block">
              <span className="text-sm font-black text-slate-700">วาง JSON</span>
              <textarea name="jsonText" className="mt-2 min-h-72 w-full rounded-lg border border-slate-200 px-3 py-3 font-mono text-sm outline-none focus:border-[#0b66c3]" placeholder='{"section":"ส่วนที่ 1 ...","topic":"ตอนที่ 1 ...","questions":[{"no":1,"passage":"ข้อความร่วม ถ้ามี","question":"...","choices":{"A":"...","B":"...","C":"...","D":"..."},"answer":"A","explanation":"..."}]}' />
            </label>
            <div>
              <label className="block">
                <span className="text-sm font-black text-slate-700">หรือเลือกไฟล์</span>
                <input name="jsonFile" type="file" accept=".json,.txt,.temp,application/json,text/plain" className="mt-2 w-full rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-8 text-sm font-semibold text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-[#071f4a] file:px-4 file:py-2 file:text-sm file:font-black file:text-white" />
              </label>
              <div className="mt-4 rounded-lg bg-[#f8fbff] p-4 text-sm font-semibold leading-6 text-slate-600">
                <p className="font-black text-[#071f4a]">หมายเหตุ</p>
                <p className="mt-1">ถ้าวาง JSON และเลือกไฟล์พร้อมกัน ระบบจะใช้ข้อความ JSON ก่อน และ passage ที่ซ้ำกันในไฟล์เดียวกันจะถูกใช้ร่วมกัน</p>
              </div>
            </div>
          </div>

          <AdminSubmitButton pendingText="กำลังนำเข้า..." className="mt-5 rounded-xl bg-[#071f4a] px-5 py-3 text-sm font-black text-white transition hover:bg-[#0b66c3]">
            นำเข้าคำถาม
          </AdminSubmitButton>
        </form>

        <div className="order-3">
          <JsonExampleCopy value={jsonImportExample} />
        </div>
      </div>
    </section>
  );
}
