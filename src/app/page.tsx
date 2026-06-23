import Link from "next/link";

const subjects = [
  {
    name: "ความรู้ความสามารถทั่วไป",
    slug: "general-ability",
    exams: 18,
    questions: 1260,
    accent: "bg-sky-100 text-sky-700",
  },
  {
    name: "วิชาชีพครู",
    slug: "teacher-profession",
    exams: 22,
    questions: 1540,
    accent: "bg-emerald-100 text-emerald-700",
  },
  {
    name: "กฎหมายการศึกษา",
    slug: "education-law",
    exams: 12,
    questions: 840,
    accent: "bg-amber-100 text-amber-700",
  },
  {
    name: "ภาษาไทยและการสื่อสาร",
    slug: "thai-communication",
    exams: 9,
    questions: 630,
    accent: "bg-rose-100 text-rose-700",
  },
];

const examSets = [
  {
    title: "แนวข้อสอบผู้ช่วยครู ภาค ก ชุดเข้มข้น",
    slug: "teacher-assistant-general-intensive",
    subject: "ความรู้ความสามารถทั่วไป",
    year: 2567,
    questions: 100,
    duration: "120 นาที",
    attempts: "18.4k",
    premium: false,
  },
  {
    title: "ข้อสอบวิชาชีพครู พร้อมเฉลยละเอียด",
    slug: "teacher-profession-with-explanations",
    subject: "วิชาชีพครู",
    year: 2567,
    questions: 80,
    duration: "90 นาที",
    attempts: "12.1k",
    premium: false,
  },
  {
    title: "กฎหมายการศึกษา อัปเดตล่าสุด",
    slug: "latest-education-law",
    subject: "กฎหมายการศึกษา",
    year: 2566,
    questions: 60,
    duration: "75 นาที",
    attempts: "9.8k",
    premium: true,
  },
];

