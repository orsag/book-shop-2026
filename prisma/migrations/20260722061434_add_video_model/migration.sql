-- CreateTable
CREATE TABLE "videos" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL DEFAULT 'video/mp4',
    "data" BYTEA NOT NULL,
    "size" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);
