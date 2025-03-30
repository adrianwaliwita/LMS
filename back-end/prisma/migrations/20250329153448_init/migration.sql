/*
  Warnings:

  - Added the required column `reserved_quantity` to the `lecture_equipment_allocation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `lecture_equipment_allocation` ADD COLUMN `reserved_quantity` INTEGER NOT NULL;
