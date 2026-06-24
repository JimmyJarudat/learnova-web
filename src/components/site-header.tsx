import Image from "next/image";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

const navItems = [
  { label: "หน้าแรก", href: "/" },
  { label: "คลังข้อสอบ", href: "/exams" },
  { label: "ข่าวสาร", href: "/news" },
  { label: "สรุปเนื้อหา", href: "/summaries" },
  { label: "แผนอ่าน", href: "/study-plans" },
  { label: "บทความ", href: "/articles" },
];

const affiliations = [
  { label: "สพฐ.", href: "/affiliations/obec" },
  { label: "สอศ.", href: "/affiliations/ovec" },
  { label: "สกร.", href: "/affiliations/nfe" },
  { label: "อปท.", href: "/affiliations/local" },
];

function getInitial(name?: string | null, email?: string | null) {
  return (name?.trim() || email?.trim() || "U").charAt(0).toUpperCase();
}

export async function SiteHeader() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  return (
    <>
      <div className="bg-[#071f4a] text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-2 text-xs font-bold sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>
            แนวข้อสอบครูผู้ช่วยทุกสังกัด รวม สอศ. พร้อมเฉลยละเอียดและแผนอ่านตรงสนาม
          </p>

          <Link
            href="/exams"
            className="text-[#ffd35a] hover:text-white"
          >
            เริ่มฝึกทำข้อสอบ
          </Link>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#ffd35a] text-xl font-black text-[#071f4a] shadow-sm">
              L
            </span>

            <div className="leading-tight">
              <div className="text-2xl font-black text-[#071f4a]">
                Learnova
              </div>
              <div className="hidden text-xs font-black text-slate-500 sm:block">
                ติวสอบครูผู้ช่วยทุกสังกัด
              </div>
            </div>
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-8 xl:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-black text-slate-700 transition hover:text-[#0b66c3]"
              >
                {item.label}
              </Link>
            ))}

            <div className="group relative">
              <button className="flex items-center gap-1 text-sm font-black text-slate-700 transition hover:text-[#0b66c3]">
                สังกัดสอบ
                <span className="text-[10px]">▼</span>
              </button>

              <div className="invisible absolute left-1/2 top-full mt-3 w-44 -translate-x-1/2 rounded-xl border border-slate-200 bg-white opacity-0 shadow-xl transition-all group-hover:visible group-hover:opacity-100">
                <div className="py-2">
                  {affiliations.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#0b66c3]"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>

          <div className="ml-auto flex items-center gap-3">
            {user ? (
              <Link
                href="/account"
                className="flex h-11 items-center gap-3 rounded-full border border-slate-200 bg-white px-2.5 pr-4 shadow-sm transition hover:border-[#0b66c3]/40 hover:shadow-md"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#071f4a] text-sm font-black text-white">
                  {getInitial(user.name, user.email)}
                </span>
                <span className="hidden max-w-32 truncate text-sm font-black text-slate-700 sm:block">
                  {user.name ?? user.email ?? "บัญชีของฉัน"}
                </span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-xl bg-[#0b66c3] px-4 py-2 text-sm font-black text-white shadow-sm hover:bg-[#084f99]"
              >
                เข้าสู่ระบบ
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  );
}


