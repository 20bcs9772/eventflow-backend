import { Request, Response } from 'express';
import { Server } from 'socket.io';
import scheduleService from '../services/schedule.service';
import { asyncHandler } from '../middleware/errorHandler';
import { emitScheduleUpdate } from '../socket/socketHandlers';

// Get creator ID from header or body
const getCreatorId = (req: Request): string => {
  const creatorId = req.headers['x-creator-id'] as string;
  return creatorId || req.body.createdBy || '';
};

export class ScheduleController {
  createScheduleItem = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const createdBy = getCreatorId(req);
    if (!createdBy) {
      res.status(400).json({
        success: false,
        error: 'Creator ID is required. Provide it via x-creator-id header or createdBy in body',
      });
      return;
    }

    const scheduleItem = await scheduleService.createScheduleItem(createdBy, req.body);
    
    // Emit Socket.IO event
    const io: Server = req.app.locals.io;
    if (io) {
      await emitScheduleUpdate(io, scheduleItem.eventId, scheduleItem);
    }

    res.status(201).json({
      success: true,
      data: scheduleItem,
    });
  });

  getScheduleItemById = asyncHandler(async (req: Request, res: Response) => {
    const scheduleItem = await scheduleService.getScheduleItemById(req.params.id);
    res.json({
      success: true,
      data: scheduleItem,
    });
  });

  getScheduleItemsByEvent = asyncHandler(async (req: Request, res: Response) => {
    const scheduleItems = await scheduleService.getScheduleItemsByEvent(req.params.eventId);
    res.json({
      success: true,
      data: scheduleItems,
    });
  });

  updateScheduleItem = asyncHandler(async (req: Request, res: Response) => {
    const scheduleItem = await scheduleService.updateScheduleItem(req.params.id, req.body);
    
    // Emit Socket.IO event
    const io: Server = req.app.locals.io;
    if (io) {
      await emitScheduleUpdate(io, scheduleItem.eventId, scheduleItem);
    }

    res.json({
      success: true,
      data: scheduleItem,
    });
  });

  deleteScheduleItem = asyncHandler(async (req: Request, res: Response) => {
    await scheduleService.deleteScheduleItem(req.params.id);
    res.json({
      success: true,
      message: 'Schedule item deleted successfully',
    });
  });

  reorderSchedule = asyncHandler(async (req: Request, res: Response) => {
    const { eventId, items } = req.body as {
      eventId: string;
      items: { id: string; orderIndex: number }[];
    };

    if (!eventId || !Array.isArray(items)) {
      res.status(400).json({
        success: false,
        error: 'eventId and items array are required',
      });
      return;
    }

    const updatedItems = await scheduleService.reorderScheduleItems(
      eventId,
      items
    );

    const io: Server = req.app.locals.io;
    if (io) {
      await emitScheduleUpdate(io, eventId, updatedItems);
    }

    res.json({
      success: true,
      data: updatedItems,
    });
  });
}

export default new ScheduleController();
