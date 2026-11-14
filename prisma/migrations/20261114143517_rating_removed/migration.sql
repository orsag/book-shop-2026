/*
  Warnings:

  - You are about to drop the column `coverUrl` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the `AggregateRating` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AggregateRating" DROP CONSTRAINT "AggregateRating_productId_fkey";

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "coverUrl";

-- DropTable
DROP TABLE "AggregateRating";
