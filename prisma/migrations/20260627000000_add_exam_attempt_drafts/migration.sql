-- CreateTable
CREATE TABLE "exam_attempt_drafts" (
    "id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "package_part_id" UUID,
    "practice_set_id" UUID,
    "status" "ExamAttemptStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "answers_json" JSONB NOT NULL DEFAULT '{}',
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration_seconds_used" INTEGER NOT NULL DEFAULT 0,
    "last_saved_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "submitted_at" TIMESTAMPTZ(6),
    "expires_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "exam_attempt_drafts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "exam_attempt_drafts_user_id_idx" ON "exam_attempt_drafts"("user_id");

-- CreateIndex
CREATE INDEX "exam_attempt_drafts_package_part_id_idx" ON "exam_attempt_drafts"("package_part_id");

-- CreateIndex
CREATE INDEX "exam_attempt_drafts_practice_set_id_idx" ON "exam_attempt_drafts"("practice_set_id");

-- CreateIndex
CREATE INDEX "exam_attempt_drafts_status_idx" ON "exam_attempt_drafts"("status");

-- CreateIndex
CREATE INDEX "exam_attempt_drafts_last_saved_at_idx" ON "exam_attempt_drafts"("last_saved_at");

-- CreateIndex
CREATE INDEX "exam_attempt_drafts_expires_at_idx" ON "exam_attempt_drafts"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "exam_attempt_drafts_user_id_package_part_id_key" ON "exam_attempt_drafts"("user_id", "package_part_id");

-- CreateIndex
CREATE UNIQUE INDEX "exam_attempt_drafts_user_id_practice_set_id_key" ON "exam_attempt_drafts"("user_id", "practice_set_id");

-- AddForeignKey
ALTER TABLE "exam_attempt_drafts" ADD CONSTRAINT "exam_attempt_drafts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_attempt_drafts" ADD CONSTRAINT "exam_attempt_drafts_package_part_id_fkey" FOREIGN KEY ("package_part_id") REFERENCES "exam_package_parts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exam_attempt_drafts" ADD CONSTRAINT "exam_attempt_drafts_practice_set_id_fkey" FOREIGN KEY ("practice_set_id") REFERENCES "practice_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
