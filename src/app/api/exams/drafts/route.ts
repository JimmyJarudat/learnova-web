import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ExamAttemptStatus } from "@/generated/prisma/client";
import prisma from "@/lib/db/postgres";
import { authOptions } from "@/lib/auth/options";
import { normalizeDraftSelectedChoices, readDraftSelectedChoices } from "@/server/exams/draft-payload";

type DraftTargetType = "packagePart" | "practiceSet";

type DraftRequestBody = {
  targetId?: string;
  targetType?: DraftTargetType;
  selectedChoices?: unknown;
  durationSecondsUsed?: number;
  startedAt?: string;
};

function isDraftTargetType(value: string | null): value is DraftTargetType {
  return value === "packagePart" || value === "practiceSet";
}

function getTarget(searchParams: URLSearchParams): { targetType: DraftTargetType; targetId: string } | null {
  const targetType = searchParams.get("targetType");
  const targetId = searchParams.get("targetId");

  if (!isDraftTargetType(targetType) || !targetId) {
    return null;
  }

  return { targetType, targetId };
}

function getDraftWhere(userId: string, target: { targetType: DraftTargetType; targetId: string }) {
  return target.targetType === "packagePart"
    ? { userId, packagePartId: target.targetId, status: ExamAttemptStatus.IN_PROGRESS }
    : { userId, practiceSetId: target.targetId, status: ExamAttemptStatus.IN_PROGRESS };
}

function getValidStartedAt(value: string | undefined) {
  if (!value) {
    return new Date();
  }

  const startedAt = new Date(value);
  return Number.isNaN(startedAt.getTime()) ? new Date() : startedAt;
}

function getDurationSecondsUsed(value: number | undefined) {
  return Math.max(0, Math.floor(value ?? 0));
}

async function getValidChoicesByQuestionId(target: { targetType: DraftTargetType; targetId: string }) {
  const items =
    target.targetType === "packagePart"
      ? await prisma.examPackagePartQuestion.findMany({
          where: { partId: target.targetId },
          select: {
            questionId: true,
            question: {
              select: {
                choices: { select: { id: true } },
              },
            },
          },
        })
      : await prisma.practiceSetQuestion.findMany({
          where: { setId: target.targetId },
          select: {
            questionId: true,
            question: {
              select: {
                choices: { select: { id: true } },
              },
            },
          },
        });

  return new Map(items.map((item) => [item.questionId, new Set(item.question.choices.map((choice) => choice.id))]));
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  const target = getTarget(new URL(request.url).searchParams);

  if (!target) {
    return NextResponse.json({ ok: false, message: "ข้อมูลชุดข้อสอบไม่ถูกต้อง" }, { status: 400 });
  }

  const draft = await prisma.examAttemptDraft.findFirst({
    where: getDraftWhere(session.user.id, target),
  });

  return NextResponse.json({
    ok: true,
    draft: draft
      ? {
          id: draft.id,
          selectedChoices: readDraftSelectedChoices(draft.answersJson),
          startedAt: draft.startedAt.toISOString(),
          durationSecondsUsed: draft.durationSecondsUsed,
          lastSavedAt: draft.lastSavedAt.toISOString(),
        }
      : null,
  });
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as DraftRequestBody;

    if ((body.targetType !== "packagePart" && body.targetType !== "practiceSet") || !body.targetId) {
      return NextResponse.json({ ok: false, message: "ข้อมูลชุดข้อสอบไม่ถูกต้อง" }, { status: 400 });
    }

    const target = { targetType: body.targetType, targetId: body.targetId };
    const validChoicesByQuestionId = await getValidChoicesByQuestionId(target);

    if (validChoicesByQuestionId.size === 0) {
      return NextResponse.json({ ok: false, message: "ไม่พบข้อสอบสำหรับบันทึกฉบับร่าง" }, { status: 404 });
    }

    const selectedChoices = normalizeDraftSelectedChoices(body.selectedChoices, validChoicesByQuestionId);
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 14);
    const data = {
      status: ExamAttemptStatus.IN_PROGRESS,
      answersJson: { selectedChoices },
      durationSecondsUsed: getDurationSecondsUsed(body.durationSecondsUsed),
      lastSavedAt: now,
      expiresAt,
    };

    const draft =
      target.targetType === "packagePart"
        ? await prisma.examAttemptDraft.upsert({
            where: {
              userId_packagePartId: {
                userId: session.user.id,
                packagePartId: target.targetId,
              },
            },
            update: data,
            create: {
              ...data,
              userId: session.user.id,
              packagePartId: target.targetId,
              practiceSetId: null,
              startedAt: getValidStartedAt(body.startedAt),
            },
          })
        : await prisma.examAttemptDraft.upsert({
            where: {
              userId_practiceSetId: {
                userId: session.user.id,
                practiceSetId: target.targetId,
              },
            },
            update: data,
            create: {
              ...data,
              userId: session.user.id,
              packagePartId: null,
              practiceSetId: target.targetId,
              startedAt: getValidStartedAt(body.startedAt),
            },
          });

    return NextResponse.json({
      ok: true,
      draft: {
        id: draft.id,
        selectedChoices,
        startedAt: draft.startedAt.toISOString(),
        durationSecondsUsed: draft.durationSecondsUsed,
        lastSavedAt: draft.lastSavedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("[exam-drafts] save failed", error);
    return NextResponse.json({ ok: false, message: "บันทึกคำตอบไม่สำเร็จ" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  const target = getTarget(new URL(request.url).searchParams);

  if (!target) {
    return NextResponse.json({ ok: false, message: "ข้อมูลชุดข้อสอบไม่ถูกต้อง" }, { status: 400 });
  }

  await prisma.examAttemptDraft.deleteMany({
    where: getDraftWhere(session.user.id, target),
  });

  return NextResponse.json({ ok: true });
}
