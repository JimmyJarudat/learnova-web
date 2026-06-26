import { describe, expect, test } from "bun:test";
import { getNewsCanonicalPath, getNewsSeoFilterLabel, shouldIndexNewsPage } from "@/lib/news/news-seo";

describe("news seo helpers", () => {
  test("indexes clean news listing pages", () => {
    expect(shouldIndexNewsPage("", "")).toBe(true);
  });

  test("does not index search or status filtered pages", () => {
    expect(shouldIndexNewsPage("ครูผู้ช่วย", "")).toBe(false);
    expect(shouldIndexNewsPage("", "open")).toBe(false);
  });

  test("canonicalizes filtered pages to the clean listing path", () => {
    expect(getNewsCanonicalPath({
      cleanPath: "/news?category=teacher-exam",
      currentPath: "/news?category=teacher-exam&q=ครู",
      query: "ครู",
      status: "",
    })).toBe("/news?category=teacher-exam");
  });

  test("builds readable filter labels", () => {
    expect(getNewsSeoFilterLabel({
      categoryName: "สอบครูผู้ช่วย",
      query: "กคศ",
      statusLabel: "เปิดรับสมัคร",
    })).toBe('สอบครูผู้ช่วย | เปิดรับสมัคร | ค้นหา "กคศ"');
  });
});
