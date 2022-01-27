-- AlterTable
ALTER TABLE `jobApplicationsHistory` ADD COLUMN `interviewerId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `jobApplicationsHistory` ADD CONSTRAINT `jobApplicationsHistory_interviewerId_fkey` FOREIGN KEY (`interviewerId`) REFERENCES `interviewers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
