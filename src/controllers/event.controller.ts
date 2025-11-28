import { Request, Response } from 'express';
import { Server } from 'socket.io';
import eventService from '../services/event.service';
import { asyncHandler } from '../middleware/errorHandler';
import { emitEventUpdate } from '../socket/socketHandlers';

// In a real app, you'd get adminId from authentication middleware
// For MVP, we'll accept it as a query parameter or header
const getAdminId = (req: Request): string => {
  // Check header first (for API key or token)
  const adminId = req.headers['x-admin-id'] as string;
  if (adminId) {
    return adminId;
  }
  // Fallback to query parameter (for MVP simplicity)
  return (req.query.adminId as string) || req.body.adminId || '';
};

export class EventController {
  createEvent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const adminId = getAdminId(req);
    if (!adminId) {
      res.status(400).json({
        success: false,
        error: 'Admin ID is required. Provide it via x-admin-id header or adminId in body/query',
      });
      return;
    }

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
    const adminId = getAdminId(req);
    if (!adminId) {
      res.status(400).json({
        success: false,
        error: 'Admin ID is required. Provide it via x-admin-id header or adminId in query',
      });
      return;
    }

    const events = await eventService.getEventsByAdmin(adminId);
    res.json({
      success: true,
      data: events,
    });
  });

  updateEvent = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const adminId = getAdminId(req);
    if (!adminId) {
      res.status(400).json({
        success: false,
        error: 'Admin ID is required. Provide it via x-admin-id header or adminId in body/query',
      });
      return;
    }

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
    const adminId = getAdminId(req);
    if (!adminId) {
      res.status(400).json({
        success: false,
        error: 'Admin ID is required. Provide it via x-admin-id header or adminId in query',
      });
      return;
    }

    await eventService.deleteEvent(req.params.id, adminId);
    res.json({
      success: true,
      message: 'Event deleted successfully',
    });
  });
}

export default new EventController();
