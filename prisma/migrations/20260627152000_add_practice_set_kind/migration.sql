-- Add practice set kind so practice routes can render objective exams or interview sessions differently.
ALTER TABLE "practice_sets"
ADD COLUMN "kind" "ExamPartKind" NOT NULL DEFAULT 'PART_A_GENERAL';

UPDATE "practice_sets"
SET "kind" = 'PART_C_INTERVIEW'
WHERE "slug" = 'part-c-interview-general';
