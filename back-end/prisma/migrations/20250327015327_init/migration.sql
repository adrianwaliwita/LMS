/*
  Warnings:

  - A unique constraint covering the columns `[course_id,name]` on the table `batch` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `batch_course_id_name_key` ON `batch`(`course_id`, `name`);
