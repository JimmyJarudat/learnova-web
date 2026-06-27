import { describe, expect, test } from "bun:test";
import { buildFallbackInterviewResult, firstInterviewQuestion, parseInterviewCoachResult } from "@/utils/interview-coach";

describe("interview coach", () => {
  test("builds a usable fallback result when AI is unavailable", () => {
    const result = buildFallbackInterviewResult("ผมอยากเป็นครูเพราะอยากพัฒนาผู้เรียนและเคยช่วยสอนนักเรียนในชุมชน", firstInterviewQuestion);

    expect(result.rubric).toHaveLength(4);
    expect(result.nextQuestion).toContain("นักเรียน");
    expect(result.feedback.length > 0).toBe(true);
  });

  test("parses AI JSON and normalizes rubric scores", () => {
    const result = parseInterviewCoachResult(
      JSON.stringify({
        feedback: "ตอบได้ตรงประเด็น",
        nextQuestion: "ถ้าเจอนักเรียนไม่ตั้งใจเรียนจะทำอย่างไร",
        improvedAnswer: "ควรเพิ่มตัวอย่างจริง",
        rubric: [
          { score: 9, note: "ดี" },
          { score: 4, note: "เหมาะสม" },
          { score: 3, note: "มีตัวอย่าง" },
          { score: 0, note: "ควรปรับภาษา" },
        ],
      }),
      "คำตอบตัวอย่าง",
      firstInterviewQuestion,
    );

    expect(result.feedback).toBe("ตอบได้ตรงประเด็น");
    expect(result.rubric[0].score).toBe(5);
    expect(result.rubric[3].score).toBe(1);
  });
});
