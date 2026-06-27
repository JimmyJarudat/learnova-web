import { describe, expect, test } from "bun:test";
import {
  buildFallbackInterviewResult,
  firstInterviewQuestion,
  isLowQualityInterviewAnswer,
  maxInterviewQuestions,
  parseInterviewCoachResult,
  summarizeInterview,
} from "@/utils/interview-coach";

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
          { score: -1, note: "ควรปรับภาษา" },
        ],
      }),
      "คำตอบตัวอย่าง",
      firstInterviewQuestion,
    );

    expect(result.feedback).toBe("ตอบได้ตรงประเด็น");
    expect(result.rubric[0].score).toBe(5);
    expect(result.rubric[3].score).toBe(0);
  });

  test("treats repeated low-effort answers as unscorable", () => {
    const result = parseInterviewCoachResult(
      JSON.stringify({
        feedback: "ดีมาก",
        nextQuestion: "คำถามต่อไป",
        improvedAnswer: "ตัวอย่าง",
        rubric: [
          { score: 5, note: "ดี" },
          { score: 5, note: "ดี" },
          { score: 5, note: "ดี" },
          { score: 5, note: "ดี" },
        ],
      }),
      "ปปปป",
      firstInterviewQuestion,
    );

    expect(isLowQualityInterviewAnswer("ปปปป")).toBe(true);
    expect(result.rubric.every((item) => item.score === 0)).toBe(true);
  });

  test("summarizes an interview round across rubric scores", () => {
    const summary = summarizeInterview([
      {
        rubric: [
          { label: "ความชัดเจนของคำตอบ", score: 4, maxScore: 5, note: "" },
          { label: "จิตวิญญาณความเป็นครู", score: 5, maxScore: 5, note: "" },
          { label: "การเชื่อมโยงประสบการณ์", score: 3, maxScore: 5, note: "" },
          { label: "ความเหมาะสมของภาษา", score: 4, maxScore: 5, note: "" },
        ],
      },
    ]);

    expect(maxInterviewQuestions).toBe(10);
    expect(summary.totalScore).toBe(16);
    expect(summary.maxScore).toBe(20);
    expect(summary.averageScore).toBe(80);
    expect(summary.strengthLabel).toBe("จิตวิญญาณความเป็นครู");
    expect(summary.improvementLabel).toBe("การเชื่อมโยงประสบการณ์");
  });

  test("does not report a strength when all answers are low quality", () => {
    const summary = summarizeInterview([
      {
        answer: "ปปปป",
        rubric: [
          { label: "ความชัดเจนของคำตอบ", score: 0, maxScore: 5, note: "" },
          { label: "จิตวิญญาณความเป็นครู", score: 0, maxScore: 5, note: "" },
          { label: "การเชื่อมโยงประสบการณ์", score: 0, maxScore: 5, note: "" },
          { label: "ความเหมาะสมของภาษา", score: 0, maxScore: 5, note: "" },
        ],
      },
    ]);

    expect(summary.averageScore).toBe(0);
    expect(summary.strengthLabel).toBe("ยังไม่พบจุดเด่นชัดเจน");
  });
});
