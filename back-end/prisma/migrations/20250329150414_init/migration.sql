/*
  Warnings:

  - You are about to drop the `classroom_allocation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `equipment_allocation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `classroom_allocation` DROP FOREIGN KEY `classroom_allocation_classroom_id_fkey`;

-- DropForeignKey
ALTER TABLE `classroom_allocation` DROP FOREIGN KEY `classroom_allocation_reserved_by_fkey`;

-- DropForeignKey
ALTER TABLE `equipment_allocation` DROP FOREIGN KEY `equipment_allocation_equipment_id_fkey`;

-- DropForeignKey
ALTER TABLE `equipment_allocation` DROP FOREIGN KEY `equipment_allocation_reserved_by_fkey`;

-- DropTable
DROP TABLE `classroom_allocation`;

-- DropTable
DROP TABLE `equipment_allocation`;

-- CreateTable
CREATE TABLE `lecture` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `batch_id` INTEGER NOT NULL,
    `module_id` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `scheduled_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lecture_lecturer_allocation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `lecture_id` INTEGER NOT NULL,
    `lecturer_id` INTEGER NOT NULL,
    `date` DATE NOT NULL,
    `from_time_slot` INTEGER NOT NULL,
    `to_time_slot` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `lecture_lecturer_allocation_lecture_id_key`(`lecture_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lecture_classroom_allocation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `lecture_id` INTEGER NOT NULL,
    `classroom_id` INTEGER NOT NULL,
    `date` DATE NOT NULL,
    `from_time_slot` INTEGER NOT NULL,
    `to_time_slot` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `lecture_classroom_allocation_lecture_id_classroom_id_key`(`lecture_id`, `classroom_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lecture_equipment_allocation` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `lecture_id` INTEGER NOT NULL,
    `equipment_id` INTEGER NOT NULL,
    `date` DATE NOT NULL,
    `from_time_slot` INTEGER NOT NULL,
    `to_time_slot` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `lecture_equipment_allocation_lecture_id_equipment_id_key`(`lecture_id`, `equipment_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `lecture` ADD CONSTRAINT `lecture_batch_id_fkey` FOREIGN KEY (`batch_id`) REFERENCES `batch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lecture` ADD CONSTRAINT `lecture_module_id_fkey` FOREIGN KEY (`module_id`) REFERENCES `module`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lecture_lecturer_allocation` ADD CONSTRAINT `lecture_lecturer_allocation_lecture_id_fkey` FOREIGN KEY (`lecture_id`) REFERENCES `lecture`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lecture_lecturer_allocation` ADD CONSTRAINT `lecture_lecturer_allocation_lecturer_id_fkey` FOREIGN KEY (`lecturer_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lecture_classroom_allocation` ADD CONSTRAINT `lecture_classroom_allocation_lecture_id_fkey` FOREIGN KEY (`lecture_id`) REFERENCES `lecture`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lecture_classroom_allocation` ADD CONSTRAINT `lecture_classroom_allocation_classroom_id_fkey` FOREIGN KEY (`classroom_id`) REFERENCES `classroom`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lecture_equipment_allocation` ADD CONSTRAINT `lecture_equipment_allocation_lecture_id_fkey` FOREIGN KEY (`lecture_id`) REFERENCES `lecture`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lecture_equipment_allocation` ADD CONSTRAINT `lecture_equipment_allocation_equipment_id_fkey` FOREIGN KEY (`equipment_id`) REFERENCES `equipment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
