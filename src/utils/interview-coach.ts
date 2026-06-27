export type InterviewRubricScore = {
  label: string;
  score: number;
  maxScore: number;
  note: string;
};

export type InterviewCoachResult = {
  feedback: string;
  nextQuestion: string;
  rubric: InterviewRubricScore[];
  improvedAnswer: string;
};

export type InterviewSummaryTurn = {
  answer?: string;
  rubric: InterviewRubricScore[];
};

export type InterviewSummary = {
  totalScore: number;
  maxScore: number;
  averageScore: number;
  levelLabel: string;
  strengthLabel: string;
  improvementLabel: string;
  advice: string;
};

export const firstInterviewQuestion =
  "กรุณาแนะนำตัวเองโดยสรุป พร้อมบอกเหตุผลที่อยากเป็นครู และประสบการณ์ที่เกี่ยวข้องกับการจัดการเรียนรู้";

export const maxInterviewQuestions = 10;

const rubricLabels = [
  "ความชัดเจนของคำตอบ",
  "จิตวิญญาณความเป็นครู",
  "การเชื่อมโยงประสบการณ์",
  "ความเหมาะสมของภาษา",
];

export function buildFallbackInterviewResult(answer: string, currentQuestion = firstInterviewQuestion): InterviewCoachResult {
  const answerLength = answer.trim().length;
  const isLowQuality = isLowQualityInterviewAnswer(answer);
  const baseScore = isLowQuality ? 0 : answerLength >= 240 ? 4 : answerLength >= 120 ? 3 : answerLength >= 60 ? 2 : 1;

  return {
    feedback: isLowQuality
      ? "คำตอบยังสั้นหรือซ้ำเกินไปจนไม่สามารถประเมินสาระของการสัมภาษณ์ได้ ควรตอบเป็นประโยคที่มีเหตุผล ตัวอย่าง และเชื่อมโยงกับบทบาทครู"
      : "ระบบ AI ยังไม่พร้อมใช้งาน จึงใช้การประเมินพื้นฐานก่อน คำตอบควรมีโครงสร้างชัดเจน เริ่มจากแนะนำตัว เหตุผลที่อยากเป็นครู ประสบการณ์ที่เกี่ยวข้อง และปิดท้ายด้วยเป้าหมายในการพัฒนาผู้เรียน",
    nextQuestion: getFallbackFollowUpQuestion(currentQuestion, answer),
    rubric: rubricLabels.map((label) => ({
      label,
      score: baseScore,
      maxScore: 5,
      note: isLowQuality
        ? "ยังไม่พบเนื้อหาที่ใช้ประเมินด้านนี้"
        : baseScore >= 3
          ? "มีประเด็นหลักแล้ว ควรเพิ่มตัวอย่างให้ชัดขึ้น"
          : "ควรขยายคำตอบและยกตัวอย่างจากประสบการณ์จริง",
    })),
    improvedAnswer:
      "ตัวอย่างแนวทางตอบ: ดิฉัน/ผมชื่อ ... สำเร็จการศึกษาด้าน ... มีความสนใจในวิชาชีพครูเพราะเชื่อว่าครูมีบทบาทสำคัญในการพัฒนาผู้เรียนทั้งความรู้และคุณลักษณะ ระหว่างที่ผ่านมาเคยมีประสบการณ์ ... ซึ่งช่วยให้เข้าใจการสื่อสารกับผู้เรียนและการจัดกิจกรรมการเรียนรู้ หากได้รับโอกาสจะตั้งใจพัฒนาตนเองและดูแลผู้เรียนให้เติบโตอย่างเหมาะสม",
  };
}

