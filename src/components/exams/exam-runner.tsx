"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
  initialDraft?: AttemptDraft | null;
  submitUrl?: string;
  draftTarget?: {
    type: "packagePart" | "practiceSet";
    id: string;
  };
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

type AttemptDraft = {
  id: string;
  selectedChoices: Record<string, string>;
  startedAt: string;
  durationSecondsUsed: number;
  lastSavedAt: string;
};

type DraftSaveState = "idle" | "saving" | "saved" | "error";

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

function isDefaultPassageTitle(title: string | null) {
  return title?.trim() === "อ่านข้อความต่อไปนี้ แล้วตอบคำถาม";
}

function getDisplayChoiceLabel(label: string) {
  const thaiLabels: Record<string, string> = {
    A: "ก",
    B: "ข",
    C: "ค",
    D: "ง",
    E: "จ",
  };
  const normalized = label.trim().toUpperCase();

  return thaiLabels[normalized] ?? label;
}

function getPlainChoiceText(choice: ExamChoice) {
  return choice.text
    .replace(/<[^>]*>/g, " ")
    .replace(/[*_`>#\[\](){}|\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function shouldUseCompactChoices(choices: ExamChoice[]) {
  return (
    choices.length > 0 &&
    choices.length <= 4 &&
    choices.every((choice) => !choice.imageUrl && !choice.text.includes("\n") && getPlainChoiceText(choice).length <= 42)
  );
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

export function ExamRunner({ part, initialHistory, initialDraft, submitUrl, draftTarget }: ExamRunnerProps) {
  const router = useRouter();
  const initialSeconds = Math.max(part.durationMinutes * 60, 1);
  const initialDraftDuration = Math.max(0, Math.floor(initialDraft?.durationSecondsUsed ?? 0));
  const [selectedChoices, setSelectedChoices] = useState<Record<string, string>>(() => initialDraft?.selectedChoices ?? {});
  const [secondsLeft, setSecondsLeft] = useState(() => Math.max(initialSeconds - initialDraftDuration, 0));
  const [startedAt, setStartedAt] = useState(() => Date.now() - initialDraftDuration * 1000);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNavigatorOpen, setIsNavigatorOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isIncompleteConfirmOpen, setIsIncompleteConfirmOpen] = useState(false);
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [pendingLeaveHref, setPendingLeaveHref] = useState<string | null>(null);
  const [draftSaveState, setDraftSaveState] = useState<DraftSaveState>(initialDraft ? "saved" : "idle");
  const [lastDraftSavedAt, setLastDraftSavedAt] = useState<string | null>(initialDraft?.lastSavedAt ?? null);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const hasSubmittedRef = useRef(false);
  const selectedChoicesRef = useRef(selectedChoices);
  const shouldWarnBeforeLeavingRef = useRef(false);
  const allowNavigationRef = useRef(false);
  const lastSavedDraftSignatureRef = useRef(initialDraft ? JSON.stringify(initialDraft.selectedChoices) : "");

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
  const unansweredCount = Math.max(part.questions.length - answeredCount, 0);
  const answeredPercent = part.questions.length > 0 ? Math.round((answeredCount / part.questions.length) * 100) : 0;
  const submitted = Boolean(result?.ok);
  const shouldWarnBeforeLeaving = Boolean(draftTarget && !submitted && answeredCount > 0);
  const draftStatusText =
    draftSaveState === "saving"
      ? "กำลังบันทึกคำตอบ..."
      : draftSaveState === "saved"
        ? lastDraftSavedAt
          ? `บันทึกล่าสุด ${formatAttemptDate(lastDraftSavedAt)}`
          : "บันทึกคำตอบแล้ว"
        : draftSaveState === "error"
          ? "บันทึกคำตอบไม่สำเร็จ จะลองใหม่อัตโนมัติ"
          : "ระบบจะบันทึกคำตอบระหว่างทำ";

  function getDurationSecondsUsed() {
    return Math.max(0, Math.round((Date.now() - startedAt) / 1000));
  }

  function getDraftPayload() {
    if (!draftTarget) {
      return null;
    }

    return {
      targetType: draftTarget.type,
      targetId: draftTarget.id,
      selectedChoices: selectedChoicesRef.current,
      durationSecondsUsed: getDurationSecondsUsed(),
      startedAt: new Date(startedAt).toISOString(),
    };
  }

  function scrollToQuestion(questionId: string) {
    document.getElementsByName(`question-${questionId}`)[0]?.scrollIntoView({ behavior: "smooth", block: "center" });
    setIsNavigatorOpen(false);
  }

  async function submitExam({ skipIncompleteConfirm = false }: { skipIncompleteConfirm?: boolean } = {}) {
    if (hasSubmittedRef.current || isSubmitting || part.questions.length === 0) {
      return;
    }

    const currentAnsweredCount = Object.keys(selectedChoicesRef.current).length;
    const currentUnansweredCount = Math.max(part.questions.length - currentAnsweredCount, 0);

    if (!skipIncompleteConfirm && currentUnansweredCount > 0) {
      setIsIncompleteConfirmOpen(true);
      return;
    }

    setIsIncompleteConfirmOpen(false);
    hasSubmittedRef.current = true;
    setIsSubmitting(true);

    const durationSeconds = getDurationSecondsUsed();
    let response: Response | null = null;
    let payload: SubmitResult;

    try {
      response = await fetch(submitUrl ?? `/api/exams/package-parts/${part.id}/submit`, {
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

      payload = (await response.json().catch(() => ({
        ok: false,
        message: "ส่งคำตอบไม่สำเร็จ",
      }))) as SubmitResult;
    } catch {
      payload = {
        ok: false,
        message: "ส่งคำตอบไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองอีกครั้ง",
      };
    }

    if (!response?.ok || !payload.ok) {
      hasSubmittedRef.current = false;
    }

    setResult(payload);
    setIsSubmitting(false);
  }

  async function saveDraft({ force = false }: { force?: boolean } = {}) {
    if (!draftTarget || submitted || part.questions.length === 0) {
      return;
    }

    const signature = JSON.stringify(selectedChoicesRef.current);

    if (!force && signature === lastSavedDraftSignatureRef.current) {
      return;
    }

    setDraftSaveState("saving");

    try {
      const payloadBody = getDraftPayload();

      if (!payloadBody) {
        return;
      }

      const response = await fetch("/api/exams/drafts", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payloadBody),
      });
      const payload = (await response.json().catch(() => ({
        ok: false,
      }))) as { ok?: boolean; draft?: { lastSavedAt?: string } };

      if (!response.ok || !payload.ok) {
        throw new Error("Draft save failed");
      }

      lastSavedDraftSignatureRef.current = signature;
      setLastDraftSavedAt(payload.draft?.lastSavedAt ?? new Date().toISOString());
      setDraftSaveState("saved");
    } catch {
      setDraftSaveState("error");
    }
  }

  function retrySubmitExam() {
    void submitExam({ skipIncompleteConfirm: true });
  }

  function navigateAfterLeaveDecision() {
    allowNavigationRef.current = true;

    if (pendingLeaveHref) {
      router.push(pendingLeaveHref);
      return;
    }

    window.history.back();
  }

  function saveDraftBeforePageExit() {
    const payloadBody = getDraftPayload();

    if (!payloadBody || allowNavigationRef.current || !shouldWarnBeforeLeavingRef.current) {
      return;
    }

    void fetch("/api/exams/drafts", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payloadBody),
      keepalive: true,
    }).catch(() => undefined);
  }

  async function deleteDraft() {
    if (!draftTarget) {
      return;
    }

    await fetch(`/api/exams/drafts?targetType=${draftTarget.type}&targetId=${draftTarget.id}`, {
      method: "DELETE",
    }).catch(() => undefined);

    lastSavedDraftSignatureRef.current = "";
    setLastDraftSavedAt(null);
    setDraftSaveState("idle");
  }

  async function leaveAfterSavingDraft() {
    setIsLeaving(true);
    await saveDraft({ force: true });
    navigateAfterLeaveDecision();
  }

  async function leaveWithoutSavingDraft() {
    setIsLeaving(true);
    await deleteDraft();
    navigateAfterLeaveDecision();
  }

  function requestSubmitExam() {
    void submitExam();
  }

  function restartExam() {
    hasSubmittedRef.current = false;
    setSelectedChoices({});
    setSecondsLeft(initialSeconds);
    setStartedAt(Date.now());
    setIsSubmitting(false);
    setIsIncompleteConfirmOpen(false);
    setIsLeaveConfirmOpen(false);
    setIsLeaving(false);
    setPendingLeaveHref(null);
    setDraftSaveState("idle");
    setLastDraftSavedAt(null);
    lastSavedDraftSignatureRef.current = "";
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => {
    selectedChoicesRef.current = selectedChoices;
  }, [selectedChoices]);

  useEffect(() => {
    shouldWarnBeforeLeavingRef.current = shouldWarnBeforeLeaving;
  }, [shouldWarnBeforeLeaving]);

  useEffect(() => {
    if (!draftTarget) {
      return;
    }

    window.history.pushState({ examLeaveGuard: true }, "", window.location.href);

    function handlePopState() {
      if (allowNavigationRef.current || !shouldWarnBeforeLeavingRef.current) {
        return;
      }

      window.history.pushState({ examLeaveGuard: true }, "", window.location.href);
      setPendingLeaveHref(null);
      setIsLeaveConfirmOpen(true);
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [draftTarget]);

  useEffect(() => {
    if (!draftTarget) {
      return;
    }

    function handleDocumentClick(event: MouseEvent) {
      if (allowNavigationRef.current || !shouldWarnBeforeLeavingRef.current || event.defaultPrevented) {
        return;
      }

      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }

      const anchor = (event.target as Element | null)?.closest("a[href]");

      if (!(anchor instanceof HTMLAnchorElement)) {
        return;
      }

      if (anchor.target && anchor.target !== "_self") {
        return;
      }

      const url = new URL(anchor.href, window.location.href);

      if (url.origin !== window.location.origin || url.href === window.location.href) {
        return;
      }

      event.preventDefault();
      setPendingLeaveHref(`${url.pathname}${url.search}${url.hash}`);
      setIsLeaveConfirmOpen(true);
    }

    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [draftTarget]);

  useEffect(() => {
    if (!draftTarget) {
      return;
    }

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!shouldWarnBeforeLeavingRef.current) {
        return;
      }

      saveDraftBeforePageExit();
      event.preventDefault();
      event.returnValue = "";
    }

    function handlePageHide() {
      saveDraftBeforePageExit();
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [draftTarget, startedAt]);

  useEffect(() => {
    if (!draftTarget || submitted || Object.keys(selectedChoices).length === 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      void saveDraft();
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [draftTarget, selectedChoices, submitted]);

  useEffect(() => {
    if (!draftTarget || submitted || Object.keys(selectedChoices).length === 0) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void saveDraft({ force: true });
    }, 15000);

    return () => window.clearInterval(intervalId);
  }, [draftTarget, selectedChoices, submitted]);

  useEffect(() => {
    if (submitted || isSubmitting || part.questions.length === 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          void submitExam({ skipIncompleteConfirm: true });
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
    <>
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
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={retrySubmitExam}
                className="inline-flex rounded-xl bg-rose-700 px-4 py-2 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "กำลังส่ง..." : "ลองส่งอีกครั้ง"}
              </button>
              <Link href="/login" className="inline-flex rounded-xl border border-rose-200 bg-white px-4 py-2 text-sm font-black text-rose-700">
                เข้าสู่ระบบ
              </Link>
            </div>
          </section>
        ) : null}

        {part.questions.map((question, index) => {
          const questionResult = resultByQuestionId.get(question.id);
          const selectedChoiceId = selectedChoices[question.id];
          const correctChoiceIds = questionResult?.correctChoiceIds ?? [];
          const compactChoices = shouldUseCompactChoices(question.choices);

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
                  {question.passage.title && !isDefaultPassageTitle(question.passage.title) ? (
                    <h2 className="mt-2 text-xl font-black text-[#071f4a]">{question.passage.title}</h2>
                  ) : null}
                  {question.passage.imageUrl ? (
                    <img src={question.passage.imageUrl} alt="" className="mt-4 max-h-[420px] w-auto max-w-full rounded-lg border border-slate-200 object-contain" />
                  ) : null}
                  <RichContent content={question.passage.content} format={question.passage.contentFormat} className="mt-3 text-sm font-semibold text-slate-700" />
                </section>
              ) : null}

              <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
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
                    <div className="mt-2 flex items-start gap-2 text-xl font-black leading-8 text-[#071f4a]">
                      <span className="shrink-0 text-[#0b66c3]">ข้อ {question.no}.</span>
                      <RichContent
                        content={question.stem}
                        format={question.contentFormat}
                        className="min-w-0 flex-1 [&_p]:my-0 [&_p]:leading-8"
                      />
                    </div>
                  </div>
                  <span className="rounded-full bg-[#fff2c2] px-3 py-1 text-xs font-black text-[#9a5b00]">
                    {questionResult ? `${questionResult.score}/${questionResult.maxScore}` : question.score} คะแนน
                  </span>
                </div>

                <div className={`mt-5 grid gap-3 ${compactChoices ? "grid-cols-2" : "grid-cols-1"}`}>
                  {question.choices.map((choice) => (
                    <label
                      key={choice.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${compactChoices ? "min-h-14" : ""} ${getChoiceClass({
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
                      <span className="min-w-0 flex-1 text-sm font-semibold leading-6 text-slate-700">
                        <span className="font-black">{getDisplayChoiceLabel(choice.label)}.</span>
                        <RichContent content={choice.text} format={choice.contentFormat} className="ml-1 inline-block [&_p]:my-0 [&_p]:leading-6" />
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
        <div className="rounded-lg bg-[#071f4a] p-5 text-white shadow-sm">
          <p className="text-sm font-black text-[#ffd35a]">{submitted ? "ส่งคำตอบแล้ว" : "กำลังทำข้อสอบ"}</p>
          <h2 className="mt-2 text-3xl font-black">{submitted ? "ดูเฉลยด้านซ้าย" : formatTime(secondsLeft)}</h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-white/70">
            ทำแล้ว {answeredCount}/{part.questions.length} ข้อ
          </p>
          {draftTarget && !submitted ? (
            <p className={`mt-2 text-xs font-black ${draftSaveState === "error" ? "text-rose-200" : "text-white/50"}`}>
              {draftStatusText}
            </p>
          ) : null}
          {currentAttempt ? (
            <div className="mt-4 rounded-lg bg-[#ffd35a] px-3 py-3 text-[#071f4a]">
              <p className="text-xs font-black">คะแนนรอบนี้</p>
              <p className="mt-1 text-2xl font-black">
                {currentAttempt.score}/{currentAttempt.maxScore}
              </p>
            </div>
          ) : null}
          {bestAttempt ? (
            <div className="mt-4 rounded-lg bg-white/10 px-3 py-2">
              <p className="text-xs font-black text-white/60">คะแนนสูงสุด</p>
              <p className="mt-1 text-lg font-black text-[#ffd35a]">
                {bestAttempt.score}/{bestAttempt.maxScore}
              </p>
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => setIsNavigatorOpen(true)}
            className="mt-4 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-black text-white transition hover:bg-white/15"
          >
            เปิดสารบัญข้อสอบ
          </button>
          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            className="mt-3 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-black text-white transition hover:bg-white/15"
          >
            ดูประวัติคะแนน
          </button>
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
              onClick={requestSubmitExam}
              className="mt-5 w-full rounded-xl bg-[#ffd35a] px-4 py-3 text-sm font-black text-[#071f4a] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "กำลังส่งคำตอบ..." : "ส่งคำตอบ"}
            </button>
          )}
        </div>

      </aside>
    </section>
    {isNavigatorOpen ? (
      <div className="fixed inset-0 z-50 bg-slate-950/60 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true">
        <div className="mx-auto flex max-h-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
          <div className="bg-[#071f4a] p-5 text-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ffd35a]">Question Navigator</p>
                <h2 className="mt-1 text-2xl font-black">สารบัญข้อสอบ</h2>
                <p className="mt-1 text-sm font-semibold text-white/65">แตะเลขข้อเพื่อข้ามไปยังข้อที่ต้องการ</p>
              </div>
              <button
                type="button"
                onClick={() => setIsNavigatorOpen(false)}
                className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm font-black text-white transition hover:bg-white/15"
              >
                ปิด
              </button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-white/10 p-3">
                <p className="text-xs font-black text-white/55">ทั้งหมด</p>
                <p className="mt-1 text-2xl font-black">{part.questions.length}</p>
              </div>
              <div className="rounded-lg bg-[#ffd35a] p-3 text-[#071f4a]">
                <p className="text-xs font-black text-[#071f4a]/60">ทำแล้ว</p>
                <p className="mt-1 text-2xl font-black">{answeredCount}</p>
              </div>
              <div className="rounded-lg bg-white/10 p-3">
                <p className="text-xs font-black text-white/55">ยังไม่ได้ทำ</p>
                <p className="mt-1 text-2xl font-black">{unansweredCount}</p>
              </div>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/15">
              <div className="h-full rounded-full bg-[#ffd35a]" style={{ width: `${answeredPercent}%` }} />
            </div>
          </div>
          <div className="overflow-y-auto bg-slate-50 p-4">
            <div className="grid grid-cols-10 gap-1.5 sm:grid-cols-12 md:grid-cols-[repeat(15,minmax(0,1fr))]">
              {part.questions.map((question) => (
                <button
                  key={question.id}
                  type="button"
                  className={`h-9 rounded-lg border text-xs font-black transition ${
                    selectedChoices[question.id]
                      ? "border-[#0b66c3] bg-[#0b66c3] text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-500 hover:border-[#0b66c3] hover:text-[#0b66c3]"
                  }`}
                  onClick={() => scrollToQuestion(question.id)}
                >
                  {question.no}
                </button>
              ))}
            </div>
          </div>
          <div className="border-t border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center gap-4 text-xs font-black text-slate-500">
              <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded bg-[#0b66c3]" /> ตอบแล้ว</span>
              <span className="inline-flex items-center gap-2"><span className="h-3 w-3 rounded bg-white ring-1 ring-slate-200" /> ยังว่าง</span>
              <span className="ml-auto text-[#0b66c3]">{answeredPercent}%</span>
            </div>
          </div>
        </div>
      </div>
    ) : null}
    {isIncompleteConfirmOpen ? (
      <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true">
        <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-2xl">
          <p className="text-sm font-black text-[#0b66c3]">ยังทำข้อสอบไม่ครบ</p>
          <h2 className="mt-2 text-2xl font-black text-[#071f4a]">เหลืออีก {unansweredCount} ข้อ</h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
            คุณยังไม่ได้ตอบครบทุกข้อ หากยืนยันส่ง ระบบจะตรวจคะแนนจากคำตอบที่เลือกไว้เท่านั้น
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setIsIncompleteConfirmOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-600 transition hover:border-[#0b66c3] hover:text-[#0b66c3]"
            >
              กลับไปทำต่อ
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => void submitExam({ skipIncompleteConfirm: true })}
              className="rounded-xl bg-[#ffd35a] px-4 py-3 text-sm font-black text-[#071f4a] transition hover:bg-[#f6bf22] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "กำลังส่ง..." : "ยืนยันส่งคำตอบ"}
            </button>
          </div>
        </div>
      </div>
    ) : null}
    {isLeaveConfirmOpen ? (
      <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true">
        <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-2xl">
          <p className="text-sm font-black text-[#0b66c3]">ออกจากหน้าทำข้อสอบ</p>
          <h2 className="mt-2 text-2xl font-black text-[#071f4a]">ต้องการบันทึกคำตอบก่อนออกไหม</h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
            คุณทำไปแล้ว {answeredCount}/{part.questions.length} ข้อ หากบันทึกไว้จะสามารถกลับมาทำต่อจากคำตอบล่าสุดได้
          </p>
          <div className="mt-5 grid gap-3">
            <button
              type="button"
              disabled={isLeaving}
              onClick={leaveAfterSavingDraft}
              className="rounded-xl bg-[#ffd35a] px-4 py-3 text-sm font-black text-[#071f4a] transition hover:bg-[#f6bf22] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLeaving ? "กำลังจัดการ..." : "บันทึกแล้วออก"}
            </button>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                disabled={isLeaving}
                onClick={() => {
                  setPendingLeaveHref(null);
                  setIsLeaveConfirmOpen(false);
                }}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-600 transition hover:border-[#0b66c3] hover:text-[#0b66c3] disabled:cursor-not-allowed disabled:opacity-70"
              >
                ทำต่อ
              </button>
              <button
                type="button"
                disabled={isLeaving}
                onClick={leaveWithoutSavingDraft}
                className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-black text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70"
              >
                ออกโดยไม่บันทึก
              </button>
            </div>
          </div>
        </div>
      </div>
    ) : null}
    {isHistoryOpen ? (
      <div className="fixed inset-0 z-50 bg-slate-950/60 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true">
        <div className="mx-auto flex max-h-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
          <div className="bg-[#071f4a] p-5 text-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ffd35a]">Score History</p>
                <h2 className="mt-1 text-2xl font-black">ประวัติคะแนน</h2>
                <p className="mt-1 text-sm font-semibold text-white/65">
                  {attemptCount > 0 ? `ทำมาแล้ว ${attemptCount} ครั้ง` : "ยังไม่มีประวัติการทำข้อสอบ"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsHistoryOpen(false)}
                className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm font-black text-white transition hover:bg-white/15"
              >
                ปิด
              </button>
            </div>
          </div>

          <div className="overflow-y-auto bg-slate-50 p-4">
            {bestAttempt || currentAttempt ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {bestAttempt ? (
                  <div className="rounded-lg bg-[#ffd35a] p-4 text-[#071f4a] shadow-sm">
                    <p className="text-sm font-black text-[#071f4a]/65">คะแนนสูงสุด</p>
                    <p className="mt-1 text-3xl font-black">
                      {bestAttempt.score}/{bestAttempt.maxScore}
                    </p>
                    <p className="mt-2 text-xs font-black text-[#071f4a]/65">ทำเมื่อ {formatAttemptDate(bestAttempt.submittedAt)}</p>
                  </div>
                ) : null}

                {currentAttempt ? (
                  <div className="rounded-lg bg-white p-4 text-[#071f4a] shadow-sm ring-1 ring-slate-200">
                    <p className="text-sm font-black text-[#0b66c3]">คะแนนรอบล่าสุด</p>
                    <p className="mt-1 text-3xl font-black">
                      {currentAttempt.score}/{currentAttempt.maxScore}
                    </p>
                    <p className="mt-2 text-xs font-black text-slate-500">
                      ทำแล้ว {currentAttempt.answeredCount}/{currentAttempt.totalQuestions} ข้อ | ใช้เวลา {formatTime(currentAttempt.durationSeconds ?? 0)}
                    </p>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="rounded-lg bg-white p-5 text-slate-600 shadow-sm ring-1 ring-slate-200">
                <p className="text-sm font-black">ยังไม่มีประวัติ</p>
                <p className="mt-1 text-sm font-semibold">ส่งคำตอบครั้งแรกเพื่อบันทึกคะแนน</p>
              </div>
            )}

            {latestAttempts.length > 0 ? (
              <div className="mt-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-black text-[#071f4a]">รายการล่าสุด</p>
                  <p className="text-xs font-bold text-slate-500">แสดง {latestAttempts.length} รายการ</p>
                </div>
                <div className="space-y-2">
                {latestAttempts.map((attempt) => (
                  <div key={attempt.id} className="rounded-lg bg-white p-3 shadow-sm ring-1 ring-slate-200">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-black text-[#071f4a]">
                          {attempt.score}/{attempt.maxScore} คะแนน
                        </p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">{formatAttemptDate(attempt.submittedAt)}</p>
                      </div>
                      <div className="rounded-lg bg-slate-100 px-3 py-2 text-right">
                        <p className="text-xs font-black text-slate-500">เวลา</p>
                        <p className="text-sm font-black text-[#0b66c3]">{formatTime(attempt.durationSeconds ?? 0)}</p>
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    ) : null}
    </>
  );
}
