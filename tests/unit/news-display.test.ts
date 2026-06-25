import { describe, expect, test } from "bun:test";
import {
  fallbackNewsImage,
  formatNewsDate,
  getNewsCategoryColor,
  getNewsImageUrl,
  getNewsSummary,
  getSafeNewsPage,
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

  test("returns a default category color for unknown category slugs", () => {
    expect(getNewsCategoryColor("unknown")).toBe("bg-[#071f4a]");
  });

  test("shows draft news outside production only", () => {
    expect(getVisibleNewsStatuses("development")).toEqual(["published", "draft"]);
    expect(getVisibleNewsStatuses("test")).toEqual(["published", "draft"]);
    expect(getVisibleNewsStatuses("production")).toEqual(["published"]);
  });

  test("keeps requested pagination within available pages", () => {
    expect(getSafeNewsPage("2", 20, 12)).toEqual({ currentPage: 2, pageCount: 2 });
    expect(getSafeNewsPage("99", 20, 12)).toEqual({ currentPage: 2, pageCount: 2 });
    expect(getSafeNewsPage("bad", 20, 12)).toEqual({ currentPage: 1, pageCount: 2 });
  });
});
