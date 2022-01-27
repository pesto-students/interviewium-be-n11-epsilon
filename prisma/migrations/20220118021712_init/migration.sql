-- AlterTable
ALTER TABLE `humanResources` ADD COLUMN `name` VARCHAR(191) NOT NULL DEFAULT 'Default Name';

-- AlterTable
ALTER TABLE `interviewees` ADD COLUMN `name` VARCHAR(191) NOT NULL DEFAULT 'Default Name';

-- AlterTable
ALTER TABLE `interviewers` ADD COLUMN `name` VARCHAR(191) NOT NULL DEFAULT 'Default Name';