export function buildInterviewPrompt({
  currentQuestion,
  answer,
  history,
  examTitle,
}: {
  currentQuestion: string;
  answer: string;
  history: Array<{ question: string; answer: string }>;
  examTitle?: string;
}) {
  const historyText = history
    .slice(-4)
    .map((item, index) => `รอบก่อนหน้า ${index + 1}\nคำถาม: ${item.question}\nคำตอบ: ${item.answer}`)
    .join("\n\n");

  return `
บริบท: ซ้อมสัมภาษณ์ภาค ค ครูผู้ช่วย${examTitle ? ` (${examTitle})` : ""}
คำถามปัจจุบัน: ${currentQuestion}
คำตอบผู้สมัคร: ${answer}
ประวัติสนทนาล่าสุด:
${historyText || "- ไม่มี"}

ให้ประเมินคำตอบตาม rubric 4 ด้าน ด้านละ 5 คะแนน:
1. ความชัดเจนของคำตอบ
2. จิตวิญญาณความเป็นครู
3. การเชื่อมโยงประสบการณ์
4. ความเหมาะสมของภาษา

ถ้าคำตอบสั้นมาก เป็นข้อความซ้ำ พิมพ์มั่ว หรือไม่มีสาระที่ตอบคำถาม ให้คะแนนแต่ละด้านเป็น 0 และ feedback ต้องบอกชัดว่ายังประเมินไม่ได้

ตอบเป็น JSON เท่านั้นในรูปแบบ:
{
  "feedback": "สรุป feedback ภาษาไทยแบบตรงประเด็น",
  "nextQuestion": "คำถามต่อยอดหนึ่งคำถาม",
  "improvedAnswer": "ตัวอย่างคำตอบที่ปรับให้ดีขึ้นแบบกระชับ",
  "rubric": [
    { "label": "ความชัดเจนของคำตอบ", "score": 0-5, "maxScore": 5, "note": "เหตุผลสั้นๆ" }
  ]
}
`.trim();
}

export function parseInterviewCoachResult(value: string, answer: string, currentQuestion: string): InterviewCoachResult {
  if (isLowQualityInterviewAnswer(answer)) {
    return buildFallbackInterviewResult(answer, currentQuestion);
  }

  try {
    const jsonText = value.match(/\{[\s\S]*\}/)?.[0] ?? value;
    const parsed = JSON.parse(jsonText) as Partial<InterviewCoachResult>;
    const fallback = buildFallbackInterviewResult(answer, currentQuestion);
    const rubric = Array.isArray(parsed.rubric) ? parsed.rubric : fallback.rubric;

    return {
      feedback: sanitizeText(parsed.feedback) || fallback.feedback,
      nextQuestion: sanitizeText(parsed.nextQuestion) || fallback.nextQuestion,
      improvedAnswer: sanitizeText(parsed.improvedAnswer) || fallback.improvedAnswer,
      rubric: rubricLabels.map((label, index) => {
        const item = rubric[index];
        const score = Math.max(0, Math.min(5, Math.round(Number(item?.score ?? fallback.rubric[index].score))));

        return {
          label,
          score,
          maxScore: 5,
          note: sanitizeText(item?.note) || fallback.rubric[index].note,
        };
      }),
    };
  } catch {
    return buildFallbackInterviewResult(answer, currentQuestion);
  }
}

export function summarizeInterview(turns: InterviewSummaryTurn[]): InterviewSummary {
  const rubricTotals = rubricLabels.map((label) => ({
    label,
    score: 0,
    maxScore: 0,
  }));

  for (const turn of turns) {
    for (const [index, item] of turn.rubric.entries()) {
      if (!rubricTotals[index]) {
        continue;
      }

      rubricTotals[index].score += Number.isFinite(item.score) ? item.score : 0;
      rubricTotals[index].maxScore += Number.isFinite(item.maxScore) ? item.maxScore : 5;
    }
  }

  const totalScore = rubricTotals.reduce((sum, item) => sum + item.score, 0);
  const maxScore = rubricTotals.reduce((sum, item) => sum + item.maxScore, 0);
  const averageScore = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  const hasMeaningfulAnswer = turns.some((turn) => turn.answer && !isLowQualityInterviewAnswer(turn.answer));
  const sortedByRatio = [...rubricTotals].sort((a, b) => {
    const aRatio = a.maxScore > 0 ? a.score / a.maxScore : 0;
    const bRatio = b.maxScore > 0 ? b.score / b.maxScore : 0;

    return aRatio - bRatio;
  });
  const improvementLabel = sortedByRatio[0]?.label ?? rubricLabels[0];
  const strengthLabel = hasMeaningfulAnswer && averageScore >= 30 ? (sortedByRatio.at(-1)?.label ?? rubricLabels[0]) : "ยังไม่พบจุดเด่นชัดเจน";

  return {
    totalScore,
    maxScore,
    averageScore,
    levelLabel: getInterviewLevelLabel(averageScore),
    strengthLabel,
    improvementLabel,
    advice: getInterviewAdvice(averageScore, improvementLabel),
  };
}

