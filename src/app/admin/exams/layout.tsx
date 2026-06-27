import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { ExamSidebar } from "@/components/admin/exam-sidebar";
import { getAuthOptions } from "@/lib/auth/options";

const adminMenu = [
  { href: "/admin/exams", label: "ภาพรวม", description: "แดชบอร์ดจัดการข้อสอบ" },
  { href: "/admin/exams/categories", label: "หมวดคลังฝึก", description: "ภาค ก, วิชาชีพ, กฎหมาย" },
  { href: "/admin/exams/practice-sets", label: "ชุดคลังฝึก", description: "เพิ่มชุดฝึกใต้หมวด" },
  { href: "/admin/exams/tracks", label: "สนามสอบ", description: "เพิ่มสังกัด + เอก" },
  { href: "/admin/exams/simulations", label: "ชุดจำลองสนาม", description: "สร้างชุด ก ข ค" },
  { href: "/admin/exams/questions", label: "เพิ่มคำถาม", description: "เพิ่มข้อสอบทีละข้อ" },
  { href: "/admin/exams/question-bank", label: "จัดการคำถาม", description: "แก้ไขและลบคำถาม" },
];

export default async function AdminExamsLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(await getAuthOptions());

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/admin/exams")}`);
  }

  return (
    <main className="min-h-screen bg-[#eef6ff] text-slate-950 lg:grid lg:grid-cols-[280px_1fr]">
      <ExamSidebar adminLabel={session.user.name ?? session.user.email ?? "ผู้ดูแล"} items={adminMenu} />

      <div className="min-w-0">
        <header className="sticky top-0 z-30 border-b border-[#cfe5ff] bg-white/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
          <p className="text-xs font-black uppercase text-[#0b66c3]">Exam Management</p>
          <h2 className="mt-1 text-xl font-black text-[#064c9b]">จัดการข้อมูลข้อสอบ</h2>
        </header>
        <section className="px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </section>
      </div>
    </main>
  );
}
