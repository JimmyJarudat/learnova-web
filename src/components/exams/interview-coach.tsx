"use client";

import { useMemo, useState } from "react";
import {
  firstInterviewQuestion,
  maxInterviewQuestions,
  summarizeInterview,
  type InterviewRubricScore,
} from "@/utils/interview-coach";

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
  durationMinutes: number;
};

export function InterviewCoach({ examTitle, affiliationLabel, majorName, durationMinutes }: InterviewCoachProps) {
  const [currentQuestion, setCurrentQuestion] = useState(firstInterviewQuestion);
  const [answer, setAnswer] = useState("");
  const [turns, setTurns] = useState<InterviewTurn[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const latestTurn = turns.at(-1);
  const latestScore = useMemo(() => latestTurn?.rubric.reduce((sum, item) => sum + item.score, 0) ?? 0, [latestTurn]);
  const interviewSummary = useMemo(
    () => summarizeInterview(turns.map((turn) => ({ answer: turn.answer, rubric: turn.rubric }))),
    [turns],
  );
  const currentRound = Math.min(turns.length + 1, maxInterviewQuestions);

  async function submitAnswer() {
    const currentAnswer = answer.trim();

    if (!currentAnswer || isSubmitting || isCompleted) {
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

      setTurns((current) => {
        const nextTurns = [
          ...current,
          {
            question: currentQuestion,
            answer: currentAnswer,
            feedback: payload.result?.feedback ?? "",
            improvedAnswer: payload.result?.improvedAnswer ?? "",
            rubric: payload.result?.rubric ?? [],
            source: payload.source ?? "fallback",
          },
        ];

        if (nextTurns.length >= maxInterviewQuestions) {
          setIsCompleted(true);
        } else {
          setCurrentQuestion(payload.result?.nextQuestion ?? "");
        }

        return nextTurns;
      });
      setAnswer("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "ส่งคำตอบไม่สำเร็จ");
    } finally {
      setIsSubmitting(false);
    }
  }

  function finishInterview() {
    if (turns.length === 0 || isSubmitting) {
      return;
    }

    setIsCompleted(true);
    setErrorMessage(null);
    setAnswer("");
  }

  function restartInterview() {
    setCurrentQuestion(firstInterviewQuestion);
    setAnswer("");
    setTurns([]);
    setIsSubmitting(false);
    setIsCompleted(false);
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
              เริ่มจากคำถามแนะนำตัว ระบบจะถามต่อจากคำตอบของคุณ และสรุปผลเมื่อครบ {maxInterviewQuestions} คำถามหรือเมื่อกดจบรอบสัมภาษณ์
            </p>
          </div>
          <div className="grid border-t border-white/10 bg-white/[0.04] sm:grid-cols-4">
            <HeroStat label="สนาม" value={affiliationLabel} />
            <HeroStat label="เอก" value={majorName} />
            <HeroStat label="กรอบเวลาฝึก" value={`${durationMinutes} นาที`} />
            <HeroStat label="จำนวนคำถาม" value={`${turns.length}/${maxInterviewQuestions}`} />
          </div>
        </section>

        {isCompleted ? (
          <SummaryPanel summary={interviewSummary} onRestart={restartInterview} />
        ) : (
          <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
            <div className="flex flex-wrap items-start justify-between gap-3 rounded-lg bg-[#eef6ff] p-4">
              <div>
                <p className="text-sm font-black text-[#0b66c3]">คำถามที่ {currentRound}/{maxInterviewQuestions}</p>
                <h3 className="mt-2 text-xl font-black leading-8 text-[#071f4a]">{currentQuestion}</h3>
              </div>
              {turns.length > 0 ? (
                <button
                  type="button"
                  onClick={finishInterview}
                  className="rounded-lg border border-[#0b66c3]/20 bg-white px-4 py-2 text-sm font-black text-[#0b66c3] transition hover:border-[#0b66c3]"
                >
                  จบและดูสรุปผล
                </button>
              ) : null}
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
                {isSubmitting ? "กำลังประเมิน..." : turns.length + 1 >= maxInterviewQuestions ? "ส่งคำตอบและดูสรุปผล" : "ส่งคำตอบให้ AI ประเมิน"}
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
        )}

        {turns.length > 0 ? (
          <section className="space-y-4">
            {turns.map((turn, index) => (
              <article key={`${turn.question}-${index}`} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-[#0b66c3]">คำถามที่ {index + 1}</p>
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
          <h3 className="mt-2 text-3xl font-black text-[#071f4a]">{latestTurn ? `${latestScore}/20` : "ยังไม่เริ่ม"}</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
            {isCompleted
              ? `จบรอบนี้แล้ว ${turns.length} คำถาม ดูสรุปผลด้านบนเพื่อวางแผนฝึกรอบถัดไป`
              : `ตอบแล้ว ${turns.length} จาก ${maxInterviewQuestions} คำถาม สามารถจบเพื่อดูสรุปผลได้หลังตอบอย่างน้อย 1 คำถาม`}
          </p>
        </div>
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-sm font-black text-[#0b66c3]">เวลาแนะนำ</p>
          <div className="mt-3 space-y-3 text-sm font-semibold text-slate-600">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span>แนะนำตัว</span>
              <span className="font-black text-[#071f4a]">2-3 นาที</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span>คำถามต่อยอด</span>
              <span className="font-black text-[#071f4a]">1-2 นาที/ข้อ</span>
            </div>
            <p className="text-xs leading-5 text-slate-400">
              ระบบไม่ตัดจบอัตโนมัติ ใช้เวลาเป็นกรอบฝึกให้คำตอบกระชับและตรงประเด็น
            </p>
          </div>
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

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4">
      <p className="text-xs font-black text-white/50">{label}</p>
      <p className="mt-1 font-black">{value}</p>
    </div>
  );
}

function SummaryPanel({
  summary,
  onRestart,
}: {
  summary: ReturnType<typeof summarizeInterview>;
  onRestart: () => void;
}) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-black text-[#0b66c3]">สรุปผลการสัมภาษณ์</p>
          <h3 className="mt-2 text-3xl font-black text-[#071f4a]">{summary.levelLabel}</h3>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-slate-600">{summary.advice}</p>
        </div>
        <div className="rounded-xl bg-[#071f4a] px-5 py-4 text-right text-white">
          <p className="text-xs font-black text-white/60">คะแนนรวม</p>
          <p className="mt-1 text-3xl font-black">
            {summary.totalScore}/{summary.maxScore}
          </p>
          <p className="text-sm font-black text-[#ffd35a]">{summary.averageScore}%</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-emerald-50 p-4">
          <p className="text-sm font-black text-emerald-800">จุดเด่นรอบนี้</p>
          <p className="mt-1 text-lg font-black text-emerald-950">{summary.strengthLabel}</p>
        </div>
        <div className="rounded-xl bg-amber-50 p-4">
          <p className="text-sm font-black text-amber-800">ควรฝึกเพิ่มก่อนรอบถัดไป</p>
          <p className="mt-1 text-lg font-black text-amber-950">{summary.improvementLabel}</p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onRestart}
          className="rounded-xl bg-[#ffd35a] px-5 py-3 text-sm font-black text-[#071f4a] transition hover:bg-[#f6bf22]"
        >
          เริ่มรอบใหม่
        </button>
      </div>
    </section>
  );
}
