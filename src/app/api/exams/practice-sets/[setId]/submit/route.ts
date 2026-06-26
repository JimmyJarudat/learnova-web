import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { ExamAttemptStatus, ExamQuestionType } from "@/generated/prisma/client";
import prisma from "@/lib/db/postgres";
import { getAuthOptions } from "@/lib/auth/options";

type SubmitAnswer = {
  questionId: string;
  selectedChoiceIds: string[];
};

type SubmitBody = {
  answers?: SubmitAnswer[];
  durationSeconds?: number;
};

type RouteContext = {
  params: Promise<{ setId: string }>;
};

function normalizeSelectedChoiceIds(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function hasExactChoiceMatch(selectedChoiceIds: string[], correctChoiceIds: string[]) {
  if (selectedChoiceIds.length !== correctChoiceIds.length) {
    return false;
  }

  const selected = new Set(selectedChoiceIds);
  return correctChoiceIds.every((choiceId) => selected.has(choiceId));
}

export async function POST(request: Request, { params }: RouteContext) {
  const session = await getServerSession(await getAuthOptions());

  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, message: "กรุณาเข้าสู่ระบบก่อนส่งคำตอบ" }, { status: 401 });
  }

  const userId = session.user.id;
  const { setId } = await params;
  const body = (await request.json().catch(() => ({}))) as SubmitBody;
  const submittedAnswers = new Map(
    (body.answers ?? []).map((answer) => [
      answer.questionId,
      normalizeSelectedChoiceIds(answer.selectedChoiceIds),
    ]),
  );
  const durationSeconds = Math.max(0, Math.floor(body.durationSeconds ?? 0));

  const practiceSet = await prisma.practiceSet.findUnique({
    where: { id: setId },
    include: {
      items: {
        orderBy: { position: "asc" },
        include: {
          question: {
            include: {
              choices: { orderBy: { sortOrder: "asc" } },
            },
          },
        },
      },
    },
  });

  if (!practiceSet) {
    return NextResponse.json({ ok: false, message: "ไม่พบชุดฝึก" }, { status: 404 });
  }

  if (practiceSet.items.length === 0) {
    return NextResponse.json({ ok: false, message: "ชุดนี้ยังไม่มีคำถาม" }, { status: 400 });
  }

  const evaluatedQuestions = practiceSet.items.map((item) => {
    const validChoiceIds = new Set(item.question.choices.map((choice) => choice.id));
    const selectedChoiceIds = (submittedAnswers.get(item.questionId) ?? []).filter((choiceId) =>
      validChoiceIds.has(choiceId),
    );
    const correctChoiceIds = item.question.choices
      .filter((choice) => choice.isCorrect)
      .map((choice) => choice.id);
    const isChoiceQuestion =
      item.question.type === ExamQuestionType.SINGLE_CHOICE ||
      item.question.type === ExamQuestionType.MULTIPLE_CHOICE ||
      item.question.type === ExamQuestionType.TRUE_FALSE;
    const isCorrect = isChoiceQuestion && hasExactChoiceMatch(selectedChoiceIds, correctChoiceIds);
    const maxScore = Number(item.score.toString());
    const score = isCorrect ? maxScore : 0;

    return {
      item,
      selectedChoiceIds,
      correctChoiceIds,
      isCorrect,
      score,
      maxScore,
    };
  });

  const answeredCount = evaluatedQuestions.filter((question) => question.selectedChoiceIds.length > 0).length;
  const correctCount = evaluatedQuestions.filter((question) => question.isCorrect).length;
  const score = evaluatedQuestions.reduce((sum, question) => sum + question.score, 0);
  const maxScore = evaluatedQuestions.reduce((sum, question) => sum + question.maxScore, 0);
  const submittedAt = new Date();
  const startedAt = new Date(submittedAt.getTime() - durationSeconds * 1000);

  const attempt = await prisma.$transaction(async (tx) => {
    const createdAttempt = await tx.examAttempt.create({
      data: {
        userId,
        practiceSetId: practiceSet.id,
        status: ExamAttemptStatus.SUBMITTED,
        startedAt,
        submittedAt,
        totalQuestions: evaluatedQuestions.length,
        answeredCount,
        score,
        maxScore,
        durationSeconds,
      },
    });

    for (const question of evaluatedQuestions) {
      const answer = await tx.examAttemptAnswer.create({
        data: {
          attemptId: createdAttempt.id,
          questionId: question.item.questionId,
          isCorrect: question.selectedChoiceIds.length > 0 ? question.isCorrect : null,
          score: question.score,
        },
      });

      if (question.selectedChoiceIds.length > 0) {
        await tx.examAttemptAnswerChoice.createMany({
          data: question.selectedChoiceIds.map((choiceId) => ({
            answerId: answer.id,
            choiceId,
          })),
          skipDuplicates: true,
        });
      }
    }

    return createdAttempt;
  });

  return NextResponse.json({
    ok: true,
    attemptId: attempt.id,
    score,
    maxScore,
    totalQuestions: evaluatedQuestions.length,
    answeredCount,
    correctCount,
    durationSeconds,
    submittedAt: submittedAt.toISOString(),
    questions: evaluatedQuestions.map((question) => ({
      questionId: question.item.questionId,
      position: question.item.position,
      selectedChoiceIds: question.selectedChoiceIds,
      correctChoiceIds: question.correctChoiceIds,
      isCorrect: question.selectedChoiceIds.length > 0 ? question.isCorrect : null,
      score: question.score,
      maxScore: question.maxScore,
      explanation: question.item.question.explanation,
      explanationFormat: question.item.question.explanationFormat,
      explanationImageUrl: question.item.question.explanationImageUrl,
    })),
  });
}
