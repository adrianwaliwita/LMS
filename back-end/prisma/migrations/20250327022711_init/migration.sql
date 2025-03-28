/*
  Warnings:

  - A unique constraint covering the columns `[batch_id,module_id,title]` on the table `assignment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `assignment_batch_id_module_id_title_key` ON `assignment`(`batch_id`, `module_id`, `title`);
