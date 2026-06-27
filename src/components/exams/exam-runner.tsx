"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { RichContent } from "@/components/exams/rich-content";

type ExamChoice = {
  id: string;
  label: string;
  text: string;
  contentFormat: string;
  imageUrl: string | null;
};

type ExamQuestion = {
  id: string;
  no: number;
  score: number;
  contentFormat: string;
  stem: string;
  inlinePassage: string | null;
  imageUrl: string | null;
  section: {
    id: string;
    title: string;
    description: string | null;
    contentFormat: string;
  } | null;
  passage: {
    id: string;
    title: string | null;
    content: string;
    contentFormat: string;
    imageUrl: string | null;
    range: {
      firstNo: number;
      lastNo: number;
    } | null;
  } | null;
  assets: Array<{
    id: string;
    url: string;
    altText: string | null;
    caption: string | null;
  }>;
  choices: ExamChoice[];
};

type ExamPart = {
  id: string;
  title: string;
  shortTitle: string;
  durationMinutes: number;
  totalQuestions: number;
  difficulty: string | null;
  questions: ExamQuestion[];
};

type SubmitResult = {
  ok: boolean;
  message?: string;
  attemptId?: string;
  score?: number;
  maxScore?: number;
  totalQuestions?: number;
  answeredCount?: number;
  correctCount?: number;
  durationSeconds?: number;
  submittedAt?: string;
  questions?: Array<{
    questionId: string;
    selectedChoiceIds: string[];
    correctChoiceIds: string[];
    isCorrect: boolean | null;
    score: number;
    maxScore: number;
    explanation: string | null;
    explanationFormat: string;
    explanationImageUrl: string | null;
  }>;
};

type ExamRunnerProps = {
  part: ExamPart;
  initialHistory?: AttemptHistory;
  submitUrl?: string;
};

type AttemptSummary = {
  id: string;
  score: number;
  maxScore: number;
  totalQuestions: number;
  answeredCount: number;
  durationSeconds: number | null;
  submittedAt: string;
};

type AttemptHistory = {
  attemptCount: number;
  bestAttempt: AttemptSummary | null;
  latestAttempts: AttemptSummary[];
};

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatAttemptDate(value: string) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatPassageRange(range: { firstNo: number; lastNo: number } | null) {
  if (!range) {
    return "ใช้ตอบคำถามที่เกี่ยวข้อง";
  }

  if (range.firstNo === range.lastNo) {
    return `ใช้ตอบคำถามข้อ ${range.firstNo}`;
  }

  return `ใช้ตอบคำถามข้อ ${range.firstNo}-${range.lastNo}`;
}

function toAttemptSummary(result: SubmitResult): AttemptSummary | null {
  if (!result.ok || !result.attemptId || result.score == null || result.maxScore == null) {
    return null;
  }

  return {
    id: result.attemptId,
    score: result.score,
    maxScore: result.maxScore,
    totalQuestions: result.totalQuestions ?? 0,
    answeredCount: result.answeredCount ?? 0,
    durationSeconds: result.durationSeconds ?? null,
    submittedAt: result.submittedAt ?? new Date().toISOString(),
  };
}

function getChoiceClass({
  choiceId,
  selectedChoiceId,
  correctChoiceIds,
  submitted,
}: {
  choiceId: string;
  selectedChoiceId: string | undefined;
  correctChoiceIds: string[];
  submitted: boolean;
}) {
  if (!submitted) {
    return selectedChoiceId === choiceId
      ? "border-[#0b66c3] bg-[#eaf4ff]"
      : "border-slate-200 bg-slate-50 hover:border-[#0b66c3] hover:bg-white";
  }

  if (correctChoiceIds.includes(choiceId)) {
    return "border-emerald-500 bg-emerald-50";
  }

  if (selectedChoiceId === choiceId) {
    return "border-rose-500 bg-rose-50";
  }

  return "border-slate-200 bg-slate-50 opacity-75";
}

