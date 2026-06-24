"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    window.setTimeout(() => {
      setIsSubmitting(false);
      setMessage("ถ้าพบบัญชีที่ตรงกับอีเมลนี้ ระบบจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ให้");
    }, 700);
  }

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      {message ? (
        <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold leading-6 text-emerald-700">
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
          disabled={isSubmitting || !email.trim()}
          className="inline-flex h-[54px] items-center justify-center gap-2 rounded-2xl bg-[#ffd35a] text-base font-black text-[#071f4a] shadow-lg shadow-[#ffd35a]/30 transition hover:-translate-y-0.5 hover:bg-[#f6bf22] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#071f4a]/25 border-t-[#071f4a]" aria-hidden="true" />
              กำลังส่งลิงก์...
            </>
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
