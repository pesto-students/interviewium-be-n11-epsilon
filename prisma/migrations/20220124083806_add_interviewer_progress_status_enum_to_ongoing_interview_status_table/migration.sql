-- AlterTable
ALTER TABLE `ongoingInterviewsStatus` ADD COLUMN `interviewProgressStatus` ENUM('IN_PROGRESS', 'ACCEPTED', 'REJECTED') NOT NULL DEFAULT 'IN_PROGRESS';
