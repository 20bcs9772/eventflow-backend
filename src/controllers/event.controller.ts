import { Request, Response } from 'express';
import { Server } from 'socket.io';
import eventService from '../services/event.service';
import { asyncHandler } from '../middleware/errorHandler';
import { emitEventUpdate } from '../socket/socketHandlers';
import userService from '../services/user.service';
import { AppError } from '../middleware/errorHandler';

// Get user ID from Firebase auth middleware
const getUserId = (req: Request): string => {
  if (!req.user || !req.user.uid) {
    throw new AppError('User not authenticated', 401);
  }
  return req.user.uid;
};

// Get user database ID from Firebase UID
const getAdminId = async (req: Request): Promise<string> => {
  const firebaseUid = getUserId(req);
  const user = await userService.getUserByFirebaseUid(firebaseUid);
  if (!user) {
    throw new AppError('User not found in database', 404);
  }
  return user.id;
};

export class EventController {
  createEvent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const adminId = await getAdminId(req);
    const event = await eventService.createEvent(adminId, req.body);
    res.status(201).json({
      success: true,
      data: event,
    });
  });

  getEventById = asyncHandler(async (req: Request, res: Response) => {
    const event = await eventService.getEventById(req.params.id);
    res.json({
      success: true,
      data: event,
    });
  });

  getEventByShortCode = asyncHandler(async (req: Request, res: Response) => {
    const event = await eventService.getEventByShortCode(req.params.shortCode);
    res.json({
      success: true,
      data: event,
    });
  });

  getEventsByAdmin = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const adminId = await getAdminId(req);
    const events = await eventService.getEventsByAdmin(adminId);
    res.json({
      success: true,
      data: events,
    });
  });

  updateEvent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const adminId = await getAdminId(req);
    const event = await eventService.updateEvent(req.params.id, adminId, req.body);
    
    // Emit Socket.IO event
    const io: Server = req.app.locals.io;
    if (io) {
      emitEventUpdate(io, event.id, event);
    }

    res.json({
      success: true,
      data: event,
    });
  });

  deleteEvent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const adminId = await getAdminId(req);
    await eventService.deleteEvent(req.params.id, adminId);
    res.json({
      success: true,
      message: 'Event deleted successfully',
    });
  });

  /**
   * Get public events for discovery
   * GET /api/events/public?limit=10&offset=0
   */
  getPublicEvents = asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;
    
    const events = await eventService.getPublicEvents(limit, offset);
    res.json({
      success: true,
      data: events,
    });
  });

  /**
   * Get events happening now (next 24 hours)
   * GET /api/events/happening-now?limit=5
   */
  getEventsHappeningNow = asyncHandler(async (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 5;
    
    const events = await eventService.getEventsHappeningNow(limit);
    res.json({
      success: true,
      data: events,
    });
  });

  /**
   * Get user's calendar events (created + joined)
   * GET /api/events/calendar?startDate=2024-01-01&endDate=2024-12-31
   */
  getCalendarEvents = asyncHandler(async (req: Request, res: Response) => {
    const adminId = await getAdminId(req);
    
    const startDate = req.query.startDate 
      ? new Date(req.query.startDate as string)
      : undefined;
    const endDate = req.query.endDate
      ? new Date(req.query.endDate as string)
      : undefined;

    const events = await eventService.getCalendarEvents(adminId, startDate, endDate);
    res.json({
      success: true,
      data: events,
    });
  });
}

export default new EventController();
