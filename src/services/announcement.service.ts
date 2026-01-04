import prisma from '../config/database';
import { CreateAnnouncementInput } from '../types';
import { AppError } from '../middleware/errorHandler';

export class AnnouncementService {
  async createAnnouncement(senderId: string, data: CreateAnnouncementInput) {
    // Verify event exists
    const event = await prisma.event.findFirst({
      where: {
        id: data.eventId,
        deletedAt: null,
      },
    });

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    // Verify sender exists
    const sender = await prisma.user.findFirst({
      where: {
        id: senderId,
        deletedAt: null,
      },
    });

    if (!sender) {
      throw new AppError('Sender not found', 404);
    }

    return prisma.announcement.create({
      data: {
        eventId: data.eventId,
        senderId,
        title: data.title,
        message: data.message,
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
          },
        },
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async getAnnouncementById(id: string) {
    const announcement = await prisma.announcement.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        event: true,
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!announcement) {
      throw new AppError('Announcement not found', 404);
    }

    return announcement;
  }

  async getAnnouncementsByEvent(eventId: string) {
    // Verify event exists
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        deletedAt: null,
      },
    });

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    return prisma.announcement.findMany({
      where: {
        eventId,
        deletedAt: null,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async deleteAnnouncement(id: string) {
    const announcement = await prisma.announcement.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!announcement) {
      throw new AppError('Announcement not found', 404);
    }

    // Soft delete
    return prisma.announcement.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async updateAnnouncement(
    id: string,
    data: Partial<Pick<CreateAnnouncementInput, 'title' | 'message'>>
  ) {
    const announcement = await prisma.announcement.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!announcement) {
      throw new AppError('Announcement not found', 404);
    }

    return prisma.announcement.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.message !== undefined && { message: data.message }),
      },
    });
  }
}

export default new AnnouncementService();
