import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { getGropApiKeys, isRetryableGropStatus } from "@/server/ai/grop-config";
import { buildFallbackInterviewResult, buildInterviewPrompt, parseInterviewCoachResult } from "@/utils/interview-coach";

type InterviewRequestBody = {
  examTitle?: string;
  currentQuestion?: string;
  answer?: string;
  history?: Array<{
    question: string;
    answer: string;
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

async function requestInterviewFeedback(apiKey: string, prompt: string) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(GROP_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.GROP_MODEL || "llama-3.1-8b-instant",
        temperature: 0.35,
        max_tokens: 700,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "คุณเป็นกรรมการสัมภาษณ์ครูผู้ช่วย ตอบเป็น JSON เท่านั้น ประเมินอย่างสร้างสรรค์ ไม่แต่งข้อมูลนอกคำตอบผู้สมัคร และถามต่อทีละหนึ่งคำถาม",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
      signal: controller.signal,
    });
    const payload = (await response.json().catch(() => ({}))) as GropChatCompletionResponse;

    if (!response.ok) {
      return {
        ok: false as const,
        retryable: isRetryableGropStatus(response.status),
        status: response.status,
      };
    }

    return {
      ok: true as const,
      content: payload.choices?.[0]?.message?.content ?? "",
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
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, message: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as InterviewRequestBody;
  const currentQuestion = body.currentQuestion?.trim();
  const answer = body.answer?.trim();

  if (!currentQuestion || !answer) {
    return NextResponse.json({ ok: false, message: "กรุณากรอกคำตอบก่อนส่ง" }, { status: 400 });
  }

  const apiKeys = getGropApiKeys();
  const history = Array.isArray(body.history) ? body.history : [];
  const prompt = buildInterviewPrompt({
    currentQuestion,
    answer,
    history,
    examTitle: body.examTitle,
  });

  for (const apiKey of apiKeys) {
    const result = await requestInterviewFeedback(apiKey, prompt);

    if (result.ok) {
      return NextResponse.json({
        ok: true,
        source: "ai",
        result: parseInterviewCoachResult(result.content, answer, currentQuestion),
      });
    }

    if (!result.retryable) {
      break;
    }
  }

  return NextResponse.json({
    ok: true,
    source: "fallback",
    result: buildFallbackInterviewResult(answer, currentQuestion),
  });
}
