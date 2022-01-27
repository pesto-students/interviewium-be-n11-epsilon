-- CreateTable
CREATE TABLE `humanResources` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `ongoingInterviewsCount` INTEGER NOT NULL DEFAULT 0,
    `onboarded` BOOLEAN NOT NULL DEFAULT false,
    `companyId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `hrProfileImageS3Link` VARCHAR(255) NULL,

    UNIQUE INDEX `humanResources_id_key`(`id`),
    UNIQUE INDEX `humanResources_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hrJobPostsHistory` (
    `id` VARCHAR(191) NOT NULL,
    `humanResourceId` VARCHAR(191) NOT NULL,
    `jobId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `hrJobPostsHistory_id_key`(`id`),
    UNIQUE INDEX `hrJobPostsHistory_jobId_key`(`jobId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hrInterviewerInvitesHistory` (
    `id` VARCHAR(191) NOT NULL,
    `humanResourceId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `interviewerId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `hrInterviewerInvitesHistory_id_key`(`id`),
    UNIQUE INDEX `hrInterviewerInvitesHistory_interviewerId_key`(`interviewerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `interviewees` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `onboarded` BOOLEAN NOT NULL DEFAULT false,
    `lookingForEmploymentType` ENUM('FULL_TIME', 'PART_TIME', 'INTERNSHIP') NOT NULL DEFAULT 'FULL_TIME',
    `yearsOfExperience` INTEGER NULL,
    `intervieweeDescription` VARCHAR(4096) NULL,
    `mobileNumber` VARCHAR(191) NULL,
    `linkedinProfileLink` VARCHAR(255) NULL,
    `educationalExperience` JSON NULL,
    `professionalExperience` JSON NULL,
    `currentCompanyName` VARCHAR(191) NULL,
    `resumeLink` VARCHAR(255) NULL,
    `primaryAndSecondarySkills` VARCHAR(1024) NOT NULL,
    `tags` VARCHAR(512) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `intervieweeProfileImageS3Link` VARCHAR(255) NULL,

    UNIQUE INDEX `interviewees_id_key`(`id`),
    UNIQUE INDEX `interviewees_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `interviewers` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `onboarded` BOOLEAN NOT NULL DEFAULT false,
    `numberOfInterviewReviewsPending` INTEGER NOT NULL DEFAULT 0,
    `calendlyLink` VARCHAR(255) NULL,
    `companyId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `interviewerProfileImageS3Link` VARCHAR(255) NULL,

    UNIQUE INDEX `interviewers_id_key`(`id`),
    UNIQUE INDEX `interviewers_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jobs` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `humanResourceId` VARCHAR(191) NOT NULL,
    `minExperienceInYears` INTEGER NULL,
    `maxExperienceInYears` INTEGER NULL,
    `employmentType` ENUM('FULL_TIME', 'PART_TIME', 'INTERNSHIP') NOT NULL DEFAULT 'FULL_TIME',
    `jobDescription` VARCHAR(4096) NULL,
    `numberOfRounds` INTEGER NOT NULL DEFAULT 4,
    `companyIconS3Link` VARCHAR(255) NULL,
    `companyId` VARCHAR(191) NOT NULL,
    `locationId` VARCHAR(191) NOT NULL,
    `primaryAndSecondarySkills` VARCHAR(1024) NOT NULL,
    `tags` VARCHAR(512) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `jobs_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `locations` (
    `id` VARCHAR(191) NOT NULL,
    `city` VARCHAR(255) NOT NULL,
    `country` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `locations_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `companies` (
    `id` VARCHAR(191) NOT NULL,
    `companyName` VARCHAR(255) NOT NULL,
    `companyEmailDomainName` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `companies_id_key`(`id`),
    UNIQUE INDEX `companies_companyName_key`(`companyName`),
    UNIQUE INDEX `companies_companyEmailDomainName_key`(`companyEmailDomainName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `jobApplicationsHistory` (
    `id` VARCHAR(191) NOT NULL,
    `jobId` VARCHAR(191) NOT NULL,
    `intervieweeId` VARCHAR(191) NOT NULL,
    `humanResourceId` VARCHAR(191) NOT NULL,
    `applicationStatus` ENUM('APPLIED', 'ONGOING', 'PASSED', 'ACCEPTED', 'REJECTED', 'WAITING_FOR_INTERVIEWER_ASSIGNMENT') NOT NULL DEFAULT 'APPLIED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `currentInterviewRound` INTEGER NULL,
    `shortlistedAt` DATETIME(3) NULL,

    UNIQUE INDEX `jobApplicationsHistory_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ongoingInterviewsStatus` (
    `id` VARCHAR(191) NOT NULL,
    `intervieweeId` VARCHAR(191) NOT NULL,
    `humanResourceId` VARCHAR(191) NOT NULL,
    `jobId` VARCHAR(191) NOT NULL,
    `interviewerId` VARCHAR(191) NOT NULL,
    `joiningLink` VARCHAR(255) NULL,
    `interviewerReview` VARCHAR(2048) NULL,
    `interviewRoundNumber` INTEGER NULL,
    `interviewDateTime` DATETIME(3) NULL,
    `interviewerVerdict` ENUM('PASSED', 'FAILED', 'UNDECIDED') NULL DEFAULT 'UNDECIDED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ongoingInterviewsStatus_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `offers` (
    `id` VARCHAR(191) NOT NULL,
    `intervieweeId` VARCHAR(191) NOT NULL,
    `jobId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `offers_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `interviewerInterviewsHistory` (
    `id` VARCHAR(191) NOT NULL,
    `intervieweeId` VARCHAR(191) NOT NULL,
    `jobId` VARCHAR(191) NOT NULL,
    `interviewDateTime` DATETIME(3) NULL,
    `joiningLink` VARCHAR(255) NULL,
    `interviewRound` INTEGER NULL,
    `interviewRoundVerdict` ENUM('PASSED', 'FAILED', 'UNDECIDED') NOT NULL DEFAULT 'UNDECIDED',
    `interviewerId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `interviewerInterviewsHistory_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `intervieweeInterviewsHistory` (
    `id` VARCHAR(191) NOT NULL,
    `intervieweeId` VARCHAR(191) NOT NULL,
    `jobId` VARCHAR(191) NOT NULL,
    `roundNumber` INTEGER NOT NULL,
    `interviewDateTime` DATETIME(3) NOT NULL,
    `joiningLink` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `intervieweeInterviewsHistory_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hotJobsOfTheDay` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `company` VARCHAR(255) NOT NULL,
    `minExperience` INTEGER NOT NULL,
    `maxExperience` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `hotJobsOfTheDay_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `humanResources` ADD CONSTRAINT `humanResources_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hrJobPostsHistory` ADD CONSTRAINT `hrJobPostsHistory_humanResourceId_fkey` FOREIGN KEY (`humanResourceId`) REFERENCES `humanResources`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hrJobPostsHistory` ADD CONSTRAINT `hrJobPostsHistory_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `jobs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hrInterviewerInvitesHistory` ADD CONSTRAINT `hrInterviewerInvitesHistory_humanResourceId_fkey` FOREIGN KEY (`humanResourceId`) REFERENCES `humanResources`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hrInterviewerInvitesHistory` ADD CONSTRAINT `hrInterviewerInvitesHistory_interviewerId_fkey` FOREIGN KEY (`interviewerId`) REFERENCES `interviewers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `interviewers` ADD CONSTRAINT `interviewers_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jobs` ADD CONSTRAINT `jobs_humanResourceId_fkey` FOREIGN KEY (`humanResourceId`) REFERENCES `humanResources`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jobs` ADD CONSTRAINT `jobs_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `companies`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jobs` ADD CONSTRAINT `jobs_locationId_fkey` FOREIGN KEY (`locationId`) REFERENCES `locations`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jobApplicationsHistory` ADD CONSTRAINT `jobApplicationsHistory_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `jobs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jobApplicationsHistory` ADD CONSTRAINT `jobApplicationsHistory_intervieweeId_fkey` FOREIGN KEY (`intervieweeId`) REFERENCES `interviewees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `jobApplicationsHistory` ADD CONSTRAINT `jobApplicationsHistory_humanResourceId_fkey` FOREIGN KEY (`humanResourceId`) REFERENCES `humanResources`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ongoingInterviewsStatus` ADD CONSTRAINT `ongoingInterviewsStatus_intervieweeId_fkey` FOREIGN KEY (`intervieweeId`) REFERENCES `interviewees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ongoingInterviewsStatus` ADD CONSTRAINT `ongoingInterviewsStatus_humanResourceId_fkey` FOREIGN KEY (`humanResourceId`) REFERENCES `humanResources`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ongoingInterviewsStatus` ADD CONSTRAINT `ongoingInterviewsStatus_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `jobs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ongoingInterviewsStatus` ADD CONSTRAINT `ongoingInterviewsStatus_interviewerId_fkey` FOREIGN KEY (`interviewerId`) REFERENCES `interviewers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `offers` ADD CONSTRAINT `offers_intervieweeId_fkey` FOREIGN KEY (`intervieweeId`) REFERENCES `interviewees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `offers` ADD CONSTRAINT `offers_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `jobs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `interviewerInterviewsHistory` ADD CONSTRAINT `interviewerInterviewsHistory_intervieweeId_fkey` FOREIGN KEY (`intervieweeId`) REFERENCES `interviewees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `interviewerInterviewsHistory` ADD CONSTRAINT `interviewerInterviewsHistory_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `jobs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `interviewerInterviewsHistory` ADD CONSTRAINT `interviewerInterviewsHistory_interviewerId_fkey` FOREIGN KEY (`interviewerId`) REFERENCES `interviewers`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `intervieweeInterviewsHistory` ADD CONSTRAINT `intervieweeInterviewsHistory_intervieweeId_fkey` FOREIGN KEY (`intervieweeId`) REFERENCES `interviewees`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `intervieweeInterviewsHistory` ADD CONSTRAINT `intervieweeInterviewsHistory_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `jobs`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
