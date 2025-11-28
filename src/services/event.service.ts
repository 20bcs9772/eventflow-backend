import prisma from '../config/database';
import { CreateEventInput, UpdateEventInput } from '../types';
import { AppError } from '../middleware/errorHandler';
import { customAlphabet } from 'nanoid';

// Generate unique short code (alphanumeric, uppercase)
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);

const generateShortCode = async (): Promise<string> => {
  let shortCode: string;
  let exists = true;
  
  while (exists) {
    shortCode = nanoid();
    const existing = await prisma.event.findUnique({
      where: { shortCode },
    });
    exists = !!existing;
  }
  
  return shortCode!;
};

export class EventService {
  async createEvent(adminId: string, data: CreateEventInput) {
    // Verify admin exists
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin || admin.deletedAt) {
      throw new AppError('Admin user not found', 404);
    }

    // Validate date range
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (startDate >= endDate) {
      throw new AppError('endDate must be after startDate', 400);
    }

    const shortCode = await generateShortCode();

    return prisma.event.create({
      data: {
        name: data.name,
        description: data.description,
        startDate,
        endDate,
        location: data.location,
        visibility: data.visibility || 'PUBLIC',
        type: data.type || 'OTHER',
        shortCode,
        adminId,
      },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async getEventById(id: string) {
    const event = await prisma.event.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        scheduleItems: {
          where: { deletedAt: null },
          orderBy: [
            { orderIndex: 'asc' },
            { startTime: 'asc' },
          ],
        },
        announcements: {
          where: { deletedAt: null },
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        guestEvents: {
          where: { deletedAt: null },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    return event;
  }

  async getEventByShortCode(shortCode: string) {
    const event = await prisma.event.findFirst({
      where: {
        shortCode,
        deletedAt: null,
      },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        scheduleItems: {
          where: { deletedAt: null },
          orderBy: [
            { orderIndex: 'asc' },
            { startTime: 'asc' },
          ],
        },
        announcements: {
          where: { deletedAt: null },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    return event;
  }

  async getEventsByAdmin(adminId: string) {
    return prisma.event.findMany({
      where: {
        adminId,
        deletedAt: null,
      },
      include: {
        scheduleItems: {
          where: { deletedAt: null },
          orderBy: [
            { orderIndex: 'asc' },
            { startTime: 'asc' },
          ],
        },
        _count: {
          select: {
            guestEvents: true,
            announcements: true,
          },
        },
      },
      orderBy: {
        startDate: 'desc',
      },
    });
  }

  async updateEvent(id: string, adminId: string, data: UpdateEventInput) {
    // Verify event exists and belongs to admin
    const event = await prisma.event.findFirst({
      where: {
        id,
        adminId,
        deletedAt: null,
      },
    });

    if (!event) {
      throw new AppError('Event not found or you do not have permission', 404);
    }

    // Validate date range if both dates are being updated
    if (data.startDate && data.endDate) {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      if (startDate >= endDate) {
        throw new AppError('endDate must be after startDate', 400);
      }
    } else if (data.startDate) {
      const startDate = new Date(data.startDate);
      if (startDate >= event.endDate) {
        throw new AppError('startDate must be before existing endDate', 400);
      }
    } else if (data.endDate) {
      const endDate = new Date(data.endDate);
      if (event.startDate >= endDate) {
        throw new AppError('endDate must be after existing startDate', 400);
      }
    }

    return prisma.event.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.startDate && { startDate: new Date(data.startDate) }),
        ...(data.endDate && { endDate: new Date(data.endDate) }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.visibility && { visibility: data.visibility }),
        ...(data.type && { type: data.type }),
      },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async deleteEvent(id: string, adminId: string) {
    // Verify event exists and belongs to admin
    const event = await prisma.event.findFirst({
      where: {
        id,
        adminId,
        deletedAt: null,
      },
    });

    if (!event) {
      throw new AppError('Event not found or you do not have permission', 404);
    }

    // Soft delete
    return prisma.event.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}

export default new EventService();
