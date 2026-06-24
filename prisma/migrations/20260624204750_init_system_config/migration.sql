-- CreateTable
CREATE TABLE "system_config" (
    "id" VARCHAR(50) NOT NULL,
    "value" VARCHAR(4000) NOT NULL,
    "description" VARCHAR(4000),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "category" VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_encrypted" BOOLEAN NOT NULL DEFAULT false,
    "last_modified_by_id" TEXT,
    "display_name" VARCHAR(100),
    "data_type" VARCHAR(20) NOT NULL DEFAULT 'STRING',

    CONSTRAINT "system_config_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ix_system_config_category_is_active" ON "system_config"("category", "is_active");
