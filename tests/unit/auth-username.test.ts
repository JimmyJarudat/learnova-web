import { describe, expect, test } from "bun:test";
import { baseUsernameFromEmail } from "@/server/auth/username";

describe("baseUsernameFromEmail", () => {
  test("uses the email local part as a lowercase username", () => {
    expect(baseUsernameFromEmail("Teacher.User@example.com")).toBe("teacher_user");
  });

  test("collapses unsafe characters into a single underscore", () => {
    expect(baseUsernameFromEmail("a---b+++c@example.com")).toBe("a_b_c");
  });

  test("falls back when the local part has no usable characters", () => {
    expect(baseUsernameFromEmail("+++@example.com")).toBe("user");
  });
});