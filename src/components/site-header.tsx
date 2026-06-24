import Link from "next/link";

const navItems = [
  ["แผนอ่าน", "/study-plans"],
  ["คลังข้อสอบ", "/exams"],
  ["สังกัดสอบ", "/affiliations"],
  ["บทความสรุป", "/articles"],
];

export function SiteHeader() {
  return (
    <>
      <div className="bg-[#071f4a] text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-2 text-xs font-bold sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>แนวข้อสอบครูผู้ช่วยทุกสังกัด รวม สอศ. พร้อมเฉลยละเอียดและแผนอ่านตรงสนาม</p>
          <Link href="/exams/education-law-all-affiliations/practice" className="text-[#ffd35a] hover:text-white">
            เริ่มทำข้อสอบ
          </Link>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-5 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="Learnova home">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#ffd35a] text-xl font-black text-[#071f4a] shadow-sm">
              L
            </span>
            <span>
              <span className="block text-2xl font-black leading-6 text-[#071f4a]">Learnova</span>
              <span className="hidden text-xs font-black text-slate-500 sm:block">ติวสอบครูผู้ช่วยทุกสังกัด</span>
            </span>
          </Link>

          <form className="ml-auto hidden w-full max-w-sm items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5 lg:flex">
            <label className="sr-only" htmlFor="nav-search">ค้นหาสรุปหรือข้อสอบครูผู้ช่วย</label>
            <input
              id="nav-search"
              name="q"
              type="search"
              placeholder="ค้นหา สอศ. / กฎหมาย / ภาค ก"
              className="min-h-9 flex-1 bg-transparent px-3 text-sm font-bold text-slate-950 outline-none placeholder:text-slate-400"
            />
            <button className="min-h-9 rounded-xl bg-[#0b66c3] px-4 text-sm font-black text-white hover:bg-[#084f99]">
              ค้นหา
            </button>
          </form>

          <nav className="hidden items-center gap-5 text-sm font-black text-slate-600 xl:flex">
            {navItems.map(([label, href]) => (
              <Link key={href} href={href} className="hover:text-[#0b66c3]">
                {label}
              </Link>
            ))}
          </nav>

          <Link href="/login" className="rounded-xl bg-[#0b66c3] px-4 py-2 text-sm font-black text-white shadow-sm hover:bg-[#084f99]">
            เข้าสู่ระบบ
          </Link>
        </div>
      </header>
    </>
  );
}
