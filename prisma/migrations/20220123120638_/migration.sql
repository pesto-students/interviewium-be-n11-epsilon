/*
  Warnings:

  - Made the column `currentInterviewRound` on table `jobApplicationsHistory` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `jobApplicationsHistory` MODIFY `currentInterviewRound` INTEGER NOT NULL DEFAULT 0;
