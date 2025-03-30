/*
  Warnings:

  - You are about to drop the column `active_from` on the `announcement` table. All the data in the column will be lost.
  - You are about to drop the column `active_till` on the `announcement` table. All the data in the column will be lost.
  - You are about to drop the column `is_disabled` on the `announcement` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[title,target_batch_id]` on the table `announcement` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `announcement` DROP COLUMN `active_from`,
    DROP COLUMN `active_till`,
    DROP COLUMN `is_disabled`,
    ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX `announcement_title_target_batch_id_key` ON `announcement`(`title`, `target_batch_id`);
