/*
  Warnings:

  - A unique constraint covering the columns `[assignment_id,student_id]` on the table `assignment_submission` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `assignment_submission_assignment_id_student_id_key` ON `assignment_submission`(`assignment_id`, `student_id`);
