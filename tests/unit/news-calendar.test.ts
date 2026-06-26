import { describe, expect, test } from "bun:test";
import {
  addCalendarMonths,
  getArticleCalendarEvents,
  getCalendarDays,
  getCalendarMonth,
  getCalendarMonthLabel,
} from "@/lib/news/news-calendar";

describe("news calendar helpers", () => {
  test("creates a complete Sunday-first six-week month grid", () => {
    const days = getCalendarDays(new Date("2026-06-01T00:00:00.000Z"));

    expect(days).toHaveLength(42);
    expect(days[0]?.date.toISOString()).toBe("2026-05-31T00:00:00.000Z");
    expect(days[1]?.isCurrentMonth).toBe(true);
  });

  test("uses the Bangkok month and Buddhist Era label", () => {
    const month = getCalendarMonth(new Date("2026-06-24T00:00:00.000Z"));

    expect(getCalendarMonthLabel(month)).toContain("มิถุนายน");
    expect(getCalendarMonthLabel(month)).toContain("2569");
    expect(addCalendarMonths(month, 1).toISOString()).toBe("2026-07-01T00:00:00.000Z");
    expect(addCalendarMonths(month, -1).toISOString()).toBe("2026-05-01T00:00:00.000Z");
  });

  test("marks only the start and end dates of an application window", () => {
    const article = {
      id: "article-1",
      applicationStart: new Date("2026-06-24T00:00:00.000Z"),
      applicationEnd: new Date("2026-06-30T00:00:00.000Z"),
    };

    expect(getArticleCalendarEvents(article, new Date("2026-06-24T00:00:00.000Z"))).toEqual(["start"]);
    expect(getArticleCalendarEvents(article, new Date("2026-06-27T00:00:00.000Z"))).toEqual([]);
    expect(getArticleCalendarEvents(article, new Date("2026-06-30T00:00:00.000Z"))).toEqual(["end"]);
  });
});
