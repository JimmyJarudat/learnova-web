"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type AdminMenuItem = {
  href: string;
  label: string;
  description: string;
};

type ExamSidebarProps = {
  adminLabel: string;
  items: AdminMenuItem[];
};

export function ExamSidebar({ adminLabel, items }: ExamSidebarProps) {
  const pathname = usePathname();
  const [isExamOpen, setIsExamOpen] = useState(true);
  const isExamActive = pathname.startsWith("/admin/exams");

  return (
    <aside className="border-b border-[#cfe5ff] bg-white lg:sticky lg:top-0 lg:h-screen lg:border-b-0 lg:border-r">
      <div className="flex min-h-16 items-center gap-3 border-b border-[#d8e9ff] px-4">
        <Link href="/admin/exams" className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#0759b8] text-sm font-black text-white">
          LN
        </Link>
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-[#064c9b]">Admin</p>
          <p className="truncate text-xs font-semibold text-slate-500">{adminLabel}</p>
        </div>
      </div>

      <nav className="p-3">
        <button
          type="button"
          onClick={() => setIsExamOpen((current) => !current)}
          className={`flex w-full items-center justify-between rounded-md px-3 py-3 text-left transition ${
            isExamActive ? "bg-[#eef6ff] text-[#064c9b]" : "text-slate-700 hover:bg-[#eef6ff] hover:text-[#064c9b]"
          }`}
          aria-expanded={isExamOpen}
        >
          <span>
            <span className="block text-sm font-black">Exam</span>
            <span className="mt-0.5 block text-xs font-semibold text-slate-400">จัดการระบบข้อสอบ</span>
          </span>
          <span className="text-sm font-black text-slate-400">{isExamOpen ? "▾" : "▸"}</span>
        </button>

        {isExamOpen ? (
          <div className="ml-4 mt-1 space-y-1 border-l border-[#cfe5ff] pl-3">
            {items.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`block rounded-md px-3 py-2.5 transition ${
                    isActive ? "bg-[#dff0ff] text-[#064c9b]" : "text-slate-700 hover:bg-[#eef6ff] hover:text-[#064c9b]"
                  }`}
                >
                  <span className="block text-sm font-black">{item.label}</span>
                  <span className="mt-0.5 block text-xs font-semibold text-slate-400">{item.description}</span>
                </Link>
              );
            })}
          </div>
        ) : null}
      </nav>

      <div className="mt-auto border-t border-[#d8e9ff] p-3 lg:absolute lg:bottom-0 lg:left-0 lg:right-0">
        <Link href="/exams" className="block rounded-lg border border-[#cfe5ff] px-4 py-3 text-center text-sm font-black text-[#064c9b] transition hover:border-[#0b66c3] hover:bg-[#eef6ff]">
          เปิดหน้า Exam
        </Link>
      </div>
    </aside>
  );
}
