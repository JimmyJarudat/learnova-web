"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

type UserMenuProps = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

function getInitial(name?: string | null, email?: string | null) {
  return (name?.trim() || email?.trim() || "U").charAt(0).toUpperCase();
}

export function UserMenu({ name, email, image }: UserMenuProps) {
  const displayName = name ?? email ?? "บัญชีของฉัน";

  return (
    <details className="group relative">
      <summary className="flex h-11 cursor-pointer list-none items-center gap-3 rounded-full border border-slate-200 bg-white px-2.5 pr-4 shadow-sm transition hover:border-[#0b66c3]/40 hover:shadow-md [&::-webkit-details-marker]:hidden">
        <span className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full bg-[#071f4a] text-sm font-black text-white">
          {image?.startsWith("/uploads/avatars/") ? (
            <img src={image} alt={name ?? "ผู้ใช้"} className="h-full w-full object-cover" />
          ) : (
            getInitial(name, email)
          )}
        </span>
        <span className="hidden max-w-32 truncate text-sm font-black text-slate-700 sm:block">
          {displayName}
        </span>
        <span className="hidden text-[10px] font-black text-slate-400 transition group-open:rotate-180 sm:block">
          ▼
        </span>
      </summary>

      <div className="absolute right-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="border-b border-slate-100 px-4 py-3">
          <p className="truncate text-sm font-black text-[#071f4a]">{displayName}</p>
          {email ? <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">{email}</p> : null}
        </div>

        <div className="p-2">
          <Link
            href="/account"
            className="block rounded-xl px-3 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50 hover:text-[#0b66c3]"
          >
            บัญชีของฉัน
          </Link>
          <Link
            href="/dashboard"
            className="block rounded-xl px-3 py-2.5 text-sm font-black text-slate-700 transition hover:bg-slate-50 hover:text-[#0b66c3]"
          >
            แดชบอร์ด
          </Link>
          <button
            type="button"
            onClick={() => void signOut({ callbackUrl: "/" })}
            className="mt-1 w-full rounded-xl px-3 py-2.5 text-left text-sm font-black text-[#c62828] transition hover:bg-[#fff1f1]"
          >
            ออกจากระบบ
          </button>
        </div>
      </div>
    </details>
  );
}


