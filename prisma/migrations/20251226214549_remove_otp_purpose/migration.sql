/*
  Warnings:

  - You are about to drop the column `purpose` on the `otps` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "otps" DROP COLUMN "purpose";

-- DropEnum
DROP TYPE "OtpPurpose";
