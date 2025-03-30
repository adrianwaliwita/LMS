/*
  Warnings:

  - The primary key for the `lecturer_module` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `user_id` on the `lecturer_module` table. All the data in the column will be lost.
  - Added the required column `lecturer_id` to the `lecturer_module` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `lecturer_module` DROP FOREIGN KEY `lecturer_module_user_id_fkey`;

-- AlterTable
ALTER TABLE `lecturer_module` DROP PRIMARY KEY,
    DROP COLUMN `user_id`,
    ADD COLUMN `lecturer_id` INTEGER NOT NULL,
    ADD PRIMARY KEY (`lecturer_id`, `module_id`);

-- AddForeignKey
ALTER TABLE `lecturer_module` ADD CONSTRAINT `lecturer_module_lecturer_id_fkey` FOREIGN KEY (`lecturer_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
