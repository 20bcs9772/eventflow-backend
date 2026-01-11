/*
  Warnings:

  - You are about to drop the column `eventDate` on the `events` table. All the data in the column will be lost.
  - You are about to drop the column `fcmToken` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[shortCode]` on the table `events` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `endDate` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shortCode` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `guest_events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `schedule_items` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "EventVisibility" AS ENUM ('PUBLIC', 'PRIVATE', 'UNLISTED');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('WEDDING', 'BIRTHDAY', 'CORPORATE', 'COLLEGE_FEST', 'OTHER');

-- CreateEnum
CREATE TYPE "GuestStatus" AS ENUM ('INVITED', 'JOINED', 'CHECKED_IN');

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('IOS', 'ANDROID', 'WEB');

-- AlterTable
ALTER TABLE "announcements" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "events" DROP COLUMN "eventDate",
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "shortCode" TEXT NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "type" "EventType" NOT NULL DEFAULT 'OTHER',
ADD COLUMN     "visibility" "EventVisibility" NOT NULL DEFAULT 'PUBLIC';

-- AlterTable
ALTER TABLE "guest_events" ADD COLUMN     "checkedInAt" TIMESTAMP(3),
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "status" "GuestStatus" NOT NULL DEFAULT 'INVITED',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "joinedAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "schedule_items" ADD COLUMN     "createdBy" TEXT NOT NULL,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "orderIndex" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "fcmToken",
ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "devices" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fcmToken" TEXT NOT NULL,
    "deviceType" "DeviceType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "eventId" TEXT,
    "deviceId" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "fcmToken" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "devices_userId_idx" ON "devices"("userId");

-- CreateIndex
CREATE INDEX "devices_fcmToken_idx" ON "devices"("fcmToken");

-- CreateIndex
CREATE INDEX "devices_deletedAt_idx" ON "devices"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "devices_userId_fcmToken_key" ON "devices"("userId", "fcmToken");

-- CreateIndex
CREATE INDEX "notification_logs_userId_idx" ON "notification_logs"("userId");

-- CreateIndex
CREATE INDEX "notification_logs_eventId_idx" ON "notification_logs"("eventId");

-- CreateIndex
CREATE INDEX "notification_logs_deviceId_idx" ON "notification_logs"("deviceId");

-- CreateIndex
CREATE INDEX "notification_logs_success_idx" ON "notification_logs"("success");

-- CreateIndex
CREATE INDEX "notification_logs_createdAt_idx" ON "notification_logs"("createdAt");

-- CreateIndex
CREATE INDEX "announcements_senderId_idx" ON "announcements"("senderId");

-- CreateIndex
CREATE INDEX "announcements_createdAt_idx" ON "announcements"("createdAt");

-- CreateIndex
CREATE INDEX "announcements_deletedAt_idx" ON "announcements"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "events_shortCode_key" ON "events"("shortCode");

-- CreateIndex
CREATE INDEX "events_adminId_idx" ON "events"("adminId");

-- CreateIndex
CREATE INDEX "events_shortCode_idx" ON "events"("shortCode");

-- CreateIndex
CREATE INDEX "events_startDate_idx" ON "events"("startDate");

-- CreateIndex
CREATE INDEX "events_endDate_idx" ON "events"("endDate");

-- CreateIndex
CREATE INDEX "events_visibility_idx" ON "events"("visibility");

-- CreateIndex
CREATE INDEX "events_type_idx" ON "events"("type");

-- CreateIndex
CREATE INDEX "events_deletedAt_idx" ON "events"("deletedAt");

-- CreateIndex
CREATE INDEX "guest_events_status_idx" ON "guest_events"("status");

-- CreateIndex
CREATE INDEX "guest_events_deletedAt_idx" ON "guest_events"("deletedAt");

-- CreateIndex
CREATE INDEX "schedule_items_startTime_idx" ON "schedule_items"("startTime");

-- CreateIndex
CREATE INDEX "schedule_items_orderIndex_idx" ON "schedule_items"("orderIndex");

-- CreateIndex
CREATE INDEX "schedule_items_createdBy_idx" ON "schedule_items"("createdBy");

-- CreateIndex
CREATE INDEX "schedule_items_deletedAt_idx" ON "schedule_items"("deletedAt");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_deletedAt_idx" ON "users"("deletedAt");

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_items" ADD CONSTRAINT "schedule_items_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
