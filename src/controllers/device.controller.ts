import { Request, Response } from 'express';
import deviceService from '../services/device.service';
import { asyncHandler } from '../middleware/errorHandler';
import { validate } from '../middleware/validation';
import { CreateDeviceSchema, UpdateDeviceSchema } from '../types';

export class DeviceController {
  createDevice = asyncHandler(async (req: Request, res: Response) => {
    const device = await deviceService.createDevice(req.body);
    res.status(201).json({
      success: true,
      data: device,
    });
  });

  getDeviceById = asyncHandler(async (req: Request, res: Response) => {
    const device = await deviceService.getDeviceById(req.params.id);
    res.json({
      success: true,
      data: device,
    });
  });

  getDevicesByUser = asyncHandler(async (req: Request, res: Response) => {
    const devices = await deviceService.getDevicesByUser(req.params.userId);
    res.json({
      success: true,
      data: devices,
    });
  });

  updateDevice = asyncHandler(async (req: Request, res: Response) => {
    const device = await deviceService.updateDevice(req.params.id, req.body);
    res.json({
      success: true,
      data: device,
    });
  });

  deleteDevice = asyncHandler(async (req: Request, res: Response) => {
    await deviceService.deleteDevice(req.params.id);
    res.json({
      success: true,
      message: 'Device deleted successfully',
    });
  });
}

export default new DeviceController();

