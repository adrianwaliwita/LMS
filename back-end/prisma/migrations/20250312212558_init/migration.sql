/*
  Warnings:

  - You are about to drop the column `courseId` on the `batch` table. All the data in the column will be lost.
  - The primary key for the `course_module` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `courseId` on the `course_module` table. All the data in the column will be lost.
  - You are about to drop the column `moduleId` on the `course_module` table. All the data in the column will be lost.
  - You are about to drop the `student` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `course_id` to the `batch` table without a default value. This is not possible if the table is not empty.
  - Added the required column `course_id` to the `course_module` table without a default value. This is not possible if the table is not empty.
  - Added the required column `module_id` to the `course_module` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `batch` DROP FOREIGN KEY `batch_courseId_fkey`;

-- DropForeignKey
ALTER TABLE `course_module` DROP FOREIGN KEY `course_module_courseId_fkey`;

-- DropForeignKey
ALTER TABLE `course_module` DROP FOREIGN KEY `course_module_moduleId_fkey`;

-- DropForeignKey
ALTER TABLE `student` DROP FOREIGN KEY `student_batch_id_fkey`;

-- DropForeignKey
ALTER TABLE `student` DROP FOREIGN KEY `student_user_id_fkey`;

-- DropIndex
DROP INDEX `batch_courseId_fkey` ON `batch`;

-- DropIndex
DROP INDEX `course_module_moduleId_fkey` ON `course_module`;

-- AlterTable
ALTER TABLE `batch` DROP COLUMN `courseId`,
    ADD COLUMN `course_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `course_module` DROP PRIMARY KEY,
    DROP COLUMN `courseId`,
    DROP COLUMN `moduleId`,
    ADD COLUMN `course_id` INTEGER NOT NULL,
    ADD COLUMN `module_id` INTEGER NOT NULL,
    ADD PRIMARY KEY (`course_id`, `module_id`);

-- DropTable
DROP TABLE `student`;

-- CreateTable
CREATE TABLE `student_batch` (
    `user_id` INTEGER NOT NULL,
    `batch_id` INTEGER NOT NULL,
    `enrolled_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `student_batch_user_id_key`(`user_id`),
    PRIMARY KEY (`user_id`, `batch_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lecturer_module` (
    `user_id` INTEGER NOT NULL,
    `module_id` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`user_id`, `module_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `course_module` ADD CONSTRAINT `course_module_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `course_module` ADD CONSTRAINT `course_module_module_id_fkey` FOREIGN KEY (`module_id`) REFERENCES `module`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `batch` ADD CONSTRAINT `batch_course_id_fkey` FOREIGN KEY (`course_id`) REFERENCES `course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_batch` ADD CONSTRAINT `student_batch_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `student_batch` ADD CONSTRAINT `student_batch_batch_id_fkey` FOREIGN KEY (`batch_id`) REFERENCES `batch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lecturer_module` ADD CONSTRAINT `lecturer_module_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lecturer_module` ADD CONSTRAINT `lecturer_module_module_id_fkey` FOREIGN KEY (`module_id`) REFERENCES `module`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
