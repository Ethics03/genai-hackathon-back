/*
  Warnings:

  - The primary key for the `Users` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Users` table. All the data in the column will be lost.
  - The required column `userId` was added to the `Users` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- CreateEnum
CREATE TYPE "public"."Houses" AS ENUM ('luminara', 'noctis', 'solaris');

-- AlterTable
ALTER TABLE "public"."Users" DROP CONSTRAINT "Users_pkey",
DROP COLUMN "id",
ADD COLUMN     "userId" TEXT NOT NULL,
ADD CONSTRAINT "Users_pkey" PRIMARY KEY ("userId");

-- CreateTable
CREATE TABLE "public"."House" (
    "houseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "traits" TEXT[],
    "color" TEXT NOT NULL,
    "motto" TEXT NOT NULL,

    CONSTRAINT "House_pkey" PRIMARY KEY ("houseId")
);

-- CreateTable
CREATE TABLE "public"."SleepEntry" (
    "sleepId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bedTime" TIMESTAMP(3) NOT NULL,
    "wakeTime" TIMESTAMP(3) NOT NULL,
    "sleepDate" DATE NOT NULL,
    "reason" TEXT NOT NULL,
    "duration" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SleepEntry_pkey" PRIMARY KEY ("sleepId")
);

-- CreateIndex
CREATE UNIQUE INDEX "House_name_key" ON "public"."House"("name");

-- CreateIndex
CREATE INDEX "SleepEntry_sleepDate_idx" ON "public"."SleepEntry"("sleepDate");

-- CreateIndex
CREATE UNIQUE INDEX "SleepEntry_userId_sleepDate_key" ON "public"."SleepEntry"("userId", "sleepDate");

-- AddForeignKey
ALTER TABLE "public"."House" ADD CONSTRAINT "House_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."Users"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SleepEntry" ADD CONSTRAINT "SleepEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."Users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
