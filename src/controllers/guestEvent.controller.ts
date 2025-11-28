import { Request, Response } from 'express';
import guestEventService from '../services/guestEvent.service';
import { asyncHandler } from '../middleware/errorHandler';
import { validate } from '../middleware/validation';
import { UpdateGuestStatusSchema } from '../types';

export class GuestEventController {
  joinEvent = asyncHandler(async (req: Request, res: Response) => {
    const guestEvent = await guestEventService.joinEvent(req.body);
    res.status(201).json({
      success: true,
      data: guestEvent,
    });
  });

  getGuestEventsByUser = asyncHandler(async (req: Request, res: Response) => {
    const guestEvents = await guestEventService.getGuestEventsByUser(req.params.userId);
    res.json({
      success: true,
      data: guestEvents,
    });
  });

  getGuestsByEvent = asyncHandler(async (req: Request, res: Response) => {
    const guests = await guestEventService.getGuestsByEvent(req.params.eventId);
    res.json({
      success: true,
      data: guests,
    });
  });

  updateGuestStatus = asyncHandler(async (req: Request, res: Response) => {
    const { userId, eventId } = req.params;
    const guestEvent = await guestEventService.updateGuestStatus(userId, eventId, req.body);
    res.json({
      success: true,
      data: guestEvent,
    });
  });

  leaveEvent = asyncHandler(async (req: Request, res: Response) => {
    const { userId, eventId } = req.params;
    await guestEventService.leaveEvent(userId, eventId);
    res.json({
      success: true,
      message: 'Left event successfully',
    });
  });
}

export default new GuestEventController();
