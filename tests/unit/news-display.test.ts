import { describe, expect, test } from "bun:test";
import {
  fallbackNewsImage,
  formatNewsDate,
  formatNewsViewCount,
  getNewsCategoryColor,
  getNewsImageUrl,
  getNewsStatusLabel,
  getSafeNewsStatus,
  getNewsSummary,
  getSafeNewsPage,
  getVisibleNewsCalendarStatuses,
  getVisibleNewsStatuses,
} from "@/lib/news-display";

describe("news display helpers", () => {
  test("falls back to the local news image when the article has no image", () => {
    expect(getNewsImageUrl(null)).toBe(fallbackNewsImage);
    expect(getNewsImageUrl("   ")).toBe(fallbackNewsImage);
  });

  test("prefers excerpt before summary and content", () => {
    expect(
      getNewsSummary({
        excerpt: "ข้อความย่อ",
        summary: "สรุปข่าว",
        content: "เนื้อหาข่าว",
      }),
    ).toBe("ข้อความย่อ");
  });

  test("trims long news summaries for card display", () => {
    const summary = getNewsSummary({
      summary: "ก".repeat(180),
    });

    expect(summary.length).toBe(150);
    expect(summary.endsWith("...")).toBe(true);
  });

  test("formats dates with the Thai Buddhist calendar", () => {
    expect(formatNewsDate(new Date("2026-06-24T00:00:00.000Z"))).toContain("2569");
  });

  test("formats article view counts for compact card display", () => {
    expect(formatNewsViewCount(0)).toBe("0");
    expect(formatNewsViewCount(999)).toBe("999");
    expect(formatNewsViewCount(1250)).toBe("1.3K");
    expect(formatNewsViewCount(12_000)).toBe("12K");
    expect(formatNewsViewCount(1_250_000)).toBe("1.3M");
  });

  test("returns a default category color for unknown category slugs", () => {
    expect(getNewsCategoryColor("unknown")).toBe("bg-[#071f4a]");
  });

  test("shows draft news outside production only", () => {
    expect(getVisibleNewsStatuses("development")).toEqual([
      "upcoming",
      "open",
      "closing_soon",
      "published",
      "draft",
    ]);
    expect(getVisibleNewsStatuses("production")).toEqual([
      "upcoming",
      "open",
      "closing_soon",
      "published",
    ]);
    expect(getVisibleNewsStatuses("development").includes("closed")).toBe(false);
    expect(getVisibleNewsStatuses("development").includes("cancelled")).toBe(false);
    expect(getVisibleNewsStatuses("development").includes("archived")).toBe(false);
  });

  test("uses active recruitment statuses for the calendar page", () => {
    expect(getVisibleNewsCalendarStatuses("production")).toEqual([
      "upcoming",
      "open",
      "closing_soon",
    ]);
    expect(getVisibleNewsCalendarStatuses("development").includes("draft")).toBe(false);
    expect(getVisibleNewsCalendarStatuses("development").includes("closed")).toBe(false);
  });

  test("returns labels and validates selectable news statuses", () => {
    const visibleStatuses = getVisibleNewsStatuses("production");

    expect(getNewsStatusLabel("open")).toBe("เปิดรับสมัคร");
    expect(getSafeNewsStatus("open", visibleStatuses)).toBe("open");
    expect(getSafeNewsStatus("closed", visibleStatuses)).toBe("");
  });

  test("keeps requested pagination within available pages", () => {
    expect(getSafeNewsPage("2", 20, 12)).toEqual({ currentPage: 2, pageCount: 2 });
    expect(getSafeNewsPage("99", 20, 12)).toEqual({ currentPage: 2, pageCount: 2 });
    expect(getSafeNewsPage("bad", 20, 12)).toEqual({ currentPage: 1, pageCount: 2 });
  });
});
