import prisma from "../config/database";
import { CreateEventInput, EventType, UpdateEventInput } from "../types";
import { AppError } from "../middleware/errorHandler";
import { customAlphabet } from "nanoid";
import { EventType as EventTypes, User } from "@prisma/client";
import {
  buildEventAccessWhereClause,
  privateEventAccess,
  publicEventAccess,
} from "../utils/eventAccessRules";

// Generate unique short code (alphanumeric, uppercase)
const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 8);

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

/**
 * Parse time string like "9:00 AM" to a Date object
 * Combines with the event date to create a full datetime
 */
const parseTimeString = (dateStr: string, timeStr: string): Date => {
  const date = new Date(dateStr);
  const timeMatch = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);

  if (!timeMatch) {
    throw new AppError(
      `Invalid time format: ${timeStr}. Expected format: "HH:mm AM/PM"`,
      400
    );
  }

  let hours = parseInt(timeMatch[1], 10);
  const minutes = parseInt(timeMatch[2], 10);
  const period = timeMatch[3].toUpperCase();

  if (period === "PM" && hours !== 12) {
    hours += 12;
  } else if (period === "AM" && hours === 12) {
    hours = 0;
  }

  date.setHours(hours, minutes, 0, 0);
  return date;
};

export class EventService {
  async getEvents(
    user: User | null | undefined,
    limit: number = 20,
    offset: number = 0,
    search?: string
  ) {
    return prisma.event.findMany({
      where: {
        ...buildEventAccessWhereClause(user),
        deletedAt: null,
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { location: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            guestEvents: true,
            announcements: true,
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
      take: limit,
      skip: offset,
    });
  }

  async createEvent(adminId: string, data: CreateEventInput) {
    // Verify admin exists
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin || admin.deletedAt) {
      throw new AppError("Admin user not found", 404);
    }

    // Validate date range
    const startDate = new Date(data.startDate);
    let endDate = new Date(data.endDate);

    // If time strings are provided, combine them with dates
    if (data.startTime) {
      const combinedStart = parseTimeString(data.startDate, data.startTime);
      startDate.setHours(
        combinedStart.getHours(),
        combinedStart.getMinutes(),
        0,
        0
      );
    }

    if (data.endTime) {
      const combinedEnd = parseTimeString(data.endDate, data.endTime);
      endDate.setHours(combinedEnd.getHours(), combinedEnd.getMinutes(), 0, 0);
    }

    if (startDate >= endDate) {
      throw new AppError("endDate must be after startDate", 400);
    }

    // Build location string from venue or use simple location
    let locationString = data.location;
    if (data.venue) {
      if (data.venue.fullAddress) {
        locationString = data.venue.fullAddress;
      } else if (data.venue.name) {
        const parts = [
          data.venue.name,
          data.venue.address,
          data.venue.city,
          data.venue.state,
          data.venue.zipCode,
        ].filter(Boolean);
        locationString = parts.join(", ");
      }
    }

    const shortCode = await generateShortCode();

    // Create event with schedule items in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const event = await tx.event.create({
        data: {
          name: data.name,
          description: data.description,
          startDate,
          endDate,
          location: locationString,
          visibility: data.visibility || "PUBLIC",
          type: data.type || "OTHER",
          shortCode,
          adminId,
        },
      });

      // Create schedule items if provided
      if (data.scheduleItems && data.scheduleItems.length > 0) {
        const schedulePromises = data.scheduleItems.map(async (item, index) => {
          // Parse time strings to datetime
          let startTime: Date;
          let endTime: Date;

          // Check if it's an ISO datetime string (contains 'T' or 'Z' or starts with a year)
          const isISOString =
            item.startTime.includes("T") ||
            item.startTime.includes("Z") ||
            /^\d{4}/.test(item.startTime);

          if (isISOString) {
            // Parse as ISO datetime string
            startTime = new Date(item.startTime);
            endTime = new Date(item.endTime);
          } else {
            // Try parsing as time string (e.g., "9:00 AM")
            try {
              startTime = parseTimeString(data.startDate, item.startTime);
              endTime = parseTimeString(data.startDate, item.endTime);
            } catch (error) {
              // If parsing fails, try as ISO datetime string as fallback
              startTime = new Date(item.startTime);
              endTime = new Date(item.endTime);
            }
          }

          // Validate dates
          if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
            throw new AppError(
              `Invalid time format for schedule item "${item.title}"`,
              400
            );
          }

          if (startTime >= endTime) {
            throw new AppError(
              `End time must be after start time for schedule item "${item.title}"`,
              400
            );
          }

          return tx.scheduleItem.create({
            data: {
              eventId: event.id,
              title: item.title,
              description: item.description,
              startTime,
              endTime,
              location: item.location,
              orderIndex: item.orderIndex ?? index,
              createdBy: adminId,
            },
          });
        });

