/*
  Warnings:

  - You are about to drop the column `interviewerId` on the `jobApplicationsHistory` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `jobApplicationsHistory` DROP FOREIGN KEY `jobApplicationsHistory_interviewerId_fkey`;

-- AlterTable
ALTER TABLE `jobApplicationsHistory` DROP COLUMN `interviewerId`,
    ADD COLUMN `currentInterviewerId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `jobApplicationsHistory` ADD CONSTRAINT `jobApplicationsHistory_currentInterviewerId_fkey` FOREIGN KEY (`currentInterviewerId`) REFERENCES `interviewers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
