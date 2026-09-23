/*
  Warnings:

  - You are about to drop the column `maker_id` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `app_makers` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[username]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_maker_id_fkey";

-- DropIndex
DROP INDEX "users_username_maker_id_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "maker_id";

-- DropTable
DROP TABLE "app_makers";

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
