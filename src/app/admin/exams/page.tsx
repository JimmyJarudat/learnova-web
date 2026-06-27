import Link from "next/link";
import prisma from "@/lib/db/postgres";

export const metadata = {
  title: "Exam Dashboard | Admin Exams",
};

export const dynamic = "force-dynamic";

const quickLinks = [
  {
    href: "/admin/exams/categories",
    label: "หมวดคลังฝึก",
    description: "จัดกลุ่มภาค ก ภาค ข ภาค ค และหมวดฝึกซ้ำ",
  },
  {
    href: "/admin/exams/practice-sets",
    label: "ชุดคลังฝึก",
    description: "สร้างชุดฝึก ก/ข และชุดสัมภาษณ์ภาค ค",
  },
  {
    href: "/admin/exams/tracks",
    label: "สนามสอบ",
    description: "ผูกสังกัดกับเอกที่ใช้ในชุดจำลองสนาม",
  },
  {
    href: "/admin/exams/simulations",
    label: "ชุดจำลองสนาม",
    description: "สร้างชุดสอบจริงที่มี ก ข ค ตามสังกัดและเอก",
  },
  {
    href: "/admin/exams/questions",
    label: "เพิ่มคำถาม",
    description: "เพิ่มข้อสอบทีละข้อหรือ JSON ลงต้นทางที่เลือก",
  },
  {
    href: "/admin/exams/question-bank",
    label: "จัดการคำถาม",
    description: "ค้นหา แก้ไข และลบคำถามจากชุดที่เลือก",
  },
];

export default async function AdminExamsIndexPage() {
  const [categoryCount, practiceSetCount, trackCount, packageCount, questionCount] = await Promise.all([
    prisma.practiceCategory.count({ where: { isActive: true } }),
    prisma.practiceSet.count({ where: { isActive: true } }),
    prisma.examTrack.count({ where: { isActive: true } }),
    prisma.examPackage.count({ where: { isActive: true } }),
    prisma.examQuestion.count({ where: { isActive: true } }),
  ]);

  const stats = [
    { label: "หมวดฝึก", value: categoryCount },
    { label: "ชุดคลังฝึก", value: practiceSetCount },
    { label: "สนามสอบ", value: trackCount },
    { label: "ชุดจำลอง", value: packageCount },
    { label: "คำถาม", value: questionCount },
  ];

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-xl bg-[#0759b8] text-white shadow-sm">
        <div className="p-6">
          <p className="text-sm font-black text-[#b9ddff]">Exam Admin</p>
          <h1 className="mt-2 text-3xl font-black">ศูนย์จัดการข้อสอบ</h1>
          <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-white/75">
            จัดการหมวด ชุดฝึก สนามสอบ ชุดจำลอง และคำถามจากหน้ารวมนี้ ทุกเมนูเป็นโทนฟ้าและเน้นงาน CRUD ของระบบข้อสอบ
          </p>
        </div>
        <div className="grid border-t border-white/10 bg-white/[0.06] sm:grid-cols-5">
          {stats.map((stat) => (
            <div key={stat.label} className="p-4">
              <p className="text-xs font-black text-white/55">{stat.label}</p>
              <p className="mt-1 text-2xl font-black text-white">{stat.value.toLocaleString("th-TH")}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {quickLinks.map((item) => (
          <Link key={item.href} href={item.href} className="rounded-xl border border-[#d8e9ff] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0b66c3] hover:shadow-md">
            <p className="text-lg font-black text-[#064c9b]">{item.label}</p>
            <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">{item.description}</p>
            <span className="mt-4 inline-flex rounded-lg bg-[#eef6ff] px-3 py-2 text-sm font-black text-[#0b66c3]">
              เปิดจัดการ
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
