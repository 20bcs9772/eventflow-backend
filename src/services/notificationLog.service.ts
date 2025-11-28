import prisma from '../config/database';

export class NotificationLogService {
  async createLog(data: {
    userId?: string;
    eventId?: string;
    deviceId?: string;
    title: string;
    message: string;
    fcmToken: string;
    success: boolean;
    errorMessage?: string;
  }) {
    return prisma.notificationLog.create({
      data,
    });
  }

  async getLogsByUser(userId: string, limit: number = 50) {
    return prisma.notificationLog.findMany({
      where: { userId },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  async getLogsByEvent(eventId: string, limit: number = 50) {
    return prisma.notificationLog.findMany({
      where: { eventId },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }

  async getLogsByDevice(deviceId: string, limit: number = 50) {
    return prisma.notificationLog.findMany({
      where: { deviceId },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });
  }
}

export default new NotificationLogService();

