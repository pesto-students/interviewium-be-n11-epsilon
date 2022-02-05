/*
  Warnings:

  - Added the required column `jobId` to the `hrIntervieweeInvitesHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `hrIntervieweeInvitesHistory` ADD COLUMN `jobId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `hrIntervieweeInvitesHistory` ADD CONSTRAINT `hrIntervieweeInvitesHistory_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `jobs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
