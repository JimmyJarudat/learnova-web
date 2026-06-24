import { describe, expect, test } from "bun:test";
import { canUseLocalAvatarCache, getUsableAvatarUrl, isLocalCachedAvatarUrl } from "@/server/auth/avatar-url";

function withNodeEnv<T>(nodeEnv: string, callback: () => T) {
  const originalNodeEnv = process.env.NODE_ENV;

  Object.defineProperty(process.env, "NODE_ENV", {
    value: nodeEnv,
    configurable: true,
  });

  try {
    return callback();
  } finally {
    Object.defineProperty(process.env, "NODE_ENV", {
      value: originalNodeEnv,
      configurable: true,
    });
  }
}

describe("avatar url helpers", () => {
  test("detects local cached avatar URLs", () => {
    expect(isLocalCachedAvatarUrl("/uploads/avatars/user.jpg")).toBe(true);
    expect(isLocalCachedAvatarUrl("https://avatars.githubusercontent.com/u/1")).toBe(false);
    expect(isLocalCachedAvatarUrl(null)).toBe(false);
  });

  test("disables local avatar cache in production", () => {
    withNodeEnv("production", () => {
      expect(canUseLocalAvatarCache()).toBe(false);
    });
  });

  test("hides local cached avatar URLs in production", () => {
    withNodeEnv("production", () => {
      expect(getUsableAvatarUrl("/uploads/avatars/user.jpg")).toBe(null);
      expect(getUsableAvatarUrl("https://avatars.githubusercontent.com/u/1")).toBe("https://avatars.githubusercontent.com/u/1");
    });
  });
});