export function ExamRunner({ part, initialHistory, submitUrl }: ExamRunnerProps) {
  const initialSeconds = Math.max(part.durationMinutes * 60, 1);
  const [selectedChoices, setSelectedChoices] = useState<Record<string, string>>({});
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const hasSubmittedRef = useRef(false);
  const selectedChoicesRef = useRef(selectedChoices);

  const resultByQuestionId = useMemo(() => {
    const entries = result?.questions?.map((question) => [question.questionId, question] as const) ?? [];
    return new Map(entries);
  }, [result]);
  const currentAttempt = useMemo(() => (result ? toAttemptSummary(result) : null), [result]);
  const bestAttempt = useMemo(() => {
    const attempts = [currentAttempt, initialHistory?.bestAttempt].filter((item): item is AttemptSummary => Boolean(item));
    return attempts.sort((a, b) => b.score - a.score || b.maxScore - a.maxScore)[0] ?? null;
  }, [currentAttempt, initialHistory?.bestAttempt]);
  const latestAttempts = useMemo(() => {
    const merged = [
      ...(currentAttempt ? [currentAttempt] : []),
      ...(initialHistory?.latestAttempts ?? []),
    ];
    const unique = new Map<string, AttemptSummary>();

    for (const attempt of merged) {
      unique.set(attempt.id, attempt);
    }

    return Array.from(unique.values())
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      .slice(0, 5);
  }, [currentAttempt, initialHistory?.latestAttempts]);
  const attemptCount = (initialHistory?.attemptCount ?? 0) + (currentAttempt ? 1 : 0);

  const answeredCount = Object.keys(selectedChoices).length;
  const submitted = Boolean(result?.ok);

  async function submitExam() {
    if (hasSubmittedRef.current || isSubmitting || part.questions.length === 0) {
      return;
    }

    hasSubmittedRef.current = true;
    setIsSubmitting(true);

    const durationSeconds = Math.max(0, Math.round((Date.now() - startedAt) / 1000));
    const response = await fetch(submitUrl ?? `/api/exams/package-parts/${part.id}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        durationSeconds,
        answers: part.questions.map((question) => ({
          questionId: question.id,
          selectedChoiceIds: selectedChoicesRef.current[question.id] ? [selectedChoicesRef.current[question.id]] : [],
        })),
      }),
    });

    const payload = (await response.json().catch(() => ({
      ok: false,
      message: "ส่งคำตอบไม่สำเร็จ",
    }))) as SubmitResult;

    if (!response.ok || !payload.ok) {
      hasSubmittedRef.current = false;
    }

    setResult(payload);
    setIsSubmitting(false);
  }

  function restartExam() {
    hasSubmittedRef.current = false;
    setSelectedChoices({});
    setSecondsLeft(initialSeconds);
    setStartedAt(Date.now());
    setIsSubmitting(false);
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => {
    selectedChoicesRef.current = selectedChoices;
  }, [selectedChoices]);

  useEffect(() => {
    if (submitted || isSubmitting || part.questions.length === 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          void submitExam();
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [submitted, isSubmitting, part.questions.length]);

  if (part.questions.length === 0) {
    return (
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-black text-[#0b66c3]">ยังไม่มีคำถามในชุดนี้</p>
          <h2 className="mt-2 text-2xl font-black text-[#071f4a]">เพิ่มข้อสอบลงฐานข้อมูลแล้วหน้านี้จะแสดงอัตโนมัติ</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm font-semibold leading-6 text-slate-500">
            ตอนนี้ข้อมูลชุด/ภาคถูกดึงจากฐานข้อมูลจริงแล้ว เหลือเพียงเพิ่มคำถามและตัวเลือกเข้า `exam_questions` พร้อมผูกเข้ากับภาคนี้
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_320px] lg:px-8">
      <div className="space-y-5">
        {result?.ok ? (
          <section className="rounded-lg bg-[#071f4a] p-6 text-white shadow-sm">
            <p className="text-sm font-black text-[#ffd35a]">ผลคะแนน</p>
            <h2 className="mt-2 text-4xl font-black">
              {result.score}/{result.maxScore} คะแนน
            </h2>
            <p className="mt-3 text-sm font-semibold text-white/75">
              ตอบถูก {result.correctCount}/{result.totalQuestions} ข้อ | ทำแล้ว {result.answeredCount} ข้อ | ใช้เวลา {formatTime(result.durationSeconds ?? 0)}
            </p>
            <button
              type="button"
              onClick={restartExam}
              className="mt-5 rounded-xl bg-[#ffd35a] px-5 py-3 text-sm font-black text-[#071f4a] transition hover:bg-[#f6bf22]"
            >
              ทำอีกครั้ง
            </button>
          </section>
        ) : null}

        {result && !result.ok ? (
          <section className="rounded-lg border border-rose-200 bg-rose-50 p-5 text-rose-900 shadow-sm">
            <h2 className="text-xl font-black">ยังส่งคำตอบไม่ได้</h2>
            <p className="mt-2 text-sm font-semibold">{result.message ?? "กรุณาลองอีกครั้ง"}</p>
            <Link href="/login" className="mt-4 inline-flex rounded-xl bg-rose-700 px-4 py-2 text-sm font-black text-white">
              เข้าสู่ระบบ
            </Link>
          </section>
        ) : null}

        {part.questions.map((question, index) => {
          const questionResult = resultByQuestionId.get(question.id);
          const selectedChoiceId = selectedChoices[question.id];
          const correctChoiceIds = questionResult?.correctChoiceIds ?? [];

          return (
            <Fragment key={question.id}>
              {question.section && question.section.id !== part.questions[index - 1]?.section?.id ? (
                <section className="rounded-lg border border-[#0b66c3]/20 bg-[#0b66c3] p-5 text-white shadow-sm">
                  <p className="text-sm font-black text-[#ffd35a]">หัวข้อ</p>
                  <h2 className="mt-1 text-2xl font-black">{question.section.title}</h2>
                  <RichContent content={question.section.description} format={question.section.contentFormat} className="mt-2 text-sm font-semibold text-white/80" />
                </section>
              ) : null}

              {question.passage && question.passage.id !== part.questions[index - 1]?.passage?.id ? (
                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-black text-[#0b66c3]">อ่านข้อความต่อไปนี้ แล้วตอบคำถาม</p>
                  <p className="mt-1 inline-flex rounded-full bg-[#fff2c2] px-3 py-1 text-xs font-black text-[#9a5b00]">
                    {formatPassageRange(question.passage.range)}
                  </p>
                  {question.passage.title ? <h2 className="mt-2 text-xl font-black text-[#071f4a]">{question.passage.title}</h2> : null}
                  {question.passage.imageUrl ? (
                    <img src={question.passage.imageUrl} alt="" className="mt-4 max-h-[420px] w-auto max-w-full rounded-lg border border-slate-200 object-contain" />
                  ) : null}
                  <RichContent content={question.passage.content} format={question.passage.contentFormat} className="mt-3 text-sm font-semibold text-slate-700" />
                </section>
              ) : null}

              <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-[#0b66c3]">ข้อ {question.no}</p>
                    {question.inlinePassage ? (
                      <RichContent content={question.inlinePassage} format={question.contentFormat} className="mt-3 rounded-lg bg-slate-50 p-4 text-sm font-semibold text-slate-700" />
                    ) : null}
                    {question.imageUrl ? (
                      <img src={question.imageUrl} alt="" className="mt-4 max-h-[420px] w-auto max-w-full rounded-lg border border-slate-200 object-contain" />
                    ) : null}
                    {question.assets.map((asset) => (
                      <figure key={asset.id} className="mt-4">
                        <img src={asset.url} alt={asset.altText ?? ""} className="max-h-[420px] w-auto max-w-full rounded-lg border border-slate-200 object-contain" />
                        {asset.caption ? <figcaption className="mt-2 text-xs font-semibold text-slate-500">{asset.caption}</figcaption> : null}
                      </figure>
                    ))}
                    <RichContent content={question.stem} format={question.contentFormat} className="mt-2 text-xl font-black leading-8 text-[#071f4a]" />
                  </div>
                  <span className="rounded-full bg-[#fff2c2] px-3 py-1 text-xs font-black text-[#9a5b00]">
                    {questionResult ? `${questionResult.score}/${questionResult.maxScore}` : question.score} คะแนน
                  </span>
                </div>

                <div className="mt-5 grid gap-3">
                  {question.choices.map((choice) => (
                    <label
                      key={choice.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${getChoiceClass({
                        choiceId: choice.id,
                        selectedChoiceId,
                        correctChoiceIds,
                        submitted,
                      })}`}
                    >
                      <input
                        type="radio"
                        name={`question-${question.id}`}
                        className="mt-1 h-4 w-4 accent-[#0b66c3]"
                        checked={selectedChoiceId === choice.id}
                        disabled={submitted || isSubmitting}
                        onChange={() =>
                          setSelectedChoices((current) => ({
                            ...current,
                            [question.id]: choice.id,
                          }))
                        }
                      />
                      <span className="text-sm font-semibold leading-6 text-slate-700">
                        <span className="font-black">{choice.label}.</span>
                        <RichContent content={choice.text} format={choice.contentFormat} className="ml-1 inline-block" />
                        {choice.imageUrl ? <img src={choice.imageUrl} alt="" className="mt-3 max-h-64 w-auto max-w-full rounded-lg border border-slate-200 object-contain" /> : null}
                      </span>
                    </label>
                  ))}
                </div>

                {questionResult ? (
                  <div className={`mt-5 rounded-lg p-4 ${questionResult.isCorrect ? "bg-emerald-50 text-emerald-900" : "bg-rose-50 text-rose-900"}`}>
                    <p className="text-sm font-black">
                      {questionResult.isCorrect ? "ตอบถูก" : questionResult.isCorrect === false ? "ตอบผิด" : "ยังไม่ได้ตอบ"}
                    </p>
                    <RichContent content={questionResult.explanation} format={questionResult.explanationFormat} className="mt-2 text-sm font-semibold" />
                    {questionResult.explanationImageUrl ? (
                      <img src={questionResult.explanationImageUrl} alt="" className="mt-3 max-h-80 w-auto max-w-full rounded-lg border border-slate-200 object-contain" />
                    ) : null}
                  </div>
                ) : null}
              </article>
            </Fragment>
          );
        })}
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-[#071f4a]">สารบัญข้อสอบ</h2>
          <div className="mt-4 grid grid-cols-5 gap-2">
            {part.questions.map((question) => (
              <button
                key={question.id}
                type="button"
                className={`h-10 rounded-lg text-sm font-black ${
                  selectedChoices[question.id] ? "bg-[#0b66c3] text-white" : "bg-slate-100 text-slate-500"
                }`}
                onClick={() => document.getElementsByName(`question-${question.id}`)[0]?.scrollIntoView({ behavior: "smooth", block: "center" })}
              >
                {question.no}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg bg-[#071f4a] p-5 text-white shadow-sm">
          <p className="text-sm font-black text-[#ffd35a]">{submitted ? "ส่งคำตอบแล้ว" : "กำลังทำข้อสอบ"}</p>
          <h2 className="mt-2 text-3xl font-black">{submitted ? "ดูเฉลยด้านซ้าย" : formatTime(secondsLeft)}</h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-white/70">
            ทำแล้ว {answeredCount}/{part.questions.length} ข้อ
          </p>
          {submitted ? (
            <button
              type="button"
              onClick={restartExam}
              className="mt-5 w-full rounded-xl bg-[#ffd35a] px-4 py-3 text-sm font-black text-[#071f4a]"
            >
              ทำอีกครั้ง
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={submitExam}
              className="mt-5 w-full rounded-xl bg-[#ffd35a] px-4 py-3 text-sm font-black text-[#071f4a] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "กำลังส่งคำตอบ..." : "ส่งคำตอบ"}
            </button>
          )}
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-black text-[#071f4a]">ประวัติคะแนน</h2>
          {bestAttempt ? (
            <div className="mt-4 rounded-lg bg-emerald-50 p-4 text-emerald-900">
              <p className="text-xs font-black">คะแนนสูงสุด</p>
              <p className="mt-1 text-2xl font-black">
                {bestAttempt.score}/{bestAttempt.maxScore}
              </p>
              <p className="mt-1 text-xs font-semibold">ทำมาแล้ว {attemptCount} ครั้ง</p>
            </div>
          ) : (
            <div className="mt-4 rounded-lg bg-slate-50 p-4 text-slate-600">
              <p className="text-sm font-black">ยังไม่มีประวัติ</p>
              <p className="mt-1 text-xs font-semibold">ส่งคำตอบครั้งแรกเพื่อบันทึกคะแนน</p>
            </div>
          )}

          {latestAttempts.length > 0 ? (
            <div className="mt-4 space-y-2">
              {latestAttempts.map((attempt) => (
                <div key={attempt.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-black text-[#071f4a]">
                      {attempt.score}/{attempt.maxScore}
                    </p>
                    <p className="text-xs font-bold text-slate-500">{formatTime(attempt.durationSeconds ?? 0)}</p>
                  </div>
                  <p className="mt-1 text-xs font-semibold text-slate-500">{formatAttemptDate(attempt.submittedAt)}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </aside>
    </section>
  );
}
