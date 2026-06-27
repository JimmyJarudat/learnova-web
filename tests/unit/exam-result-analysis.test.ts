import { describe, expect, test } from "bun:test";
import { analyzeExamResult, analyzeExamResultBySection } from "@/utils/exam-result-analysis";

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

  test("groups result by section and sorts weakest section first", () => {
    const sections = analyzeExamResultBySection(
      [
        { id: "q1", no: 1, score: 1, section: { id: "number", title: "ความสามารถด้านตัวเลข" } },
        { id: "q2", no: 2, score: 1, section: { id: "number", title: "ความสามารถด้านตัวเลข" } },
        { id: "q3", no: 3, score: 1, section: { id: "thai", title: "ภาษาไทย" } },
      ],
      [
        { questionId: "q1", selectedChoiceIds: ["c1"], isCorrect: false, score: 0, maxScore: 1 },
        { questionId: "q2", selectedChoiceIds: [], isCorrect: null, score: 0, maxScore: 1 },
        { questionId: "q3", selectedChoiceIds: ["c3"], isCorrect: true, score: 1, maxScore: 1 },
      ],
    );

    expect(sections[0]).toEqual({
      id: "number",
      title: "ความสามารถด้านตัวเลข",
      score: 0,
      maxScore: 2,
      totalQuestions: 2,
      answeredCount: 1,
      correctCount: 0,
      incorrectCount: 1,
      unansweredCount: 1,
      reviewQuestions: [
        { id: "q1", no: 1, status: "incorrect" },
        { id: "q2", no: 2, status: "unanswered" },
      ],
      percentage: 0,
    });
    expect(sections[1].title).toBe("ภาษาไทย");
  });
});
