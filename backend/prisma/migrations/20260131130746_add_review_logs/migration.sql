-- CreateEnum
CREATE TYPE "ReviewPlanStatus" AS ENUM ('PENDING', 'DONE', 'SKIPPED');

-- CreateEnum
CREATE TYPE "ReviewGrade" AS ENUM ('AGAIN', 'HARD', 'GOOD');

-- DropIndex
DROP INDEX "ReviewPlan_scheduledAt_idx";

-- AlterTable
ALTER TABLE "Memo" ADD COLUMN     "lastReviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewCount" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "ReviewPlan" ADD COLUMN     "status" "ReviewPlanStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "ReviewLog" (
    "id" TEXT NOT NULL,
    "memoId" TEXT NOT NULL,
    "reviewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "grade" "ReviewGrade" NOT NULL,
    "intervalDays" INTEGER,

    CONSTRAINT "ReviewLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReviewLog_memoId_reviewedAt_idx" ON "ReviewLog"("memoId", "reviewedAt");

-- CreateIndex
CREATE INDEX "ReviewLog_reviewedAt_idx" ON "ReviewLog"("reviewedAt");

-- CreateIndex
CREATE INDEX "ReviewPlan_scheduledAt_status_idx" ON "ReviewPlan"("scheduledAt", "status");

-- AddForeignKey
ALTER TABLE "ReviewLog" ADD CONSTRAINT "ReviewLog_memoId_fkey" FOREIGN KEY ("memoId") REFERENCES "Memo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
