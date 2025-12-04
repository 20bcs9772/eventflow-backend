import { Request, Response } from 'express';
import guestEventService from '../services/guestEvent.service';
import { asyncHandler } from '../middleware/errorHandler';
import userService from '../services/user.service';
import { AppError } from '../middleware/errorHandler';

// Get user database ID from Firebase UID
const getUserId = async (req: Request): Promise<string | null> => {
  if (req.user && req.user.uid) {
    const user = await userService.getUserByFirebaseUid(req.user.uid);
    return user?.id || null;
  }
  return null;
};

export class GuestEventController {
  joinEvent = asyncHandler(async (req: Request, res: Response) => {
    // If user is authenticated, use their userId
    const userId = await getUserId(req);
    const joinData = {
      ...req.body,
      userId: userId || req.body.userId,
    };

    const guestEvent = await guestEventService.joinEvent(joinData);
    res.status(201).json({
      success: true,
      data: guestEvent,
    });
  });

  getGuestEventsByUser = asyncHandler(async (req: Request, res: Response) => {
    // If /my-events route, get userId from auth
    let userId = req.params.userId;
    if (!userId && req.user) {
      const user = await userService.getUserByFirebaseUid(req.user.uid);
      if (!user) {
        throw new AppError('User not found', 404);
      }
      userId = user.id;
    }
    
    if (!userId) {
      throw new AppError('User ID is required', 400);
    }

    const guestEvents = await guestEventService.getGuestEventsByUser(userId);
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
    if (!req.user || !req.user.uid) {
      throw new AppError('User not authenticated', 401);
    }

    const user = await userService.getUserByFirebaseUid(req.user.uid);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const { eventId } = req.params;
    await guestEventService.leaveEvent(user.id, eventId);
    res.json({
      success: true,
      message: 'Left event successfully',
    });
  });
}

export default new GuestEventController();
