/*
  Warnings:

  - You are about to drop the column `traits` on the `House` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId]` on the table `SleepEntry` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."House" DROP COLUMN "traits";

-- AlterTable
ALTER TABLE "public"."SleepEntry" ADD COLUMN     "sleepQuality" DOUBLE PRECISION;

-- CreateIndex
CREATE UNIQUE INDEX "SleepEntry_userId_key" ON "public"."SleepEntry"("userId");
