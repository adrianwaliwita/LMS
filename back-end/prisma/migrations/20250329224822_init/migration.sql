/*
  Warnings:

  - A unique constraint covering the columns `[batch_id,module_id,scheduled_from,scheduled_to]` on the table `lecture` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `lecture_batch_id_module_id_scheduled_from_scheduled_to_key` ON `lecture`(`batch_id`, `module_id`, `scheduled_from`, `scheduled_to`);
