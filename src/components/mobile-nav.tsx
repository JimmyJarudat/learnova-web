"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

type NavItem = {
  label: string;
  href: string;
};

type MobileNavProps = {
  navItems: NavItem[];
  affiliations: NavItem[];
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
};

function getDisplayName(user: MobileNavProps["user"]) {
  return user?.name ?? user?.email ?? "บัญชีของฉัน";
}

export function MobileNav({ navItems, affiliations, user }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative ml-auto xl:hidden">
      <button
        type="button"
        aria-label={isOpen ? "ปิดเมนู" : "เปิดเมนู"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-[#071f4a] shadow-sm transition hover:border-[#0b66c3]/40"
      >
        <span className="grid gap-1.5">
          <span className={`block h-0.5 w-5 rounded-full bg-current transition ${isOpen ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`block h-0.5 w-5 rounded-full bg-current transition ${isOpen ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 w-5 rounded-full bg-current transition ${isOpen ? "-translate-y-2 -rotate-45" : ""}`} />
        </span>
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-full z-50 mt-3 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="border-b border-slate-100 p-3">
            {user ? (
              <div className="rounded-xl bg-slate-50 px-3 py-3">
                <p className="truncate text-sm font-black text-[#071f4a]">{getDisplayName(user)}</p>
                {user.email ? <p className="mt-0.5 truncate text-xs font-semibold text-slate-500">{user.email}</p> : null}
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="flex h-11 items-center justify-center rounded-xl bg-[#0b66c3] px-4 text-sm font-black text-white shadow-sm hover:bg-[#084f99]"
              >
                เข้าสู่ระบบ
              </Link>
            )}
          </div>

          <nav className="max-h-[70vh] overflow-y-auto p-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block rounded-xl px-3 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 hover:text-[#0b66c3]"
              >
                {item.label}
              </Link>
            ))}

            <div className="my-2 h-px bg-slate-100" />
            <p className="px-3 py-2 text-xs font-black uppercase tracking-normal text-slate-400">สังกัดสอบ</p>
            {affiliations.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="block rounded-xl px-3 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 hover:text-[#0b66c3]"
              >
                {item.label}
              </Link>
            ))}

            {user ? (
              <>
                <div className="my-2 h-px bg-slate-100" />
                <Link
                  href="/account"
                  onClick={() => setIsOpen(false)}
                  className="block rounded-xl px-3 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 hover:text-[#0b66c3]"
                >
                  บัญชีของฉัน
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block rounded-xl px-3 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50 hover:text-[#0b66c3]"
                >
                  แดชบอร์ด
                </Link>
                <button
                  type="button"
                  onClick={() => void signOut({ callbackUrl: "/" })}
                  className="w-full rounded-xl px-3 py-3 text-left text-sm font-black text-[#c62828] transition hover:bg-[#fff1f1]"
                >
                  ออกจากระบบ
                </button>
              </>
            ) : null}
          </nav>
        </div>
      ) : null}
    </div>
  );
}
