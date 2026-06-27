import { describe, expect, test } from "bun:test";
import { normalizeDraftSelectedChoices, readDraftSelectedChoices } from "@/server/exams/draft-payload";

describe("exam draft payload", () => {
  const validChoicesByQuestionId = new Map([
    ["q1", new Set(["c1", "c2"])],
    ["q2", new Set(["c3", "c4"])],
  ]);

  test("keeps only valid question and choice pairs", () => {
    expect(
      normalizeDraftSelectedChoices(
        {
          q1: "c2",
          q2: "bad-choice",
          unknown: "c1",
          q3: 123,
        },
        validChoicesByQuestionId,
      ),
    ).toEqual({ q1: "c2" });
  });

  test("reads selected choices from stored draft JSON", () => {
    expect(readDraftSelectedChoices({ selectedChoices: { q1: "c1", q2: "c3", q3: 123 } })).toEqual({
      q1: "c1",
      q2: "c3",
    });
  });
});
