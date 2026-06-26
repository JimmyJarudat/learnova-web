-- CreateEnum
CREATE TYPE "ExamPartKind" AS ENUM ('PART_A_GENERAL', 'PART_B_PROFESSION', 'PART_B_MAJOR', 'PART_C_INTERVIEW', 'PRACTICE');

-- CreateEnum
CREATE TYPE "ExamQuestionType" AS ENUM ('SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'SHORT_ANSWER');

-- CreateEnum
CREATE TYPE "ExamAttemptStatus" AS ENUM ('IN_PROGRESS', 'SUBMITTED', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "exam_affiliations" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(80) NOT NULL,
    "label" VARCHAR(50) NOT NULL,
    "name" VARCHAR(180) NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "color_class" VARCHAR(80),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "exam_affiliations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_majors" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "short_name" VARCHAR(80),
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "exam_majors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_tracks" (
    "id" UUID NOT NULL,
    "affiliation_id" UUID NOT NULL,
    "major_id" UUID NOT NULL,
    "slug" VARCHAR(140) NOT NULL,
    "title" VARCHAR(220) NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "exam_tracks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_packages" (
    "id" UUID NOT NULL,
    "track_id" UUID NOT NULL,
    "slug" VARCHAR(140) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "year" VARCHAR(30) NOT NULL,
    "label" VARCHAR(80),
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "exam_packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_package_parts" (
    "id" UUID NOT NULL,
    "package_id" UUID NOT NULL,
    "slug" VARCHAR(140) NOT NULL,
    "kind" "ExamPartKind" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "short_title" VARCHAR(80),
    "audience_label" VARCHAR(120),
    "description" TEXT,
    "duration_minutes" INTEGER NOT NULL DEFAULT 60,
    "total_questions" INTEGER NOT NULL DEFAULT 0,
    "total_score" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "difficulty" VARCHAR(50),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "exam_package_parts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practice_categories" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "title" VARCHAR(180) NOT NULL,
    "short_title" VARCHAR(80),
    "description" TEXT,
    "color_class" VARCHAR(80),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "practice_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practice_sets" (
    "id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "slug" VARCHAR(140) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "scope_label" VARCHAR(120),
    "year_label" VARCHAR(50),
    "description" TEXT,
    "duration_minutes" INTEGER NOT NULL DEFAULT 30,
    "total_questions" INTEGER NOT NULL DEFAULT 0,
    "total_score" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "difficulty" VARCHAR(50),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "practice_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practice_set_affiliations" (
    "id" UUID NOT NULL,
    "practice_set_id" UUID NOT NULL,
    "affiliation_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "practice_set_affiliations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_questions" (
    "id" UUID NOT NULL,
    "type" "ExamQuestionType" NOT NULL DEFAULT 'SINGLE_CHOICE',
    "stem" TEXT NOT NULL,
    "passage" TEXT,
    "image_url" TEXT,
    "explanation" TEXT,
    "difficulty" VARCHAR(50),
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "source_label" VARCHAR(150),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "exam_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_question_choices" (
    "id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "label" VARCHAR(20) NOT NULL,
    "text" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,
    "explanation" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "exam_question_choices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_question_accepted_answers" (
    "id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "text" TEXT NOT NULL,
    "normalized_text" TEXT,
    "is_case_sensitive" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "exam_question_accepted_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_package_part_questions" (
    "id" UUID NOT NULL,
    "part_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "score" DECIMAL(8,2) NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_package_part_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practice_set_questions" (
    "id" UUID NOT NULL,
    "set_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "score" DECIMAL(8,2) NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "practice_set_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_attempts" (
    "id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "package_part_id" UUID,
    "practice_set_id" UUID,
    "status" "ExamAttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submitted_at" TIMESTAMPTZ(6),
    "expires_at" TIMESTAMPTZ(6),
    "total_questions" INTEGER NOT NULL DEFAULT 0,
    "answered_count" INTEGER NOT NULL DEFAULT 0,
    "score" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "max_score" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "duration_seconds" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "exam_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_attempt_answers" (
    "id" UUID NOT NULL,
    "attempt_id" UUID NOT NULL,
    "question_id" UUID NOT NULL,
    "text_answer" TEXT,
    "is_correct" BOOLEAN,
    "score" DECIMAL(8,2) NOT NULL DEFAULT 0,
    "answered_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_attempt_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exam_attempt_answer_choices" (
    "id" UUID NOT NULL,
    "answer_id" UUID NOT NULL,
    "choice_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exam_attempt_answer_choices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "exam_affiliations_slug_key" ON "exam_affiliations"("slug");

-- CreateIndex
CREATE INDEX "exam_affiliations_is_active_idx" ON "exam_affiliations"("is_active");

-- CreateIndex
CREATE INDEX "exam_affiliations_sort_order_idx" ON "exam_affiliations"("sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "exam_majors_slug_key" ON "exam_majors"("slug");

-- CreateIndex
CREATE INDEX "exam_majors_is_active_idx" ON "exam_majors"("is_active");

-- CreateIndex
CREATE INDEX "exam_majors_sort_order_idx" ON "exam_majors"("sort_order");

-- CreateIndex
CREATE INDEX "exam_tracks_major_id_idx" ON "exam_tracks"("major_id");

-- CreateIndex
CREATE INDEX "exam_tracks_is_active_idx" ON "exam_tracks"("is_active");

-- CreateIndex
CREATE INDEX "exam_tracks_sort_order_idx" ON "exam_tracks"("sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "exam_tracks_affiliation_id_major_id_key" ON "exam_tracks"("affiliation_id", "major_id");

-- CreateIndex
CREATE UNIQUE INDEX "exam_tracks_affiliation_id_slug_key" ON "exam_tracks"("affiliation_id", "slug");

-- CreateIndex
CREATE INDEX "exam_packages_year_idx" ON "exam_packages"("year");

-- CreateIndex
CREATE INDEX "exam_packages_is_active_idx" ON "exam_packages"("is_active");

-- CreateIndex
CREATE INDEX "exam_packages_sort_order_idx" ON "exam_packages"("sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "exam_packages_track_id_slug_key" ON "exam_packages"("track_id", "slug");

-- CreateIndex
CREATE INDEX "exam_package_parts_kind_idx" ON "exam_package_parts"("kind");

-- CreateIndex
CREATE INDEX "exam_package_parts_is_active_idx" ON "exam_package_parts"("is_active");

-- CreateIndex
CREATE INDEX "exam_package_parts_sort_order_idx" ON "exam_package_parts"("sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "exam_package_parts_package_id_slug_key" ON "exam_package_parts"("package_id", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "practice_categories_slug_key" ON "practice_categories"("slug");

-- CreateIndex
CREATE INDEX "practice_categories_is_active_idx" ON "practice_categories"("is_active");

-- CreateIndex
CREATE INDEX "practice_categories_sort_order_idx" ON "practice_categories"("sort_order");

-- CreateIndex
CREATE INDEX "practice_sets_is_active_idx" ON "practice_sets"("is_active");

-- CreateIndex
CREATE INDEX "practice_sets_sort_order_idx" ON "practice_sets"("sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "practice_sets_category_id_slug_key" ON "practice_sets"("category_id", "slug");

-- CreateIndex
CREATE INDEX "practice_set_affiliations_affiliation_id_idx" ON "practice_set_affiliations"("affiliation_id");

-- CreateIndex
CREATE UNIQUE INDEX "practice_set_affiliations_practice_set_id_affiliation_id_key" ON "practice_set_affiliations"("practice_set_id", "affiliation_id");

-- CreateIndex
CREATE INDEX "exam_questions_type_idx" ON "exam_questions"("type");

-- CreateIndex
CREATE INDEX "exam_questions_difficulty_idx" ON "exam_questions"("difficulty");

-- CreateIndex
CREATE INDEX "exam_questions_is_active_idx" ON "exam_questions"("is_active");

-- CreateIndex
CREATE INDEX "exam_question_choices_question_id_idx" ON "exam_question_choices"("question_id");

-- CreateIndex
CREATE INDEX "exam_question_choices_sort_order_idx" ON "exam_question_choices"("sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "exam_question_choices_question_id_label_key" ON "exam_question_choices"("question_id", "label");

-- CreateIndex
CREATE INDEX "exam_question_accepted_answers_question_id_idx" ON "exam_question_accepted_answers"("question_id");

-- CreateIndex
CREATE INDEX "exam_package_part_questions_question_id_idx" ON "exam_package_part_questions"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "exam_package_part_questions_part_id_question_id_key" ON "exam_package_part_questions"("part_id", "question_id");

-- CreateIndex
CREATE UNIQUE INDEX "exam_package_part_questions_part_id_position_key" ON "exam_package_part_questions"("part_id", "position");

-- CreateIndex
CREATE INDEX "practice_set_questions_question_id_idx" ON "practice_set_questions"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "practice_set_questions_set_id_question_id_key" ON "practice_set_questions"("set_id", "question_id");

-- CreateIndex
CREATE UNIQUE INDEX "practice_set_questions_set_id_position_key" ON "practice_set_questions"("set_id", "position");

-- CreateIndex
CREATE INDEX "exam_attempts_user_id_idx" ON "exam_attempts"("user_id");

-- CreateIndex
CREATE INDEX "exam_attempts_package_part_id_idx" ON "exam_attempts"("package_part_id");

-- CreateIndex
CREATE INDEX "exam_attempts_practice_set_id_idx" ON "exam_attempts"("practice_set_id");

-- CreateIndex
CREATE INDEX "exam_attempts_status_idx" ON "exam_attempts"("status");

-- CreateIndex
CREATE INDEX "exam_attempts_started_at_idx" ON "exam_attempts"("started_at");

-- CreateIndex
CREATE INDEX "exam_attempt_answers_question_id_idx" ON "exam_attempt_answers"("question_id");

-- CreateIndex
CREATE UNIQUE INDEX "exam_attempt_answers_attempt_id_question_id_key" ON "exam_attempt_answers"("attempt_id", "question_id");

-- CreateIndex
CREATE INDEX "exam_attempt_answer_choices_choice_id_idx" ON "exam_attempt_answer_choices"("choice_id");

-- CreateIndex
CREATE UNIQUE INDEX "exam_attempt_answer_choices_answer_id_choice_id_key" ON "exam_attempt_answer_choices"("answer_id", "choice_id");

-- AddForeignKey
ALTER TABLE "exam_tracks" ADD CONSTRAINT "exam_tracks_affiliation_id_fkey" FOREIGN KEY ("affiliation_id") REFERENCES "exam_affiliations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_tracks" ADD CONSTRAINT "exam_tracks_major_id_fkey" FOREIGN KEY ("major_id") REFERENCES "exam_majors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_packages" ADD CONSTRAINT "exam_packages_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "exam_tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_package_parts" ADD CONSTRAINT "exam_package_parts_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "exam_packages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_sets" ADD CONSTRAINT "practice_sets_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "practice_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_set_affiliations" ADD CONSTRAINT "practice_set_affiliations_practice_set_id_fkey" FOREIGN KEY ("practice_set_id") REFERENCES "practice_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_set_affiliations" ADD CONSTRAINT "practice_set_affiliations_affiliation_id_fkey" FOREIGN KEY ("affiliation_id") REFERENCES "exam_affiliations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_question_choices" ADD CONSTRAINT "exam_question_choices_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "exam_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_question_accepted_answers" ADD CONSTRAINT "exam_question_accepted_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "exam_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_package_part_questions" ADD CONSTRAINT "exam_package_part_questions_part_id_fkey" FOREIGN KEY ("part_id") REFERENCES "exam_package_parts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_package_part_questions" ADD CONSTRAINT "exam_package_part_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "exam_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_set_questions" ADD CONSTRAINT "practice_set_questions_set_id_fkey" FOREIGN KEY ("set_id") REFERENCES "practice_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "practice_set_questions" ADD CONSTRAINT "practice_set_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "exam_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_attempts" ADD CONSTRAINT "exam_attempts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_attempts" ADD CONSTRAINT "exam_attempts_package_part_id_fkey" FOREIGN KEY ("package_part_id") REFERENCES "exam_package_parts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_attempts" ADD CONSTRAINT "exam_attempts_practice_set_id_fkey" FOREIGN KEY ("practice_set_id") REFERENCES "practice_sets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_attempt_answers" ADD CONSTRAINT "exam_attempt_answers_attempt_id_fkey" FOREIGN KEY ("attempt_id") REFERENCES "exam_attempts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_attempt_answers" ADD CONSTRAINT "exam_attempt_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "exam_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_attempt_answer_choices" ADD CONSTRAINT "exam_attempt_answer_choices_answer_id_fkey" FOREIGN KEY ("answer_id") REFERENCES "exam_attempt_answers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_attempt_answer_choices" ADD CONSTRAINT "exam_attempt_answer_choices_choice_id_fkey" FOREIGN KEY ("choice_id") REFERENCES "exam_question_choices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Manual constraints for exam module
-- Optional DB-level constraints for the exam module.
-- Run these inside your migration SQL if you want PostgreSQL to enforce the invariants,
-- because Prisma schema does not currently model CHECK constraints directly.

-- An attempt must point to exactly one source:
-- either an exam package part from the affiliation/major/package flow,
-- or a practice set from the topic-practice flow.
ALTER TABLE "exam_attempts"
ADD CONSTRAINT "exam_attempts_exactly_one_source_chk"
CHECK (
  (
    "package_part_id" IS NOT NULL
    AND "practice_set_id" IS NULL
  )
  OR
  (
    "package_part_id" IS NULL
    AND "practice_set_id" IS NOT NULL
  )
);

-- Keep scoring sane.
ALTER TABLE "exam_attempts"
ADD CONSTRAINT "exam_attempts_score_range_chk"
CHECK ("score" >= 0 AND "max_score" >= 0 AND "score" <= "max_score");

ALTER TABLE "exam_attempt_answers"
ADD CONSTRAINT "exam_attempt_answers_score_non_negative_chk"
CHECK ("score" >= 0);

-- A question item score should not be negative.
ALTER TABLE "exam_package_part_questions"
ADD CONSTRAINT "exam_package_part_questions_score_non_negative_chk"
CHECK ("score" >= 0);

ALTER TABLE "practice_set_questions"
ADD CONSTRAINT "practice_set_questions_score_non_negative_chk"
CHECK ("score" >= 0);

