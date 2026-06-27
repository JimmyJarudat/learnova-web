type ExamResultInput = {
  score: number;
  maxScore: number;
  totalQuestions: number;
  answeredCount: number;
  correctCount: number;
  durationSeconds: number;
};

type BestAttemptInput = {
  score: number;
  maxScore: number;
} | null | undefined;

type ExamQuestionInput = {
  id: string;
  no: number;
  score: number;
  section: {
    id: string;
    title: string;
  } | null;
};

type ExamQuestionResultInput = {
  questionId: string;
  selectedChoiceIds: string[];
  isCorrect: boolean | null;
  score: number;
  maxScore: number;
};

export function analyzeExamResult(result: ExamResultInput, previousBestAttempt?: BestAttemptInput) {
  const percentage = result.maxScore > 0 ? Math.round((result.score / result.maxScore) * 100) : 0;
  const incorrectCount = Math.max(result.answeredCount - result.correctCount, 0);
  const unansweredCount = Math.max(result.totalQuestions - result.answeredCount, 0);
  const previousBestScore = previousBestAttempt?.score ?? null;
  const bestScoreDiff = previousBestScore == null ? null : result.score - previousBestScore;

  return {
    percentage,
    incorrectCount,
    unansweredCount,
    bestScoreDiff,
    levelLabel: getResultLevelLabel(percentage),
    advice: getResultAdvice({ percentage, unansweredCount, incorrectCount }),
  };
}

export function analyzeExamResultBySection(questions: ExamQuestionInput[], results: ExamQuestionResultInput[] | undefined) {
  const resultByQuestionId = new Map(results?.map((result) => [result.questionId, result]) ?? []);
  const sectionById = new Map<
    string,
    {
      id: string;
      title: string;
      score: number;
      maxScore: number;
      totalQuestions: number;
      answeredCount: number;
      correctCount: number;
      incorrectCount: number;
      unansweredCount: number;
      reviewQuestions: Array<{
        id: string;
        no: number;
        status: "incorrect" | "unanswered";
      }>;
    }
  >();

  for (const question of questions) {
    const sectionId = question.section?.id ?? "uncategorized";
    const section = sectionById.get(sectionId) ?? {
      id: sectionId,
      title: question.section?.title ?? "ไม่ระบุหัวข้อ",
      score: 0,
      maxScore: 0,
      totalQuestions: 0,
      answeredCount: 0,
      correctCount: 0,
      incorrectCount: 0,
      unansweredCount: 0,
      reviewQuestions: [],
    };
    const result = resultByQuestionId.get(question.id);
    const isAnswered = Boolean(result?.selectedChoiceIds.length);
    const isCorrect = result?.isCorrect === true;
    const isIncorrect = result?.isCorrect === false;
    const maxScore = result?.maxScore ?? question.score;

    section.score += result?.score ?? 0;
    section.maxScore += maxScore;
    section.totalQuestions += 1;
    section.answeredCount += isAnswered ? 1 : 0;
    section.correctCount += isCorrect ? 1 : 0;
    section.incorrectCount += isIncorrect ? 1 : 0;
    section.unansweredCount += isAnswered ? 0 : 1;

    if (!isAnswered || !isCorrect) {
      section.reviewQuestions.push({
        id: question.id,
        no: question.no,
        status: isAnswered ? "incorrect" : "unanswered",
      });
    }

    sectionById.set(sectionId, section);
  }

  return Array.from(sectionById.values())
    .map((section) => ({
      ...section,
      percentage: section.maxScore > 0 ? Math.round((section.score / section.maxScore) * 100) : 0,
    }))
    .sort((a, b) => a.percentage - b.percentage || b.unansweredCount - a.unansweredCount || b.incorrectCount - a.incorrectCount);
}

function getResultLevelLabel(percentage: number) {
  if (percentage >= 80) {
    return "ทำได้ดีมาก";
  }

  if (percentage >= 60) {
    return "อยู่ในเกณฑ์ดี";
  }

  if (percentage >= 40) {
    return "ควรทบทวนเพิ่ม";
  }

  return "ควรกลับไปปูพื้นฐาน";
}

function getResultAdvice({
  percentage,
  unansweredCount,
  incorrectCount,
}: {
  percentage: number;
  unansweredCount: number;
  incorrectCount: number;
}) {
  if (unansweredCount > 0) {
    return `ยังมีข้อที่ไม่ได้ตอบ ${unansweredCount} ข้อ รอบถัดไปลองคุมเวลาให้ตอบครบก่อน แล้วค่อยกลับมาไล่ข้อยาก`;
  }

  if (percentage >= 80) {
    return "พื้นฐานรอบนี้แน่นแล้ว รอบถัดไปลองจับเวลาให้เร็วขึ้นและทบทวนเฉพาะข้อที่ผิด";
  }

  if (incorrectCount > 0) {
    return `มีข้อที่ตอบผิด ${incorrectCount} ข้อ ควรอ่านเฉลยข้อผิดก่อนทำซ้ำอีกครั้ง`;
  }

  return "บันทึกผลเรียบร้อยแล้ว ลองทำชุดอื่นต่อเพื่อเทียบความพร้อมในหลายหมวด";
}