const articles = [
  "วิธีวางแผนอ่านหนังสือสอบผู้ช่วยครูใน 30 วัน",
  "หัวข้อกฎหมายการศึกษาที่ออกสอบบ่อย",
  "เทคนิคทำข้อสอบจับเวลาให้คะแนนนิ่งขึ้น",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f8f3] text-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="Learnova home">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-950 text-lg font-black text-white">
              L
            </span>
            <span className="text-xl font-bold tracking-normal">Learnova</span>
          </Link>

          <nav className="ml-auto hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <Link href="/subjects" className="hover:text-slate-950">วิชาสอบ</Link>
            <Link href="/exams" className="hover:text-slate-950">ชุดข้อสอบ</Link>
            <Link href="/articles" className="hover:text-slate-950">บทความ</Link>
            <Link href="/admin" className="hover:text-slate-950">Admin</Link>
          </nav>

          <Link
            href="/login"
            className="hidden h-10 items-center rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 sm:inline-flex"
          >
            เข้าสู่ระบบ
          </Link>
        </div>
      </header>

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-14">
          <div className="flex flex-col justify-center">
            <p className="mb-4 w-fit rounded-lg bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
              แพลตฟอร์มเตรียมสอบผู้ช่วยครู
            </p>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-5xl lg:text-6xl">
              ค้นหา ฝึกทำ และวิเคราะห์ข้อสอบในที่เดียว
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
              Learnova รวมชุดข้อสอบตามวิชา พร้อมระบบจับเวลา เฉลยละเอียด ประวัติการทำข้อสอบ
              และเนื้อหาที่ออกแบบให้ค้นเจอบน Google ได้ง่ายตั้งแต่วันแรก
            </p>

            <form className="mt-8 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2 shadow-sm sm:flex-row">
              <label className="sr-only" htmlFor="search">ค้นหาข้อสอบ</label>
              <input
                id="search"
                name="q"
                type="search"
                placeholder="ค้นหา เช่น กฎหมายการศึกษา, ภาค ก, ปี 2567"
                className="min-h-12 flex-1 rounded-lg border border-transparent bg-white px-4 text-base text-slate-900 outline-none ring-0 placeholder:text-slate-400 focus:border-sky-300"
              />
              <button className="min-h-12 rounded-lg bg-sky-600 px-6 text-base font-semibold text-white transition hover:bg-sky-700">
                ค้นหา
              </button>
            </form>

            <div className="mt-6 flex flex-wrap gap-2 text-sm text-slate-600">
              {["ภาค ก", "วิชาชีพครู", "กฎหมาย", "ข้อสอบจับเวลา"].map((tag) => (
                <Link
                  key={tag}
                  href={`/search?q=${encodeURIComponent(tag)}`}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 hover:border-slate-300"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-xl border border-slate-200 bg-[#102033] p-6 text-white shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-sky-200">Mock exam today</p>
                  <h2 className="mt-2 text-2xl font-bold">ข้อสอบภาค ก ชุดแนะนำ</h2>
                </div>
                <span className="rounded-lg bg-white/10 px-3 py-1 text-sm">ฟรี</span>
              </div>
              <div className="mt-8 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg bg-white/10 p-3"><p className="text-2xl font-bold">100</p><p className="mt-1 text-xs text-slate-300">ข้อ</p></div>
                <div className="rounded-lg bg-white/10 p-3"><p className="text-2xl font-bold">120</p><p className="mt-1 text-xs text-slate-300">นาที</p></div>
                <div className="rounded-lg bg-white/10 p-3"><p className="text-2xl font-bold">8.7</p><p className="mt-1 text-xs text-slate-300">ระดับยาก</p></div>
              </div>
              <Link
                href="/exams/teacher-assistant-general-intensive/practice"
                className="mt-6 flex h-12 items-center justify-center rounded-lg bg-white text-sm font-bold text-slate-950 transition hover:bg-slate-100"
              >
                เริ่มทำข้อสอบ
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-3xl font-bold text-slate-950">61k+</p><p className="mt-1 text-sm text-slate-600">ครั้งที่ทำข้อสอบ</p></div>
              <div className="rounded-xl border border-slate-200 bg-white p-5"><p className="text-3xl font-bold text-slate-950">4,270</p><p className="mt-1 text-sm text-slate-600">ข้อสอบในคลัง</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-sky-700">Subjects</p>
            <h2 className="mt-1 text-2xl font-bold sm:text-3xl">เลือกอ่านตามวิชาสอบ</h2>
          </div>
          <Link href="/subjects" className="text-sm font-semibold text-sky-700 hover:text-sky-800">ดูทั้งหมด</Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {subjects.map((subject) => (
            <Link
              key={subject.slug}
              href={`/subjects/${subject.slug}`}
              className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md"
            >
              <span className={`rounded-lg px-3 py-1 text-sm font-semibold ${subject.accent}`}>{subject.exams} ชุด</span>
              <h3 className="mt-5 min-h-14 text-lg font-bold leading-7 group-hover:text-sky-700">{subject.name}</h3>
              <p className="mt-3 text-sm text-slate-600">{subject.questions.toLocaleString()} ข้อพร้อมฝึก</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-emerald-700">Exam sets</p>
              <h2 className="mt-1 text-2xl font-bold sm:text-3xl">ชุดข้อสอบยอดนิยม</h2>
            </div>
            <Link href="/exams" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">ดูทั้งหมด</Link>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {examSets.map((exam) => (
              <article key={exam.slug} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{exam.subject}</span>
                  {exam.premium ? <span className="rounded-lg bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">Premium</span> : null}
                </div>
                <h3 className="mt-4 text-xl font-bold leading-8">{exam.title}</h3>
                <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-slate-50 p-3"><dt className="text-slate-500">ปี</dt><dd className="mt-1 font-bold">{exam.year}</dd></div>
                  <div className="rounded-lg bg-slate-50 p-3"><dt className="text-slate-500">จำนวน</dt><dd className="mt-1 font-bold">{exam.questions} ข้อ</dd></div>
                  <div className="rounded-lg bg-slate-50 p-3"><dt className="text-slate-500">เวลา</dt><dd className="mt-1 font-bold">{exam.duration}</dd></div>
                  <div className="rounded-lg bg-slate-50 p-3"><dt className="text-slate-500">ผู้ฝึก</dt><dd className="mt-1 font-bold">{exam.attempts}</dd></div>
                </dl>
                <div className="mt-5 flex gap-3">
                  <Link href={`/exams/${exam.slug}`} className="flex h-11 flex-1 items-center justify-center rounded-lg border border-slate-200 text-sm font-semibold hover:bg-slate-50">รายละเอียด</Link>
                  <Link href={`/exams/${exam.slug}/practice`} className="flex h-11 flex-1 items-center justify-center rounded-lg bg-slate-950 text-sm font-semibold text-white hover:bg-slate-800">ฝึกทำ</Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm font-semibold text-rose-700">Profile preview</p>
          <h2 className="mt-2 text-2xl font-bold">ภาพรวมหลังทำข้อสอบ</h2>
          <div className="mt-6 space-y-4">
            {[
              ["วิชาชีพครู", "82%", "bg-emerald-500"],
              ["ภาค ก", "68%", "bg-sky-500"],
              ["กฎหมายการศึกษา", "54%", "bg-amber-500"],
            ].map(([label, score, color]) => (
              <div key={label}>
                <div className="flex justify-between text-sm"><span className="font-medium text-slate-700">{label}</span><span className="font-bold">{score}</span></div>
                <div className="mt-2 h-3 rounded-full bg-slate-100"><div className={`h-3 rounded-full ${color}`} style={{ width: score }} /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm font-semibold text-slate-600">Articles</p>
          <h2 className="mt-2 text-2xl font-bold">บทความช่วยเตรียมสอบ</h2>
          <div className="mt-5 divide-y divide-slate-100">
            {articles.map((title, index) => (
              <Link key={title} href={`/articles/mock-${index + 1}`} className="flex items-center justify-between gap-4 py-4 hover:text-sky-700">
                <span className="font-semibold">{title}</span>
                <span className="text-sm text-slate-500">อ่านต่อ</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-slate-300 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>Learnova mock frontend for Teacher Assistant Exam MVP</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
