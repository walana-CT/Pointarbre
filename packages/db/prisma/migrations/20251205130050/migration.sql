/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `triage` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "triage_name_key" ON "triage"("name");
