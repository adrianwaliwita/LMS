/*
  Warnings:

  - You are about to drop the column `is_active` on the `announcement` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `announcement` DROP COLUMN `is_active`,
    ADD COLUMN `is_disabled` BOOLEAN NOT NULL DEFAULT false;
