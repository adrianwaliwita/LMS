/*
  Warnings:

  - You are about to alter the column `category` on the `course` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `level` on the `course` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `course` MODIFY `category` INTEGER NOT NULL,
    MODIFY `level` INTEGER NOT NULL;
