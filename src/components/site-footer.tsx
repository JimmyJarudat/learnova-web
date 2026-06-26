import Link from "next/link";

const examLinks = [
  { href: "/affiliations/obec", label: "สพฐ.", soon: true },
  { href: "/affiliations/bma", label: "กทม.", soon: true },
  { href: "/affiliations/ovec", label: "สอศ.", soon: true },
  { href: "/affiliations/dole", label: "สกร.", soon: true },
  { href: "/affiliations/dla", label: "อปท.", soon: true },
];

const learningLinks = [
  { href: "/exams", label: "คลังข้อสอบ" },
  { href: "/articles", label: "บทความสรุป", soon: true },
  { href: "/study-plan", label: "แผนอ่านสอบ", soon: true },
  { href: "/affiliations", label: "เทียบสังกัด", soon: true },
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
  links: Array<{ href: string; label: string; newTab?: boolean; soon?: boolean }>;
}) {
  return (
    <nav aria-label={title} className="border-t border-white/10 pt-5 sm:border-t-0 sm:pt-0">
      <h2 className="text-sm font-black text-white">{title}</h2>
      <ul className="mt-3 grid gap-1 sm:mt-4 sm:block sm:space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              target={link.newTab ? "_blank" : undefined}
              rel={link.newTab ? "noopener noreferrer" : undefined}
              aria-disabled={link.soon ? true : undefined}
              className={`flex items-center gap-2 rounded-lg py-2 text-sm font-semibold transition sm:inline-flex sm:rounded-none sm:py-0 ${
                link.soon ? "text-white/42 hover:text-white/55" : "text-white/72 hover:text-[#ffd35a]"
              }`}
            >
              <span>{link.label}</span>
              {link.soon ? (
                <span className="rounded-full border border-[#ffd35a]/25 bg-[#ffd35a]/10 px-2 py-0.5 text-[10px] font-black uppercase text-[#ffd35a]">
                  Soon
                </span>
              ) : null}
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
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_1.85fr] lg:gap-14">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#ffd35a] text-xl font-black text-[#071f4a] shadow-lg shadow-black/10 sm:h-12 sm:w-12 sm:rounded-2xl">
                L
              </span>
              <span>
                <span className="block text-xl font-black sm:text-2xl">Learnova</span>
                <span className="block text-xs font-bold uppercase tracking-normal text-white/50">Teacher Exam Prep</span>
              </span>
            </Link>

            <p className="mt-4 max-w-md text-sm font-semibold leading-7 text-white/70 sm:mt-5">
              พื้นที่ฝึกสอบและอ่านสรุปสำหรับคนเตรียมสอบครูผู้ช่วย เน้นเลือกสนามให้ชัด อ่านเป็นระบบ และฝึกทำข้อสอบพร้อมติดตามผลของตัวเอง
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2 min-[420px]:flex min-[420px]:flex-wrap">
              {highlights.map((item) => (
                <span key={item} className="rounded-lg border border-white/12 bg-white/[0.06] px-3 py-2 text-center text-xs font-black text-white/75 min-[420px]:rounded-full min-[420px]:py-1.5">
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-3 sm:gap-8">
            <FooterColumn title="สนามสอบ" links={examLinks} />
            <FooterColumn title="เนื้อหา" links={learningLinks} />
            <FooterColumn title="ช่วยเหลือ" links={supportLinks} />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 bg-[#061a3d]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div className="text-xs font-semibold leading-6 text-white/55 md:max-w-2xl">
            <p>© 2026 Learnova. All rights reserved.</p>
            <p>บริการสำหรับการเรียนรู้และเตรียมสอบ ไม่ใช่หน่วยงานราชการหรือผู้จัดสอบอย่างเป็นทางการ</p>
          </div>
          <div className="grid gap-2 text-xs font-bold text-white/60 sm:flex sm:flex-wrap sm:gap-x-4">
            <a href="mailto:jarudat@jarudat.com" className="break-all rounded-lg py-1 hover:text-white sm:break-normal sm:py-0">jarudat@jarudat.com</a>
            <a href="mailto:jarudat.jc@gmail.com" className="break-all rounded-lg py-1 hover:text-white sm:break-normal sm:py-0">jarudat.jc@gmail.com</a>
          </div>
        </div>
      </div>
    </footer>
  );
}


