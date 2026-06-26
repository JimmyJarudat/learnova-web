export type NewsCalendarArticle = {
  id: string;
  applicationStart?: Date | null;
  applicationEnd?: Date | null;
};

export type CalendarDay = {
  date: Date;
  isCurrentMonth: boolean;
};

const thaiMonthFormatter = new Intl.DateTimeFormat("th-TH", {
  month: "long",
  year: "numeric",
  timeZone: "Asia/Bangkok",
});

function toBangkokDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  return {
    year: Number(parts.find((part) => part.type === "year")?.value),
    month: Number(parts.find((part) => part.type === "month")?.value),
    day: Number(parts.find((part) => part.type === "day")?.value),
  };
}

function toUtcDay(date: Date) {
  const { year, month, day } = toBangkokDateParts(date);
  return Date.UTC(year, month - 1, day);
}

export function getCalendarMonth(date: Date): Date {
  const { year, month } = toBangkokDateParts(date);
  return new Date(Date.UTC(year, month - 1, 1));
}

export function addCalendarMonths(date: Date, amount: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1));
}

export function getCalendarDays(month: Date): CalendarDay[] {
  const firstDay = new Date(Date.UTC(month.getUTCFullYear(), month.getUTCMonth(), 1));
  const start = new Date(firstDay);
  start.setUTCDate(start.getUTCDate() - start.getUTCDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + index);

    return {
      date,
      isCurrentMonth: date.getUTCMonth() === firstDay.getUTCMonth(),
    };
  });
}

export function getCalendarDateLabel(date: Date): string {
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    timeZone: "Asia/Bangkok",
  }).format(date);
}

export function getCalendarMonthLabel(month: Date): string {
  return thaiMonthFormatter.format(month);
}

export function getArticleCalendarEvents(article: NewsCalendarArticle, date: Date): Array<"start" | "end"> {
  const day = toUtcDay(date);
  const events: Array<"start" | "end"> = [];

  if (article.applicationStart && toUtcDay(article.applicationStart) === day) {
    events.push("start");
  }

  if (article.applicationEnd && toUtcDay(article.applicationEnd) === day) {
    events.push("end");
  }

  return events;
}
