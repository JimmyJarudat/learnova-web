import { describe, expect, test } from "bun:test";
import { analyzeExamResult } from "@/utils/exam-result-analysis";

describe("analyzeExamResult", () => {
  test("summarizes score, missing answers, and previous best difference", () => {
    const analysis = analyzeExamResult(
      {
        score: 12,
        maxScore: 20,
        totalQuestions: 20,
        answeredCount: 18,
        correctCount: 12,
        durationSeconds: 1200,
      },
      { score: 10, maxScore: 20 },
    );

    expect({
      percentage: analysis.percentage,
      incorrectCount: analysis.incorrectCount,
      unansweredCount: analysis.unansweredCount,
      bestScoreDiff: analysis.bestScoreDiff,
      levelLabel: analysis.levelLabel,
    }).toEqual({
      percentage: 60,
      incorrectCount: 6,
      unansweredCount: 2,
      bestScoreDiff: 2,
      levelLabel: "อยู่ในเกณฑ์ดี",
    });
  });

  test("handles a first attempt without previous best", () => {
    expect(
      analyzeExamResult({
        score: 0,
        maxScore: 0,
        totalQuestions: 0,
        answeredCount: 0,
        correctCount: 0,
        durationSeconds: 0,
      }).bestScoreDiff,
    ).toBe(null);
  });
});
