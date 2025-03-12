/*
  Warnings:

  - You are about to drop the column `created_at` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `created_at`,
    ADD COLUMN `created_ats` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
