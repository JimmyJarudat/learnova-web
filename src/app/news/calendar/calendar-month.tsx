"use client";

import { useMemo, useState } from "react";
import {
  addCalendarMonths,
  getArticleCalendarEvents,
  getCalendarDateLabel,
  getCalendarDays,
  getCalendarMonthLabel,
} from "@/lib/news-calendar";
import { getNewsReadHref } from "@/lib/news-view";
import { NewsTrackedLink } from "../news-tracked-link";

const weekdayLabels = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

type CalendarArticle = {
  id: string;
  title: string;
  applicationStart: string | null;
  applicationEnd: string | null;
};

type NewsCalendarMonthProps = {
  articles: CalendarArticle[];
  initialMonth: string;
};

export function NewsCalendarMonth({ articles, initialMonth }: NewsCalendarMonthProps) {
  const [month, setMonth] = useState(() => new Date(initialMonth));
  const datedArticles = useMemo(
    () =>
      articles.map((article) => ({
        ...article,
        applicationStart: article.applicationStart ? new Date(article.applicationStart) : null,
        applicationEnd: article.applicationEnd ? new Date(article.applicationEnd) : null,
      })),
    [articles],
  );
  const days = getCalendarDays(month);

  return (
    <div className="mb-7 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex flex-wrap items-center gap-3 text-xs font-black text-slate-600">
          <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#00a86b]" />วันเปิดรับสมัคร</span>
          <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#e94b7b]" />วันสุดท้าย</span>
        </div>
        <p className="text-xs font-bold text-slate-500">กดชื่อรายการในช่องวันเพื่ออ่านประกาศต้นทาง</p>
      </div>

      <div className="px-3 py-4 sm:px-5 sm:py-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setMonth((current) => addCalendarMonths(current, -1))}
            aria-label="ดูเดือนก่อนหน้า"
            title="เดือนก่อนหน้า"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-slate-200 bg-white text-lg font-black text-[#071f4a] transition hover:border-[#0b66c3] hover:text-[#0b66c3]"
          >
            &larr;
          </button>
          <div className="min-w-0 text-center">
            <h3 className="text-xl font-black text-[#071f4a] sm:text-2xl">{getCalendarMonthLabel(month)}</h3>
            <button
              type="button"
              onClick={() => setMonth(new Date(initialMonth))}
              className="mt-1 text-xs font-black text-[#0b66c3] transition hover:text-[#071f4a]"
            >
              กลับเดือนปัจจุบัน
            </button>
          </div>
          <button
            type="button"
            onClick={() => setMonth((current) => addCalendarMonths(current, 1))}
            aria-label="ดูเดือนถัดไป"
            title="เดือนถัดไป"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-slate-200 bg-white text-lg font-black text-[#071f4a] transition hover:border-[#0b66c3] hover:text-[#0b66c3]"
          >
            &rarr;
          </button>
        </div>

        <div className="grid grid-cols-7 border-l border-t border-slate-200">
          {weekdayLabels.map((label) => (
            <div key={label} className="border-b border-r border-slate-200 bg-slate-50 py-2 text-center text-xs font-black text-slate-400 sm:text-sm">
              {label}
            </div>
          ))}
          {days.map((day) => {
            const dayArticles = datedArticles.flatMap((article) =>
              getArticleCalendarEvents(article, day.date).map((event) => ({ article, event })),
            );

            return (
              <div
                key={day.date.toISOString()}
                className={`min-h-24 border-b border-r border-slate-200 p-1.5 sm:min-h-32 sm:p-2 ${day.isCurrentMonth ? "bg-white" : "bg-slate-50/70"}`}
              >
                <span className={`grid h-6 w-6 place-items-center rounded-full text-xs font-black sm:h-7 sm:w-7 sm:text-sm ${day.isCurrentMonth ? "text-slate-600" : "text-slate-300"}`}>
                  {getCalendarDateLabel(day.date)}
                </span>
                <div className="mt-1 space-y-1 sm:mt-1.5">
                  {dayArticles.slice(0, 3).map(({ article, event }) => (
                    <NewsTrackedLink
                      key={`${article.id}-${event}`}
                      articleId={article.id}
                      href={getNewsReadHref(article.id)}
                      target="_blank"
                      rel="noreferrer"
                      prefetch={false}
                      title={`${event === "start" ? "เปิดรับสมัคร" : "วันสุดท้าย"}: ${article.title}`}
                      className={`block truncate rounded px-1 py-0.5 text-[10px] font-black leading-4 text-white transition hover:brightness-95 sm:px-1.5 sm:text-xs sm:leading-5 ${event === "start" ? "bg-[#00a86b]" : "bg-[#e94b7b]"}`}
                    >
                      {event === "start" ? "เปิด" : "ปิด"} {article.title}
                    </NewsTrackedLink>
                  ))}
                  {dayArticles.length > 3 ? <p className="px-1 text-[10px] font-black text-[#0b66c3] sm:text-xs">+{dayArticles.length - 3} รายการ</p> : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