function sanitizeText(value: unknown) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, 1200) : "";
}

function getInterviewLevelLabel(averageScore: number) {
  if (averageScore >= 80) {
    return "พร้อมเข้าสอบสัมภาษณ์";
  }

  if (averageScore >= 60) {
    return "พื้นฐานดี ควรเพิ่มความคมชัด";
  }

  return "ควรฝึกจัดโครงคำตอบเพิ่ม";
}

function getInterviewAdvice(averageScore: number, improvementLabel: string) {
  if (averageScore < 30) {
    return "คำตอบส่วนใหญ่ยังสั้นหรือไม่มีสาระเพียงพอให้ประเมินได้ รอบถัดไปควรตอบเป็นประโยคสมบูรณ์ พร้อมเหตุผล ตัวอย่างจริง และเชื่อมโยงกับบทบาทครู";
  }

  if (averageScore >= 80) {
    return `ภาพรวมตอบได้ดีแล้ว รอบถัดไปให้ซ้อมตอบให้กระชับขึ้น และรักษาจุดเด่นด้าน${improvementLabel}ไม่ให้หลุดประเด็น`;
  }

  if (averageScore >= 60) {
    return `คำตอบมีแกนหลักแล้ว แต่ควรเพิ่มตัวอย่างจริงและเรียงลำดับคำตอบให้ชัด โดยเฉพาะด้าน${improvementLabel}`;
  }

  return `ควรเริ่มจากโครงคำตอบ 4 ส่วน: บริบท เหตุผล ตัวอย่างจริง และผลลัพธ์ที่เกิดขึ้น โดยให้เน้นปรับด้าน${improvementLabel}ก่อน`;
}

export function isLowQualityInterviewAnswer(answer: string) {
  const normalized = answer
    .replace(/\s+/g, "")
    .replace(/[.,!?;:()[\]{}'"“”‘’\-_/\\|0-9๐-๙]/g, "");

  if (normalized.length < 20) {
    return true;
  }

  const charCounts = new Map<string, number>();
  for (const char of normalized) {
    charCounts.set(char, (charCounts.get(char) ?? 0) + 1);
  }

  const uniqueCharCount = charCounts.size;
  const maxRepeatedCharCount = Math.max(...charCounts.values());
  const repeatedRatio = maxRepeatedCharCount / normalized.length;

  return uniqueCharCount <= 4 || repeatedRatio >= 0.6;
}

function getFallbackFollowUpQuestion(currentQuestion: string, answer: string) {
  if (answer.includes("ประสบการณ์") || answer.includes("สอน") || answer.includes("นักเรียน")) {
    return "จากประสบการณ์ที่กล่าวมา หากเจอนักเรียนที่ไม่สนใจเรียน คุณจะใช้วิธีใดเพื่อดึงเขากลับเข้าสู่บทเรียน";
  }

  if (currentQuestion.includes("แนะนำตัว")) {
    return "ช่วยยกตัวอย่างประสบการณ์หนึ่งเรื่องที่สะท้อนว่าคุณเหมาะกับวิชาชีพครู";
  }

  return "ถ้ากรรมการถามว่าจุดเด่นของคุณต่อการเป็นครูคืออะไร คุณจะตอบอย่างไรให้เห็นภาพชัดเจน";
}
