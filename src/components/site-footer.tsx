import Link from "next/link";

const examLinks = [
  { href: "/affiliations/obec", label: "สพฐ." },
  { href: "/affiliations/bma", label: "กทม." },
  { href: "/affiliations/ovec", label: "สอศ." },
  { href: "/affiliations/dole", label: "สกร." },
  { href: "/affiliations/dla", label: "อปท." },
];

const learningLinks = [
  { href: "/practice", label: "คลังข้อสอบ" },
  { href: "/articles", label: "บทความสรุป" },
  { href: "/study-plan", label: "แผนอ่านสอบ" },
  { href: "/affiliations", label: "เทียบสังกัด" },
];

const supportLinks = [
  { href: "/privacy-policy", label: "นโยบายความเป็นส่วนตัว", newTab: true },
  { href: "/terms", label: "เงื่อนไขการใช้งาน", newTab: true },
  { href: "/delete-account", label: "ลบบัญชีและข้อมูล", newTab: true },
];

const highlights = ["ครูผู้ช่วยทุกสังกัด", "รวม สอศ.", "สรุปตรงสนาม", "ฝึกทำข้อสอบ"];

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: Array<{ href: string; label: string; newTab?: boolean }>;
}) {
  return (
    <nav aria-label={title}>
      <h2 className="text-sm font-black text-white">{title}</h2>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              target={link.newTab ? "_blank" : undefined}
              rel={link.newTab ? "noopener noreferrer" : undefined}
              className="text-sm font-semibold text-white/70 transition hover:text-[#ffd35a]"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export function SiteFooter() {
  return (
    <footer className="bg-[#071f4a] text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1.85fr] lg:gap-14">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#ffd35a] text-xl font-black text-[#071f4a] shadow-lg shadow-black/10">
                L
              </span>
              <span>
                <span className="block text-2xl font-black">Learnova</span>
                <span className="block text-xs font-bold uppercase tracking-normal text-white/50">Teacher Exam Prep</span>
              </span>
            </Link>

            <p className="mt-5 max-w-md text-sm font-semibold leading-7 text-white/70">
              พื้นที่ฝึกสอบและอ่านสรุปสำหรับคนเตรียมสอบครูผู้ช่วย เน้นเลือกสนามให้ชัด อ่านเป็นระบบ และฝึกทำข้อสอบพร้อมติดตามผลของตัวเอง
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {highlights.map((item) => (
                <span key={item} className="rounded-full border border-white/12 bg-white/[0.06] px-3 py-1.5 text-xs font-black text-white/75">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            <FooterColumn title="สนามสอบ" links={examLinks} />
            <FooterColumn title="เนื้อหา" links={learningLinks} />
            <FooterColumn title="ช่วยเหลือ" links={supportLinks} />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 bg-[#061a3d]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="text-xs font-semibold leading-6 text-white/55">
            <p>© 2026 Learnova. All rights reserved.</p>
            <p>บริการสำหรับการเรียนรู้และเตรียมสอบ ไม่ใช่หน่วยงานราชการหรือผู้จัดสอบอย่างเป็นทางการ</p>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-bold text-white/60">
            <a href="mailto:jarudat@jarudat.com" className="hover:text-white">jarudat@jarudat.com</a>
            <a href="mailto:jarudat.jc@gmail.com" className="hover:text-white">jarudat.jc@gmail.com</a>
          </div>
        </div>
      </div>
    </footer>
  );
}


