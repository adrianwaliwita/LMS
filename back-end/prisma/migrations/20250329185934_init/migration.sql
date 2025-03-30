/*
  Warnings:

  - You are about to drop the column `scheduled_at` on the `lecture` table. All the data in the column will be lost.
  - Added the required column `scheduled_from` to the `lecture` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scheduled_to` to the `lecture` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `lecture` DROP COLUMN `scheduled_at`,
    ADD COLUMN `scheduled_from` DATETIME(3) NOT NULL,
    ADD COLUMN `scheduled_to` DATETIME(3) NOT NULL;
