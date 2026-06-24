import Link from "next/link";

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

export function SiteHeader() {
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

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
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

          {/* Center Nav */}
          <nav className="hidden flex-1 justify-center items-center gap-8 xl:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-black text-slate-700 hover:text-[#0b66c3] transition"
              >
                {item.label}
              </Link>
            ))}

            {/* Dropdown */}
            <div className="relative group">
              <button className="text-sm font-black text-slate-700 hover:text-[#0b66c3] transition flex items-center gap-1">
                สังกัดสอบ
                <span className="text-[10px]">▼</span>
              </button>

              <div className="invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all absolute left-1/2 -translate-x-1/2 top-full mt-3 w-44 rounded-xl border border-slate-200 bg-white shadow-xl">
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

          {/* Right */}
          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-xl bg-[#0b66c3] px-4 py-2 text-sm font-black text-white shadow-sm hover:bg-[#084f99]"
            >
              เข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}