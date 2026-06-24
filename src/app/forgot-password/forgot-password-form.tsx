"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error">("success");
  const [retryAfterSeconds, setRetryAfterSeconds] = useState(0);

  useEffect(() => {
    if (retryAfterSeconds <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setRetryAfterSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [retryAfterSeconds]);

  const countdownText = `${Math.floor(retryAfterSeconds / 60)}:${String(retryAfterSeconds % 60).padStart(2, "0")}`;
  const isCoolingDown = retryAfterSeconds > 0;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    setMessageType("success");
    setRetryAfterSeconds(0);

    try {
      const response = await fetch("/api/password-reset/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = (await response.json()) as { ok: boolean; status?: string; message?: string; error?: string; retryAfterSeconds?: number };

      if (!response.ok || !result.ok) {
        setMessageType("error");
        setMessage(result.error ?? "ไม่สามารถส่งคำขอรีเซ็ตรหัสผ่านได้");
        return;
      }

      if (typeof result.retryAfterSeconds === "number" && result.retryAfterSeconds > 0) {
        setRetryAfterSeconds(result.retryAfterSeconds);
      }

      setMessageType(result.status === "sent" ? "success" : "error");
      setMessage(result.message ?? "ไม่สามารถส่งอีเมลรีเซ็ตรหัสผ่านได้");
    } catch {
      setMessageType("error");
      setMessage("ไม่สามารถติดต่อระบบรีเซ็ตรหัสผ่านได้ กรุณาลองอีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      {message ? (
        <div className={`mb-5 rounded-2xl border px-4 py-3 text-sm font-bold leading-6 ${messageType === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-[#ffc9c9] bg-[#fff1f1] text-[#b42318]"}`}>
          {message}
        </div>
      ) : null}

      <form className="grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2">
          <span className="text-sm font-black text-slate-700">อีเมลที่ใช้สมัคร</span>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="teacher@example.com"
            className="h-[54px] rounded-2xl border border-slate-200 bg-white px-4 text-base font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0b66c3] focus:ring-4 focus:ring-[#0b66c3]/10"
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting || isCoolingDown || !email.trim()}
          className="inline-flex h-[54px] items-center justify-center gap-2 rounded-2xl bg-[#ffd35a] text-base font-black text-[#071f4a] shadow-lg shadow-[#ffd35a]/30 transition hover:-translate-y-0.5 hover:bg-[#f6bf22] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#071f4a]/25 border-t-[#071f4a]" aria-hidden="true" />
              กำลังส่งลิงก์...
            </>
          ) : isCoolingDown ? (
            `ส่งอีกครั้งได้ใน ${countdownText}`
          ) : (
            "ส่งลิงก์ตั้งรหัสผ่านใหม่"
          )}
        </button>
      </form>

      <div className="mt-5 grid gap-2 text-center text-sm font-semibold text-slate-600">
        <Link href="/login" className="font-black text-[#0b66c3] hover:text-[#084f99]">
          กลับไปเข้าสู่ระบบ
        </Link>
        <Link href="/register" className="font-black text-slate-500 hover:text-[#0b66c3]">
          ยังไม่มีบัญชี? สมัครสมาชิก
        </Link>
      </div>
    </div>
  );
}
