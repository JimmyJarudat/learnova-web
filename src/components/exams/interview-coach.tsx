"use client";

import { useMemo, useState } from "react";
import { firstInterviewQuestion, type InterviewRubricScore } from "@/utils/interview-coach";

type InterviewTurn = {
  question: string;
  answer: string;
  feedback: string;
  improvedAnswer: string;
  rubric: InterviewRubricScore[];
  source: "ai" | "fallback";
};

type InterviewCoachProps = {
  examTitle: string;
  affiliationLabel: string;
  majorName: string;
};

export function InterviewCoach({ examTitle, affiliationLabel, majorName }: InterviewCoachProps) {
  const [currentQuestion, setCurrentQuestion] = useState(firstInterviewQuestion);
  const [answer, setAnswer] = useState("");
  const [turns, setTurns] = useState<InterviewTurn[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const latestTurn = turns.at(-1);
  const totalScore = useMemo(() => latestTurn?.rubric.reduce((sum, item) => sum + item.score, 0) ?? 0, [latestTurn]);

  async function submitAnswer() {
    const currentAnswer = answer.trim();

    if (!currentAnswer || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch("/api/exams/interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          examTitle,
          currentQuestion,
          answer: currentAnswer,
          history: turns.map((turn) => ({
            question: turn.question,
            answer: turn.answer,
          })),
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
        source?: "ai" | "fallback";
        result?: {
          feedback: string;
          nextQuestion: string;
          improvedAnswer: string;
          rubric: InterviewRubricScore[];
        };
      };

      if (!response.ok || !payload.ok || !payload.result) {
        throw new Error(payload.message ?? "ส่งคำตอบไม่สำเร็จ");
      }

      setTurns((current) => [
        ...current,
        {
          question: currentQuestion,
          answer: currentAnswer,
          feedback: payload.result?.feedback ?? "",
          improvedAnswer: payload.result?.improvedAnswer ?? "",
          rubric: payload.result?.rubric ?? [],
          source: payload.source ?? "fallback",
        },
      ]);
      setCurrentQuestion(payload.result.nextQuestion);
      setAnswer("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "ส่งคำตอบไม่สำเร็จ");
    } finally {
      setIsSubmitting(false);
    }
  }

  function restartInterview() {
    setCurrentQuestion(firstInterviewQuestion);
    setAnswer("");
    setTurns([]);
    setErrorMessage(null);
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
      <div className="space-y-5">
        <section className="overflow-hidden rounded-xl bg-[#071f4a] text-white shadow-sm">
          <div className="p-6">
            <p className="text-sm font-black text-[#ffd35a]">AI Interview Coach</p>
            <h2 className="mt-2 text-3xl font-black">ซ้อมสัมภาษณ์ภาค ค แบบถามตอบ</h2>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-white/75">
              เริ่มจากคำถามแนะนำตัว จากนั้นระบบจะถามต่อจากคำตอบของคุณ พร้อมประเมินตามเกณฑ์สัมภาษณ์ครูผู้ช่วย
            </p>
          </div>
          <div className="grid border-t border-white/10 bg-white/[0.04] sm:grid-cols-3">
            <div className="p-4">
              <p className="text-xs font-black text-white/50">สนาม</p>
              <p className="mt-1 font-black">{affiliationLabel}</p>
            </div>
            <div className="p-4">
              <p className="text-xs font-black text-white/50">เอก</p>
              <p className="mt-1 font-black">{majorName}</p>
            </div>
            <div className="p-4">
              <p className="text-xs font-black text-white/50">จำนวนรอบ</p>
              <p className="mt-1 font-black">{turns.length} คำตอบ</p>
            </div>
          </div>
        </section>

        <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <div className="rounded-lg bg-[#eef6ff] p-4">
            <p className="text-sm font-black text-[#0b66c3]">คำถามปัจจุบัน</p>
            <h3 className="mt-2 text-xl font-black leading-8 text-[#071f4a]">{currentQuestion}</h3>
          </div>

          <label className="mt-5 block">
            <span className="text-sm font-black text-[#071f4a]">พิมพ์คำตอบของคุณ</span>
            <textarea
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              rows={8}
              className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold leading-6 text-slate-700 outline-none transition focus:border-[#0b66c3] focus:bg-white"
              placeholder="ตัวอย่าง: สวัสดีครับ/ค่ะ ดิฉัน/ผมชื่อ... สำเร็จการศึกษา... มีความตั้งใจเป็นครูเพราะ..."
            />
          </label>

          {errorMessage ? (
            <p className="mt-3 rounded-lg bg-rose-50 px-4 py-3 text-sm font-black text-rose-700">{errorMessage}</p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={isSubmitting || !answer.trim()}
              onClick={submitAnswer}
              className="rounded-xl bg-[#ffd35a] px-5 py-3 text-sm font-black text-[#071f4a] transition hover:bg-[#f6bf22] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "กำลังประเมิน..." : "ส่งคำตอบให้ AI ประเมิน"}
            </button>
            <button
              type="button"
              onClick={restartInterview}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-600 transition hover:border-[#0b66c3] hover:text-[#0b66c3]"
            >
              เริ่มใหม่
            </button>
          </div>
        </section>

        {turns.length > 0 ? (
          <section className="space-y-4">
            {turns.map((turn, index) => (
              <article key={`${turn.question}-${index}`} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-[#0b66c3]">รอบที่ {index + 1}</p>
                    <h3 className="mt-1 text-lg font-black text-[#071f4a]">{turn.question}</h3>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-black ${turn.source === "ai" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                    {turn.source === "ai" ? "AI ประเมิน" : "ประเมินพื้นฐาน"}
                  </span>
                </div>
                <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-600">
                  {turn.answer}
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  {turn.rubric.map((item) => (
                    <div key={item.label} className="rounded-lg bg-[#eef6ff] p-3">
                      <p className="text-xs font-black text-[#0b66c3]">{item.label}</p>
                      <p className="mt-1 text-2xl font-black text-[#071f4a]">
                        {item.score}/{item.maxScore}
                      </p>
                      <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{item.note}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  <div className="rounded-lg bg-emerald-50 p-4 text-emerald-900">
                    <p className="text-sm font-black">Feedback</p>
                    <p className="mt-2 text-sm font-semibold leading-6">{turn.feedback}</p>
                  </div>
                  <div className="rounded-lg bg-amber-50 p-4 text-amber-900">
                    <p className="text-sm font-black">ตัวอย่างคำตอบที่ปรับดีขึ้น</p>
                    <p className="mt-2 text-sm font-semibold leading-6">{turn.improvedAnswer}</p>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : null}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-black text-[#0b66c3]">ภาพรวมการซ้อม</p>
          <h3 className="mt-2 text-3xl font-black text-[#071f4a]">{latestTurn ? `${totalScore}/20` : "ยังไม่เริ่ม"}</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
            คะแนนเป็นการประเมินเพื่อฝึกตอบ ไม่ใช่คะแนนสอบจริง ใช้ดูแนวทางปรับคำตอบให้ชัดขึ้น
          </p>
        </div>
        <div className="rounded-xl bg-[#071f4a] p-5 text-white shadow-sm">
          <p className="text-sm font-black text-[#ffd35a]">Rubric</p>
          <ul className="mt-3 space-y-2 text-sm font-semibold leading-6 text-white/75">
            <li>ความชัดเจนของคำตอบ</li>
            <li>จิตวิญญาณความเป็นครู</li>
            <li>การเชื่อมโยงประสบการณ์</li>
            <li>ความเหมาะสมของภาษา</li>
          </ul>
        </div>
      </aside>
    </section>
  );
}
