import { Request, Response } from 'express';
import { Server } from 'socket.io';
import announcementService from '../services/announcement.service';
import { asyncHandler } from '../middleware/errorHandler';
import { emitAnnouncement } from '../socket/socketHandlers';

// In a real app, you'd get senderId from authentication middleware
// For MVP, we'll accept it as a query parameter or header
const getSenderId = (req: Request): string => {
  const senderId = req.headers['x-sender-id'] as string;
  if (senderId) {
    return senderId;
  }
  return (req.query.senderId as string) || req.body.senderId || '';
};

export class AnnouncementController {
  createAnnouncement = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const senderId = getSenderId(req);
    if (!senderId) {
      res.status(400).json({
        success: false,
        error: 'Sender ID is required. Provide it via x-sender-id header or senderId in body/query',
      });
      return;
    }

    const announcement = await announcementService.createAnnouncement(senderId, req.body);
    
    // Emit Socket.IO event and send push notifications
    const io: Server = req.app.locals.io;
    if (io) {
      await emitAnnouncement(io, announcement.eventId, announcement);
    }

    res.status(201).json({
      success: true,
      data: announcement,
    });
  });

  getAnnouncementById = asyncHandler(async (req: Request, res: Response) => {
    const announcement = await announcementService.getAnnouncementById(req.params.id);
    res.json({
      success: true,
      data: announcement,
    });
  });

  getAnnouncementsByEvent = asyncHandler(async (req: Request, res: Response) => {
    const announcements = await announcementService.getAnnouncementsByEvent(req.params.eventId);
    res.json({
      success: true,
      data: announcements,
    });
  });

  updateAnnouncement = asyncHandler(async (req: Request, res: Response) => {
    const announcement = await announcementService.updateAnnouncement(
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      data: announcement,
    });
  });

  deleteAnnouncement = asyncHandler(async (req: Request, res: Response) => {
    await announcementService.deleteAnnouncement(req.params.id);
    res.json({
      success: true,
      message: 'Announcement deleted successfully',
    });
  });
}

export default new AnnouncementController();

