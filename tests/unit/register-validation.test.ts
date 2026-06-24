import { describe, expect, test } from "bun:test";
import { normalizeRegisterInput, validateRegisterInput } from "@/server/auth/register";

describe("register validation", () => {
  test("normalizes email and username", () => {
    const input = normalizeRegisterInput({
      displayName: " ครูใหม่ ",
      username: "Teacher_01",
      email: "TEACHER@EXAMPLE.COM ",
      password: "password123",
      confirmPassword: "password123",
      acceptedTerms: true,
    });

    expect(input.displayName).toBe("ครูใหม่");
    expect(input.username).toBe("teacher_01");
    expect(input.email).toBe("teacher@example.com");
  });

  test("accepts a complete registration input", () => {
    const result = validateRegisterInput({
      displayName: "ครูใหม่",
      username: "teacher_01",
      email: "teacher@example.com",
      password: "password123",
      confirmPassword: "password123",
      acceptedTerms: true,
    });

    expect(result.isValid).toBe(true);
  });

  test("rejects mismatched passwords and missing terms", () => {
    const result = validateRegisterInput({
      displayName: "ครูใหม่",
      username: "teacher_01",
      email: "teacher@example.com",
      password: "password123",
      confirmPassword: "password456",
      acceptedTerms: false,
    });

    expect(result.isValid).toBe(false);
    expect(result.fieldErrors.confirmPassword).toBe("รหัสผ่านยืนยันไม่ตรงกัน");
    expect(result.fieldErrors.acceptedTerms).toBe("กรุณารับทราบนโยบายและเงื่อนไขการใช้งาน");
  });
});
