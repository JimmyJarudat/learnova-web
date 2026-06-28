"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import { SocialLoginButtons } from "../login/social-login-buttons";

type FieldErrors = Partial<Record<"displayName" | "username" | "email" | "password" | "confirmPassword" | "acceptedTerms", string>>;

type RegisterResponse = {
  ok: boolean;
  formError?: string;
  fieldErrors?: FieldErrors;
};

type RegisterFormProps = {
  callbackUrl: string;
};

function fieldError(errors: FieldErrors, field: keyof FieldErrors) {
  return errors[field] ? <p className="text-xs font-bold text-[#b42318]">{errors[field]}</p> : null;
}

export function RegisterForm({ callbackUrl }: RegisterFormProps) {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setFieldErrors({});
    setFormError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      displayName: formData.get("displayName"),
      username: formData.get("username"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
      acceptedTerms: formData.get("acceptedTerms") === "on",
    };

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as RegisterResponse;

      if (!response.ok || !result.ok) {
        setFieldErrors(result.fieldErrors ?? {});
        setFormError(result.formError ?? null);
        return;
      }

      const params = new URLSearchParams({ registered: "1" });

      if (callbackUrl !== "/") {
        params.set("callbackUrl", callbackUrl);
      }

      window.location.href = `/login?${params.toString()}`;
    } catch {
      setFormError("ไม่สามารถสมัครสมาชิกได้ กรุณาลองอีกครั้ง");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <SocialLoginButtons callbackUrl={callbackUrl} />

      <div className="my-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-xs font-black text-slate-400">
        <span className="h-px bg-slate-200" />
        <span>หรือสมัครด้วยอีเมล</span>
        <span className="h-px bg-slate-200" />
      </div>

      {formError ? (
        <div className="mb-4 rounded-2xl border border-[#ffc9c9] bg-[#fff1f1] px-4 py-3 text-sm font-bold leading-6 text-[#b42318]">
          {formError}
        </div>
      ) : null}

      <form className="grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-2">
          <span className="text-sm font-black text-slate-700">ชื่อที่แสดง</span>
          <input
            type="text"
            name="displayName"
            placeholder="ครูผู้ช่วยมือใหม่"
            className="h-[48px] rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0b66c3] focus:ring-4 focus:ring-[#0b66c3]/10"
          />
          {fieldError(fieldErrors, "displayName")}
        </label>

        <div className="grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-black text-slate-700">username</span>
            <input
              type="text"
              name="username"
              placeholder="learnova_teacher"
              className="h-[48px] rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0b66c3] focus:ring-4 focus:ring-[#0b66c3]/10"
            />
            {fieldError(fieldErrors, "username")}
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-black text-slate-700">อีเมล</span>
            <input
              type="email"
              name="email"
              placeholder="teacher@example.com"
              className="h-[48px] rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0b66c3] focus:ring-4 focus:ring-[#0b66c3]/10"
            />
            {fieldError(fieldErrors, "email")}
          </label>
        </div>

        <div className="grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-black text-slate-700">รหัสผ่าน</span>
            <input
              type="password"
              name="password"
              placeholder="อย่างน้อย 8 ตัวอักษร"
              className="h-[48px] rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0b66c3] focus:ring-4 focus:ring-[#0b66c3]/10"
            />
            {fieldError(fieldErrors, "password")}
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-black text-slate-700">ยืนยันรหัสผ่าน</span>
            <input
              type="password"
              name="confirmPassword"
              placeholder="กรอกรหัสผ่านอีกครั้ง"
              className="h-[48px] rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0b66c3] focus:ring-4 focus:ring-[#0b66c3]/10"
            />
            {fieldError(fieldErrors, "confirmPassword")}
          </label>
        </div>

        <label className="flex gap-3 rounded-2xl bg-slate-50 p-4 text-xs font-semibold leading-5 text-slate-600">
          <input type="checkbox" name="acceptedTerms" className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0b66c3]" />
          <span>
            ฉันรับทราบ
            <Link href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="mx-1 font-black text-[#0b66c3] hover:text-[#084f99]">
              นโยบายความเป็นส่วนตัว
            </Link>
            และ
            <Link href="/terms" target="_blank" rel="noopener noreferrer" className="mx-1 font-black text-[#0b66c3] hover:text-[#084f99]">
              เงื่อนไขการใช้งาน
            </Link>
          </span>
        </label>
        {fieldError(fieldErrors, "acceptedTerms")}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-[52px] items-center justify-center gap-2 rounded-2xl bg-[#ffd35a] text-base font-black text-[#071f4a] shadow-lg shadow-[#ffd35a]/25 transition hover:-translate-y-0.5 hover:bg-[#f6bf22] disabled:cursor-wait disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#071f4a]/25 border-t-[#071f4a]" aria-hidden="true" />
              กำลังสร้างบัญชี...
            </>
          ) : (
            "สร้างบัญชี"
          )}
        </button>
      </form>
    </div>
  );
}




