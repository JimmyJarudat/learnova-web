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
