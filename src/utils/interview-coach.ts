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

export const firstInterviewQuestion =
  "กรุณาแนะนำตัวเองโดยสรุป พร้อมบอกเหตุผลที่อยากเป็นครู และประสบการณ์ที่เกี่ยวข้องกับการจัดการเรียนรู้";

const rubricLabels = [
  "ความชัดเจนของคำตอบ",
  "จิตวิญญาณความเป็นครู",
  "การเชื่อมโยงประสบการณ์",
  "ความเหมาะสมของภาษา",
];

export function buildFallbackInterviewResult(answer: string, currentQuestion = firstInterviewQuestion): InterviewCoachResult {
  const answerLength = answer.trim().length;
  const baseScore = answerLength >= 240 ? 4 : answerLength >= 120 ? 3 : answerLength >= 60 ? 2 : 1;

  return {
    feedback:
      "ระบบ AI ยังไม่พร้อมใช้งาน จึงใช้การประเมินพื้นฐานก่อน คำตอบควรมีโครงสร้างชัดเจน เริ่มจากแนะนำตัว เหตุผลที่อยากเป็นครู ประสบการณ์ที่เกี่ยวข้อง และปิดท้ายด้วยเป้าหมายในการพัฒนาผู้เรียน",
    nextQuestion: getFallbackFollowUpQuestion(currentQuestion, answer),
    rubric: rubricLabels.map((label) => ({
      label,
      score: baseScore,
      maxScore: 5,
      note: baseScore >= 3 ? "มีประเด็นหลักแล้ว ควรเพิ่มตัวอย่างให้ชัดขึ้น" : "ควรขยายคำตอบและยกตัวอย่างจากประสบการณ์จริง",
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

ตอบเป็น JSON เท่านั้นในรูปแบบ:
{
  "feedback": "สรุป feedback ภาษาไทยแบบตรงประเด็น",
  "nextQuestion": "คำถามต่อยอดหนึ่งคำถาม",
  "improvedAnswer": "ตัวอย่างคำตอบที่ปรับให้ดีขึ้นแบบกระชับ",
  "rubric": [
    { "label": "ความชัดเจนของคำตอบ", "score": 1-5, "maxScore": 5, "note": "เหตุผลสั้นๆ" }
  ]
}
`.trim();
}

export function parseInterviewCoachResult(value: string, answer: string, currentQuestion: string): InterviewCoachResult {
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
        const score = Math.max(1, Math.min(5, Math.round(Number(item?.score ?? fallback.rubric[index].score))));

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

function sanitizeText(value: unknown) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, 1200) : "";
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
