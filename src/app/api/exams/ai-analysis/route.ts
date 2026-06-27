import { NextResponse } from "next/server";
import { getGropApiKeys, isRetryableGropStatus } from "@/server/ai/grop-config";

type AiAnalysisRequestBody = {
  examTitle?: string;
  result?: {
    score?: number;
    maxScore?: number;
    percentage?: number;
    totalQuestions?: number;
    answeredCount?: number;
    correctCount?: number;
    incorrectCount?: number;
    unansweredCount?: number;
    durationSeconds?: number;
    levelLabel?: string;
  };
  sections?: Array<{
    title: string;
    score: number;
    maxScore: number;
    percentage: number;
    correctCount: number;
    incorrectCount: number;
    unansweredCount: number;
  }>;
  reviewQuestions?: Array<{
    no: number;
    status: "incorrect" | "unanswered";
  }>;
  latestAttempts?: Array<{
    score: number;
    maxScore: number;
    totalQuestions: number;
    answeredCount: number;
    durationSeconds: number | null;
    submittedAt: string;
  }>;
};

type GropChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

const GROP_CHAT_COMPLETIONS_URL = "https://api.groq.com/openai/v1/chat/completions";

function buildPrompt(body: AiAnalysisRequestBody) {
  const weakSections = (body.sections ?? [])
    .slice(0, 5)
    .map(
      (section, index) =>
        `${index + 1}. ${section.title}: ${section.score}/${section.maxScore} (${section.percentage}%), ถูก ${section.correctCount}, ผิด ${section.incorrectCount}, ไม่ตอบ ${section.unansweredCount}`,
    )
    .join("\n");
  const reviewQuestions = (body.reviewQuestions ?? [])
    .slice(0, 30)
    .map((question) => `ข้อ ${question.no} ${question.status === "unanswered" ? "ไม่ได้ตอบ" : "ตอบผิด"}`)
    .join(", ");
  const attempts = (body.latestAttempts ?? [])
    .slice(0, 5)
    .map((attempt, index) => `${index + 1}. ${attempt.score}/${attempt.maxScore}, ทำ ${attempt.answeredCount}/${attempt.totalQuestions}, เวลา ${attempt.durationSeconds ?? 0} วินาที`)
    .join("\n");

  return `
ข้อสอบ: ${body.examTitle ?? "ไม่ระบุ"}
คะแนนล่าสุด: ${body.result?.score ?? 0}/${body.result?.maxScore ?? 0} (${body.result?.percentage ?? 0}%)
ระดับ: ${body.result?.levelLabel ?? "ไม่ระบุ"}
สรุปจำนวนข้อ: ทั้งหมด ${body.result?.totalQuestions ?? 0}, ทำแล้ว ${body.result?.answeredCount ?? 0}, ถูก ${body.result?.correctCount ?? 0}, ผิด ${body.result?.incorrectCount ?? 0}, ไม่ตอบ ${body.result?.unansweredCount ?? 0}
หัวข้อที่ควรทบทวน:
${weakSections || "- ไม่มีข้อมูลหัวข้อ"}
ข้อที่ควรดู:
${reviewQuestions || "- ไม่มี"}
ประวัติล่าสุด:
${attempts || "- ยังไม่มีประวัติ"}
`.trim();
}

function cleanAdvice(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, 900);
}

async function requestAdvice(apiKey: string, prompt: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(GROP_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.GROP_MODEL || "llama-3.1-8b-instant",
        temperature: 0.3,
        max_tokens: 450,
        messages: [
          {
            role: "system",
            content:
              "คุณเป็นผู้ช่วยวิเคราะห์ผลสอบครูผู้ช่วย ตอบภาษาไทย กระชับ ใช้ข้อมูลที่ได้รับเท่านั้น ห้ามแต่งคะแนนหรือข้อสอบใหม่ ให้คำแนะนำเป็นขั้นตอนที่ทำตามได้จริงภายใน 3-5 ข้อ",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
      signal: controller.signal,
    });

    const payload = (await response.json().catch(() => ({}))) as GropChatCompletionResponse & { error?: unknown };

    if (!response.ok) {
      return {
        ok: false as const,
        retryable: isRetryableGropStatus(response.status),
        status: response.status,
      };
    }

    const advice = cleanAdvice(payload.choices?.[0]?.message?.content ?? "");

    if (!advice) {
      return {
        ok: false as const,
        retryable: true,
        status: response.status,
      };
    }

    return {
      ok: true as const,
      advice,
    };
  } catch {
    return {
      ok: false as const,
      retryable: true,
      status: 0,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as AiAnalysisRequestBody;
  const apiKeys = getGropApiKeys();

  if (apiKeys.length === 0) {
    return NextResponse.json({ ok: false, message: "ยังไม่ได้ตั้งค่า GROP_API_KEY" }, { status: 503 });
  }

  const prompt = buildPrompt(body);
  let lastStatus = 0;

  for (const apiKey of apiKeys) {
    const result = await requestAdvice(apiKey, prompt);

    if (result.ok) {
      return NextResponse.json({ ok: true, advice: result.advice });
    }

    lastStatus = result.status;

    if (!result.retryable) {
      break;
    }
  }

  return NextResponse.json(
    {
      ok: false,
      message: "ยังสร้างคำแนะนำ AI ไม่สำเร็จ",
      status: lastStatus,
    },
    { status: 503 },
  );
}
