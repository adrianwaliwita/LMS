/*
  Warnings:

  - Added the required column `department_id` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `department_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `user_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `department`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
