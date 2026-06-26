-- CreateEnum
CREATE TYPE "ExamContentFormat" AS ENUM ('PLAIN_TEXT', 'MARKDOWN', 'HTML');

-- AlterTable
ALTER TABLE "exam_package_part_questions" ADD COLUMN     "section_id" UUID;

-- AlterTable
ALTER TABLE "exam_question_accepted_answers" ADD COLUMN     "content_format" "ExamContentFormat" NOT NULL DEFAULT 'PLAIN_TEXT';

-- AlterTable
ALTER TABLE "exam_question_choices" ADD COLUMN     "content_format" "ExamContentFormat" NOT NULL DEFAULT 'MARKDOWN',
ADD COLUMN     "explanation_format" "ExamContentFormat" NOT NULL DEFAULT 'MARKDOWN',
ADD COLUMN     "explanation_image_url" TEXT,
ADD COLUMN     "image_url" TEXT;

-- AlterTable
ALTER TABLE "exam_questions" ADD COLUMN     "content_format" "ExamContentFormat" NOT NULL DEFAULT 'MARKDOWN',
ADD COLUMN     "explanation_format" "ExamContentFormat" NOT NULL DEFAULT 'MARKDOWN',
ADD COLUMN     "explanation_image_url" TEXT,
ADD COLUMN     "passage_id" UUID;

-- AlterTable
ALTER TABLE "practice_set_questions" ADD COLUMN     "section_id" UUID;

-- CreateTable
CREATE TABLE "exam_sections" (
    "id" UUID NOT NULL,
    "part_id" UUID,
    "practice_set_id" UUID,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "content_format" "ExamContentFormat" NOT NULL DEFAULT 'MARKDOWN',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "exam_sections_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "exam_sections"
ADD CONSTRAINT "exam_sections_exactly_one_owner_chk"
CHECK (
  (
    CASE WHEN "part_id" IS NULL THEN 0 ELSE 1 END
    + CASE WHEN "practice_set_id" IS NULL THEN 0 ELSE 1 END
  ) = 1
);

-- CreateTable
CREATE TABLE "exam_passages" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255),
    "content" TEXT NOT NULL,
    "content_format" "ExamContentFormat" NOT NULL DEFAULT 'MARKDOWN',
    "image_url" TEXT,
    "source_label" VARCHAR(150),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "exam_passages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_question_assets" (
    "id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "alt_text" VARCHAR(255),
    "caption" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "exam_question_assets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "exam_sections_part_id_idx" ON "exam_sections"("part_id");

-- CreateIndex
CREATE INDEX "exam_sections_practice_set_id_idx" ON "exam_sections"("practice_set_id");

-- CreateIndex
CREATE INDEX "exam_sections_sort_order_idx" ON "exam_sections"("sort_order");

-- CreateIndex
CREATE INDEX "exam_passages_sort_order_idx" ON "exam_passages"("sort_order");

-- CreateIndex
CREATE INDEX "exam_question_assets_question_id_idx" ON "exam_question_assets"("question_id");

-- CreateIndex
CREATE INDEX "exam_question_assets_sort_order_idx" ON "exam_question_assets"("sort_order");

-- CreateIndex
CREATE INDEX "exam_package_part_questions_section_id_idx" ON "exam_package_part_questions"("section_id");

-- CreateIndex
CREATE INDEX "exam_questions_passage_id_idx" ON "exam_questions"("passage_id");

-- CreateIndex
CREATE INDEX "practice_set_questions_section_id_idx" ON "practice_set_questions"("section_id");

-- AddForeignKey
ALTER TABLE "exam_sections" ADD CONSTRAINT "exam_sections_part_id_fkey" FOREIGN KEY ("part_id") REFERENCES "exam_package_parts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_sections" ADD CONSTRAINT "exam_sections_practice_set_id_fkey" FOREIGN KEY ("practice_set_id") REFERENCES "practice_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_questions" ADD CONSTRAINT "exam_questions_passage_id_fkey" FOREIGN KEY ("passage_id") REFERENCES "exam_passages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_question_assets" ADD CONSTRAINT "exam_question_assets_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "exam_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_package_part_questions" ADD CONSTRAINT "exam_package_part_questions_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "exam_sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_set_questions" ADD CONSTRAINT "practice_set_questions_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "exam_sections"("id") ON DELETE SET NULL ON UPDATE CASCADE;
