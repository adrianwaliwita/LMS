/*
  Warnings:

  - Added the required column `department_id` to the `course` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `course` ADD COLUMN `department_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `course` ADD CONSTRAINT `course_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `department`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
