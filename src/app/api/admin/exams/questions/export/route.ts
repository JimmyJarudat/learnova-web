import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import prisma from "@/lib/db/postgres";

type ExportChoice = {
  label: string;
  text: string;
  sortOrder: number;
  isCorrect: boolean;
};

type ExportItem = {
  position: number;
  section: { title: string } | null;
  question: {
    stem: string;
    inlinePassage: string | null;
    explanation: string | null;
    sharedPassage: { content: string } | null;
    choices: ExportChoice[];
  };
};

type ExportBlock = {
  section?: string;
  topic?: string;
  questions: Array<{
    no: number;
    passage?: string;
    question: string;
    choices: Record<string, string>;
    answer: string | string[];
    explanation?: string;
  }>;
};

function sanitizeFilename(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-") || "questions";
}

function splitSectionTitle(title: string, fallbackSection: string) {
  const parts = title
    .split(/\r?\n/)
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    section: parts[0] || fallbackSection,
    topic: parts.slice(1).join("\n") || undefined,
  };
}

function toExportBlocks(items: ExportItem[], fallbackSection: string) {
  const groups = new Map<string, ExportBlock>();

  for (const item of items) {
    const sectionTitle = item.section?.title ?? fallbackSection;
    const key = sectionTitle || "default";
    const block = groups.get(key) ?? {
      ...splitSectionTitle(sectionTitle, fallbackSection),
      questions: [],
    };
    const choices = item.question.choices
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .reduce<Record<string, string>>((result, choice) => {
        result[choice.label] = choice.text;
        return result;
      }, {});
    const answerLabels = item.question.choices
      .filter((choice) => choice.isCorrect)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((choice) => choice.label);

    block.questions.push({
      no: item.position,
      passage: item.question.sharedPassage?.content ?? item.question.inlinePassage ?? undefined,
      question: item.question.stem,
      choices,
      answer: answerLabels.length > 1 ? answerLabels : (answerLabels[0] ?? ""),
      explanation: item.question.explanation ?? undefined,
    });

    groups.set(key, block);
  }

  const blocks = Array.from(groups.values());
  return blocks.length === 1 ? blocks[0] : blocks;
}

function jsonDownloadResponse(payload: unknown, slug: string) {
  const filename = `${sanitizeFilename(slug)}.json`;
  const body = JSON.stringify(payload, null, 2);

  return new Response(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return Response.json({ ok: false, message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  const destination = new URL(request.url).searchParams.get("destination") ?? "";

  if (destination.startsWith("practice:")) {
    const setId = destination.replace("practice:", "");
    const set = await prisma.practiceSet.findUnique({
      where: { id: setId },
      include: {
        category: true,
        items: {
          orderBy: { position: "asc" },
          include: {
            section: { select: { title: true } },
            question: {
              select: {
                stem: true,
                inlinePassage: true,
                explanation: true,
                sharedPassage: { select: { content: true } },
                choices: {
                  orderBy: { sortOrder: "asc" },
                  select: {
                    label: true,
                    text: true,
                    sortOrder: true,
                    isCorrect: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!set) {
      return Response.json({ ok: false, message: "ไม่พบชุดข้อสอบ" }, { status: 404 });
    }

    return jsonDownloadResponse(toExportBlocks(set.items, set.category.title), set.slug);
  }

  if (destination.startsWith("part:")) {
    const partId = destination.replace("part:", "");
    const part = await prisma.examPackagePart.findUnique({
      where: { id: partId },
      include: {
        package: true,
        items: {
          orderBy: { position: "asc" },
          include: {
            section: { select: { title: true } },
            question: {
              select: {
                stem: true,
                inlinePassage: true,
                explanation: true,
                sharedPassage: { select: { content: true } },
                choices: {
                  orderBy: { sortOrder: "asc" },
                  select: {
                    label: true,
                    text: true,
                    sortOrder: true,
                    isCorrect: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!part) {
      return Response.json({ ok: false, message: "ไม่พบชุดข้อสอบ" }, { status: 404 });
    }

    return jsonDownloadResponse(toExportBlocks(part.items, part.title), part.slug || part.package.slug);
  }

  return Response.json({ ok: false, message: "ปลายทางคำถามไม่ถูกต้อง" }, { status: 400 });
}
