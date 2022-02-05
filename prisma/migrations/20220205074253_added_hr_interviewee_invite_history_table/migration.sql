-- CreateTable
CREATE TABLE `hrIntervieweeInvitesHistory` (
    `id` VARCHAR(191) NOT NULL,
    `humanResourceId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `intervieweeId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `hrIntervieweeInvitesHistory_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `hrIntervieweeInvitesHistory` ADD CONSTRAINT `hrIntervieweeInvitesHistory_humanResourceId_fkey` FOREIGN KEY (`humanResourceId`) REFERENCES `humanResources`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hrIntervieweeInvitesHistory` ADD CONSTRAINT `hrIntervieweeInvitesHistory_intervieweeId_fkey` FOREIGN KEY (`intervieweeId`) REFERENCES `interviewees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