        await Promise.all(schedulePromises);
      }

      return event;
    });

    // Fetch the created event with all relations
    return prisma.event.findUnique({
      where: { id: result.id },
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
          orderBy: [{ orderIndex: "asc" }, { startTime: "asc" }],
        },
      },
    });
  }

  async getEventById(id: string, user: User | null | undefined) {
    const event = await prisma.event.findFirst({
      where: {
        id,
        ...buildEventAccessWhereClause(user),
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
          orderBy: [{ orderIndex: "asc" }, { startTime: "asc" }],
        },
        announcements: {
          where: { deletedAt: null },
          orderBy: {
            createdAt: "desc",
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
      throw new AppError("Event not found", 404);
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
          orderBy: [{ orderIndex: "asc" }, { startTime: "asc" }],
        },
        announcements: {
          where: { deletedAt: null },
          orderBy: {
            createdAt: "desc",
          },
          take: 10,
        },
      },
    });

    if (!event) {
      throw new AppError("Event not found", 404);
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
          orderBy: [{ orderIndex: "asc" }, { startTime: "asc" }],
        },
        _count: {
          select: {
            guestEvents: true,
            announcements: true,
          },
        },
      },
      orderBy: {
        startDate: "desc",
      },
    });
  }

  /**
   * Get public events for discovery (home screen)
   */
  async getPublicEvents(limit: number = 10, offset: number = 0) {
    const now = new Date();

    return prisma.event.findMany({
      where: {
        visibility: "PUBLIC",
        deletedAt: null,
        startDate: { gte: now }, // Only future events
      },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            guestEvents: true,
          },
        },
      },
      orderBy: {
        startDate: "asc", // Upcoming events first
      },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get events happening now (within next 24 hours)
   */
  async getEventsHappeningNow(limit: number = 5) {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 2);

    return prisma.event.findMany({
      where: {
        visibility: "PUBLIC",
        deletedAt: null,
        startDate: {
          gte: now,
          lte: tomorrow,
        },
      },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            guestEvents: true,
          },
        },
      },
      orderBy: {
        startDate: "asc",
      },
      take: limit,
    });
  }

  /**
   * Get user's calendar events (both created and joined events)
   * Returns events within a date range
   */
  async getCalendarEvents(userId: string, startDate?: Date, endDate?: Date) {
    const start = startDate || new Date();
    const end = endDate || new Date();
    end.setMonth(end.getMonth() + 1);

    const events = await prisma.event.findMany({
      where: {
        deletedAt: null,
        startDate: { gte: start, lte: end },
        OR: [
          { adminId: userId },
          {
            guestEvents: {
              some: {
                userId,
                deletedAt: null,
              },
            },
          },
        ],
      },
      include: {
        admin: {
          select: { id: true, name: true, email: true },
        },
        scheduleItems: {
          where: { deletedAt: null },
          orderBy: [{ orderIndex: "asc" }, { startTime: "asc" }],
        },
        _count: {
          select: { guestEvents: true },
        },
        guestEvents: {
          where: { userId },
          select: { status: true },
        },
      },
      orderBy: { startDate: "asc" },
    });

    return events;
  }

  /**
   * Get types of events
   */
  async getTypesOfEvents() {
    return Object.values(EventTypes);
  }

  /**
   * Get events by type
   */
  async getEventsByType(
    type: string,
    user: User | null | undefined,
    limit: number = 5
  ) {
    return prisma.event.findMany({
      where: {
        OR: [publicEventAccess, privateEventAccess(user)],
        deletedAt: null,
        type: type as EventType,
      },
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            guestEvents: true,
          },
        },
      },
      orderBy: {
        startDate: "asc",
      },
      take: limit,
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
      throw new AppError("Event not found or you do not have permission", 404);
    }

    // Validate date range if both dates are being updated
    if (data.startDate && data.endDate) {
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      if (startDate >= endDate) {
        throw new AppError("endDate must be after startDate", 400);
      }
    } else if (data.startDate) {
      const startDate = new Date(data.startDate);
      if (startDate >= event.endDate) {
        throw new AppError("startDate must be before existing endDate", 400);
      }
    } else if (data.endDate) {
      const endDate = new Date(data.endDate);
      if (event.startDate >= endDate) {
        throw new AppError("endDate must be after existing startDate", 400);
      }
    }

    return prisma.event.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
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
      throw new AppError("Event not found or you do not have permission", 404);
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
