import prisma from '../config/database';
import { CreateDeviceInput, UpdateDeviceInput } from '../types';
import { AppError } from '../middleware/errorHandler';

export class DeviceService {
  async createDevice(data: CreateDeviceInput) {
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check if device already exists
    const existingDevice = await prisma.device.findUnique({
      where: {
        userId_fcmToken: {
          userId: data.userId,
          fcmToken: data.fcmToken,
        },
      },
    });

    if (existingDevice) {
      // Update if soft deleted
      if (existingDevice.deletedAt) {
        return prisma.device.update({
          where: { id: existingDevice.id },
          data: {
            deviceType: data.deviceType,
            deletedAt: null,
          },
        });
      }
      return existingDevice;
    }

    return prisma.device.create({
      data: {
        userId: data.userId,
        fcmToken: data.fcmToken,
        deviceType: data.deviceType,
      },
    });
  }

  async getDeviceById(id: string) {
    const device = await prisma.device.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!device || device.deletedAt) {
      throw new AppError('Device not found', 404);
    }

    return device;
  }

  async getDevicesByUser(userId: string) {
    return prisma.device.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async updateDevice(id: string, data: UpdateDeviceInput) {
    const device = await prisma.device.findUnique({
      where: { id },
    });

    if (!device || device.deletedAt) {
      throw new AppError('Device not found', 404);
    }

    return prisma.device.update({
      where: { id },
      data: {
        ...(data.fcmToken && { fcmToken: data.fcmToken }),
        ...(data.deviceType && { deviceType: data.deviceType }),
      },
    });
  }

  async deleteDevice(id: string) {
    const device = await prisma.device.findUnique({
      where: { id },
    });

    if (!device || device.deletedAt) {
      throw new AppError('Device not found', 404);
    }

    // Soft delete
    return prisma.device.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async getFcmTokensByUser(userId: string): Promise<string[]> {
    const devices = await prisma.device.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      select: {
        fcmToken: true,
      },
    });

    return devices.map((d) => d.fcmToken);
  }

  async getFcmTokensByEvent(eventId: string): Promise<string[]> {
    const guests = await prisma.guestEvent.findMany({
      where: {
        eventId,
        deletedAt: null,
      },
      include: {
        user: {
          include: {
            devices: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
    });

    const tokens: string[] = [];
    for (const guest of guests) {
      tokens.push(...guest.user.devices.map((d) => d.fcmToken));
    }

    return tokens;
  }
}

export default new DeviceService();

