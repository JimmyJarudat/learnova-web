"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";

type ResetPasswordFormProps = {
  token: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/password-reset/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          password: formData.get("password"),
          confirmPassword: formData.get("confirmPassword"),
        }),
      });
      const result = (await response.json()) as { ok: boolean; error?: string };

      if (!response.ok || !result.ok) {
        setError(result.error ?? "ไม่สามารถตั้งรหัสผ่านใหม่ได้");
        return;
      }

      setIsComplete(true);
    } catch {
      setError("ไม่สามารถตั้งรหัสผ่านใหม่ได้ กรุณาลองอีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isComplete) {
    return (
      <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 p-5 text-center shadow-sm">
        <h2 className="text-xl font-black text-emerald-800">ตั้งรหัสผ่านใหม่สำเร็จ</h2>
        <p className="mt-2 text-sm font-semibold leading-6 text-emerald-700">
          คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้แล้ว
        </p>
        <Link href="/login" className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-[#0b66c3] px-5 text-sm font-black text-white hover:bg-[#084f99]">
          ไปหน้าเข้าสู่ระบบ
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      {error ? (
        <div className="mb-5 rounded-2xl border border-[#ffc9c9] bg-[#fff1f1] px-4 py-3 text-sm font-bold leading-6 text-[#b42318]">
          {error}
        </div>
      ) : null}

      <form className="grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2">
          <span className="text-sm font-black text-slate-700">รหัสผ่านใหม่</span>
          <input
            type="password"
            name="password"
            placeholder="อย่างน้อย 8 ตัวอักษร"
            className="h-[54px] rounded-2xl border border-slate-200 bg-white px-4 text-base font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0b66c3] focus:ring-4 focus:ring-[#0b66c3]/10"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-black text-slate-700">ยืนยันรหัสผ่านใหม่</span>
          <input
            type="password"
            name="confirmPassword"
            placeholder="กรอกรหัสผ่านอีกครั้ง"
            className="h-[54px] rounded-2xl border border-slate-200 bg-white px-4 text-base font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0b66c3] focus:ring-4 focus:ring-[#0b66c3]/10"
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-[54px] items-center justify-center gap-2 rounded-2xl bg-[#ffd35a] text-base font-black text-[#071f4a] shadow-lg shadow-[#ffd35a]/30 transition hover:-translate-y-0.5 hover:bg-[#f6bf22] disabled:cursor-wait disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#071f4a]/25 border-t-[#071f4a]" aria-hidden="true" />
              กำลังตั้งรหัสผ่าน...
            </>
          ) : (
            "ตั้งรหัสผ่านใหม่"
          )}
        </button>
      </form>
    </div>
  );
}
