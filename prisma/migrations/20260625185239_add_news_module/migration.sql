-- CreateTable
CREATE TABLE "news_sources" (
    "id" UUID NOT NULL,
    "name" VARCHAR(150) NOT NULL,
    "url" TEXT NOT NULL,
    "type" VARCHAR(50) NOT NULL DEFAULT 'other',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_fetch_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "news_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_categories" (
    "id" UUID NOT NULL,
    "name_th" VARCHAR(100) NOT NULL,
    "name_en" VARCHAR(100),
    "slug" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "news_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_articles" (
    "id" UUID NOT NULL,
    "source_id" UUID,
    "category_id" UUID,
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "excerpt" VARCHAR(500),
    "summary" TEXT,
    "content" TEXT,
    "source_name" VARCHAR(150),
    "source_url" TEXT NOT NULL,
    "image_url" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" VARCHAR(30) NOT NULL DEFAULT 'draft',
    "relevance_score" INTEGER NOT NULL DEFAULT 0,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "source_published_at" TIMESTAMPTZ(6),
    "published_at" TIMESTAMPTZ(6),
    "fetched_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "raw_data" JSONB,
    "created_by" UUID,
    "updated_by" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "news_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "news_fetch_logs" (
    "id" UUID NOT NULL,
    "source_id" UUID,
    "source_name" VARCHAR(150),
    "source_url" TEXT,
    "status" VARCHAR(30) NOT NULL DEFAULT 'success',
    "total_found" INTEGER NOT NULL DEFAULT 0,
    "total_inserted" INTEGER NOT NULL DEFAULT 0,
    "total_skipped" INTEGER NOT NULL DEFAULT 0,
    "total_failed" INTEGER NOT NULL DEFAULT 0,
    "message" TEXT,
    "error_message" TEXT,
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "news_fetch_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "news_sources_url_key" ON "news_sources"("url");

-- CreateIndex
CREATE INDEX "news_sources_type_idx" ON "news_sources"("type");

-- CreateIndex
CREATE INDEX "news_sources_is_active_idx" ON "news_sources"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "news_categories_slug_key" ON "news_categories"("slug");

-- CreateIndex
CREATE INDEX "news_categories_is_active_idx" ON "news_categories"("is_active");

-- CreateIndex
CREATE INDEX "news_categories_sort_order_idx" ON "news_categories"("sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "news_articles_slug_key" ON "news_articles"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "news_articles_source_url_key" ON "news_articles"("source_url");

-- CreateIndex
CREATE INDEX "news_articles_status_idx" ON "news_articles"("status");

-- CreateIndex
CREATE INDEX "news_articles_category_id_idx" ON "news_articles"("category_id");

-- CreateIndex
CREATE INDEX "news_articles_source_id_idx" ON "news_articles"("source_id");

-- CreateIndex
CREATE INDEX "news_articles_published_at_idx" ON "news_articles"("published_at");

-- CreateIndex
CREATE INDEX "news_articles_source_published_at_idx" ON "news_articles"("source_published_at");

-- CreateIndex
CREATE INDEX "news_articles_relevance_score_idx" ON "news_articles"("relevance_score");

-- CreateIndex
CREATE INDEX "news_articles_view_count_idx" ON "news_articles"("view_count");

-- CreateIndex
CREATE INDEX "news_articles_is_featured_idx" ON "news_articles"("is_featured");

-- CreateIndex
CREATE INDEX "news_fetch_logs_source_id_idx" ON "news_fetch_logs"("source_id");

-- CreateIndex
CREATE INDEX "news_fetch_logs_status_idx" ON "news_fetch_logs"("status");

-- CreateIndex
CREATE INDEX "news_fetch_logs_started_at_idx" ON "news_fetch_logs"("started_at");

-- AddForeignKey
ALTER TABLE "news_articles" ADD CONSTRAINT "news_articles_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "news_sources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "news_articles" ADD CONSTRAINT "news_articles_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "news_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
