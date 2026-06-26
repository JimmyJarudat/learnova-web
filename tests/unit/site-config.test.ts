import { describe, expect, test } from "bun:test";
import { siteConfig } from "@/config/site";

describe("site config", () => {
  test("keeps the canonical site URL in one shared place", () => {
    expect(siteConfig.name).toBe("Learnova");
    expect(siteConfig.url).toBe("https://learnova.jarudat.com");
    expect(new URL(siteConfig.url).protocol).toBe("https:");
  });
});
