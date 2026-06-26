import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteConfig } from "@/config/site";
import prisma from "@/lib/db/postgres";
import {
  formatNewsDate,
  getNewsCategoryColor,
  getNewsStatusColor,
  getNewsStatusLabel,
  getNewsSummary,
  getVisibleNewsCalendarStatuses,
} from "@/lib/news-display";
import { getNewsReadHref } from "@/lib/news-view";
import { NewsTrackedLink } from "../news-tracked-link";
import { NewsViewCount } from "../news-view-count";
import { NewsCalendarMonth } from "./calendar-month";

const calendarTitle = "ปฏิทินรับสมัครสอบครูและสนามสอบ";
const calendarDescription =
  "รวมกำหนดการรับสมัครสอบครู ข่าวเปิดรับสมัคร และประกาศใกล้หมดเขตจากแหล่งข่าวต้นทาง เพื่อช่วยวางแผนติดตามสนามสอบได้ทันเวลา";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: calendarTitle,
  description: calendarDescription,
  alternates: {
    canonical: "/news/calendar",
  },
  openGraph: {
    title: calendarTitle,
    description: calendarDescription,
    url: "/news/calendar",
    siteName: siteConfig.name,
    locale: "th_TH",
    type: "website",
  },
};

function formatApplicationRange(start?: Date | null, end?: Date | null): string {
  if (start && end) {
    return `${formatNewsDate(start)} - ${formatNewsDate(end)}`;
  }

  if (start) {
    return `เริ่ม ${formatNewsDate(start)}`;
  }

  if (end) {
    return `ถึง ${formatNewsDate(end)}`;
  }

  return "ตรวจสอบช่วงสมัครจากต้นทาง";
}

async function getCalendarData() {
  const statuses = getVisibleNewsCalendarStatuses();
  const where = {
    status: { in: statuses },
  };

  const [articles, statusCounts] = await Promise.all([
    prisma.newsArticle.findMany({
      where,
      include: { category: true, source: true },
      orderBy: [
        { applicationEnd: "asc" },
        { applicationStart: "asc" },
        { sourcePublishedAt: "desc" },
        { fetchedAt: "desc" },
      ],
      take: 36,
    }),
    Promise.all(
      statuses.map(async (status) => ({
        status,
        count: await prisma.newsArticle.count({ where: { status } }),
      })),
    ),
  ]);

  return { articles, statusCounts };
}

export default async function NewsCalendarPage() {
  const { articles, statusCounts } = await getCalendarData();
  const totalCount = statusCounts.reduce((sum, item) => sum + item.count, 0);

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-950">
      <SiteHeader />

      <section className="relative overflow-hidden bg-[#071f4a] bg-[url('/images/news-calendar-hero.png')] bg-cover bg-center bg-no-repeat text-white">
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,31,74,0.92)_0%,rgba(7,31,74,0.74)_44%,rgba(7,31,74,0.34)_100%)] max-lg:bg-[linear-gradient(180deg,rgba(7,31,74,0.92)_0%,rgba(7,31,74,0.72)_56%,rgba(7,31,74,0.38)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,211,90,0.24),transparent_28%)]" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <Link href="/news" className="text-sm font-black text-[#ffd35a] transition hover:text-white">
              กลับไปข่าวสาร
            </Link>
            <h1 className="mt-5 text-4xl font-black leading-tight sm:text-5xl">
              ปฏิทินรับสมัครสอบครู
            </h1>
            <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-white/85">
              ดูวันเปิดรับสมัครและวันสุดท้ายของแต่ละสนามได้ในปฏิทิน แล้วเลือกอ่านประกาศฉบับเต็มจากแหล่งข่าวต้นทางได้ทันที
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3 lg:max-w-2xl">
              {statusCounts.map((item) => (
                <div key={item.status} className="rounded-lg border border-white/15 bg-white/10 p-4 shadow-sm backdrop-blur">
                  <p className="text-sm font-bold text-white/70">{getNewsStatusLabel(item.status)}</p>
                  <p className="mt-1 text-3xl font-black text-[#ffd35a]">{item.count}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-black text-[#0b66c3]">กำหนดการที่ควรติดตาม</p>
            <h2 className="mt-1 text-2xl font-black text-[#071f4a]">สนามสอบและรับสมัครล่าสุด</h2>
          </div>
          <p className="text-sm font-semibold text-slate-500">ทั้งหมด {totalCount} รายการ</p>
        </div>

        {articles.length > 0 ? (
          <>
            <NewsCalendarMonth
              initialMonth={new Date().toISOString()}
              articles={articles.map((article) => ({
                id: article.id,
                title: article.title,
                applicationStart: article.applicationStart?.toISOString() ?? null,
                applicationEnd: article.applicationEnd?.toISOString() ?? null,
              }))}
            />
            <div className="mb-4 flex items-center gap-3">
              <span className="h-7 w-1 rounded-full bg-[#f6b21a]" />
              <div>
                <p className="text-sm font-black text-[#0b66c3]">รายละเอียดกำหนดการ</p>
                <h3 className="text-xl font-black text-[#071f4a]">รายการที่กำลังติดตาม</h3>
              </div>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {articles.map((article) => (
                <NewsTrackedLink
                  key={article.id}
                  articleId={article.id}
                  href={getNewsReadHref(article.id)}
                  target="_blank"
                  rel="noreferrer"
                  prefetch={false}
                  className="group grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-md ${getNewsCategoryColor(article.category?.slug)} px-2.5 py-1 text-xs font-black text-white`}>
                      {article.category?.nameTh ?? article.source?.type ?? "ข่าวสาร"}
                    </span>
                    <span className={`rounded-md ${getNewsStatusColor(article.status)} px-2.5 py-1 text-xs font-black text-white`}>
                      {getNewsStatusLabel(article.status)}
                    </span>
                    <NewsViewCount
                      articleId={article.id}
                      initialViewCount={article.viewCount}
                      suffix=""
                      className="ml-auto rounded-full bg-[#fff2c2] px-2 py-0.5 text-xs font-black text-[#9a5b00]"
                    />
                  </div>

                  <div>
                    <p className="text-sm font-black text-[#0b66c3]">
                      {formatApplicationRange(article.applicationStart, article.applicationEnd)}
                    </p>
                    <h3 className="mt-2 text-lg font-black leading-7 text-[#071f4a] group-hover:text-[#0b66c3]">
                      {article.title}
                    </h3>
                    <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                      {getNewsSummary(article)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <span className="text-xs font-bold text-slate-500">
                      {article.sourceName ?? article.source?.name ?? "แหล่งข่าวต้นทาง"}
                    </span>
                    <span className="text-sm font-black text-[#0b66c3]">อ่านจากแหล่งข่าว →</span>
                  </div>
                </NewsTrackedLink>
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
            <h3 className="text-xl font-black text-[#071f4a]">ยังไม่มีข่าวรับสมัครที่เปิดอยู่</h3>
            <p className="mt-2 text-sm font-semibold text-slate-500">
              เมื่อ n8n ดึงข่าวที่มีสถานะเปิดรับสมัคร ใกล้หมดเขต หรือกำลังจะเปิดรับสมัคร รายการจะมาแสดงที่นี่
            </p>
          </div>
        )}
      </section>

      <SiteFooter />
    </main>
  );
}

