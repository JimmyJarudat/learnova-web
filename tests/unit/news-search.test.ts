import { describe, expect, test } from "bun:test";
import { getNewsSearchTerms, normalizeNewsSearchQuery } from "@/lib/news-search";

describe("news search helpers", () => {
  test("normalizes extra whitespace", () => {
    expect(normalizeNewsSearchQuery("  รับสมัคร   ครู  ")).toBe("รับสมัคร ครู");
  });

  test("adds useful related terms for smarter news search", () => {
    const terms = getNewsSearchTerms("สมัครครู กคศ");

    expect(terms).toContain("รับสมัคร");
    expect(terms).toContain("เปิดรับสมัคร");
    expect(terms).toContain("ครูผู้ช่วย");
    expect(terms).toContain("ก.ค.ศ.");
  });
});
