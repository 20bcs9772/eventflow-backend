import prisma from "../config/database";
import { JoinEventInput, UpdateGuestStatusInput } from "../types";
import { AppError } from "../middleware/errorHandler";
import userService from "./user.service";

export class GuestEventService {
  async joinEvent(data: JoinEventInput) {
    let event;

    // Find event by ID or shortCode
    if (data.eventId) {
      event = await prisma.event.findFirst({
        where: {
          id: data.eventId,
          deletedAt: null,
        },
      });
    } else if (data.shortCode) {
      event = await prisma.event.findFirst({
        where: {
          shortCode: data.shortCode,
          deletedAt: null,
        },
      });
    } else {
      throw new AppError("Either eventId or shortCode must be provided", 400);
    }

    if (!event) {
      throw new AppError("Event not found", 404);
    }

    // Check visibility
    if (event.visibility === "PRIVATE") {
      throw new AppError("Event is private", 403);
    }

    let user;

    // If userId is provided, use existing user
    if (data.userId) {
      user = await prisma.user.findFirst({
        where: {
          id: data.userId,
          deletedAt: null,
        },
      });

      if (!user) {
        throw new AppError("User not found", 404);
      }
    } else {
      // Create new user if email or name is provided
      if (data.email || data.name) {
        user = await userService.createUser({
          email: data.email,
          name: data.name,
        });
      } else {
        throw new AppError("Either userId or email/name must be provided", 400);
      }
    }

    // Check if user is already joined
    const existingJoin = await prisma.guestEvent.findFirst({
      where: {
        userId: user.id,
        eventId: event.id,
        deletedAt: null,
      },
    });

    if (existingJoin) {
      // Update status to JOINED if it was INVITED
      if (existingJoin.status === "INVITED") {
        const updated = await prisma.guestEvent.update({
          where: { id: existingJoin.id },
          data: {
            status: "JOINED",
            joinedAt: new Date(),
          },
        });

        return prisma.guestEvent.findUnique({
          where: { id: updated.id },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            event: {
              include: {
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
            },
          },
        });
      }

      // User already joined, return existing join record
      return prisma.guestEvent.findUnique({
        where: { id: existingJoin.id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          event: {
            include: {
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
          },
        },
      });
    }

    // Create new join record
    return prisma.guestEvent.create({
      data: {
        userId: user.id,
        eventId: event.id,
        status: "JOINED",
        joinedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        event: {
          include: {
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
        },
      },
    });
  }

  async getGuestEventsByUser(userId: string) {
    return prisma.guestEvent.findMany({
      where: {
        userId,
        deletedAt: null,
        event: {
          deletedAt: null, // Filter events that are not deleted
        },
      },
      include: {
        event: {
          include: {
            scheduleItems: {
              where: { deletedAt: null },
              orderBy: [{ orderIndex: "asc" }, { startTime: "asc" }],
            },
            _count: {
              select: {
                guestEvents: true,
              },
            },
          },
        },
      },
      orderBy: {
        joinedAt: "desc",
      },
    });
  }

  async getGuestsByEvent(eventId: string) {
    // Verify event exists
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        deletedAt: null,
      },
    });

    if (!event) {
      throw new AppError("Event not found", 404);
    }

    return prisma.guestEvent.findMany({
      where: {
        eventId,
        deletedAt: null,
        user: {
          deletedAt: null,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        joinedAt: "desc",
      },
    });
  }

  async updateGuestStatus(
    userId: string,
    eventId: string,
    data: UpdateGuestStatusInput
  ) {
    const guestEvent = await prisma.guestEvent.findFirst({
      where: {
        userId,
        eventId,
        deletedAt: null,
      },
    });

    if (!guestEvent) {
      throw new AppError("Guest event not found", 404);
    }

    const updateData: any = {
      status: data.status,
    };

    if (data.status === "JOINED" && guestEvent.status !== "JOINED") {
      updateData.joinedAt = new Date();
    }

    if (data.status === "CHECKED_IN") {
      updateData.checkedInAt = new Date();
    }

    return prisma.guestEvent.update({
      where: { id: guestEvent.id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        event: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async getGuestEventByUserAndEvent(userId: string, eventId: string) {
    return prisma.guestEvent.findFirst({
      where: {
        userId,
        eventId,
        deletedAt: null,
        user: {
          deletedAt: null,
        },
        event: {
          deletedAt: null,
        },
      },
      include: {
        event: {
          include: {
            scheduleItems: {
              where: { deletedAt: null },
              orderBy: [{ orderIndex: "asc" }, { startTime: "asc" }],
            },
            _count: {
              select: {
                guestEvents: true,
              },
            },
          },
        },
      },
      orderBy: {
        joinedAt: "desc",
      },
    });
  }

  async leaveEvent(userId: string, eventId: string) {
    const guestEvent = await prisma.guestEvent.findFirst({
      where: {
        userId,
        eventId,
        deletedAt: null,
      },
    });

    if (!guestEvent) {
      throw new AppError("Guest event not found", 404);
    }

    // Soft delete
    return prisma.guestEvent.update({
      where: { id: guestEvent.id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}

export default new GuestEventService();
