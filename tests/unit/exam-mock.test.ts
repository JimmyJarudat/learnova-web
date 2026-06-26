import { describe, expect, test } from "bun:test";
import {
  examAffiliations,
  examSets,
  getExamAffiliation,
  getExamSet,
  getExamSets,
  getExamMajor,
  getExamSubject,
  getExamTrackPackage,
  getExamTrackPackages,
  getExamTrackPart,
  getExamTrackParts,
  getExamTotals,
  getPracticeCategory,
  getPracticeSet,
  getPracticeSets,
  practiceCategories,
} from "@/lib/exam-mock";

describe("exam mock data", () => {
  test("has affiliation subject routes for main teacher exam boards", () => {
    expect(examAffiliations.map((item) => item.slug)).toEqual(["obec", "ovec", "dole", "dla", "bma"]);
    expect(getExamSubject("ovec", "part-a-general")?.title).toBe("ภาค ก ความสามารถทั่วไป");
    expect(getExamSubject("obec", "part-b-profession")?.shortTitle).toBe("วิชาชีพครู");
    expect(getExamSubject("obec", "major-computer")?.audience).toBe("เอกคอมพิวเตอร์");
    expect(getExamSubject("obec", "major-computer")?.isMajor).toBe(true);
  });

  test("groups exam sets by affiliation and subject", () => {
    const ovecGeneralSets = getExamSets("ovec", "part-a-general");

    expect(ovecGeneralSets).toHaveLength(3);
    expect(ovecGeneralSets.every((set) => set.affiliationSlug === "ovec")).toBe(true);
    expect(ovecGeneralSets.every((set) => set.subjectSlug === "part-a-general")).toBe(true);
  });

  test("finds a concrete exam set route", () => {
    const set = getExamSet("ovec", "major-computer", "major-computer-mock-exam");

    expect(getExamAffiliation("ovec")?.label).toBe("สอศ.");
    expect(set?.title).toContain("สอศ.");
    expect(set?.title).toContain("เอกคอมพิวเตอร์");
    expect(set?.questions).toBe(100);
  });

  test("supports affiliation to major to package to part flow", () => {
    const major = getExamMajor("obec", "major-computer");
    const packages = getExamTrackPackages("obec", "major-computer");
    const pack = getExamTrackPackage("obec", "major-computer", "2567-set-1");

    expect(major?.audience).toBe("เอกคอมพิวเตอร์");
    expect(packages).toHaveLength(3);
    expect(pack?.title).toContain("เอกคอมพิวเตอร์");

    if (!major) {
      throw new Error("major missing");
    }

    expect(getExamTrackParts(major).map((part) => part.slug)).toEqual([
      "part-a-general",
      "part-b-profession",
      "major-computer",
      "part-c-interview",
    ]);
    expect(getExamTrackPart(major, "major-computer")?.partLabel).toBe("เอกคอมพิวเตอร์");
  });

  test("supports topic practice flow without choosing affiliation first", () => {
    const category = getPracticeCategory("part-a");
    const sets = getPracticeSets("part-a");
    const set = getPracticeSet("part-a", "part-a-speed-30");

    expect(practiceCategories.map((item) => item.slug)).toContain("part-a");
    expect(category?.title).toBe("ภาค ก รวมทุกสังกัด");
    expect(sets).toHaveLength(4);
    expect(set?.questions).toBe(30);
    expect(set?.scope).toBe("ทุกสังกัด");
  });

  test("totals are derived from the mock set collection", () => {
    const totals = getExamTotals();

    expect(totals.affiliations).toBe(examAffiliations.length);
    expect(totals.sets).toBe(examSets.length);
    expect(totals.questions > 0).toBe(true);
  });
});
