"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState } from "react";
import type { FormEvent } from "react";
import { SocialLoginButtons } from "./social-login-buttons";

type LoginFormProps = {
  errorMessage: string | null;
  successMessage: string | null;
};

export function LoginForm({ errorMessage, successMessage }: LoginFormProps) {
  const [localError, setLocalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setLocalError(null);

    const formData = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      identifier: String(formData.get("identifier") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirect: false,
      callbackUrl: "/",
    });

    setIsSubmitting(false);

    if (result?.error) {
      setLocalError("อีเมล username หรือรหัสผ่านไม่ถูกต้อง");
      return;
    }

    window.location.href = result?.url ?? "/";
  }

  const visibleError = localError ?? errorMessage;

  return (
    <>
      <div className="mb-6 text-center">
        <h1 className="text-4xl font-black leading-tight text-[#071f4a]">เข้าสู่ระบบ</h1>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
          กลับมาทำข้อสอบต่อและดูผลวิเคราะห์ของคุณ
        </p>
      </div>

      {successMessage ? (
        <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold leading-6 text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      {visibleError ? (
        <div className="mb-5 rounded-2xl border border-[#ffc9c9] bg-[#fff1f1] px-4 py-3 text-sm font-bold leading-6 text-[#b42318]">
          {visibleError}
        </div>
      ) : null}

      <form className="grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2">
          <span className="text-sm font-black text-slate-700">อีเมลหรือ username</span>
          <input
            type="text"
            name="identifier"
            placeholder="teacher@example.com"
            className="h-[54px] rounded-2xl border border-slate-200 bg-white px-4 text-base font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0b66c3] focus:ring-4 focus:ring-[#0b66c3]/10"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm font-black text-slate-700">รหัสผ่าน</span>
          <input
            type="password"
            name="password"
            placeholder="กรอกรหัสผ่าน"
            className="h-[54px] rounded-2xl border border-slate-200 bg-white px-4 text-base font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0b66c3] focus:ring-4 focus:ring-[#0b66c3]/10"
          />
        </label>

        <div className="flex justify-end text-sm font-bold">
          <Link href="/forgot-password" className="text-[#0b66c3] hover:text-[#084f99]">
            ลืมรหัสผ่าน?
          </Link>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-[54px] items-center justify-center gap-2 rounded-2xl bg-[#ffd35a] text-base font-black text-[#071f4a] shadow-lg shadow-[#ffd35a]/30 transition hover:-translate-y-0.5 hover:bg-[#f6bf22] disabled:cursor-wait disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#071f4a]/25 border-t-[#071f4a]" aria-hidden="true" />
              กำลังเข้าสู่ระบบ...
            </>
          ) : (
            "เข้าสู่ระบบ"
          )}
        </button>
      </form>

      <div className="my-6 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-xs font-black text-slate-400">
        <span className="h-px bg-slate-200" />
        <span>หรือเข้าสู่ระบบด้วย</span>
        <span className="h-px bg-slate-200" />
      </div>

      <SocialLoginButtons />

      <p className="mt-5 text-center text-xs font-semibold leading-5 text-slate-500">
        การเข้าสู่ระบบถือว่าคุณรับทราบ
        <Link href="/privacy-policy" className="ml-1 font-black text-[#0b66c3] hover:text-[#084f99]">
          นโยบายความเป็นส่วนตัว
        </Link>
        <span className="mx-1">และ</span>
        <Link href="/terms" className="font-black text-[#0b66c3] hover:text-[#084f99]">
          เงื่อนไขการใช้งาน
        </Link>
      </p>
      <p className="mt-2 text-center text-xs font-semibold leading-5 text-slate-500">
        ต้องการลบบัญชีหรือข้อมูลส่วนบุคคล?
        <Link href="/delete-account" className="ml-1 font-black text-[#0b66c3] hover:text-[#084f99]">
          ดูขั้นตอนที่นี่
        </Link>
      </p>

      <p className="mt-6 text-center text-sm font-semibold text-slate-600">
        ยังไม่มีบัญชี?{" "}
        <Link href="/register" className="font-black text-[#0b66c3] hover:text-[#084f99]">
          สมัครสมาชิก
        </Link>
      </p>
    </>
  );
}




