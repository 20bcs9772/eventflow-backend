/*
  Warnings:

  - A unique constraint covering the columns `[userId,deviceId]` on the table `devices` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `deviceId` to the `devices` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "devices_userId_fcmToken_key";

-- AlterTable
ALTER TABLE "devices" ADD COLUMN     "deviceId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "devices_userId_deviceId_key" ON "devices"("userId", "deviceId");
