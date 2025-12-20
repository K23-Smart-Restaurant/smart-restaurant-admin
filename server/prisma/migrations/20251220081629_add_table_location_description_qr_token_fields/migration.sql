/*
  Warnings:

  - A unique constraint covering the columns `[qrToken]` on the table `Table` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Table" ADD COLUMN     "description" TEXT,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "qrToken" VARCHAR(500),
ADD COLUMN     "qrTokenCreatedAt" TIMESTAMP(3);

-- Add CHECK constraint for capacity (1-20 range as per requirements)
ALTER TABLE "Table" ADD CONSTRAINT "Table_capacity_check" CHECK (capacity >= 1 AND capacity <= 20);

-- CreateIndex
CREATE UNIQUE INDEX "Table_qrToken_key" ON "Table"("qrToken");

-- CreateIndex
CREATE INDEX "Table_location_idx" ON "Table"("location");
