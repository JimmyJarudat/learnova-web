"use client";

import { useState } from "react";

type JsonExampleCopyProps = {
  value: string;
};

export function JsonExampleCopy({ value }: JsonExampleCopyProps) {
  const [copied, setCopied] = useState(false);

  async function copyExample() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-black text-[#0b66c3]">รูปแบบ JSON ที่รองรับ</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">คัดลอกตัวอย่างนี้ไปแก้แล้วนำเข้าได้ทันที</p>
        </div>
        <button
          type="button"
          onClick={copyExample}
          className="rounded-lg bg-[#071f4a] px-4 py-2 text-sm font-black text-white transition hover:bg-[#0b66c3]"
        >
          {copied ? "คัดลอกแล้ว" : "คัดลอก JSON"}
        </button>
      </div>
      <textarea
        readOnly
        value={value}
        className="mt-4 min-h-80 w-full resize-y rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs leading-5 text-slate-700 outline-none"
      />
    </div>
  );
}
