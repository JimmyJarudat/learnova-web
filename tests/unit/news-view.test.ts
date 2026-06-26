import { describe, expect, test } from "bun:test";
import { getNewsReadHref, isNewsArticleId } from "@/lib/news/news-view";

describe("news view helpers", () => {
  test("builds the tracked source link route", () => {
    expect(getNewsReadHref("550e8400-e29b-41d4-a716-446655440000")).toBe(
      "/api/news/articles/550e8400-e29b-41d4-a716-446655440000/view",
    );
  });

  test("accepts only UUID article ids", () => {
    expect(isNewsArticleId("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
    expect(isNewsArticleId("not-a-uuid")).toBe(false);
    expect(isNewsArticleId("../news")).toBe(false);
  });
});
