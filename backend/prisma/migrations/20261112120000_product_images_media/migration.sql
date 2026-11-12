-- AlterTable
ALTER TABLE "tbl_categories" DROP COLUMN "image";

-- CreateTable
CREATE TABLE "tbl_media" (
    "id" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tbl_media_pkey" PRIMARY KEY ("id")
);

