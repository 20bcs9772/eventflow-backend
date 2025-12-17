import prisma from '../config/database';
import { CreateScheduleItemInput, UpdateScheduleItemInput } from '../types';
import { AppError } from '../middleware/errorHandler';

export class ScheduleService {
  async createScheduleItem(createdBy: string, data: CreateScheduleItemInput) {
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

    // Verify creator exists
    const creator = await prisma.user.findUnique({
      where: { id: createdBy },
    });

    if (!creator || creator.deletedAt) {
      throw new AppError('Creator not found', 404);
    }

    // Validate time range
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    if (startTime >= endTime) {
      throw new AppError('endTime must be after startTime', 400);
    }

    // Get max orderIndex for this event
    const maxOrder = await prisma.scheduleItem.findFirst({
      where: {
        eventId: data.eventId,
        deletedAt: null,
      },
      orderBy: {
        orderIndex: 'desc',
      },
      select: {
        orderIndex: true,
      },
    });

    const orderIndex = data.orderIndex ?? (maxOrder ? maxOrder.orderIndex + 1 : 0);

    return prisma.scheduleItem.create({
      data: {
        eventId: data.eventId,
        title: data.title,
        description: data.description,
        startTime,
        endTime,
        location: data.location,
        orderIndex,
        createdBy,
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async getScheduleItemById(id: string) {
    const scheduleItem = await prisma.scheduleItem.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        event: true,
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!scheduleItem) {
      throw new AppError('Schedule item not found', 404);
    }

    return scheduleItem;
  }

  async getScheduleItemsByEvent(eventId: string) {
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

    return prisma.scheduleItem.findMany({
      where: {
        eventId,
        deletedAt: null,
      },
      orderBy: [
        { orderIndex: 'asc' },
        { startTime: 'asc' },
      ],
    });
  }

  async updateScheduleItem(id: string, data: UpdateScheduleItemInput) {
    const scheduleItem = await prisma.scheduleItem.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!scheduleItem) {
      throw new AppError('Schedule item not found', 404);
    }

    // Validate time range if both times are being updated
    if (data.startTime && data.endTime) {
      const startTime = new Date(data.startTime);
      const endTime = new Date(data.endTime);
      if (startTime >= endTime) {
        throw new AppError('endTime must be after startTime', 400);
      }
    } else if (data.startTime) {
      const startTime = new Date(data.startTime);
      if (startTime >= scheduleItem.endTime) {
        throw new AppError('startTime must be before existing endTime', 400);
      }
    } else if (data.endTime) {
      const endTime = new Date(data.endTime);
      if (scheduleItem.startTime >= endTime) {
        throw new AppError('endTime must be after existing startTime', 400);
      }
    }

    return prisma.scheduleItem.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.startTime && { startTime: new Date(data.startTime) }),
        ...(data.endTime && { endTime: new Date(data.endTime) }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.orderIndex !== undefined && { orderIndex: data.orderIndex }),
      },
      include: {
        event: {
          select: {
            id: true,
            name: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async deleteScheduleItem(id: string) {
    const scheduleItem = await prisma.scheduleItem.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!scheduleItem) {
      throw new AppError('Schedule item not found', 404);
    }

    // Soft delete
    return prisma.scheduleItem.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async reorderScheduleItems(
    eventId: string,
    items: { id: string; orderIndex: number }[]
  ) {
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

    // Ensure all items belong to this event
    const ids = items.map((i) => i.id);
    const existingItems = await prisma.scheduleItem.findMany({
      where: {
        id: { in: ids },
        eventId,
        deletedAt: null,
      },
      select: { id: true },
    });

    if (existingItems.length !== items.length) {
      throw new AppError('One or more schedule items are invalid', 400);
    }

    await prisma.$transaction(
      items.map((item) =>
        prisma.scheduleItem.update({
          where: { id: item.id },
          data: { orderIndex: item.orderIndex },
        })
      )
    );

    return this.getScheduleItemsByEvent(eventId);
  }
}

export default new ScheduleService();
