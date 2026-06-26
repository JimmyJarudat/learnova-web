-- AlterTable
ALTER TABLE "news_articles" ADD COLUMN     "application_end" DATE,
ADD COLUMN     "application_start" DATE,
ADD COLUMN     "archived_at" TIMESTAMPTZ(6),
ADD COLUMN     "cancelled_at" TIMESTAMPTZ(6),
ADD COLUMN     "closed_at" TIMESTAMPTZ(6),
ADD COLUMN     "external_id" VARCHAR(100),
ADD COLUMN     "last_seen_at" TIMESTAMPTZ(6),
ALTER COLUMN "status" SET DEFAULT 'published';

-- CreateIndex
CREATE INDEX "news_articles_application_start_idx" ON "news_articles"("application_start");

-- CreateIndex
CREATE INDEX "news_articles_application_end_idx" ON "news_articles"("application_end");

-- CreateIndex
CREATE INDEX "news_articles_last_seen_at_idx" ON "news_articles"("last_seen_at");

-- CreateIndex
CREATE INDEX "news_articles_source_id_external_id_idx" ON "news_articles"("source_id", "external_id");
